import assert from "node:assert/strict";
import test from "node:test";
import type { CompiledPack } from "./pack-compiler.js";
import { resolvePackAgents } from "./pack-agents.js";
import { PackRegistry } from "./pack-registry.js";
import { QA_SPECIALIST_CAPABILITIES } from "./qa/qa-grants.js";

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
      { id: "worker-a", role: "Specialist", enabled: true },
      { id: "worker-b", role: "Specialist", enabled: false },
    ],
    counts: { skills: 0, mcpServers: 0, plugins: 0, artifacts: 0, workflows: 0, tasks: 0, subAgents: 3 },
    policy: {},
    valid: true,
    contentHash: "x",
    ...overrides,
  };
}

test("resolves the supervisor and enabled specialists, excluding disabled agents", () => {
  const model = resolvePackAgents(compiled());
  assert.equal(model.ok, true);
  assert.equal(model.supervisor?.id, "sup");
  assert.equal(model.supervisor?.kind, "supervisor");
  assert.deepEqual(model.specialists.map((agent) => agent.id), ["worker-a"]);
});

test("a supervisor reference that matches no agent is a diagnostic and not ok", () => {
  const model = resolvePackAgents(compiled({ supervisor: "ghost" }));
  assert.equal(model.ok, false);
  assert.ok(model.diagnostics.some((issue) => issue.includes("ghost")));
  assert.equal(model.supervisor, undefined);
  // Without a matching supervisor, every enabled agent is a specialist.
  assert.deepEqual(model.specialists.map((agent) => agent.id), ["sup", "worker-a"]);
});

test("strict mode fails closed when references do not resolve", () => {
  assert.throws(() => resolvePackAgents(compiled({ supervisor: "ghost" }), { strict: true }), /failed to resolve/);
  // A resolvable pack does not throw in strict mode.
  assert.doesNotThrow(() => resolvePackAgents(compiled(), { strict: true }));
});

test("the generic resolver reproduces today's QA specialist selection", () => {
  const registry = new PackRegistry();
  const qa = registry.compiled("qa");
  assert.ok(qa, "the QA pack should compile");
  const model = resolvePackAgents(qa!);
  assert.equal(model.supervisor?.id, "qa-supervisor");

  const resolvedIds = new Set(model.specialists.map((agent) => agent.id));
  // Every capability-granted QA specialist is enumerated by the generic model,
  // so Phase 4 can instantiate the same scoped agents from the generic path.
  for (const specialistId of Object.keys(QA_SPECIALIST_CAPABILITIES)) {
    assert.ok(resolvedIds.has(specialistId), `generic model should surface ${specialistId}`);
  }
});

test("resolution never throws for any shipped pack in lenient mode", () => {
  const registry = new PackRegistry();
  for (const pack of registry.packs) {
    const model = resolvePackAgents(registry.compiled(pack.id)!);
    assert.ok(Array.isArray(model.specialists));
  }
});
