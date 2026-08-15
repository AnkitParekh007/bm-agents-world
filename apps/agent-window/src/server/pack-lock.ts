import { existsSync, readFileSync } from "node:fs";
import type { PackRegistry } from "./pack-registry.js";

/**
 * Release / drift governance (Phase 8).
 *
 * A pack lock records the approved content hash of every pack (from the Phase 2
 * compiler). Comparing the currently loaded packs against a committed lock
 * surfaces drift — packs added, removed, or whose compiled definition changed
 * without an approved release. This is the audit primitive a release gate uses
 * to refuse an unreviewed pack change in production.
 */

export const PACK_LOCK_VERSION = 1 as const;

export interface PackLockEntry {
  version: string;
  contentHash: string;
}

export interface PackLock {
  lockVersion: number;
  packs: Record<string, PackLockEntry>;
}

export interface PackDriftEntry {
  id: string;
  expected?: string;
  actual?: string;
}

export interface PackDrift {
  ok: boolean;
  added: PackDriftEntry[];
  removed: PackDriftEntry[];
  changed: PackDriftEntry[];
}

/** Snapshots the current registry into a lock, packs ordered for stable diffs. */
export function buildPackLock(registry: PackRegistry): PackLock {
  const packs: Record<string, PackLockEntry> = {};
  for (const pack of [...registry.packs].sort((a, b) => a.id.localeCompare(b.id))) {
    const compiled = registry.compiled(pack.id);
    if (compiled) packs[pack.id] = { version: pack.version, contentHash: compiled.contentHash };
  }
  return { lockVersion: PACK_LOCK_VERSION, packs };
}

/** Deterministic JSON for committing a lock (sorted keys, trailing newline). */
export function serializePackLock(lock: PackLock): string {
  const packs: Record<string, PackLockEntry> = {};
  for (const id of Object.keys(lock.packs).sort()) packs[id] = lock.packs[id];
  return `${JSON.stringify({ lockVersion: lock.lockVersion, packs }, null, 2)}\n`;
}

export function parsePackLock(raw: string): PackLock {
  const parsed = JSON.parse(raw) as PackLock;
  if (!parsed || typeof parsed !== "object" || typeof parsed.packs !== "object") {
    throw new Error("Invalid pack lock: missing packs map.");
  }
  return { lockVersion: parsed.lockVersion ?? PACK_LOCK_VERSION, packs: parsed.packs };
}

/** Reads a committed lock file, or undefined when none is present. */
export function loadPackLock(path: string): PackLock | undefined {
  if (!existsSync(path)) return undefined;
  return parsePackLock(readFileSync(path, "utf8"));
}

/** Compares an approved baseline lock against the current registry state. */
export function diffPackLock(baseline: PackLock, current: PackLock): PackDrift {
  const added: PackDriftEntry[] = [];
  const removed: PackDriftEntry[] = [];
  const changed: PackDriftEntry[] = [];

  for (const [id, entry] of Object.entries(current.packs)) {
    const prior = baseline.packs[id];
    if (!prior) added.push({ id, actual: entry.contentHash });
    else if (prior.contentHash !== entry.contentHash) {
      changed.push({ id, expected: prior.contentHash, actual: entry.contentHash });
    }
  }
  for (const [id, entry] of Object.entries(baseline.packs)) {
    if (!current.packs[id]) removed.push({ id, expected: entry.contentHash });
  }

  return { ok: added.length === 0 && removed.length === 0 && changed.length === 0, added, removed, changed };
}
