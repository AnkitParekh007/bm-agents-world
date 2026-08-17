import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "./capability-broker.js";
import type { ExecutionContext } from "./capability-types.js";
import { BitbucketReadAdapter } from "../qa/bitbucket-read-adapter.js";
import { JiraReadAdapter } from "../qa/jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "../qa/qa-capabilities.js";
import { buildQaGrantRegistry } from "../qa/qa-grants.js";

function context(agentId: string, environment: ExecutionContext["environment"] = "qa"): ExecutionContext {
  return {
    runId: "run-grants",
    userId: "user-test",
    agentId,
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment,
    tenantId: "tenant-test",
    requestedAt: new Date().toISOString(),
  };
}

function grantedBroker() {
  const mock = new QaMockAdapter();
  return new CapabilityBroker(
    QA_CAPABILITIES,
    [mock, new JiraReadAdapter(mock), new BitbucketReadAdapter(mock)],
    undefined,
    buildQaGrantRegistry(),
  );
}

test("a specialist may request the capability it is granted", () => {
  const action = grantedBroker().requestAction(
    "qa.jira.story.read",
    context("qa.story-context"),
    { storyId: "PCC-101" },
  );
  assert.notEqual(action.status, "rejected");
  assert.equal(action.status, "ready");
});

test("a specialist is denied a capability outside its grant, before any policy check", () => {
  const action = grantedBroker().requestAction(
    "qa.jira.bug.create",
    context("qa.browser-qa"),
    { bugDraftArtifactId: "draft-1", bugDraftSha256: "abc" },
  );
  assert.equal(action.status, "rejected");
  assert.match(action.policyReason, /not granted/);
  assert.match(action.policyReason, /qa\.browser-qa/);
});

test("a denied grant records an audit trail and cannot be executed", async () => {
  const instance = grantedBroker();
  const action = instance.requestAction(
    "qa.teams.status.post",
    context("qa.browser-qa"),
    { channel: "Teams-activities", message: "out of scope" },
  );
  assert.equal(action.status, "rejected");
  const denials = instance.listAudit(50).filter((event) => event.event === "action.denied");
  assert.ok(denials.some((event) => event.metadata?.grant === "denied"));
  await assert.rejects(() => instance.executeAction(action.id), /cannot execute/);
});

test("the declared supervisor may drive any capability", () => {
  const instance = grantedBroker();
  const read = instance.requestAction("qa.jira.story.read", context("qa"), { storyId: "PCC-1" });
  assert.equal(read.status, "ready");
  const write = instance.requestAction("qa.jira.bug.create", context("qa"), {
    bugDraftArtifactId: "draft-1",
    bugDraftSha256: "abc",
  });
  // Not a grant rejection: the supervisor is declared unrestricted, so this
  // reaches the normal risk/approval path instead (external write => approval).
  assert.notEqual(write.policyReason, `Agent qa is not granted capability qa.jira.bug.create.`);
});

test("an unknown (typo'd/spoofed) agent id is denied before any policy check", () => {
  // qa.browser_qa (underscore) is not the granted qa.browser-qa (hyphen): under
  // fail-closed grants it collapses to no authority instead of unrestricted.
  const action = grantedBroker().requestAction(
    "qa.jira.story.read",
    context("qa.browser_qa"),
    { storyId: "PCC-1" },
  );
  assert.equal(action.status, "rejected");
  assert.match(action.policyReason, /not granted/);
});
