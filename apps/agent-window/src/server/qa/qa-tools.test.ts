import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "../platform/capability-broker.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa-capabilities.js";
import { buildQaGrantRegistry, qaSpecialistAgentId } from "./qa-grants.js";
import { buildQaTools } from "./qa-tools.js";

/**
 * QA's tool surface moved onto the shared governed-capability builder in Phase 9
 * so a second vertical would not need a second copy of the broker protocol.
 * These tests pin the surface itself — the names, order, and descriptions an
 * agent sees, and the parameters it may send — because a silent change to any
 * of them is a silent change to the live pilot's prompt contract.
 */

function tools(agentId?: string) {
  const mock = new QaMockAdapter();
  const broker = new CapabilityBroker(QA_CAPABILITIES, [mock], undefined, buildQaGrantRegistry());
  return buildQaTools(broker, undefined, agentId);
}

test("exposes exactly the QA tool names, in order", () => {
  assert.deepEqual(
    tools().map((tool) => tool.name),
    [
      "listQaCapabilities",
      "listQaProjectTests",
      "startQaRun",
      "requestQaCapabilityAction",
      "getQaCapabilityAction",
      "executeQaCapabilityAction",
    ],
  );
});

test("keeps the QA-worded descriptions the pilot prompt relies on", () => {
  const byName = new Map(tools().map((tool) => [tool.name, tool.description]));

  assert.equal(
    byName.get("listQaCapabilities"),
    "List governed QA capabilities, risk levels, environments, and approval requirements.",
  );
  assert.equal(
    byName.get("startQaRun"),
    "Start one durable QA workflow run scoped to the current authenticated identity, project, and environment.",
  );
  assert.equal(
    byName.get("requestQaCapabilityAction"),
    "Create an immutable, policy-evaluated QA capability action inside a durable QA run.",
  );
  assert.equal(
    byName.get("getQaCapabilityAction"),
    "Read the server-side status of one previously requested QA action in the current identity scope.",
  );
  assert.equal(
    byName.get("executeQaCapabilityAction"),
    "Execute a previously requested QA action only when server policy and current identity scope permit it.",
  );
});

test("requestQaCapabilityAction still accepts exactly its documented parameters", () => {
  const request = tools().find((tool) => tool.name === "requestQaCapabilityAction");
  assert.ok(request);

  const parsed = request.parameters.parse({
    runId: "b7d0e2f4-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
    capabilityId: "qa.jira.story.read",
    projectId: "PCC",
    environment: "qa",
    payload: { storyId: "PCC-1" },
  });
  assert.equal((parsed as { capabilityId: string }).capabilityId, "qa.jira.story.read");

  // payload defaults to {} and an unknown environment is rejected.
  const withoutPayload = request.parameters.parse({
    capabilityId: "qa.jira.story.read",
    projectId: "PCC",
    environment: "playground",
  });
  assert.deepEqual((withoutPayload as { payload: unknown }).payload, {});
  assert.equal(request.parameters.safeParse({ capabilityId: "x", projectId: "PCC", environment: "staging" }).success, false);
});

test("binds tools to the agent identity they were built for", () => {
  // The surface is identical for every agent; only the identity the tools act
  // under changes, which is what the broker's per-specialist grant enforces.
  const specialist = tools(qaSpecialistAgentId("browser-qa"));
  assert.deepEqual(
    specialist.map((tool) => tool.name),
    tools().map((tool) => tool.name),
  );
});
