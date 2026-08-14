import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeValidations,
  validateAgentRegistry,
  validatePackManifest,
} from "./pack-schema.js";

test("a spec-style manifest validates", () => {
  const result = validatePackManifest({
    apiVersion: "qa-agent-pack/v1",
    kind: "AgentPack",
    metadata: { name: "qa-agent-pack", version: "1.0.0", owner: "qa-platform" },
    spec: {
      supervisor: "qa-supervisor",
      projects: ["PCC", "SOP"],
      environments: ["playground", "qa", "prod"],
      registries: { agents: "agent-registry.yaml" },
      defaultPolicy: { production: "read-only", secretValuesVisibleToModel: false },
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test("a top-level-fields manifest (no spec) validates — corpus is heterogeneous", () => {
  const result = validatePackManifest({
    apiVersion: "java-developer-agent-pack/v1",
    kind: "AgentPack",
    metadata: { name: "java-developer-agent-pack", version: "1.0.0" },
    counts: { agents: 23, skills: 120 },
    environments: ["sandbox", "playground", "qa", "prod"],
    externalWritesRequireApproval: true,
  });
  assert.equal(result.ok, true);
});

test("a manifest with a mistyped name is invalid", () => {
  const result = validatePackManifest({ metadata: { name: 42 } });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("metadata.name")));
});

test("a manifest with a mistyped supervisor is invalid", () => {
  const result = validatePackManifest({ spec: { supervisor: ["not", "a", "string"] } });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("spec.supervisor")));
});

test("an agent registry with an agent missing an id is invalid", () => {
  const result = validateAgentRegistry({
    kind: "AgentRegistry",
    agents: [{ id: "story-context" }, { role: "Specialist" }],
  });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("agents.1.id")));
});

test("a well-formed agent registry validates", () => {
  const result = validateAgentRegistry({
    agents: [
      { id: "qa-supervisor", role: "Supervisor", enabled: true },
      { id: "browser-qa", role: "Executor" },
    ],
  });
  assert.equal(result.ok, true);
});

test("mergeValidations is ok only when every input is ok", () => {
  assert.equal(mergeValidations({ ok: true, issues: [] }, { ok: true, issues: [] }).ok, true);
  const merged = mergeValidations({ ok: true, issues: [] }, { ok: false, issues: ["x: bad"] });
  assert.equal(merged.ok, false);
  assert.deepEqual(merged.issues, ["x: bad"]);
});
