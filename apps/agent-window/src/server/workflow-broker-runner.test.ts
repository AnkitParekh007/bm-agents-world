import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "./platform/capability-broker.js";
import type { ExecutionContext } from "./platform/capability-types.js";
import { BitbucketReadAdapter } from "./qa/bitbucket-read-adapter.js";
import { JiraReadAdapter } from "./qa/jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa/qa-capabilities.js";
import { buildQaGrantRegistry } from "./qa/qa-grants.js";
import { compileWorkflow, type CompiledWorkflowStep } from "./workflow-compiler.js";
import { executeWorkflow, type WorkflowRunContext } from "./workflow-executor.js";
import { BrokerStepRunner, type CapabilityStepBinding } from "./workflow-broker-runner.js";

function broker(grants?: ReturnType<typeof buildQaGrantRegistry>) {
  const mock = new QaMockAdapter();
  return new CapabilityBroker(
    QA_CAPABILITIES,
    [mock, new JiraReadAdapter(mock), new BitbucketReadAdapter(mock)],
    undefined,
    grants,
  );
}

function ctxBuilder(agentId = "qa") {
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

function resolverFrom(map: Record<string, CapabilityStepBinding>) {
  return (step: CompiledWorkflowStep) => map[step.id];
}

const runContext = (): WorkflowRunContext => ({ runId: "run-1", results: {} });

const step = (id: string, extra: Partial<CompiledWorkflowStep> = {}): CompiledWorkflowStep => ({
  id,
  skills: [],
  dependsOn: [],
  wave: 0,
  ...extra,
});

test("an L0 read step is requested and executed to completion", async () => {
  const runner = new BrokerStepRunner({
    broker: broker(),
    resolveCapability: resolverFrom({ read: { capabilityId: "qa.jira.story.read", payload: { storyId: "PCC-1" } } }),
    buildContext: ctxBuilder(),
  });
  const outcome = await runner.run(step("read"), runContext());
  assert.equal(outcome.status, "completed");
});

test("an L3 write step comes back awaiting approval instead of executing", async () => {
  const runner = new BrokerStepRunner({
    broker: broker(),
    resolveCapability: resolverFrom({ post: { capabilityId: "qa.teams.status.post", payload: { channel: "Teams", message: "hi" } } }),
    buildContext: ctxBuilder(),
  });
  const outcome = await runner.run(step("post"), runContext());
  assert.equal(outcome.status, "awaiting_approval");
});

test("a step outside the agent's grant is failed by the broker", async () => {
  const runner = new BrokerStepRunner({
    broker: broker(buildQaGrantRegistry()),
    resolveCapability: resolverFrom({ bug: { capabilityId: "qa.jira.bug.create", payload: {} } }),
    buildContext: ctxBuilder("qa.browser-qa"),
  });
  const outcome = await runner.run(step("bug"), runContext());
  assert.equal(outcome.status, "failed");
  assert.match(outcome.error ?? "", /not granted/);
});

test("an unmapped step is delegated (completed) or failed per onUnmapped", async () => {
  const base = { broker: broker(), resolveCapability: () => undefined, buildContext: ctxBuilder() };
  const delegated = await new BrokerStepRunner(base).run(step("think"), runContext());
  assert.equal(delegated.status, "completed");
  const failed = await new BrokerStepRunner({ ...base, onUnmapped: "fail" }).run(step("think"), runContext());
  assert.equal(failed.status, "failed");
});

test("an unmapped step declaring a side effect fails closed, tool or action", async () => {
  const base = { broker: broker(), resolveCapability: () => undefined, buildContext: ctxBuilder() };

  const unmappedTool = await new BrokerStepRunner(base).run(step("publish", { tool: "teams.post" }), runContext());
  assert.equal(unmappedTool.status, "failed");
  assert.match(unmappedTool.error ?? "", /tool "teams\.post".*no governed capability binding/);

  // A named `action` (git.push, jira.write) is just as concrete a side effect as
  // a tool; delegating one as if it were reasoning would let a workflow perform
  // an ungoverned external write.
  const unmappedAction = await new BrokerStepRunner(base).run(step("push", { action: "git.push" }), runContext());
  assert.equal(unmappedAction.status, "failed");
  assert.match(unmappedAction.error ?? "", /action "git\.push".*no governed capability binding/);
});

test("end to end: compile a workflow and run it through the governed broker", async () => {
  const compiled = compileWorkflow({
    metadata: { id: "read-then-post" },
    steps: [
      { id: "read", agent: "story-context", skill: "qa.story.read" },
      { id: "post", agent: "qa-reporter", skill: "qa.report", dependsOn: ["read"] },
    ],
  });
  const runner = new BrokerStepRunner({
    broker: broker(),
    resolveCapability: resolverFrom({
      read: { capabilityId: "qa.jira.story.read", payload: { storyId: "PCC-1" } },
      post: { capabilityId: "qa.teams.status.post", payload: { channel: "Teams", message: "done" } },
    }),
    buildContext: ctxBuilder(),
  });

  const result = await executeWorkflow(compiled, runner, runContext());
  assert.equal(result.status, "awaiting_approval");
  assert.equal(result.pausedAt, "post");
  assert.equal(result.steps.find((s) => s.id === "read")!.status, "completed");
  assert.equal(result.steps.find((s) => s.id === "post")!.status, "awaiting_approval");
});
