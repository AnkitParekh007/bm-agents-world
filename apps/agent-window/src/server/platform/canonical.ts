import { createHash } from "node:crypto";

/**
 * Recursively normalizes a value into a canonical form: object keys are sorted
 * so that two structurally-equal values with different key orderings serialize
 * identically. Arrays keep their order (order is significant for lists).
 */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

/** Deterministic SHA-256 (hex) over the canonical JSON form of a value. */
export function canonicalHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}
