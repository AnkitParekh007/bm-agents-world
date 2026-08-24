import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { CapabilityBroker } from "./capability-broker.js";
import { SqliteCapabilityStore } from "./capability-store.js";
import type { ExecutionContext } from "./capability-types.js";
import { QA_CAPABILITIES, QaMockAdapter } from "../qa/qa-capabilities.js";
import { TeamsStatusAdapter } from "../qa/qa-teams-adapter.js";

/** Adapters for a QA broker, including the Teams adapter (delegates to mock in tests). */
function qaAdapters() {
  const mock = new QaMockAdapter();
  return [mock, new TeamsStatusAdapter(mock)];
}

/**
 * Best-effort removal of the test's temp directory. On Windows, node:sqlite can
 * hold the database file's handle past db.close() (its WAL/SHM sidecars), so
 * rmSync throws EPERM/EBUSY; on Linux CI the handle is released and the delete
 * succeeds. This is a teardown of a throwaway temp dir the OS reaps anyway — not
 * product behavior, which the assertions above have already verified — so we
 * retry a few times and then give up quietly on a lock rather than failing the
 * test on a platform cleanup quirk. Any non-lock error is still surfaced.
 */
async function removeTempDir(directory: string): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(directory, { recursive: true, force: true });
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EPERM" && code !== "EBUSY") throw error;
      await new Promise((done) => setTimeout(done, 50));
    }
  }
  // Still locked (Windows + experimental node:sqlite): leave it for the OS.
}

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
    const firstBroker = new CapabilityBroker(QA_CAPABILITIES, qaAdapters(), firstStore);
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
    const secondBroker = new CapabilityBroker(QA_CAPABILITIES, qaAdapters(), secondStore);
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
    await removeTempDir(directory);
  }
});
