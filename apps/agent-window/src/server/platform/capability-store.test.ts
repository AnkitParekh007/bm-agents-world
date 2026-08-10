import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { CapabilityBroker } from "./capability-broker.js";
import { SqliteCapabilityStore } from "./capability-store.js";
import type { ExecutionContext } from "./capability-types.js";
import { QA_CAPABILITIES, QaMockAdapter } from "../qa/qa-capabilities.js";

function context(): ExecutionContext {
  return {
    runId: "11111111-1111-4111-8111-111111111111",
    userId: "qa-requester",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-a",
    requestedAt: "2026-08-10T00:00:00.000Z",
  };
}

test("SQLite store survives broker restart with run, action, approval, and audit state", async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-state-test-"));
  const path = resolve(directory, "qa.sqlite");
  try {
    const firstStore = new SqliteCapabilityStore(path);
    const firstBroker = new CapabilityBroker(QA_CAPABILITIES, [new QaMockAdapter()], firstStore);
    const run = firstBroker.startRun(context());
    assert.equal(run.id, context().runId);

    const action = firstBroker.requestAction(
      "qa.teams.status.post",
      context(),
      { channel: "Teams-activities", message: "QA status" },
    );
    assert.equal(action.status, "pending_approval");
    firstBroker.decideAction(action.id, "approved", "qa-reviewer");
    const executed = await firstBroker.executeAction(action.id);
    assert.equal(executed.status, "executed");
    firstStore.close();

    const secondStore = new SqliteCapabilityStore(path);
    const secondBroker = new CapabilityBroker(QA_CAPABILITIES, [new QaMockAdapter()], secondStore);
    const restoredRun = secondBroker.getRun(context().runId);
    const restoredAction = secondBroker.getAction(action.id);

    assert.equal(restoredRun?.context.userId, "qa-requester");
    assert.equal(restoredRun?.context.tenantId, "tenant-a");
    assert.equal(restoredAction?.status, "executed");
    assert.equal(restoredAction?.approval?.status, "approved");
    assert.equal(restoredAction?.approval?.decidedBy, "qa-reviewer");
    assert.equal(secondBroker.listActionsForRun(context().runId).length, 1);
    assert.ok(secondBroker.listAudit(20).some((event) => event.event === "approval.approved"));
    assert.ok(secondBroker.listAudit(20).some((event) => event.event === "action.executed"));
    secondStore.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
