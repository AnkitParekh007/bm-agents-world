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

  async run(request: BrowserRunRequest) {
    this.requests.push(request);
    return {
      startedAt: "2026-08-10T00:00:00.000Z",
      finishedAt: "2026-08-10T00:00:01.000Z",
      targetUrl: request.targetUrl,
      finalUrl: request.targetUrl,
      pageTitle: "PCC QA",
      httpStatus: 200,
      checks: [
        { id: "document-response", passed: true, detail: "Document returned HTTP 200." },
        { id: "body-visible", passed: true, detail: "Document body is visible." },
        { id: "console-errors", passed: true, detail: "No browser console errors captured." },
      ],
      consoleErrors: [],
      network: [{ method: "GET", url: request.targetUrl, status: 200 }],
      screenshot: Buffer.from("png-evidence"),
      trace: Buffer.from("zip-evidence"),
    };
  }
}

function withPlaywrightEnvironment(run: () => Promise<void>) {
  const previous = {
    enabled: process.env.QA_PLAYWRIGHT_ENABLED,
    target: process.env.QA_PCC_PLAYWRIGHT_QA_URL,
  };
  process.env.QA_PLAYWRIGHT_ENABLED = "true";
  process.env.QA_PCC_PLAYWRIGHT_QA_URL = "https://qa.pcc.example.test";
  return run().finally(() => {
    if (previous.enabled === undefined) delete process.env.QA_PLAYWRIGHT_ENABLED;
    else process.env.QA_PLAYWRIGHT_ENABLED = previous.enabled;
    if (previous.target === undefined) delete process.env.QA_PCC_PLAYWRIGHT_QA_URL;
    else process.env.QA_PCC_PLAYWRIGHT_QA_URL = previous.target;
  });
}

test("Playwright worker produces schema-shaped evidence artifacts", async () => withPlaywrightEnvironment(async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-artifact-test-"));
  try {
    const store = new ArtifactStore(directory);
    const executor = new FakeBrowserExecutor();
    const adapter = new PlaywrightWorkerAdapter(new QaMockAdapter(), store, executor);
    const result = await adapter.execute(definition, context(), {
      suite: "story-smoke",
      storyId: "PCC-101",
      build: "qa-2026.08.10",
    });

    assert.equal(result.ok, true);
    assert.equal(result.mode, "live");
    assert.equal(result.externalSideEffect, false);
    assert.equal(executor.requests.length, 1);
    assert.equal(executor.requests[0]?.targetUrl, "https://qa.pcc.example.test");

    const data = result.data as Record<string, any>;
    assert.equal(data.execution.status, "passed");
    assert.equal(data.testResultArtifact.type, "test-execution-result");
    assert.equal(data.evidenceManifestArtifact.type, "evidence-manifest");
    assert.ok(store.find(data.testResultArtifact.id));
    assert.ok(store.find(data.evidenceManifestArtifact.id));
    assert.equal(data.evidence.length, 4);
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
