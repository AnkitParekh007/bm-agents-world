import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "../platform/capability-broker.js";
import { BitbucketReadAdapter } from "../qa/bitbucket-read-adapter.js";
import { JiraReadAdapter } from "../qa/jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "../qa/qa-capabilities.js";
import { buildQaGrantRegistry, QA_SPECIALIST_CAPABILITIES, qaSpecialistAgentId } from "../qa/qa-grants.js";
import { PackRegistry } from "../pack-registry.js";
import { buildAgentDefinitions } from "../copilot.js";
import { summarizeAgentDefinitions } from "./agent-runtime.js";
import { inProcessRuntimeAdapter } from "./inprocess-adapter.js";

function broker() {
  const mock = new QaMockAdapter();
  return new CapabilityBroker(
    QA_CAPABILITIES,
    [mock, new JiraReadAdapter(mock), new BitbucketReadAdapter(mock)],
    undefined,
    buildQaGrantRegistry(),
  );
}

function definitions() {
  return buildAgentDefinitions(new PackRegistry(), broker());
}

test("the neutral definitions include the default supervisor, the QA team, and one agent per pack", () => {
  const registry = new PackRegistry();
  const defs = buildAgentDefinitions(registry, broker());
  const ids = new Set(defs.map((definition) => definition.id));

  assert.ok(ids.has("default"), "a default supervisor is defined");
  assert.ok(ids.has("qa"), "the QA supervisor is defined");
  for (const specialistId of Object.keys(QA_SPECIALIST_CAPABILITIES)) {
    assert.ok(ids.has(qaSpecialistAgentId(specialistId)), `QA specialist ${specialistId} is defined`);
  }
  // Every loaded pack has an agent; the QA team adds specialists on top.
  const packIds = registry.packs.map((pack) => pack.id);
  for (const packId of packIds) assert.ok(ids.has(packId), `pack ${packId} has an agent`);
  assert.equal(defs.length, packIds.length + Object.keys(QA_SPECIALIST_CAPABILITIES).length + 1);
});

test("agent step budgets match the pilot (supervisor 16, specialist 10, pack 8, default 6)", () => {
  const summary = new Map(summarizeAgentDefinitions(definitions()).map((entry) => [entry.id, entry]));
  assert.equal(summary.get("qa")!.maxSteps, 16);
  assert.equal(summary.get(qaSpecialistAgentId("browser-qa"))!.maxSteps, 10);
  assert.equal(summary.get("default")!.maxSteps, 6);
  const nonQaPack = definitions().find((d) => d.id !== "qa" && d.id !== "default" && !d.id.startsWith("qa."))!;
  assert.equal(summary.get(nonQaPack.id)!.maxSteps, 8);
});

test("QA specialists carry the pack introspection tools plus the governed QA tools", () => {
  const summary = new Map(summarizeAgentDefinitions(definitions()).map((entry) => [entry.id, entry]));
  const supervisor = summary.get("qa")!;
  for (const tool of ["getPackOverview", "startQaRun", "requestQaCapabilityAction", "executeQaCapabilityAction"]) {
    assert.ok(supervisor.toolNames.includes(tool), `qa supervisor exposes ${tool}`);
  }
  const specialist = summary.get(qaSpecialistAgentId("browser-qa"))!;
  assert.ok(specialist.toolNames.includes("listQaCapabilities"), "specialist has governed QA tools");
});

test("the neutral definitions run through a CopilotKit-free in-process adapter", async () => {
  const registry = new PackRegistry();
  const runtime = inProcessRuntimeAdapter.materialize(buildAgentDefinitions(registry, broker()));

  // The default supervisor's world tool executes with no LLM and no CopilotKit.
  const listed = (await runtime.agent("default")!.callTool("listAgentPacks")) as { packs: unknown[] };
  assert.ok(Array.isArray(listed.packs) && listed.packs.length === registry.packs.length);

  // A pack agent's introspection tool returns that pack's own metadata.
  const somePack = registry.packs.find((pack) => pack.id !== "qa")!;
  const overview = (await runtime.agent(somePack.id)!.callTool("getPackOverview")) as { id: string };
  assert.equal(overview.id, somePack.id);
});

test("the in-process adapter validates tool arguments against the tool schema", async () => {
  const runtime = inProcessRuntimeAdapter.materialize(definitions());
  const agent = runtime.agent("qa")!;
  // startQaRun requires projectId + a valid environment enum; bad input is rejected
  // at the boundary, exactly as the LLM runtime's schema validation would.
  await assert.rejects(() => agent.callTool("startQaRun", { environment: "not-an-env" }));
  await assert.rejects(() => agent.callTool("nonexistentTool"), /has no tool/);
});
