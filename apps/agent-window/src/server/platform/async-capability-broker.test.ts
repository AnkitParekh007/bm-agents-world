import assert from "node:assert/strict";
import test from "node:test";
import { AsyncCapabilityBroker, type AsyncCapabilityStore } from "./async-capability-broker.js";
import type { CapabilityRun } from "./capability-store.js";
import type { AuditEvent, CapabilityAction, ExecutionContext } from "./capability-types.js";
import { QA_CAPABILITIES, QaMockAdapter } from "../qa/qa-capabilities.js";

class MemoryAsyncStore implements AsyncCapabilityStore {
  readonly runs = new Map<string, CapabilityRun>();
  readonly actions = new Map<string, CapabilityAction>();
  readonly audit: AuditEvent[] = [];

  async upsertRun(context: ExecutionContext): Promise<CapabilityRun> {
    const existing = this.runs.get(context.runId);
    const now = new Date().toISOString();
    const run = {
      id: context.runId,
      context: structuredClone(context),
      createdAt: existing?.createdAt ?? context.requestedAt,
      updatedAt: now,
    };
    this.runs.set(run.id, run);
    return structuredClone(run);
  }

  async getRun(runId: string) {
    const value = this.runs.get(runId);
    return value ? structuredClone(value) : undefined;
  }

  async listRuns(limit = 100) {
    return [...this.runs.values()].slice(0, limit).map((item) => structuredClone(item));
  }

  async saveAction(action: CapabilityAction) {
    await this.upsertRun(action.context);
    this.actions.set(action.id, structuredClone(action));
  }

  async getAction(actionId: string) {
    const value = this.actions.get(actionId);
    return value ? structuredClone(value) : undefined;
  }

  async listActionsForRun(runId: string) {
    return [...this.actions.values()]
      .filter((item) => item.context.runId === runId)
      .map((item) => structuredClone(item));
  }

  async appendAudit(event: AuditEvent, context: ExecutionContext) {
    await this.upsertRun(context);
    this.audit.push(structuredClone(event));
  }

  async listAudit(limit = 100) {
    return this.audit.slice(-limit).reverse().map((item) => structuredClone(item));
  }
}

function context(environment: ExecutionContext["environment"] = "qa"): ExecutionContext {
  return {
    runId: "83b72e39-9715-4f41-8923-725ff32f23a8",
    userId: "qa.engineer@example.com",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment,
    tenantId: "tenant-test",
    requestedAt: new Date().toISOString(),
  };
}

function broker(store: AsyncCapabilityStore) {
  return new AsyncCapabilityBroker(QA_CAPABILITIES, [new QaMockAdapter()], store);
}

test("shared async broker preserves automatic L0 execution", async () => {
  const store = new MemoryAsyncStore();
  const instance = broker(store);
  const action = await instance.requestAction("qa.jira.story.read", context(), { storyId: "PCC-101" });
  assert.equal(action.riskLevel, "L0");
  assert.equal(action.status, "ready");
  const executed = await instance.executeAction(action.id);
  assert.equal(executed.status, "executed");
  assert.equal(executed.result?.externalSideEffect, false);
  assert.ok(executed.executionDurationMs !== undefined);
});

test("protected action can be requested on one broker and approved/executed on another", async () => {
  const store = new MemoryAsyncStore();
  const podA = broker(store);
  const podB = broker(store);

  const requested = await podA.requestAction(
    "qa.teams.status.post",
    context(),
    { channel: "Teams-activities", message: "QA status ready" },
  );
  assert.equal(requested.riskLevel, "L3");
  assert.equal(requested.status, "pending_approval");
  assert.equal(requested.approval?.status, "pending");
  await assert.rejects(() => podB.executeAction(requested.id), /cannot execute/);

  const approved = await podB.decideAction(requested.id, "approved", "qa.lead@example.com");
  assert.equal(approved.status, "approved");
  assert.equal(approved.approval?.payloadHash, requested.payloadHash);
  assert.equal(approved.approval?.decidedBy, "qa.lead@example.com");

  const executed = await podB.executeAction(requested.id);
  assert.equal(executed.status, "executed");
  assert.equal(executed.payloadHash, requested.payloadHash);
  assert.equal(executed.result?.externalSideEffect, false);

  const audit = await store.listAudit(20);
  assert.ok(audit.some((event) => event.event === "approval.approved"));
  assert.ok(audit.some((event) => event.event === "action.executed"));
});

test("shared async broker still elevates production reads to L4", async () => {
  const store = new MemoryAsyncStore();
  const action = await broker(store).requestAction(
    "qa.jira.story.read",
    context("prod"),
    { storyId: "PCC-101" },
  );
  assert.equal(action.riskLevel, "L4");
  assert.equal(action.status, "pending_approval");
  assert.equal(action.approval?.riskLevel, "L4");
});
