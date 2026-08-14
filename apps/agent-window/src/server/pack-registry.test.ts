import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { loadAgentPacks, PackRegistry } from "./pack-registry.js";

test("the whole shipped pack corpus validates cleanly (Phase 1 is non-destructive)", () => {
  const registry = new PackRegistry();
  assert.ok(registry.packs.length >= 20, "expected the full pack corpus to load");
  assert.deepEqual(
    registry.invalidPacks(),
    [],
    "no shipped pack should regress schema validation",
  );
  assert.ok(registry.listPublic().every((pack) => pack.valid === true));
});

function writeBadPackRepo(): string {
  const root = mkdtempSync(resolve(tmpdir(), "bm-pack-"));
  const config = join(root, "packs", "broken-agent-pack", "config");
  mkdirSync(config, { recursive: true });
  // metadata.name mistyped as a number => structurally invalid.
  writeFileSync(join(config, "pack-manifest.yaml"), "metadata:\n  name: 123\nspec:\n  supervisor: sup\n", "utf8");
  writeFileSync(join(config, "agent-registry.yaml"), "agents:\n  - id: only-one\n", "utf8");
  return root;
}

function withEnv(values: Record<string, string | undefined>, run: () => void) {
  const keys = Object.keys(values);
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key] as string;
    }
  }
}

test("an invalid pack loads with recorded issues in lenient mode", () => {
  const root = writeBadPackRepo();
  try {
    withEnv({ BM_AGENTS_REPO_ROOT: root, BM_PACK_STRICT: "false" }, () => {
      const packs = loadAgentPacks();
      const broken = packs.find((pack) => pack.id === "broken");
      assert.ok(broken, "lenient mode still loads the invalid pack");
      assert.equal(broken?.validation.ok, false);
      assert.ok((broken?.validation.issues.length ?? 0) > 0);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an invalid pack is failed closed (skipped) in strict mode", () => {
  const root = writeBadPackRepo();
  try {
    withEnv({ BM_AGENTS_REPO_ROOT: root, BM_PACK_STRICT: "true" }, () => {
      const packs = loadAgentPacks();
      assert.equal(packs.find((pack) => pack.id === "broken"), undefined);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
