import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { ApprovedConnectorRegistry } from "./connector-registry.js";
import type { CapabilityDefinition, ExecutionContext } from "./capability-types.js";
import { LocalPolicyEngine, OpaPolicyEngine } from "./policy-engine.js";
import { QA_CAPABILITIES } from "../qa/qa-capabilities.js";

function capability(id: string): CapabilityDefinition {
  const found = QA_CAPABILITIES.find((item) => item.id === id);
  if (!found) throw new Error(`Missing test capability ${id}`);
  return found;
}

function context(environment: ExecutionContext["environment"] = "qa", packId = "qa-agent-pack"): ExecutionContext {
  return {
    runId: "d82d03c8-d6b1-4a7d-8bed-f6008135b4fb",
    userId: "qa.engineer@example.com",
    agentId: "qa",
    packId,
    projectId: "PCC",
    environment,
    tenantId: "tenant-test",
    requestedAt: new Date().toISOString(),
  };
}

async function withFakeOpa(result: Record<string, unknown>, run: (baseUrl: string) => Promise<void>) {
  const server = createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ result, decision_id: "decision-test" }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test("approved connector registry admits only mapped pack/tool/environment contracts", () => {
  const registry = new ApprovedConnectorRegistry();
  const jira = registry.admission(capability("qa.jira.story.read"), "qa-agent-pack", "qa");
  assert.equal(jira.allowed, true);
  assert.equal(jira.connector?.id, "jira");
  assert.equal(jira.tool?.id, "story.read");

  const wrongPack = registry.admission(capability("qa.jira.story.read"), "frontend-engineer-agent-pack", "qa");
  assert.equal(wrongPack.allowed, false);
  assert.match(wrongPack.reason, /not approved for pack/i);

  const prodBrowser = registry.admission(capability("qa.playwright.test.run"), "qa-agent-pack", "prod");
  assert.equal(prodBrowser.allowed, false);
  assert.match(prodBrowser.reason, /not approved in prod/i);
});

test("connector registry enforces tool risk ceilings", () => {
  const registry = new ApprovedConnectorRegistry();
  const elevated: CapabilityDefinition = { ...capability("qa.playwright.test.run"), riskLevel: "L3" };
  const decision = registry.admission(elevated, "qa-agent-pack", "qa");
  assert.equal(decision.allowed, false);
  assert.match(decision.reason, /risk ceiling/i);
});

test("local central policy preserves standing reads and governed writes", async () => {
  const engine = new LocalPolicyEngine(new ApprovedConnectorRegistry());
  const read = await engine.evaluate(capability("qa.jira.story.read"), context("qa"));
  assert.equal(read.effect, "allow");
  assert.equal(read.riskLevel, "L0");
  assert.equal(read.connectorId, "jira");

  const write = await engine.evaluate(capability("qa.jira.bug.create"), context("qa"));
  assert.equal(write.effect, "approval");
  assert.equal(write.riskLevel, "L3");
  assert.equal(write.approvalMode, "human");
});

test("production reads are centrally escalated to privileged L4 approval", async () => {
  const engine = new LocalPolicyEngine(new ApprovedConnectorRegistry());
  const decision = await engine.evaluate(capability("qa.jira.story.read"), context("prod"));
  assert.equal(decision.effect, "approval");
  assert.equal(decision.riskLevel, "L4");
  assert.equal(decision.approvalMode, "privileged-process");
});

test("unregistered capabilities fail closed before connector execution", async () => {
  const engine = new LocalPolicyEngine(new ApprovedConnectorRegistry());
  const unknown: CapabilityDefinition = { ...capability("qa.jira.story.read"), id: "qa.unapproved.admin.read" };
  const decision = await engine.evaluate(unknown, context("qa"));
  assert.equal(decision.effect, "deny");
  assert.match(decision.reason, /not present in the approved connector registry/i);
});

test("OPA cannot weaken the capability and connector minimum policy", async () => {
  await withFakeOpa(
    { effect: "allow", riskLevel: "L0", approvalMode: "none", reason: "intentionally permissive test result" },
    async (baseUrl) => {
      const engine = new OpaPolicyEngine(new ApprovedConnectorRegistry(), baseUrl);
      const decision = await engine.evaluate(capability("qa.jira.bug.create"), context("qa"));
      assert.equal(decision.effect, "approval");
      assert.equal(decision.riskLevel, "L3");
      assert.equal(decision.approvalMode, "human");
      assert.equal(decision.source, "opa");
      assert.equal(decision.decisionId, "decision-test");
      assert.match(decision.reason, /bounded by the capability\/connector minimum/i);
    },
  );
});

test("OPA evaluator fails closed when the policy service is unavailable", async () => {
  const previous = process.env.BM_OPA_TIMEOUT_MS;
  process.env.BM_OPA_TIMEOUT_MS = "250";
  try {
    const engine = new OpaPolicyEngine(new ApprovedConnectorRegistry(), "http://127.0.0.1:9");
    const decision = await engine.evaluate(capability("qa.jira.story.read"), context("qa"));
    assert.equal(decision.effect, "deny");
    assert.equal(decision.riskLevel, "L4");
    assert.equal(decision.source, "opa");
    assert.match(decision.reason, /fail-closed/i);
  } finally {
    if (previous === undefined) delete process.env.BM_OPA_TIMEOUT_MS;
    else process.env.BM_OPA_TIMEOUT_MS = previous;
  }
});
