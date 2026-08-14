import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import type { ExecutionContext } from "../platform/capability-types.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa-capabilities.js";
import { ApiContractAdapter, apiContractAdapterMode } from "./qa-api-contract-adapter.js";

const context: ExecutionContext = {
  runId: "run-api",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-test",
  requestedAt: "2026-08-14T00:00:00.000Z",
};

const definition = QA_CAPABILITIES.find((item) => item.id === "qa.api.contract.test");

function withEnv(path: string | undefined, run: () => Promise<void>) {
  const previous = process.env.QA_API_CONTRACTS_PATH;
  if (path === undefined) delete process.env.QA_API_CONTRACTS_PATH;
  else process.env.QA_API_CONTRACTS_PATH = path;
  return run().finally(() => {
    if (previous === undefined) delete process.env.QA_API_CONTRACTS_PATH;
    else process.env.QA_API_CONTRACTS_PATH = previous;
  });
}

function allowlistFile(dir: string): string {
  const path = join(dir, "contracts.yaml");
  writeFileSync(
    path,
    [
      "contracts:",
      "  - id: suppliers-list",
      "    projectId: PCC",
      "    method: GET",
      "    url: https://qa.pcc.internal/api/suppliers",
      "    expectStatus: 200",
      "    maxLatencyMs: 2000",
      "    expectJsonFields: [data.total]",
    ].join("\n"),
    "utf8",
  );
  return path;
}

test("runs an allowlisted contract and reports per-assertion results", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-api-"));
  try {
    let requested = "";
    const fetchImpl: typeof fetch = async (input) => {
      requested = String(input);
      return new Response(JSON.stringify({ data: { total: 3 } }), { status: 200, headers: { "content-type": "application/json" } });
    };
    await withEnv(allowlistFile(dir), async () => {
      const adapter = new ApiContractAdapter(new QaMockAdapter(), fetchImpl);
      const result = await adapter.execute(definition, context, { contractId: "suppliers-list" });
      assert.equal(result.ok, true);
      assert.equal(result.mode, "live");
      assert.equal(result.externalSideEffect, false);
      assert.equal(requested, "https://qa.pcc.internal/api/suppliers");
      const data = result.data as any;
      assert.equal(data.passed, true);
      assert.ok(data.assertions.find((item: any) => item.name === "status")?.passed);
      assert.ok(data.assertions.find((item: any) => item.name === "field:data.total")?.passed);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a missing expected field fails the contract without erroring", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-api-"));
  try {
    const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ data: {} }), { status: 200, headers: { "content-type": "application/json" } });
    await withEnv(allowlistFile(dir), async () => {
      const adapter = new ApiContractAdapter(new QaMockAdapter(), fetchImpl);
      const result = await adapter.execute(definition, context, { contractId: "suppliers-list" });
      assert.equal(result.ok, true);
      assert.equal((result.data as any).passed, false);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects a contract id that is not on the project allowlist", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-api-"));
  try {
    let called = 0;
    const fetchImpl: typeof fetch = async () => { called += 1; return new Response("{}", { status: 200 }); };
    await withEnv(allowlistFile(dir), async () => {
      const adapter = new ApiContractAdapter(new QaMockAdapter(), fetchImpl);
      const result = await adapter.execute(definition, context, { contractId: "unknown" });
      assert.equal(result.ok, false);
      assert.match(result.error ?? "", /allowlist/);
      assert.equal(called, 0);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("apiContractAdapterMode is live only with a configured allowlist", async () => {
  const dir = mkdtempSync(resolve(tmpdir(), "bm-api-"));
  try {
    await withEnv(undefined, async () => assert.equal(apiContractAdapterMode(), "mock"));
    await withEnv(allowlistFile(dir), async () => assert.equal(apiContractAdapterMode(), "live"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("falls back to an honest mock when no allowlist is configured", async () => {
  assert.ok(definition);
  let called = 0;
  const fetchImpl: typeof fetch = async () => { called += 1; return new Response("{}", { status: 200 }); };
  await withEnv(undefined, async () => {
    const adapter = new ApiContractAdapter(new QaMockAdapter(), fetchImpl);
    const result = await adapter.execute(definition, context, { contractId: "suppliers-list" });
    assert.equal(result.mode, "mock");
    assert.equal((result.data as any).simulated, true);
    assert.equal(called, 0);
  });
});
