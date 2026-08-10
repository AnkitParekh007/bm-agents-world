import { createHash, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArtifactLookup, ArtifactRepository, StoredArtifact } from "./artifact-store.js";
import { mediaTypeFor } from "./artifact-store.js";

interface SupabaseArtifactMetadata extends StoredArtifact {
  storagePath: string;
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "artifact";
}

function metadataPath(id: string): string {
  return `artifacts/${id}/metadata.json`;
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function serverClient(url: string, secretKey: string): SupabaseClient {
  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Private Supabase Storage repository. The server secret key is never exposed
 * to clients. Authorization continues to be enforced by the BM runtime using
 * the artifact's persisted runId before bytes are returned to an employee.
 */
export class SupabaseArtifactStore implements ArtifactRepository {
  readonly kind = "supabase-storage" as const;
  readonly location: string;
  private readonly client: SupabaseClient;

  constructor(
    url: string,
    secretKey: string,
    readonly bucket = process.env.BM_SUPABASE_ARTIFACT_BUCKET?.trim() || "bm-agents-world-evidence",
    client?: SupabaseClient,
  ) {
    if (!url.trim()) throw new Error("SUPABASE_URL is required for Supabase artifact storage");
    if (!secretKey.trim()) throw new Error("SUPABASE_SECRET_KEY is required for Supabase artifact storage");
    this.client = client ?? serverClient(url, secretKey);
    this.location = `${new URL(url).origin}/storage/${this.bucket}`;
  }

  async write(
    runId: string,
    type: string,
    filename: string,
    data: string | Buffer,
    options: { classification?: string; redacted?: boolean; mediaType?: string } = {},
  ): Promise<StoredArtifact> {
    const id = randomUUID();
    const safeFilename = safeSegment(filename);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const storagePath = `artifacts/${id}/${safeFilename}`;
    const record: SupabaseArtifactMetadata = {
      id,
      runId,
      type,
      filename: safeFilename,
      mediaType: options.mediaType ?? mediaTypeFor(safeFilename),
      classification: options.classification ?? "internal-qa-evidence",
      sha256: sha256(buffer),
      sizeBytes: buffer.length,
      createdAt: new Date().toISOString(),
      redacted: options.redacted ?? false,
      uri: `/api/qa/artifacts/${id}`,
      storagePath,
    };

    const bucket = this.client.storage.from(this.bucket);
    const uploaded = await bucket.upload(storagePath, buffer, {
      contentType: record.mediaType,
      cacheControl: "0",
      upsert: false,
    });
    if (uploaded.error) throw new Error(`Supabase artifact upload failed: ${uploaded.error.message}`);

    const metadata = Buffer.from(JSON.stringify(record), "utf8");
    const metadataUpload = await bucket.upload(metadataPath(id), metadata, {
      contentType: "application/json",
      cacheControl: "0",
      upsert: false,
    });
    if (metadataUpload.error) {
      await bucket.remove([storagePath]).catch(() => undefined);
      throw new Error(`Supabase artifact metadata upload failed: ${metadataUpload.error.message}`);
    }
    return this.publicRecord(record);
  }

  async writeJson(
    runId: string,
    type: string,
    filename: string,
    value: unknown,
    options: { classification?: string; redacted?: boolean } = {},
  ): Promise<StoredArtifact> {
    return this.write(runId, type, filename, JSON.stringify(value, null, 2), {
      ...options,
      mediaType: "application/json",
    });
  }

  async find(id: string): Promise<ArtifactLookup | undefined> {
    const metadata = await this.loadMetadata(id);
    return metadata ? { record: this.publicRecord(metadata) } : undefined;
  }

  async readJson<T>(id: string, expectedType?: string): Promise<{ record: StoredArtifact; value: T } | undefined> {
    const metadata = await this.loadMetadata(id);
    if (!metadata) return undefined;
    if (expectedType && metadata.type !== expectedType) return undefined;
    if (metadata.mediaType !== "application/json") return undefined;
    const data = await this.verifiedDownload(metadata);
    if (!data) return undefined;
    try {
      return { record: this.publicRecord(metadata), value: JSON.parse(data.toString("utf8")) as T };
    } catch {
      return undefined;
    }
  }

  async readBuffer(id: string): Promise<{ record: StoredArtifact; data: Buffer } | undefined> {
    const metadata = await this.loadMetadata(id);
    if (!metadata) return undefined;
    const data = await this.verifiedDownload(metadata);
    return data ? { record: this.publicRecord(metadata), data } : undefined;
  }

  async healthCheck(): Promise<boolean> {
    const result = await this.client.storage.from(this.bucket).list("artifacts", { limit: 1 });
    return !result.error;
  }

  async close(): Promise<void> {}

  private async loadMetadata(id: string): Promise<SupabaseArtifactMetadata | undefined> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
    const data = await this.download(metadataPath(id));
    if (!data) return undefined;
    try {
      const metadata = JSON.parse(data.toString("utf8")) as SupabaseArtifactMetadata;
      if (metadata.id !== id || !metadata.storagePath || !metadata.runId) return undefined;
      if (!/^[0-9a-f]{64}$/i.test(metadata.sha256) || !Number.isFinite(metadata.sizeBytes) || metadata.sizeBytes < 0) return undefined;
      return metadata;
    } catch {
      return undefined;
    }
  }

  private async verifiedDownload(metadata: SupabaseArtifactMetadata): Promise<Buffer | undefined> {
    const data = await this.download(metadata.storagePath);
    if (!data || data.length !== metadata.sizeBytes) return undefined;
    return sha256(data) === metadata.sha256.toLowerCase() ? data : undefined;
  }

  private async download(path: string): Promise<Buffer | undefined> {
    const result = await this.client.storage.from(this.bucket).download(path, {}, { cache: "no-store" });
    if (result.error || !result.data) return undefined;
    return Buffer.from(await result.data.arrayBuffer());
  }

  private publicRecord(record: SupabaseArtifactMetadata): StoredArtifact {
    const { storagePath: _storagePath, ...publicRecord } = record;
    return publicRecord;
  }
}
