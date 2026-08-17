import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "./platform/capability-broker.js";
import type { CapabilityBrokerContract, MaybePromise } from "./platform/capability-broker-contract.js";
import type {
  AuditEvent,
  CapabilityAction,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "./platform/capability-types.js";
import type { CapabilityRun } from "./platform/capability-store.js";
import { BitbucketReadAdapter } from "./qa/bitbucket-read-adapter.js";
import { JiraReadAdapter } from "./qa/jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa/qa-capabilities.js";
import { buildQaGrantRegistry, qaSpecialistAgentId } from "./qa/qa-grants.js";
import { compileWorkflow, type CompiledWorkflowStep } from "./workflow-compiler.js";
import type { WorkflowRunContext } from "./workflow-executor.js";
import { BrokerStepRunner, type CapabilityStepBinding } from "./workflow-broker-runner.js";
import { executeWorkflowRun } from "./workflow-run-executor.js";
import { InMemoryWorkflowRunStore } from "./workflow-run-store.js";

/** Delegating broker that counts request/execute calls to prove idempotency. */
class CountingBroker implements CapabilityBrokerContract {
  requests = 0;
  executes = 0;
  constructor(private readonly inner: CapabilityBrokerContract) {}
  listCapabilities(): CapabilityDefinition[] {
    return this.inner.listCapabilities();
  }
  startRun(context: ExecutionContext): MaybePromise<CapabilityRun> {
    return this.inner.startRun(context);
  }
  getRun(runId: string): MaybePromise<CapabilityRun | undefined> {
    return this.inner.getRun(runId);
  }
  listRuns(limit?: number): MaybePromise<CapabilityRun[]> {
    return this.inner.listRuns(limit);
  }
  listActionsForRun(runId: string): MaybePromise<CapabilityAction[]> {
    return this.inner.listActionsForRun(runId);
  }
  listAudit(limit?: number): MaybePromise<AuditEvent[]> {
    return this.inner.listAudit(limit);
  }
  getAction(actionId: string): MaybePromise<CapabilityAction | undefined> {
    return this.inner.getAction(actionId);
  }
  requestAction(capabilityId: string, context: ExecutionContext, payload: Record<string, unknown>): MaybePromise<CapabilityAction> {
    this.requests++;
    return this.inner.requestAction(capabilityId, context, payload);
  }
  decideAction(actionId: string, decision: "approved" | "rejected", decidedBy: string, reason?: string): MaybePromise<CapabilityAction> {
    return this.inner.decideAction(actionId, decision, decidedBy, reason);
  }
  executeAction(actionId: string): Promise<CapabilityAction> {
    this.executes++;
    return this.inner.executeAction(actionId);
  }
}

function countingBroker() {
  const mock = new QaMockAdapter();
  // The teams capability's adapterId is "qa-teams-adapter"; register a thin
  // executor under that id (delegating to the mock) so the approval-resume path
  // can execute end to end in this fixture.
  const teams: CapabilityAdapter = { id: "qa-teams-adapter", execute: (def, ctx, payload) => mock.execute(def, ctx, payload) };
  const inner = new CapabilityBroker(
    QA_CAPABILITIES,
    [mock, new JiraReadAdapter(mock), new BitbucketReadAdapter(mock), teams],
    undefined,
    buildQaGrantRegistry(),
  );
  return new CountingBroker(inner);
}

function baseContext(agentId: string) {
  return (_step: CompiledWorkflowStep, context: WorkflowRunContext): ExecutionContext => ({
    runId: context.runId,
    userId: "user-test",
    agentId,
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-test",
    requestedAt: new Date().toISOString(),
  });
}

const resolverFrom = (map: Record<string, CapabilityStepBinding>) => (step: CompiledWorkflowStep) => map[step.id];

test("a governed step is attributed to the compiled workflow agent, not a caller-named identity", async () => {
  // buildContext names the unrestricted supervisor "qa"; resolveAgentId derives
  // the real specialist (qa.browser-qa) from the compiled step. The authoritative
  // identity must win, so a capability outside browser-qa's grant is denied — the
  // workflow cannot route around the specialist grants via a permissive context.
  const broker = countingBroker();
  const runner = new BrokerStepRunner({
    broker,
    resolveCapability: resolverFrom({ bug: { capabilityId: "qa.jira.bug.create", payload: {} } }),
    buildContext: baseContext("qa"),
    resolveAgentId: (step) => qaSpecialistAgentId(step.agent ?? ""),
  });
  const compiled = compileWorkflow({ metadata: { id: "wf" }, steps: [{ id: "bug", agent: "browser-qa", skill: "qa.bug" }] });
  const store = new InMemoryWorkflowRunStore();

  const result = await executeWorkflowRun(compiled, runner, store, { runId: "run-A" });
  assert.equal(result.status, "failed");
  const step = store.getStep("run-A", "bug")!;
  assert.equal(step.agentId, "qa.browser-qa");
  assert.match(step.error ?? "", /not granted/);
});

test("an executable step with no capability binding fails closed", async () => {
  const broker = countingBroker();
  const runner = new BrokerStepRunner({
    broker,
    resolveCapability: () => undefined,
    buildContext: baseContext("qa"),
    resolveAgentId: () => "qa",
  });
  const compiled = compileWorkflow({ metadata: { id: "wf" }, steps: [{ id: "run-tests", agent: "browser-qa", skill: "qa.playwright" }] });
  const store = new InMemoryWorkflowRunStore();

  const result = await executeWorkflowRun(compiled, runner, store, { runId: "run-B" });
  assert.equal(result.status, "failed");
  assert.match(store.getStep("run-B", "run-tests")!.error ?? "", /unmapped executable|no governed capability/);
  assert.equal(broker.requests, 0, "no capability action is requested for an unmapped executable step");
});

test("the run persists the audit chain: agent, capability, action, and input hash", async () => {
  const broker = countingBroker();
  const runner = new BrokerStepRunner({
    broker,
    resolveCapability: resolverFrom({ read: { capabilityId: "qa.jira.story.read", payload: { storyId: "PCC-1" } } }),
    buildContext: baseContext("qa"),
    resolveAgentId: (step) => qaSpecialistAgentId(step.agent ?? ""),
  });
  const compiled = compileWorkflow({ metadata: { id: "wf" }, steps: [{ id: "read", agent: "story-context", skill: "qa.story.read" }] });
  const store = new InMemoryWorkflowRunStore();

  const result = await executeWorkflowRun(compiled, runner, store, { runId: "run-C", packageHash: "pack-abc", runtimeAdapter: "copilotkit" });
  assert.equal(result.status, "completed");
  const run = store.getRun("run-C")!;
  assert.equal(run.packageHash, "pack-abc");
  assert.equal(run.workflowHash, compiled.contentHash);
  assert.equal(run.runtimeAdapter, "copilotkit");
  const step = store.getStep("run-C", "read")!;
  assert.equal(step.agentId, "qa.story-context");
  assert.equal(step.capabilityId, "qa.jira.story.read");
  assert.ok(step.capabilityActionId, "the step is bound to a capability action");
  assert.match(step.inputHash ?? "", /^[0-9a-f]{64}$/);
});

test("an approval pause resumes from server state, reuses the bound action, and never double-fires", async () => {
  const broker = countingBroker();
  const runner = new BrokerStepRunner({
    broker,
    resolveCapability: resolverFrom({ post: { capabilityId: "qa.teams.status.post", payload: { channel: "Teams-activities", message: "done" } } }),
    buildContext: baseContext("qa"),
    resolveAgentId: (step) => qaSpecialistAgentId(step.agent ?? ""),
  });
  const compiled = compileWorkflow({ metadata: { id: "wf" }, steps: [{ id: "post", agent: "qa-reporter", skill: "qa.report" }] });
  const store = new InMemoryWorkflowRunStore();
  const launch = { runId: "run-D" };

  // First execution: L3 external write pauses for human approval.
  const paused = await executeWorkflowRun(compiled, runner, store, launch);
  assert.equal(paused.status, "awaiting_approval");
  assert.equal(paused.pausedAt, "post");
  assert.equal(broker.requests, 1);
  assert.equal(broker.executes, 0);
  const actionId = store.getStep("run-D", "post")!.capabilityActionId!;
  assert.ok(actionId);

  // Approve out of band (authoritative approval lives in the broker, not the caller).
  await broker.decideAction(actionId, "approved", "user-test");

  // Resume with NO caller-provided approval/completed sets — purely from server state.
  const resumed = await executeWorkflowRun(compiled, runner, store, launch);
  assert.equal(resumed.status, "completed");
  assert.equal(broker.requests, 1, "resume reuses the bound action — no duplicate request");
  assert.equal(broker.executes, 1);

  // A third execution is fully idempotent: the completed step is not re-run.
  const again = await executeWorkflowRun(compiled, runner, store, launch);
  assert.equal(again.status, "completed");
  assert.equal(broker.requests, 1);
  assert.equal(broker.executes, 1);
});

test("an approval-gate step resolves only from recorded server state and unblocks its dependents", async () => {
  const broker = countingBroker();
  const runner = new BrokerStepRunner({
    broker,
    resolveCapability: resolverFrom({ notify: { capabilityId: "qa.jira.story.read", payload: { storyId: "PCC-1" } } }),
    buildContext: baseContext("qa"),
    resolveAgentId: () => "qa",
  });
  const compiled = compileWorkflow({
    metadata: { id: "wf" },
    steps: [
      { id: "gate", type: "human-approval" },
      { id: "notify", agent: "qa-reporter", skill: "qa.report", dependsOn: ["gate"] },
    ],
  });
  const store = new InMemoryWorkflowRunStore();
  const launch = { runId: "run-E" };

  // Gate is not yet approved: the run pauses and the dependent does not run.
  const paused = await executeWorkflowRun(compiled, runner, store, launch);
  assert.equal(paused.status, "awaiting_approval");
  assert.equal(store.getStep("run-E", "gate")!.status, "awaiting_approval");
  assert.equal(broker.requests, 0, "the dependent capability step never ran while the gate was open");

  // An approver records the gate complete in server state.
  const gate = store.getStep("run-E", "gate")!;
  store.putStep({ ...gate, status: "completed", result: { approved: true } });

  const resumed = await executeWorkflowRun(compiled, runner, store, launch);
  assert.equal(resumed.status, "completed");
  assert.equal(store.getStep("run-E", "notify")!.status, "completed");
  assert.equal(broker.requests, 1);
});
