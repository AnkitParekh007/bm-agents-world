import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseArtifactStore } from "./supabase-artifact-store.js";

class FakeStorageBucket {
  readonly objects = new Map<string, Buffer>();

  async upload(path: string, value: unknown) {
    const buffer = Buffer.isBuffer(value)
      ? Buffer.from(value)
      : value instanceof Blob
        ? Buffer.from(await value.arrayBuffer())
        : Buffer.from(String(value));
    if (this.objects.has(path)) return { data: null, error: new Error("duplicate") };
    this.objects.set(path, buffer);
    return { data: { path }, error: null };
  }

  async download(path: string) {
    const value = this.objects.get(path);
    if (!value) return { data: null, error: new Error("not found") };
    const bytes = Uint8Array.from(value);
    return {
      data: {
        arrayBuffer: async () => bytes.buffer,
      } as Blob,
      error: null,
    };
  }

  async list() {
    return { data: [], error: null };
  }

  async remove(paths: string[]) {
    for (const path of paths) this.objects.delete(path);
    return { data: paths, error: null };
  }
}

function fakeClient(bucket: FakeStorageBucket): SupabaseClient {
  return {
    storage: {
      from: () => bucket,
    },
  } as unknown as SupabaseClient;
}

test("private Supabase artifact repository round-trips metadata and JSON bytes", async () => {
  const bucket = new FakeStorageBucket();
  const store = new SupabaseArtifactStore(
    "https://example.supabase.co",
    "sb_secret_test_only",
    "bm-agents-world-evidence",
    fakeClient(bucket),
  );

  const written = await store.writeJson(
    "6d6690ae-4257-46b7-8e4c-572b7ddf5348",
    "bug-draft",
    "bug-draft.json",
    { title: "PCC story failed", parentIssue: "PCC-101" },
  );

  assert.equal(written.type, "bug-draft");
  assert.equal(written.mediaType, "application/json");
  assert.match(written.uri, new RegExp(`/api/qa/artifacts/${written.id}$`));
  assert.equal(bucket.objects.has(`artifacts/${written.id}/bug-draft.json`), true);
  assert.equal(bucket.objects.has(`artifacts/${written.id}/metadata.json`), true);

  const found = await store.find(written.id);
  assert.deepEqual(found?.record, written);
  assert.equal(found?.diskPath, undefined);

  const loaded = await store.readJson<{ title: string; parentIssue: string }>(written.id, "bug-draft");
  assert.equal(loaded?.record.sha256, written.sha256);
  assert.equal(loaded?.value.parentIssue, "PCC-101");

  const bytes = await store.readBuffer(written.id);
  assert.ok(bytes?.data.length);
  assert.equal(await store.healthCheck(), true);
});

test("Supabase artifact repository rejects wrong expected artifact types", async () => {
  const bucket = new FakeStorageBucket();
  const store = new SupabaseArtifactStore(
    "https://example.supabase.co",
    "sb_secret_test_only",
    "bm-agents-world-evidence",
    fakeClient(bucket),
  );
  const written = await store.writeJson("8edddce4-88ad-4784-8187-a132347334b1", "evidence-manifest", "manifest.json", { items: [] });
  assert.equal(await store.readJson(written.id, "bug-draft"), undefined);
});

test("Supabase artifact repository rejects bytes that no longer match immutable metadata", async () => {
  const bucket = new FakeStorageBucket();
  const store = new SupabaseArtifactStore(
    "https://example.supabase.co",
    "sb_secret_test_only",
    "bm-agents-world-evidence",
    fakeClient(bucket),
  );
  const written = await store.writeJson(
    "3edc1058-ae2a-46c6-ad92-258238ef49d5",
    "bug-draft",
    "bug-draft.json",
    { title: "Original", parentIssue: "PCC-303" },
  );

  bucket.objects.set(
    `artifacts/${written.id}/bug-draft.json`,
    Buffer.from(JSON.stringify({ title: "Tampered", parentIssue: "PCC-303" })),
  );

  assert.equal(await store.readBuffer(written.id), undefined);
  assert.equal(await store.readJson(written.id, "bug-draft"), undefined);
});
