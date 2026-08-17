import assert from "node:assert/strict";
import test from "node:test";
import { compilePack, type PackComponentHashes } from "./pack-compiler.js";
import { PackRegistry, type AgentPack, type PackContent } from "./pack-registry.js";

function content(overrides: Partial<PackContent> = {}): PackContent {
  return {
    skills: [
      { id: "skill.a", version: "1.0.0" },
      { id: "skill.b", version: "1.0.0" },
      { id: "skill.c", version: "1.0.0" },
    ],
    mcpServers: [{ id: "mcp.jira" }, { id: "mcp.teams" }],
    plugins: [{ id: "plugin.reporter" }],
    artifacts: [{ id: "artifact.test-plan" }],
    workflows: [{ name: "flow.yaml", content: { steps: [{ id: "read" }] } }],
    policies: { rules: [{ id: "external-write", approval: "human" }] },
    permissions: "agent,capability,mode\nqa.browser-qa,qa.playwright.test.run,allow",
    ...overrides,
  };
}

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
    artifactCount: 1,
    workflowCount: 1,
    taskCount: 10,
    taskGroups: [],
    policy: { production: "read-only", secretValuesVisibleToModel: false },
    content: content(),
    validation: { ok: true, issues: [] },
    directory: "/tmp/qa",
    ...overrides,
  };
}

test("compiling the same pack is deterministic", () => {
  assert.equal(compilePack(pack()).contentHash, compilePack(pack()).contentHash);
});

test("agent, project, and registry order do not change the hash", () => {
  const a = compilePack(pack());
  const b = compilePack(
    pack({
      projects: ["SOP", "PCC"],
      subAgents: [
        { id: "story-context", role: "Specialist", enabled: true },
        { id: "browser-qa", role: "Executor", enabled: true },
      ],
      content: content({
        skills: [
          { id: "skill.c", version: "1.0.0" },
          { id: "skill.a", version: "1.0.0" },
          { id: "skill.b", version: "1.0.0" },
        ],
      }),
    }),
  );
  assert.equal(a.contentHash, b.contentHash);
  assert.deepEqual(a.agents.map((agent) => agent.id), ["browser-qa", "story-context"]);
  assert.deepEqual(a.projects, ["PCC", "SOP"]);
});

test("a change to declared identity changes the hash and the manifest component", () => {
  const base = compilePack(pack());
  for (const changed of [
    compilePack(pack({ version: "1.1.0" })),
    compilePack(pack({ supervisor: "other" })),
  ]) {
    assert.notEqual(base.contentHash, changed.contentHash);
    assert.notEqual(base.components.manifest, changed.components.manifest);
  }
  const renamedAgent = compilePack(
    pack({ subAgents: [{ id: "renamed", role: "Executor", enabled: true }] }),
  );
  assert.notEqual(base.contentHash, renamedAgent.contentHash);
  assert.notEqual(base.components.agents, renamedAgent.components.agents);
});

test("swapping a skill's content with the count unchanged still changes the hash", () => {
  // The exact defect: skill B replaced by skill X, skillCount stays 3.
  const base = compilePack(pack());
  const swapped = compilePack(
    pack({
      content: content({
        skills: [
          { id: "skill.a", version: "1.0.0" },
          { id: "skill.x", version: "2.0.0" }, // behavior changed
          { id: "skill.c", version: "1.0.0" },
        ],
      }),
    }),
  );
  assert.equal(base.counts.skills, swapped.counts.skills, "count is unchanged");
  assert.notEqual(base.contentHash, swapped.contentHash, "package hash must change");
  assert.notEqual(base.components.skills, swapped.components.skills);
  // Only the skills component moved; everything else is stable.
  for (const component of ["manifest", "agents", "mcpServers", "policies", "permissions"] as const) {
    assert.equal(base.components[component], swapped.components[component]);
  }
});

test("a derived count alone does not change the hash", () => {
  // skillCount is derived metadata, not authoritative content.
  assert.equal(compilePack(pack()).contentHash, compilePack(pack({ skillCount: 99 })).contentHash);
});

test("changing an approval policy or permission row changes only that component", () => {
  const base = compilePack(pack());
  const relaxedPolicy = compilePack(
    pack({ content: content({ policies: { rules: [{ id: "external-write", approval: "none" }] } }) }),
  );
  assert.notEqual(base.contentHash, relaxedPolicy.contentHash);
  assert.notEqual(base.components.policies, relaxedPolicy.components.policies);
  assert.equal(base.components.skills, relaxedPolicy.components.skills);

  const editedPermissions = compilePack(
    pack({ content: content({ permissions: "agent,capability,mode\nqa.browser-qa,qa.jira.bug.create,allow" }) }),
  );
  assert.notEqual(base.contentHash, editedPermissions.contentHash);
  assert.notEqual(base.components.permissions, editedPermissions.components.permissions);
});

test("the registry compiles every loaded pack with stable component hashes", () => {
  const registry = new PackRegistry();
  const componentKeys: (keyof PackComponentHashes)[] = [
    "manifest",
    "agents",
    "skills",
    "mcpServers",
    "plugins",
    "artifacts",
    "workflows",
    "policies",
    "permissions",
  ];
  for (const loaded of registry.packs) {
    const compiled = registry.compiled(loaded.id);
    assert.ok(compiled, `pack ${loaded.id} should have a compiled form`);
    assert.match(compiled!.contentHash, /^[0-9a-f]{64}$/);
    for (const key of componentKeys) assert.match(compiled!.components[key], /^[0-9a-f]{64}$/);
    // Recompiling the same loaded pack reproduces the same hash.
    assert.equal(compiled!.contentHash, compilePack(loaded).contentHash);
  }
});
