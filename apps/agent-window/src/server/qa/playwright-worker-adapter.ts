import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import type { ArtifactRepository, StoredArtifact } from "../platform/artifact-store.js";
import { loadQaIntegrationStatus, resolvePlaywrightTarget } from "./qa-integration-config.js";
import {
  resolveProjectStorageState,
  resolveProjectTestSelection,
  type ProjectTestCase,
  type ProjectTestStep,
} from "./qa-project-tests.js";

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

function targetUrl(base: string, path: string): string {
  const url = new URL(path, `${base.replace(/\/+$/, "")}/`);
  if (!sameOrigin(base, url.toString())) throw new Error(`Test step attempted cross-origin navigation to ${url.origin}`);
  return url.toString();
}

export interface BrowserRunRequest {
  targetUrl: string;
  timeoutMs: number;
  storyId: string;
  suite: string;
  storageStatePath?: string;
  cases: ProjectTestCase[];
}

export interface BrowserCaseResult {
  id: string;
  title: string;
  passed: boolean;
  steps: Array<{ type: string; passed: boolean; detail: string }>;
}

export interface BrowserRunEvidence {
  startedAt: string;
  finishedAt: string;
  targetUrl: string;
  finalUrl: string;
  pageTitle: string;
  authenticated: boolean;
  cases: BrowserCaseResult[];
  consoleErrors: string[];
  network: Array<{ method: string; url: string; status?: number; failure?: string }>;
  screenshot?: Buffer;
  trace?: Buffer;
}

export interface BrowserExecutor {
  run(request: BrowserRunRequest): Promise<BrowserRunEvidence>;
}

