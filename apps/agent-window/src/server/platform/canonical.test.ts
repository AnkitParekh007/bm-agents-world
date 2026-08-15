import assert from "node:assert/strict";
import test from "node:test";
import { canonicalHash, canonicalize } from "./canonical.js";

test("canonicalize sorts object keys recursively", () => {
  const out = canonicalize({ b: 1, a: { d: 2, c: 3 } });
  assert.deepEqual(Object.keys(out as object), ["a", "b"]);
  assert.deepEqual(Object.keys((out as any).a), ["c", "d"]);
});

test("canonicalHash is independent of object key order", () => {
  assert.equal(
    canonicalHash({ a: 1, b: 2, nested: { x: 1, y: 2 } }),
    canonicalHash({ b: 2, nested: { y: 2, x: 1 }, a: 1 }),
  );
});

test("canonicalHash is sensitive to array order and to values", () => {
  assert.notEqual(canonicalHash([1, 2, 3]), canonicalHash([3, 2, 1]));
  assert.notEqual(canonicalHash({ a: 1 }), canonicalHash({ a: 2 }));
});
