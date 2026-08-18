import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "./platform/capability-broker.js";
import { BitbucketReadAdapter } from "./qa/bitbucket-read-adapter.js";
import { JiraReadAdapter } from "./qa/jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa/qa-capabilities.js";
import { buildQaGrantRegistry } from "./qa/qa-grants.js";
import { PackRegistry } from "./pack-registry.js";
import { InMemoryWorkflowRunStore } from "./workflow-run-store.js";
import { GovernedWorkflowService, WorkflowServiceError } from "./workflow-run-service.js";

function service(store = new InMemoryWorkflowRunStore()) {
  const mock = new QaMockAdapter();
  const broker = new CapabilityBroker(
    QA_CAPABILITIES,
    [mock, new JiraReadAdapter(mock), new BitbucketReadAdapter(mock)],
    undefined,
    buildQaGrantRegistry(),
  );
  return { svc: new GovernedWorkflowService({ registry: new PackRegistry(), broker, store }), store };
}

const scope = { projectId: "PCC", environment: "qa" as const, userId: "user-test", tenantId: "tenant-test" };

test("launching a real QA workflow governs the reads, delegates reasoning, and pauses at the gate", async () => {
  const { svc, store } = service();
  const result = await svc.launch("qa", "story-to-test-plan", scope, { runId: "run-1", inputs: { jiraIssueKey: "PCC-1" } });

  // The workflow ends at the human-approval gate.
  assert.equal(result.status, "awaiting_approval");
  assert.equal(result.pausedAt, "review");

  // Governed read steps went through the broker under the authoritative specialist identity.
  const context = store.getStep("run-1", "context")!;
  assert.equal(context.status, "completed");
  assert.equal(context.capabilityId, "qa.jira.story.read");
  assert.equal(context.agentId, "qa.story-context");
  assert.ok(context.capabilityActionId);

  const impact = store.getStep("run-1", "impact")!;
  assert.equal(impact.status, "completed");
  assert.equal(impact.capabilityId, "qa.bitbucket.change-impact.read");
  assert.equal(impact.agentId, "qa.change-impact");

  // Reasoning steps (no governed capability) were delegated, not failed.
  const risks = store.getStep("run-1", "risks")!;
  assert.equal(risks.status, "completed");
  assert.equal(risks.capabilityId, undefined);

  // The gate is awaiting authoritative approval.
  assert.equal(store.getStep("run-1", "review")!.status, "awaiting_approval");
});

test("the run is persisted with pack + workflow provenance and is readable back", async () => {
  const { svc } = service();
  await svc.launch("qa", "story-to-test-plan", scope, { runId: "run-2", inputs: { jiraIssueKey: "PCC-9" } });
  const view = svc.getRun("run-2")!;
  assert.ok(view, "the run is readable from the store");
  assert.equal(view.run.workflowId, "story-to-test-plan");
  assert.match(view.run.workflowHash, /^[0-9a-f]{64}$/);
  assert.match(view.run.packageHash ?? "", /^[0-9a-f]{64}$/);
  assert.equal(view.run.runtimeAdapter, "copilotkit");
  assert.equal(view.run.status, "awaiting_approval");
  assert.ok(view.steps.length >= 6);
});

test("relaunching with the same runId resumes idempotently (completed steps are not re-run)", async () => {
  const { svc, store } = service();
  await svc.launch("qa", "story-to-test-plan", scope, { runId: "run-3", inputs: { jiraIssueKey: "PCC-1" } });
  const contextAttempt = store.getStep("run-3", "context")!.attempt;

  await svc.launch("qa", "story-to-test-plan", scope, { runId: "run-3", inputs: { jiraIssueKey: "PCC-1" } });
  // The already-completed governed read was not driven again.
  assert.equal(store.getStep("run-3", "context")!.attempt, contextAttempt);
  assert.equal(store.getStep("run-3", "context")!.status, "completed");
});

test("unknown pack, ungoverned pack, and unknown workflow are rejected", async () => {
  const { svc } = service();
  await assert.rejects(() => svc.launch("nope", "wf", scope), (error: unknown) => error instanceof WorkflowServiceError && error.code === "pack_not_found");
  await assert.rejects(() => svc.launch("java-developer", "wf", scope), (error: unknown) => error instanceof WorkflowServiceError && error.code === "pack_not_governed");
  await assert.rejects(() => svc.launch("qa", "does-not-exist", scope), (error: unknown) => error instanceof WorkflowServiceError && error.code === "workflow_not_found");
  await assert.rejects(() => svc.launch("qa", "../secret", scope), (error: unknown) => error instanceof WorkflowServiceError && error.code === "workflow_not_found");
});
