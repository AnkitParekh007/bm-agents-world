import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import YAML from "yaml";
import { compileWorkflow } from "./workflow-compiler.js";

test("a linear workflow compiles into ordered single-step waves", () => {
  const compiled = compileWorkflow({
    metadata: { id: "linear" },
    steps: [
      { id: "a" },
      { id: "b", dependsOn: ["a"] },
      { id: "c", dependsOn: ["b"] },
    ],
  });
  assert.equal(compiled.ok, true);
  assert.deepEqual(compiled.order, [["a"], ["b"], ["c"]]);
});

test("independent steps share a wave and are sorted deterministically", () => {
  const compiled = compileWorkflow({
    metadata: { id: "fan" },
    steps: [
      { id: "gate" },
      { id: "browser", dependsOn: ["gate"] },
      { id: "api", dependsOn: ["gate"] },
      { id: "database", dependsOn: ["gate"] },
      { id: "evidence", dependsOn: ["browser", "api", "database"] },
    ],
  });
  assert.equal(compiled.ok, true);
  assert.deepEqual(compiled.order, [["gate"], ["api", "browser", "database"], ["evidence"]]);
});

test("a cycle is reported and fails compilation", () => {
  const compiled = compileWorkflow({
    metadata: { id: "cyclic" },
    steps: [
      { id: "a", dependsOn: ["b"] },
      { id: "b", dependsOn: ["a"] },
    ],
  });
  assert.equal(compiled.ok, false);
  assert.ok(compiled.diagnostics.some((issue) => issue.includes("cycle")));
});

test("unknown dependency and duplicate id are diagnostics", () => {
  const dup = compileWorkflow({ metadata: { id: "d" }, steps: [{ id: "a" }, { id: "a" }] });
  assert.ok(dup.diagnostics.some((issue) => issue.includes("duplicate step id: a")));

  const missing = compileWorkflow({ metadata: { id: "m" }, steps: [{ id: "a", dependsOn: ["ghost"] }] });
  assert.ok(missing.diagnostics.some((issue) => issue.includes('unknown step "ghost"')));
});

test("agent references are validated only when a known-agent set is supplied", () => {
  const workflow = { metadata: { id: "w" }, steps: [{ id: "a", agent: "browser-qa" }, { id: "b", agent: "ghost", dependsOn: ["a"] }] };
  assert.equal(compileWorkflow(workflow).ok, true);
  const checked = compileWorkflow(workflow, { knownAgents: new Set(["browser-qa"]) });
  assert.equal(checked.ok, false);
  assert.ok(checked.diagnostics.some((issue) => issue.includes('unknown agent "ghost"')));
});

test("strict mode throws on any diagnostic", () => {
  assert.throws(() => compileWorkflow({ metadata: { id: "x" }, steps: [{ id: "a", dependsOn: ["ghost"] }] }, { strict: true }), /failed to compile/);
});

test("compilation is deterministic and independent of input step order", () => {
  const forward = compileWorkflow({ metadata: { id: "o" }, steps: [{ id: "a" }, { id: "b", dependsOn: ["a"] }] });
  const reversed = compileWorkflow({ metadata: { id: "o" }, steps: [{ id: "b", dependsOn: ["a"] }, { id: "a" }] });
  assert.equal(forward.contentHash, reversed.contentHash);
});

test("every shipped QA workflow compiles cleanly", () => {
  const dir = resolve(process.cwd(), "..", "..", "packs", "qa-agent-pack", "workflows");
  const files = readdirSync(dir).filter((file) => /\.ya?ml$/i.test(file));
  assert.ok(files.length >= 5);
  for (const file of files) {
    const doc = YAML.parse(readFileSync(resolve(dir, file), "utf8"));
    const compiled = compileWorkflow(doc);
    assert.equal(compiled.ok, true, `${file} should compile: ${compiled.diagnostics.join("; ")}`);
    assert.match(compiled.contentHash, /^[0-9a-f]{64}$/);
  }
});
