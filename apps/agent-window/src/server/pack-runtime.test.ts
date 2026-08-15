import assert from "node:assert/strict";
import test from "node:test";
import type { CompiledPack } from "./pack-compiler.js";
import { planGovernedAgents, type PackRuntimeProvider } from "./pack-runtime.js";
import { PackRegistry } from "./pack-registry.js";
import { QA_SPECIALIST_CAPABILITIES, qaRuntimeProvider, qaSpecialistAgentId } from "./qa/qa-grants.js";

function compiled(overrides: Partial<CompiledPack> = {}): CompiledPack {
  return {
    id: "demo",
    packName: "demo-agent-pack",
    version: "1.0.0",
    supervisor: "sup",
    projects: [],
    environments: [],
    agents: [
      { id: "sup", role: "Supervisor", enabled: true },
      { id: "reader", role: "Specialist", enabled: true },
      { id: "writer", role: "Specialist", enabled: true },
      { id: "ungoverned", role: "Specialist", enabled: true },
    ],
    counts: { skills: 0, mcpServers: 0, plugins: 0, artifacts: 0, workflows: 0, tasks: 0, subAgents: 4 },
    policy: {},
    valid: true,
    contentHash: "x",
    ...overrides,
  };
}

const demoProvider: PackRuntimeProvider = {
  packId: "demo",
  supervisorRuntimeId: () => "demo",
  specialistRuntimeId: (sourceId) => `demo.${sourceId}`,
  grantsFor: (sourceId) =>
    ({ reader: ["demo.read"], writer: ["demo.write"] } as Record<string, string[]>)[sourceId],
};

test("the planner scopes only governed specialists and leaves the rest as context", () => {
  const plan = planGovernedAgents(compiled(), demoProvider);
  assert.equal(plan.ok, true);
  assert.equal(plan.supervisor?.runtimeId, "demo");
  assert.deepEqual(
    plan.specialists.map((spec) => spec.runtimeId).sort(),
    ["demo.reader", "demo.writer"],
  );
  assert.equal(plan.specialists.find((s) => s.sourceId === "reader")?.capabilities?.[0], "demo.read");
  // "ungoverned" has no grant, so it is not instantiated as its own scoped agent.
  assert.ok(!plan.specialists.some((s) => s.sourceId === "ungoverned"));
});

test("the planner passes strict fail-closed through to reference resolution", () => {
  assert.throws(() => planGovernedAgents(compiled({ supervisor: "ghost" }), demoProvider, { strict: true }), /failed to resolve/);
});

test("the generic plan reproduces the QA special-case team exactly", () => {
  const registry = new PackRegistry();
  const qa = registry.compiled("qa");
  assert.ok(qa);
  const plan = planGovernedAgents(qa!, qaRuntimeProvider);

  assert.equal(plan.supervisor?.runtimeId, "qa");

  const planned = new Map(plan.specialists.map((spec) => [spec.sourceId, spec]));
  // Same specialist set as the special-case map.
  assert.deepEqual(
    [...planned.keys()].sort(),
    Object.keys(QA_SPECIALIST_CAPABILITIES).sort(),
  );
  // Same runtime ids and same grants for each specialist.
  for (const [sourceId, capabilities] of Object.entries(QA_SPECIALIST_CAPABILITIES)) {
    const spec = planned.get(sourceId);
    assert.ok(spec, `expected planned specialist ${sourceId}`);
    assert.equal(spec!.runtimeId, qaSpecialistAgentId(sourceId));
    assert.deepEqual(spec!.capabilities, capabilities);
  }
});
