import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import type { ArtifactStore, StoredArtifact } from "../platform/artifact-store.js";
import { loadQaIntegrationStatus, resolvePlaywrightTarget } from "./qa-integration-config.js";

const MAX_NETWORK_EVENTS = 100;
const MAX_CONSOLE_ERRORS = 30;
const ALLOWED_SUITES = new Set(["story-smoke"]);

function redactNetworkUrl(raw: string): string {
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.slice(0, 2000);
  } catch {
    return raw.split("?", 1)[0]?.slice(0, 2000) ?? "invalid-url";
  }
}

function sameOrigin(left: string, right: string): boolean {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return false;
  }
}

export interface BrowserRunRequest {
  targetUrl: string;
  timeoutMs: number;
  storyId: string;
  suite: string;
}

export interface BrowserRunEvidence {
  startedAt: string;
  finishedAt: string;
  targetUrl: string;
  finalUrl: string;
  pageTitle: string;
  httpStatus?: number;
  checks: Array<{ id: string; passed: boolean; detail: string }>;
  consoleErrors: string[];
  network: Array<{ method: string; url: string; status?: number; failure?: string }>;
  screenshot?: Buffer;
  trace?: Buffer;
}

export interface BrowserExecutor {
  run(request: BrowserRunRequest): Promise<BrowserRunEvidence>;
}

