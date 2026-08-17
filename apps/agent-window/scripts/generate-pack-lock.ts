/**
 * Generates (or verifies) the pack lock — the approved content hash of every
 * pack. Run `npm run pack:lock` to refresh it after an intended pack change, and
 * `npm run pack:lock:check` in CI to fail when a pack's compiled definition
 * drifts from the committed lock without an approved release.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PackRegistry } from "../src/server/pack-registry.js";
import {
  buildPackLock,
  diffPackLock,
  loadPackLock,
  serializePackLock,
} from "../src/server/pack-lock.js";

const LOCK_PATH = resolve(import.meta.dirname, "..", "config", "pack-lock.json");

function main(): void {
  const check = process.argv.includes("--check");
  const current = buildPackLock(new PackRegistry());

  if (check) {
    const baseline = loadPackLock(LOCK_PATH);
    if (!baseline) {
      console.error(`No pack lock found at ${LOCK_PATH}. Run: npm run pack:lock`);
      process.exit(1);
    }
    const drift = diffPackLock(baseline, current);
    if (drift.ok) {
      console.log(`pack lock OK — ${Object.keys(current.packs).length} packs match the approved hashes.`);
      return;
    }
    console.error("Pack drift detected against the approved lock:");
    for (const entry of drift.added) console.error(`  + added:   ${entry.id}`);
    for (const entry of drift.removed) console.error(`  - removed: ${entry.id}`);
    for (const entry of drift.changed) {
      const components = entry.components?.length ? ` [${entry.components.join(", ")}]` : "";
      console.error(`  ~ changed: ${entry.id} (${entry.expected?.slice(0, 12)} -> ${entry.actual?.slice(0, 12)})${components}`);
    }
    console.error("If this change is intended, run: npm run pack:lock");
    process.exit(1);
  }

  writeFileSync(LOCK_PATH, serializePackLock(current), "utf8");
  console.log(`Wrote ${LOCK_PATH} with ${Object.keys(current.packs).length} packs.`);
}

main();
