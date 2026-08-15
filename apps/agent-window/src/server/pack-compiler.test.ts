import assert from "node:assert/strict";
import test from "node:test";
import { compilePack } from "./pack-compiler.js";
import { PackRegistry, type AgentPack } from "./pack-registry.js";

function pack(overrides: Partial<AgentPack> = {}): AgentPack {
  return {
    id: "qa",
    packName: "qa-agent-pack",
    displayName: "QA",
    version: "1.0.0",
    supervisor: "qa-supervisor",
    summary: "Governed QA pack.",
    projects: ["PCC", "SOP"],
    environments: ["qa", "prod"],
    subAgents: [
      { id: "browser-qa", role: "Executor", enabled: true },
      { id: "story-context", role: "Specialist", enabled: true },
    ],
    skillCount: 3,
    mcpCount: 2,
    pluginCount: 1,
    artifactCount: 4,
    workflowCount: 1,
    taskCount: 10,
    taskGroups: [],
    policy: { production: "read-only", secretValuesVisibleToModel: false },
    validation: { ok: true, issues: [] },
    directory: "/tmp/qa",
    ...overrides,
  };
}

test("compiling the same pack is deterministic", () => {
  assert.equal(compilePack(pack()).contentHash, compilePack(pack()).contentHash);
});

test("agent order and project order do not change the hash", () => {
  const a = compilePack(pack());
  const b = compilePack(
    pack({
      projects: ["SOP", "PCC"],
      subAgents: [
        { id: "story-context", role: "Specialist", enabled: true },
        { id: "browser-qa", role: "Executor", enabled: true },
      ],
    }),
  );
  assert.equal(a.contentHash, b.contentHash);
  // Normalized output is sorted regardless of input order.
  assert.deepEqual(a.agents.map((agent) => agent.id), ["browser-qa", "story-context"]);
  assert.deepEqual(a.projects, ["PCC", "SOP"]);
});

test("a change to what the pack declares changes the hash", () => {
  const base = compilePack(pack()).contentHash;
  assert.notEqual(base, compilePack(pack({ version: "1.1.0" })).contentHash);
  assert.notEqual(base, compilePack(pack({ supervisor: "other" })).contentHash);
  assert.notEqual(
    base,
    compilePack(pack({ subAgents: [{ id: "renamed", role: "Executor", enabled: true }] })).contentHash,
  );
  assert.notEqual(base, compilePack(pack({ skillCount: 99 })).contentHash);
});

test("the registry compiles every loaded pack with a stable hash", () => {
  const registry = new PackRegistry();
  for (const loaded of registry.packs) {
    const compiled = registry.compiled(loaded.id);
    assert.ok(compiled, `pack ${loaded.id} should have a compiled form`);
    assert.match(compiled!.contentHash, /^[0-9a-f]{64}$/);
    // Recompiling the same loaded pack reproduces the same hash.
    assert.equal(compiled!.contentHash, compilePack(loaded).contentHash);
  }
});