export class PlaywrightBrowserExecutor implements BrowserExecutor {
  async run(request: BrowserRunRequest): Promise<BrowserRunEvidence> {
    const { chromium } = await import("playwright");
    const temporaryDirectory = mkdtempSync(resolve(tmpdir(), "bm-qa-playwright-"));
    const tracePath = resolve(temporaryDirectory, "trace.zip");
    const startedAt = new Date().toISOString();
    const network: BrowserRunEvidence["network"] = [];
    const consoleErrors: string[] = [];
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        ignoreHTTPSErrors: false,
        serviceWorkers: "block",
      });
      await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
      const page = await context.newPage();
      page.setDefaultTimeout(request.timeoutMs);

      page.on("console", (message) => {
        if (message.type() === "error" && consoleErrors.length < MAX_CONSOLE_ERRORS) {
          consoleErrors.push(message.text().slice(0, 1000));
        }
      });
      page.on("response", (response) => {
        if (network.length >= MAX_NETWORK_EVENTS) return;
        network.push({
          method: response.request().method(),
          url: redactNetworkUrl(response.url()),
          status: response.status(),
        });
      });
      page.on("requestfailed", (requestFailure) => {
        if (network.length >= MAX_NETWORK_EVENTS) return;
        network.push({
          method: requestFailure.method(),
          url: redactNetworkUrl(requestFailure.url()),
          failure: requestFailure.failure()?.errorText?.slice(0, 500) ?? "request_failed",
        });
      });

      const response = await page.goto(request.targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: request.timeoutMs,
      });
      await page.waitForLoadState("networkidle", { timeout: Math.min(request.timeoutMs, 10_000) }).catch(() => undefined);

      const title = await page.title();
      const bodyVisible = await page.locator("body").isVisible().catch(() => false);
      const finalUrl = page.url();
      const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
      await context.tracing.stop({ path: tracePath });
      const trace = readFileSync(tracePath);
      const status = response?.status();
      const checks = [
        {
          id: "document-response",
          passed: status !== undefined && status < 400,
          detail: status === undefined ? "Navigation produced no document response." : `Document returned HTTP ${status}.`,
        },
        {
          id: "target-origin",
          passed: sameOrigin(request.targetUrl, finalUrl),
          detail: sameOrigin(request.targetUrl, finalUrl)
            ? "Top-level navigation remained on the configured target origin."
            : `Top-level navigation left the configured target origin and ended at ${redactNetworkUrl(finalUrl)}.`,
        },
        {
          id: "body-visible",
          passed: bodyVisible,
          detail: bodyVisible ? "Document body is visible." : "Document body is not visible.",
        },
        {
          id: "console-errors",
          passed: consoleErrors.length === 0,
          detail: consoleErrors.length === 0 ? "No browser console errors captured." : `${consoleErrors.length} console error(s) captured.`,
        },
      ];

      await context.close();
      return {
        startedAt,
        finishedAt: new Date().toISOString(),
        targetUrl: redactNetworkUrl(request.targetUrl),
        finalUrl: redactNetworkUrl(finalUrl),
        pageTitle: title,
        httpStatus: status,
        checks,
        consoleErrors,
        network,
        screenshot,
        trace,
      };
    } finally {
      await browser?.close().catch(() => undefined);
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

function artifactItem(artifact: StoredArtifact) {
  return {
    id: artifact.id,
    type: artifact.type,
    uri: artifact.uri,
    sha256: artifact.sha256,
    classification: artifact.classification,
    redacted: artifact.redacted,
  };
}

export class PlaywrightWorkerAdapter implements CapabilityAdapter {
  readonly id = "qa-playwright-worker-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly artifacts: ArtifactStore,
    private readonly executor: BrowserExecutor = new PlaywrightBrowserExecutor(),
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.playwright.test.run") {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: `Playwright worker does not implement ${definition.id}`,
      };
    }

    const integration = loadQaIntegrationStatus().playwright;
    const target = resolvePlaywrightTarget(context.projectId, context.environment);
    if (integration.mode !== "live" || !target) {
      return this.fallback.execute(definition, context, payload);
    }

    const suite = String(payload.suite ?? "story-smoke");
    if (!ALLOWED_SUITES.has(suite)) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: `Suite ${suite} is not allowlisted. Allowed suites: ${[...ALLOWED_SUITES].join(", ")}`,
      };
    }

    const storyId = String(payload.storyId ?? `${context.projectId}-UNSCOPED`);
    const build = String(payload.build ?? "unknown");
    const testCaseId = `${storyId}:${suite}`;

    try {
      const evidence = await this.executor.run({
        targetUrl: target,
        timeoutMs: integration.timeoutMs,
        storyId,
        suite,
      });
      const failedChecks = evidence.checks.filter((check) => !check.passed);
      const status = failedChecks.length === 0 ? "passed" : "failed";
      const evidenceArtifacts: StoredArtifact[] = [];

      if (evidence.screenshot) {
        evidenceArtifacts.push(this.artifacts.write(
          context.runId,
          "screenshot",
          "story-smoke.png",
          evidence.screenshot,
          { classification: "internal-qa-evidence", mediaType: "image/png" },
        ));
      }
      if (evidence.trace) {
        evidenceArtifacts.push(this.artifacts.write(
          context.runId,
          "playwright-trace",
          "trace.zip",
          evidence.trace,
          { classification: "internal-qa-evidence", mediaType: "application/zip" },
        ));
      }
      evidenceArtifacts.push(this.artifacts.writeJson(
        context.runId,
        "network-evidence",
        "network.json",
        {
          targetUrl: evidence.targetUrl,
          finalUrl: evidence.finalUrl,
          requests: evidence.network,
          boundedAt: MAX_NETWORK_EVENTS,
          queryStringsRemoved: true,
        },
        { classification: "internal-qa-evidence", redacted: true },
      ));

      const testResult = {
        runId: context.runId,
        testCaseId,
        status,
        build,
        startedAt: evidence.startedAt,
        finishedAt: evidence.finishedAt,
        evidenceIds: evidenceArtifacts.map((artifact) => artifact.id),
        failure: failedChecks.length ? {
          failedChecks,
          consoleErrors: evidence.consoleErrors,
        } : null,
        summary: {
          suite,
          projectId: context.projectId,
          environment: context.environment,
          pageTitle: evidence.pageTitle,
          targetUrl: evidence.targetUrl,
          finalUrl: evidence.finalUrl,
          httpStatus: evidence.httpStatus,
          checks: evidence.checks,
        },
      };
      const resultArtifact = this.artifacts.writeJson(
        context.runId,
        "test-execution-result",
        "test-result.json",
        testResult,
      );
      evidenceArtifacts.push(resultArtifact);

      const evidenceManifest = {
        runId: context.runId,
        items: evidenceArtifacts.map(artifactItem),
      };
      const manifestArtifact = this.artifacts.writeJson(
        context.runId,
        "evidence-manifest",
        "evidence-manifest.json",
        evidenceManifest,
      );

      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          execution: {
            suite,
            storyId,
            projectId: context.projectId,
            environment: context.environment,
            status,
            checks: evidence.checks,
            consoleErrorCount: evidence.consoleErrors.length,
            networkEventCount: evidence.network.length,
          },
          testResultArtifact: resultArtifact,
          evidenceManifestArtifact: manifestArtifact,
          evidence: evidenceArtifacts,
          note: "A real isolated Chromium run executed against the server-configured non-production target. No Jira/Teams write occurred.",
        },
      };
    } catch (error) {
      const failureResult = {
        runId: context.runId,
        testCaseId,
        status: "error",
        build,
        startedAt: context.requestedAt,
        finishedAt: new Date().toISOString(),
        evidenceIds: [],
        failure: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
      const resultArtifact = this.artifacts.writeJson(
        context.runId,
        "test-execution-result",
        "test-result.json",
        failureResult,
      );
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        data: { testResultArtifact: resultArtifact },
        error: failureResult.failure.message,
      };
    }
  }
}
