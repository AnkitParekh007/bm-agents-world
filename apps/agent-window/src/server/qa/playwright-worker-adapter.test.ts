import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { ArtifactStore } from "../platform/artifact-store.js";
import type { ExecutionContext } from "../platform/capability-types.js";
import { QaMockAdapter, QA_CAPABILITIES } from "./qa-capabilities.js";
import type { BrowserExecutor, BrowserRunRequest } from "./playwright-worker-adapter.js";
import { PlaywrightWorkerAdapter } from "./playwright-worker-adapter.js";

const definition = QA_CAPABILITIES.find((item) => item.id === "qa.playwright.test.run");
if (!definition) throw new Error("Missing Playwright capability definition");

function context(): ExecutionContext {
  return {
    runId: "run-playwright-test",
    userId: "user-test",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-test",
    requestedAt: new Date().toISOString(),
  };
}

class FakeBrowserExecutor implements BrowserExecutor {
  requests: BrowserRunRequest[] = [];
  fail = false;

  async run(request: BrowserRunRequest) {
    this.requests.push(request);
    return {
      startedAt: "2026-08-10T00:00:00.000Z",
      finishedAt: "2026-08-10T00:00:01.000Z",
      targetUrl: request.targetUrl,
      finalUrl: request.targetUrl,
      pageTitle: "PCC QA",
      authenticated: Boolean(request.storageStatePath),
      cases: request.cases.map((testCase, index) => ({
        id: testCase.id,
        title: testCase.title,
        passed: !(this.fail && index === 0),
        steps: [{
          type: "expectVisible",
          passed: !(this.fail && index === 0),
          detail: this.fail && index === 0 ? "Selector body is not visible." : "Selector body is visible.",
        }],
      })),
      consoleErrors: [],
      network: [{ method: "GET", url: request.targetUrl, status: 200 }],
      screenshot: Buffer.from("png-evidence"),
      trace: Buffer.from("zip-evidence"),
    };
  }
}

function withPlaywrightEnvironment(run: () => Promise<void>) {
  const keys = ["QA_PLAYWRIGHT_ENABLED", "QA_PCC_PLAYWRIGHT_QA_URL", "QA_PCC_PLAYWRIGHT_STORAGE_STATE"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  process.env.QA_PLAYWRIGHT_ENABLED = "true";
  process.env.QA_PCC_PLAYWRIGHT_QA_URL = "https://qa.pcc.example.test";
  delete process.env.QA_PCC_PLAYWRIGHT_STORAGE_STATE;
  return run().finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("Playwright worker selects project tests and produces schema-shaped evidence", async () => withPlaywrightEnvironment(async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-artifact-test-"));
  try {
    const store = new ArtifactStore(directory);
    const executor = new FakeBrowserExecutor();
    const adapter = new PlaywrightWorkerAdapter(new QaMockAdapter(), store, executor);
    const result = await adapter.execute(definition, context(), {
      suite: "story-smoke",
      storyId: "PCC-101",
      build: "qa-2026.08.10",
      changedFiles: ["src/app/supplier.ts"],
    });

    assert.equal(result.ok, true);
    assert.equal(result.mode, "live");
    assert.equal(result.externalSideEffect, false);
    assert.equal(executor.requests.length, 1);
    assert.equal(executor.requests[0]?.targetUrl, "https://qa.pcc.example.test");
    assert.equal(executor.requests[0]?.cases[0]?.id, "pcc-shell");
    assert.equal(executor.requests[0]?.storageStatePath, undefined);

    const data = result.data as Record<string, any>;
    assert.equal(data.execution.status, "passed");
    assert.deepEqual(data.execution.selectedCases, ["pcc-shell"]);
    assert.equal(data.testResultArtifact.type, "test-execution-result");
    assert.equal(data.evidenceManifestArtifact.type, "evidence-manifest");
    assert.equal(data.bugDraftArtifact, undefined);
    assert.ok(store.find(data.testResultArtifact.id));
    assert.ok(store.find(data.evidenceManifestArtifact.id));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));

test("failed project QA creates a bug-draft artifact but performs no Jira write", async () => withPlaywrightEnvironment(async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-artifact-test-"));
  try {
    const store = new ArtifactStore(directory);
    const executor = new FakeBrowserExecutor();
    executor.fail = true;
    const adapter = new PlaywrightWorkerAdapter(new QaMockAdapter(), store, executor);
    const result = await adapter.execute(definition, context(), {
      suite: "story-smoke",
      storyId: "PCC-202",
      build: "qa-build-202",
    });

    assert.equal(result.ok, true);
    assert.equal(result.externalSideEffect, false);
    const data = result.data as Record<string, any>;
    assert.equal(data.execution.status, "failed");
    assert.equal(data.bugDraftArtifact.type, "bug-draft");
    const found = store.find(data.bugDraftArtifact.id);
    assert.ok(found?.diskPath);
    const draft = JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(found.diskPath, "utf8")));
    assert.equal(draft.parentIssue, "PCC-202");
    assert.equal(draft.environment, "qa");
    assert.ok(Array.isArray(draft.stepsToReproduce));
    assert.ok(Array.isArray(draft.evidenceIds));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));

test("Playwright worker rejects suites outside the server allowlist", async () => withPlaywrightEnvironment(async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-artifact-test-"));
  try {
    const adapter = new PlaywrightWorkerAdapter(new QaMockAdapter(), new ArtifactStore(directory), new FakeBrowserExecutor());
    const result = await adapter.execute(definition, context(), { suite: "arbitrary-script" });
    assert.equal(result.ok, false);
    assert.match(result.error ?? "", /not allowlisted/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));

test("Playwright worker preserves mock fallback when live execution is disabled", async () => {
  const previous = process.env.QA_PLAYWRIGHT_ENABLED;
  delete process.env.QA_PLAYWRIGHT_ENABLED;
  const directory = mkdtempSync(resolve(tmpdir(), "bm-artifact-test-"));
  try {
    const adapter = new PlaywrightWorkerAdapter(new QaMockAdapter(), new ArtifactStore(directory), new FakeBrowserExecutor());
    const result = await adapter.execute(definition, context(), { suite: "story-smoke" });
    assert.equal(result.ok, true);
    assert.equal(result.mode, "mock");
  } finally {
    if (previous !== undefined) process.env.QA_PLAYWRIGHT_ENABLED = previous;
    rmSync(directory, { recursive: true, force: true });
  }
});
