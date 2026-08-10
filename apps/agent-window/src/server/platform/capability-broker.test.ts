import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "./capability-broker.js";
import type { ExecutionContext } from "./capability-types.js";
import { BitbucketReadAdapter } from "../qa/bitbucket-read-adapter.js";
import { JiraReadAdapter } from "../qa/jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "../qa/qa-capabilities.js";

function context(environment: ExecutionContext["environment"] = "qa"): ExecutionContext {
  return {
    runId: "run-test",
    userId: "user-test",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment,
    tenantId: "tenant-test",
    requestedAt: new Date().toISOString(),
  };
}

function broker() {
  const mock = new QaMockAdapter();
  return new CapabilityBroker(QA_CAPABILITIES, [
    mock,
    new JiraReadAdapter(mock),
    new BitbucketReadAdapter(mock),
  ]);
}

test("L0 QA reads are immediately executable", async () => {
  const instance = broker();
  const action = instance.requestAction(
    "qa.jira.story.read",
    context("qa"),
    { storyId: "PCC-101" },
  );

  assert.equal(action.riskLevel, "L0");
  assert.equal(action.status, "ready");
  assert.equal(action.approval, undefined);

  const executed = await instance.executeAction(action.id);
  assert.equal(executed.status, "executed");
  assert.equal(executed.result?.mode, "mock");
  assert.equal(executed.result?.externalSideEffect, false);
});

test("L3 external writes cannot execute before approval", async () => {
  const instance = broker();
  const action = instance.requestAction(
    "qa.jira.bug.create",
    context("qa"),
    { storyId: "PCC-101", summary: "Example defect", severity: "Major" },
  );

  assert.equal(action.riskLevel, "L3");
  assert.equal(action.status, "pending_approval");
  assert.equal(action.approval?.status, "pending");
  await assert.rejects(() => instance.executeAction(action.id), /cannot execute/);
});

test("human approval is bound to the exact payload hash", async () => {
  const instance = broker();
  const action = instance.requestAction(
    "qa.jira.bug.create",
    context("qa"),
    { storyId: "PCC-101", summary: "Example defect", severity: "Major" },
  );

  const originalHash = action.payloadHash;
  const approved = instance.decideAction(action.id, "approved", "reviewer-1");
  assert.equal(approved.status, "approved");
  assert.equal(approved.approval?.payloadHash, originalHash);
  assert.equal(approved.approval?.decidedBy, "reviewer-1");

  const executed = await instance.executeAction(action.id);
  assert.equal(executed.status, "executed");
  assert.equal(executed.payloadHash, originalHash);
  assert.equal(executed.result?.externalSideEffect, false);
});

test("production reads are elevated to L4 approval", () => {
  const instance = broker();
  const action = instance.requestAction(
    "qa.jira.story.read",
    context("prod"),
    { storyId: "PCC-101" },
  );

  assert.equal(action.riskLevel, "L4");
  assert.equal(action.status, "pending_approval");
  assert.equal(action.approval?.riskLevel, "L4");
});
