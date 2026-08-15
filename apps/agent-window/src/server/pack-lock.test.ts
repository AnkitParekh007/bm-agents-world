import assert from "node:assert/strict";
import test from "node:test";
import { PackRegistry } from "./pack-registry.js";
import {
  buildPackLock,
  diffPackLock,
  parsePackLock,
  serializePackLock,
  type PackLock,
} from "./pack-lock.js";

test("buildPackLock snapshots every pack with a 64-hex content hash", () => {
  const lock = buildPackLock(new PackRegistry());
  const ids = Object.keys(lock.packs);
  assert.ok(ids.length >= 20);
  for (const id of ids) assert.match(lock.packs[id].contentHash, /^[0-9a-f]{64}$/);
});

test("serialize -> parse round-trips and is stably sorted", () => {
  const lock: PackLock = {
    lockVersion: 1,
    packs: { qa: { version: "1.0.0", contentHash: "a" }, alpha: { version: "2.0.0", contentHash: "b" } },
  };
  const serialized = serializePackLock(lock);
  assert.ok(serialized.endsWith("\n"));
  assert.ok(serialized.indexOf('"alpha"') < serialized.indexOf('"qa"'), "keys are sorted");
  assert.deepEqual(parsePackLock(serialized), lock);
});

test("a clean registry has no drift against its own lock", () => {
  const registry = new PackRegistry();
  const lock = buildPackLock(registry);
  assert.equal(diffPackLock(lock, buildPackLock(registry)).ok, true);
});

test("diff detects added, removed, and changed packs", () => {
  const baseline: PackLock = {
    lockVersion: 1,
    packs: { qa: { version: "1.0.0", contentHash: "hash-qa" }, old: { version: "1.0.0", contentHash: "hash-old" } },
  };
  const current: PackLock = {
    lockVersion: 1,
    packs: { qa: { version: "1.1.0", contentHash: "hash-qa-2" }, fresh: { version: "1.0.0", contentHash: "hash-fresh" } },
  };
  const drift = diffPackLock(baseline, current);
  assert.equal(drift.ok, false);
  assert.deepEqual(drift.added.map((entry) => entry.id), ["fresh"]);
  assert.deepEqual(drift.removed.map((entry) => entry.id), ["old"]);
  assert.deepEqual(drift.changed.map((entry) => entry.id), ["qa"]);
  assert.equal(drift.changed[0].expected, "hash-qa");
  assert.equal(drift.changed[0].actual, "hash-qa-2");
});
