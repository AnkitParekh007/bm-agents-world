import assert from "node:assert/strict";
import test from "node:test";
import { compileWorkflow } from "./workflow-compiler.js";
import { executeWorkflow, type StepRunner, type WorkflowRunContext } from "./workflow-executor.js";

const workflowDoc = {
  metadata: { id: "gated-execution" },
  steps: [
    { id: "readiness", agent: "environment-readiness" },
    { id: "gate", type: "policy-and-human-gate", dependsOn: ["readiness"] },
    { id: "browser", agent: "browser-qa", dependsOn: ["gate"] },
    { id: "api", agent: "api-qa", dependsOn: ["gate"] },
    { id: "evidence", agent: "evidence-curator", dependsOn: ["browser", "api"] },
  ],
};

function mockRunner(fail: Set<string> = new Set()): { runner: StepRunner; calls: string[] } {
  const calls: string[] = [];
  const runner: StepRunner = {
    async run(step) {
      calls.push(step.id);
      if (fail.has(step.id)) return { status: "failed", error: "boom" };
      return { status: "completed", result: { ran: step.id } };
    },
  };
  return { runner, calls };
}

function context(overrides: Partial<WorkflowRunContext> = {}): WorkflowRunContext {
  return { runId: "run-1", results: {}, ...overrides };
}

function statusOf(steps: { id: string; status: string }[], id: string): string {
  return steps.find((step) => step.id === id)!.status;
}

test("runs to completion when gates are approved", async () => {
  const { runner, calls } = mockRunner();
  const compiled = compileWorkflow(workflowDoc);
  const result = await executeWorkflow(compiled, runner, context({ approvals: new Set(["gate"]) }));
  assert.equal(result.status, "completed");
  assert.equal(result.pausedAt, undefined);
  assert.deepEqual(calls.sort(), ["api", "browser", "evidence", "readiness"]);
  assert.deepEqual((result.steps.find((s) => s.id === "browser")!.result as any), { ran: "browser" });
});

test("pauses at an unapproved gate and blocks its dependents", async () => {
  const { runner, calls } = mockRunner();
  const compiled = compileWorkflow(workflowDoc);
  const result = await executeWorkflow(compiled, runner, context());
  assert.equal(result.status, "awaiting_approval");
  assert.equal(result.pausedAt, "gate");
  assert.equal(statusOf(result.steps, "gate"), "awaiting_approval");
  assert.equal(statusOf(result.steps, "browser"), "pending");
  assert.equal(statusOf(result.steps, "evidence"), "pending");
  // The gate is never delegated to the runner; only the pre-gate step ran.
  assert.deepEqual(calls, ["readiness"]);
});

test("a failed step fails the run and skips its dependents", async () => {
  const { runner } = mockRunner(new Set(["browser"]));
  const compiled = compileWorkflow(workflowDoc);
  const result = await executeWorkflow(compiled, runner, context({ approvals: new Set(["gate"]) }));
  assert.equal(result.status, "failed");
  assert.equal(statusOf(result.steps, "browser"), "failed");
  assert.equal(statusOf(result.steps, "api"), "completed");
  assert.equal(statusOf(result.steps, "evidence"), "skipped");
});

test("refuses to execute an invalid workflow (fail-closed)", async () => {
  const { runner } = mockRunner();
  const cyclic = compileWorkflow({ metadata: { id: "c" }, steps: [{ id: "a", dependsOn: ["b"] }, { id: "b", dependsOn: ["a"] }] });
  const result = await executeWorkflow(cyclic, runner, context());
  assert.equal(result.status, "failed");
  assert.ok(result.diagnostics.length > 0);
  await assert.rejects(() => executeWorkflow(cyclic, runner, context(), { strict: true }), /Refusing to execute/);
});

test("resumes after approval without re-executing completed work", async () => {
  const compiled = compileWorkflow(workflowDoc);

  const first = mockRunner();
  const shared = context();
  const paused = await executeWorkflow(compiled, first.runner, shared);
  assert.equal(paused.status, "awaiting_approval");
  assert.deepEqual(first.calls, ["readiness"]);

  const second = mockRunner();
  const resumed = await executeWorkflow(compiled, second.runner, {
    ...shared,
    approvals: new Set(["gate"]),
    completedSteps: new Set(["readiness"]),
  });
  assert.equal(resumed.status, "completed");
  // readiness is not re-run on resume; only the post-gate steps execute.
  assert.deepEqual(second.calls.sort(), ["api", "browser", "evidence"]);
});

test("step states are ordered by wave then id", async () => {
  const { runner } = mockRunner();
  const compiled = compileWorkflow(workflowDoc);
  const result = await executeWorkflow(compiled, runner, context({ approvals: new Set(["gate"]) }));
  assert.deepEqual(result.steps.map((step) => step.id), ["readiness", "gate", "api", "browser", "evidence"]);
});
