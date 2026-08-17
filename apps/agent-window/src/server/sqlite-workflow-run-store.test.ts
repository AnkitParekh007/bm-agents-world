import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { InMemoryWorkflowRunStore, type WorkflowRunStore, type WorkflowStepRunRecord } from "./workflow-run-store.js";
import { SqliteWorkflowRunStore } from "./sqlite-workflow-run-store.js";

/** node:sqlite is unavailable in some sandboxes; detect so those cases skip cleanly. */
let sqliteAvailable = true;
try {
  new SqliteWorkflowRunStore(":memory:").close();
} catch {
  sqliteAvailable = false;
}
const sqliteSkip = sqliteAvailable ? false : "node:sqlite unavailable in this environment";

function step(overrides: Partial<WorkflowStepRunRecord> = {}): WorkflowStepRunRecord {
  return {
    runId: "run-1",
    stepId: "read",
    agentId: "qa.story-context",
    skillId: "qa.story.read-context",
    capabilityId: "qa.jira.story.read",
    capabilityActionId: "act-1",
    inputHash: "a".repeat(64),
    outputArtifactIds: ["artifact-1"],
    status: "completed",
    attempt: 1,
    result: { ok: true },
    ...overrides,
  };
}

/** The behavioural contract every WorkflowRunStore binding must satisfy. */
function runStoreContract(label: string, makeStore: () => WorkflowRunStore, skip: boolean | string = false) {
  test(`[${label}] createRun is idempotent by runId and preserves provenance`, { skip }, () => {
    const store = makeStore();
    const first = store.createRun({ runId: "run-1", workflowId: "wf", workflowHash: "wh", packageHash: "ph", runtimeAdapter: "copilotkit" });
    const second = store.createRun({ runId: "run-1", workflowId: "other", workflowHash: "different" });
    assert.equal(second.workflowId, first.workflowId, "the original run is preserved");
    assert.equal(store.getRun("run-1")!.packageHash, "ph");
    assert.equal(store.getRun("run-1")!.workflowHash, "wh");
    assert.equal(store.getRun("run-1")!.runtimeAdapter, "copilotkit");
    assert.equal(store.getRun("run-1")!.status, "running");
  });

  test(`[${label}] putStep upserts by (runId, stepId) with the full audit chain`, { skip }, () => {
    const store = makeStore();
    store.createRun({ runId: "run-1", workflowId: "wf", workflowHash: "wh" });
    store.putStep(step({ status: "awaiting_approval" }));
    store.putStep(step({ status: "completed", attempt: 2 }));
    const persisted = store.getStep("run-1", "read")!;
    assert.equal(persisted.status, "completed");
    assert.equal(persisted.attempt, 2);
    assert.equal(persisted.agentId, "qa.story-context");
    assert.equal(persisted.capabilityId, "qa.jira.story.read");
    assert.equal(persisted.capabilityActionId, "act-1");
    assert.deepEqual(persisted.outputArtifactIds, ["artifact-1"]);
    assert.deepEqual(persisted.result, { ok: true });
    assert.equal(store.listSteps("run-1").length, 1, "same step id upserts, not duplicates");
  });

  test(`[${label}] setRunStatus updates the run and listSteps is run-scoped`, { skip }, () => {
    const store = makeStore();
    store.createRun({ runId: "run-1", workflowId: "wf", workflowHash: "wh" });
    store.createRun({ runId: "run-2", workflowId: "wf", workflowHash: "wh" });
    store.putStep(step({ runId: "run-1", stepId: "a" }));
    store.putStep(step({ runId: "run-1", stepId: "b" }));
    store.putStep(step({ runId: "run-2", stepId: "a" }));
    store.setRunStatus("run-1", "completed");
    assert.equal(store.getRun("run-1")!.status, "completed");
    assert.equal(store.getRun("run-2")!.status, "running");
    assert.deepEqual(store.listSteps("run-1").map((s) => s.stepId), ["a", "b"]);
    assert.deepEqual(store.listSteps("run-2").map((s) => s.stepId), ["a"]);
  });
}

runStoreContract("in-memory", () => new InMemoryWorkflowRunStore());
runStoreContract("sqlite", () => new SqliteWorkflowRunStore(":memory:"), sqliteSkip);

test("the durable store survives a restart (reopen the same file)", { skip: sqliteSkip }, () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-wf-store-"));
  const path = join(dir, "workflow-runs.sqlite");
  try {
    const first = new SqliteWorkflowRunStore(path);
    first.createRun({ runId: "run-D", workflowId: "wf", workflowHash: "wh", packageHash: "ph" });
    first.putStep(step({ runId: "run-D", stepId: "post", status: "awaiting_approval", capabilityActionId: "act-D" }));
    first.close();

    // Simulate a process restart: a brand-new store over the same file.
    const reopened = new SqliteWorkflowRunStore(path);
    const run = reopened.getRun("run-D");
    assert.ok(run, "the run survived the restart");
    assert.equal(run!.packageHash, "ph");
    const post = reopened.getStep("run-D", "post")!;
    assert.equal(post.status, "awaiting_approval");
    assert.equal(post.capabilityActionId, "act-D", "the bound action id survived — a resume can reuse it");
    reopened.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
