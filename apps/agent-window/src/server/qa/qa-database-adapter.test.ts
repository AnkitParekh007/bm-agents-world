import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import type { ExecutionContext } from "../platform/capability-types.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa-capabilities.js";
import { DatabaseValidationAdapter, type DatabaseValidationExecutor } from "./qa-database-adapter.js";

const context: ExecutionContext = {
  runId: "run-db",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-test",
  requestedAt: "2026-08-14T00:00:00.000Z",
};

const definition = QA_CAPABILITIES.find((item) => item.id === "qa.database.validation.read");
const ENV_KEYS = ["QA_DATABASE_URL", "QA_DATABASE_VALIDATIONS_PATH"] as const;

function withEnv(values: Record<string, string | undefined>, run: () => Promise<void>) {
  const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return run().finally(() => {
    for (const key of ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key] as string;
    }
  });
}

function allowlistFile(dir: string): string {
  const path = join(dir, "validations.yaml");
  writeFileSync(
    path,
    [
      "validations:",
      "  - id: orphan-suppliers",
      "    projectId: PCC",
      "    description: Suppliers without an owning account",
      "    sql: SELECT id FROM suppliers WHERE account_id IS NULL",
      "    expectZeroRows: true",
    ].join("\n"),
    "utf8",
  );
  return path;
}

test("runs an allowlisted read-only validation and returns a verdict without row data", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-db-"));
  try {
    let executed = "";
    const executor: DatabaseValidationExecutor = {
      async run(sql) { executed = sql; return { rowCount: 0, rows: [{ id: 1 }] }; },
    };
    await withEnv({ QA_DATABASE_URL: "postgres://ro@db/qa", QA_DATABASE_VALIDATIONS_PATH: allowlistFile(dir) }, async () => {
      const adapter = new DatabaseValidationAdapter(new QaMockAdapter(), executor);
      const result = await adapter.execute(definition, context, { validationId: "orphan-suppliers" });
      assert.equal(result.ok, true);
      assert.equal(result.mode, "live");
      const data = result.data as any;
      assert.equal(data.rowCount, 0);
      assert.equal(data.passed, true, "expectZeroRows with 0 rows is a pass");
      assert.equal(data.rows, undefined, "row data is withheld by default");
      assert.match(executed, /SELECT id FROM suppliers/);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects a validation id that is not on the project allowlist", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-db-"));
  try {
    let called = 0;
    const executor: DatabaseValidationExecutor = { async run() { called += 1; return { rowCount: 0, rows: [] }; } };
    await withEnv({ QA_DATABASE_URL: "postgres://ro@db/qa", QA_DATABASE_VALIDATIONS_PATH: allowlistFile(dir) }, async () => {
      const adapter = new DatabaseValidationAdapter(new QaMockAdapter(), executor);
      const result = await adapter.execute(definition, context, { validationId: "drop-everything" });
      assert.equal(result.ok, false);
      assert.match(result.error ?? "", /allowlist/);
      assert.equal(called, 0);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("falls back to an honest mock when no database is configured", async () => {
  assert.ok(definition);
  let called = 0;
  const executor: DatabaseValidationExecutor = { async run() { called += 1; return { rowCount: 0, rows: [] }; } };
  await withEnv({ QA_DATABASE_URL: undefined, QA_DATABASE_VALIDATIONS_PATH: undefined }, async () => {
    const adapter = new DatabaseValidationAdapter(new QaMockAdapter(), executor);
    const result = await adapter.execute(definition, context, { validationId: "orphan-suppliers" });
    assert.equal(result.mode, "mock");
    assert.equal((result.data as any).simulated, true);
    assert.equal(called, 0);
  });
});
