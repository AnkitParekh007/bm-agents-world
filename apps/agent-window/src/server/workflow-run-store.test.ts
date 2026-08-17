import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryWorkflowRunStore, type WorkflowStepRunRecord } from "./workflow-run-store.js";

function step(overrides: Partial<WorkflowStepRunRecord> = {}): WorkflowStepRunRecord {
  return {
    runId: "run-1",
    stepId: "read",
    agentId: "qa.story-context",
    skillId: "qa.story.read",
    capabilityId: "qa.jira.story.read",
    capabilityActionId: "act-1",
    inputHash: "hash-1",
    outputArtifactIds: [],
    status: "completed",
    attempt: 1,
    ...overrides,
  };
}

test("createRun is idempotent by runId and preserves provenance", () => {
  const store = new InMemoryWorkflowRunStore();
  const first = store.createRun({ runId: "run-1", workflowId: "wf", workflowHash: "wh", packageHash: "ph", runtimeAdapter: "copilotkit" });
  const second = store.createRun({ runId: "run-1", workflowId: "wf-other", workflowHash: "different" });
  assert.equal(first, second, "same record is returned on resume");
  assert.equal(store.getRun("run-1")!.workflowId, "wf");
  assert.equal(store.getRun("run-1")!.packageHash, "ph");
  assert.equal(store.getRun("run-1")!.runtimeAdapter, "copilotkit");
  assert.equal(store.getRun("run-1")!.status, "running");
});

test("putStep upserts by (runId, stepId) and setRunStatus updates the run", () => {
  const store = new InMemoryWorkflowRunStore();
  store.createRun({ runId: "run-1", workflowId: "wf", workflowHash: "wh" });
  store.putStep(step({ status: "awaiting_approval" }));
  store.putStep(step({ status: "completed", result: { ok: true } }));
  const persisted = store.getStep("run-1", "read")!;
  assert.equal(persisted.status, "completed");
  assert.deepEqual(persisted.result, { ok: true });
  assert.equal(store.listSteps("run-1").length, 1, "same step id is upserted, not duplicated");
  store.setRunStatus("run-1", "completed");
  assert.equal(store.getRun("run-1")!.status, "completed");
});

test("the store returns defensive copies so persisted state cannot be mutated in place", () => {
  const store = new InMemoryWorkflowRunStore();
  store.createRun({ runId: "run-1", workflowId: "wf", workflowHash: "wh" });
  store.putStep(step({ outputArtifactIds: ["a"] }));
  const read = store.getStep("run-1", "read")!;
  read.outputArtifactIds.push("tampered");
  read.status = "failed";
  const reread = store.getStep("run-1", "read")!;
  assert.deepEqual(reread.outputArtifactIds, ["a"]);
  assert.equal(reread.status, "completed");
});

test("listSteps is scoped to the run", () => {
  const store = new InMemoryWorkflowRunStore();
  store.putStep(step({ runId: "run-1", stepId: "a" }));
  store.putStep(step({ runId: "run-1", stepId: "b" }));
  store.putStep(step({ runId: "run-2", stepId: "a" }));
  assert.deepEqual(store.listSteps("run-1").map((s) => s.stepId), ["a", "b"]);
  assert.deepEqual(store.listSteps("run-2").map((s) => s.stepId), ["a"]);
});