async function executeStep(page: any, baseUrl: string, step: ProjectTestStep, timeoutMs: number) {
  switch (step.type) {
    case "goto": {
      const url = targetUrl(baseUrl, step.path);
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      const status = response?.status();
      const passed = status !== undefined && status < 400 && sameOrigin(baseUrl, page.url());
      return { type: step.type, passed, detail: `GET ${redactNetworkUrl(url)} returned ${status ?? "no-response"}.` };
    }
    case "expectVisible": {
      const passed = await page.locator(step.selector).first().isVisible({ timeout: Math.min(timeoutMs, 10_000) }).catch(() => false);
      return { type: step.type, passed, detail: passed ? `Selector ${step.selector} is visible.` : `Selector ${step.selector} is not visible.` };
    }
    case "expectText": {
      const actual = await page.locator(step.selector).first().textContent({ timeout: Math.min(timeoutMs, 10_000) }).catch(() => null);
      const passed = typeof actual === "string" && actual.includes(step.text);
      return { type: step.type, passed, detail: passed ? `Expected text is present in ${step.selector}.` : `Expected text was not found in ${step.selector}.` };
    }
    case "expectUrlContains": {
      const passed = page.url().includes(step.value);
      return { type: step.type, passed, detail: passed ? `URL contains ${step.value}.` : `URL does not contain ${step.value}.` };
    }
  }
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
        storageState: request.storageStatePath,
      });
      const page = await context.newPage();
      page.setDefaultTimeout(request.timeoutMs);

      await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
      page.on("console", (message) => {
        if (message.type() === "error" && consoleErrors.length < MAX_CONSOLE_ERRORS) {
          consoleErrors.push(message.text().slice(0, 1000));
        }
      });
      page.on("response", (response) => {
        if (network.length >= MAX_NETWORK_EVENTS) return;
        network.push({ method: response.request().method(), url: redactNetworkUrl(response.url()), status: response.status() });
      });
      page.on("requestfailed", (failed) => {
        if (network.length >= MAX_NETWORK_EVENTS) return;
        network.push({
          method: failed.method(),
          url: redactNetworkUrl(failed.url()),
          failure: failed.failure()?.errorText?.slice(0, 500) ?? "request_failed",
        });
      });

      const caseResults: BrowserCaseResult[] = [];
      for (const testCase of request.cases) {
        const steps: BrowserCaseResult["steps"] = [];
        for (const step of testCase.steps) {
          const result = await executeStep(page, request.targetUrl, step, request.timeoutMs);
          steps.push(result);
          if (!result.passed) break;
        }
        caseResults.push({ id: testCase.id, title: testCase.title, passed: steps.length > 0 && steps.every((item) => item.passed), steps });
      }

      const title = await page.title().catch(() => "");
      const finalUrl = page.url();
      const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
      await context.tracing.stop({ path: tracePath });
      const trace = readFileSync(tracePath);
      await context.close();

      return {
        startedAt,
        finishedAt: new Date().toISOString(),
        targetUrl: redactNetworkUrl(request.targetUrl),
        finalUrl: redactNetworkUrl(finalUrl),
        pageTitle: title,
        authenticated: Boolean(request.storageStatePath),
        cases: caseResults,
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

function bugDraftFor(
  context: ExecutionContext,
  storyId: string,
  build: string,
  suite: string,
  failedCases: BrowserCaseResult[],
  evidenceIds: string[],
) {
  const first = failedCases[0];
  return {
    title: `[QA] ${storyId} failed ${first?.title ?? suite}`,
    parentIssue: storyId,
    environment: context.environment,
    build,
    preconditions: ["Executed by governed BM Agents World Playwright worker.", "Authenticated test identity was resolved server-side when configured."],
    stepsToReproduce: first?.steps.map((step, index) => `${index + 1}. ${step.type}: ${step.detail}`) ?? [`Run ${suite}`],
    expectedResult: "All selected allowlisted QA checks pass.",
    actualResult: failedCases.map((item) => `${item.title}: ${item.steps.find((step) => !step.passed)?.detail ?? "failed"}`).join("; "),
    businessImpact: "Automated QA found a reproducible failure in the story-scoped test selection. Human triage is required before Jira creation.",
    severityRecommendation: "Major",
    evidenceIds,
    duplicateCandidates: [],
  };
}

export class PlaywrightWorkerAdapter implements CapabilityAdapter {
  readonly id = "qa-playwright-worker-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly artifacts: ArtifactRepository,
    private readonly executor: BrowserExecutor = new PlaywrightBrowserExecutor(),
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.playwright.test.run") {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Playwright worker does not implement ${definition.id}` };
    }

    const integration = loadQaIntegrationStatus().playwright;
    const target = resolvePlaywrightTarget(context.projectId, context.environment);
    if (integration.mode !== "live" || !target) return this.fallback.execute(definition, context, payload);

    const suite = String(payload.suite ?? "story-smoke");
    if (!ALLOWED_SUITES.has(suite)) {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Suite ${suite} is not allowlisted.` };
    }

    const changedFiles = Array.isArray(payload.changedFiles)
      ? payload.changedFiles.map(String).slice(0, 200)
      : [];
    const selection = resolveProjectTestSelection(context.projectId, suite, changedFiles);
    if (!selection || !selection.cases.length) {
      return { ok: false, mode: "live", externalSideEffect: false, error: `No allowlisted ${suite} tests are configured for ${context.projectId}.` };
    }

    const storageStatePath = resolveProjectStorageState(context.projectId);
    if (selection.identity.configured && (!storageStatePath || !existsSync(storageStatePath))) {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Configured Playwright test identity for ${context.projectId} could not be resolved.` };
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
        storageStatePath,
        cases: selection.cases,
      });
      const failedCases = evidence.cases.filter((item) => !item.passed);
      const status = failedCases.length === 0 ? "passed" : "failed";
      const evidenceArtifacts: StoredArtifact[] = [];

      if (evidence.screenshot) evidenceArtifacts.push(await this.artifacts.write(context.runId, "screenshot", "project-tests.png", evidence.screenshot, { classification: "internal-qa-evidence", mediaType: "image/png" }));
      if (evidence.trace) evidenceArtifacts.push(await this.artifacts.write(context.runId, "playwright-trace", "trace.zip", evidence.trace, { classification: evidence.authenticated ? "restricted-qa-evidence" : "internal-qa-evidence", mediaType: "application/zip" }));
      evidenceArtifacts.push(await this.artifacts.writeJson(context.runId, "network-evidence", "network.json", {
        targetUrl: evidence.targetUrl,
        finalUrl: evidence.finalUrl,
        requests: evidence.network,
        boundedAt: MAX_NETWORK_EVENTS,
        queryStringsRemoved: true,
      }, { classification: "internal-qa-evidence", redacted: true }));

      const testResult = {
        runId: context.runId,
        testCaseId,
        status,
        build,
        startedAt: evidence.startedAt,
        finishedAt: evidence.finishedAt,
        evidenceIds: evidenceArtifacts.map((artifact) => artifact.id),
        failure: failedCases.length ? { failedCases, consoleErrors: evidence.consoleErrors } : null,
        summary: {
          suite,
          projectId: context.projectId,
          environment: context.environment,
          authenticated: evidence.authenticated,
          identityReference: selection.identity.secretReference,
          selectedCases: selection.cases.map((item) => item.id),
          changedFiles: selection.changedFiles,
          pageTitle: evidence.pageTitle,
          targetUrl: evidence.targetUrl,
          finalUrl: evidence.finalUrl,
          caseResults: evidence.cases,
        },
      };
      const resultArtifact = await this.artifacts.writeJson(context.runId, "test-execution-result", "test-result.json", testResult);
      evidenceArtifacts.push(resultArtifact);

      let bugDraftArtifact: StoredArtifact | undefined;
      if (failedCases.length) {
        bugDraftArtifact = await this.artifacts.writeJson(
          context.runId,
          "bug-draft",
          "bug-draft.json",
          bugDraftFor(context, storyId, build, suite, failedCases, evidenceArtifacts.map((item) => item.id)),
        );
        evidenceArtifacts.push(bugDraftArtifact);
      }

      const manifestArtifact = await this.artifacts.writeJson(context.runId, "evidence-manifest", "evidence-manifest.json", {
        runId: context.runId,
        items: evidenceArtifacts.map(artifactItem),
      });

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
            authenticated: evidence.authenticated,
            selectedCases: selection.cases.map((item) => item.id),
            passed: evidence.cases.filter((item) => item.passed).length,
            failed: failedCases.length,
          },
          testResultArtifact: resultArtifact,
          evidenceManifestArtifact: manifestArtifact,
          bugDraftArtifact,
          evidence: evidenceArtifacts,
          note: "Project-specific allowlisted Chromium tests executed. Auth state, when configured, was resolved only inside the worker. Jira/Teams writes remain disabled.",
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
        failure: { message: error instanceof Error ? error.message : String(error) },
      };
      const resultArtifact = await this.artifacts.writeJson(context.runId, "test-execution-result", "test-result.json", failureResult);
      return { ok: false, mode: "live", externalSideEffect: false, data: { testResultArtifact: resultArtifact }, error: failureResult.failure.message };
    }
  }
}
