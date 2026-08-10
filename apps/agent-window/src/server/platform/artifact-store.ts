import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { MaybePromise } from "./capability-broker-contract.js";

export interface StoredArtifact {
  id: string;
  runId: string;
  type: string;
  filename: string;
  mediaType: string;
  classification: string;
  sha256: string;
  sizeBytes: number;
  createdAt: string;
  redacted: boolean;
  uri: string;
}

export interface ArtifactLookup {
  record: StoredArtifact;
  /** Local filesystem path when the active repository is filesystem-backed. */
  diskPath?: string;
}

export interface ArtifactRepository {
  readonly kind: "filesystem" | "supabase-storage";
  readonly location: string;
  write(
    runId: string,
    type: string,
    filename: string,
    data: string | Buffer,
    options?: { classification?: string; redacted?: boolean; mediaType?: string },
  ): MaybePromise<StoredArtifact>;
  writeJson(
    runId: string,
    type: string,
    filename: string,
    value: unknown,
    options?: { classification?: string; redacted?: boolean },
  ): MaybePromise<StoredArtifact>;
  find(id: string): MaybePromise<ArtifactLookup | undefined>;
  readJson<T>(id: string, expectedType?: string): MaybePromise<{ record: StoredArtifact; value: T } | undefined>;
  readBuffer(id: string): MaybePromise<{ record: StoredArtifact; data: Buffer } | undefined>;
  healthCheck?(): MaybePromise<boolean>;
  close?(): MaybePromise<void>;
}

interface ArtifactMetadata extends StoredArtifact {
  diskPath: string;
}

function defaultRoot(): string {
  return resolve(process.env.BM_ARTIFACT_ROOT?.trim() || process.cwd(), ".bm-agents-runtime", "artifacts");
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "artifact";
}

export function mediaTypeFor(filename: string): string {
  switch (extname(filename).toLowerCase()) {
    case ".json": return "application/json";
    case ".png": return "image/png";
    case ".zip": return "application/zip";
    case ".txt": return "text/plain; charset=utf-8";
    default: return "application/octet-stream";
  }
}

export class ArtifactStore implements ArtifactRepository {
  readonly kind = "filesystem" as const;
  readonly root: string;
  readonly location: string;

  constructor(root = defaultRoot()) {
    this.root = root;
    this.location = root;
    mkdirSync(this.root, { recursive: true });
  }

  write(
    runId: string,
    type: string,
    filename: string,
    data: string | Buffer,
    options: { classification?: string; redacted?: boolean; mediaType?: string } = {},
  ): StoredArtifact {
    const id = randomUUID();
    const runDirectory = resolve(this.root, safeSegment(runId));
    const artifactDirectory = resolve(runDirectory, id);
    mkdirSync(artifactDirectory, { recursive: true });

    const safeFilename = safeSegment(filename);
    const diskPath = resolve(artifactDirectory, safeFilename);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    writeFileSync(diskPath, buffer, { mode: 0o600 });

    const record: ArtifactMetadata = {
      id,
      runId,
      type,
      filename: safeFilename,
      mediaType: options.mediaType ?? mediaTypeFor(safeFilename),
      classification: options.classification ?? "internal-qa-evidence",
      sha256: createHash("sha256").update(buffer).digest("hex"),
      sizeBytes: buffer.length,
      createdAt: new Date().toISOString(),
      redacted: options.redacted ?? false,
      uri: `/api/qa/artifacts/${id}`,
      diskPath,
    };

    writeFileSync(
      resolve(artifactDirectory, "metadata.json"),
      JSON.stringify(record, null, 2),
      { mode: 0o600 },
    );
    return this.publicRecord(record);
  }

  writeJson(
    runId: string,
    type: string,
    filename: string,
    value: unknown,
    options: { classification?: string; redacted?: boolean } = {},
  ): StoredArtifact {
    return this.write(runId, type, filename, JSON.stringify(value, null, 2), {
      ...options,
      mediaType: "application/json",
    });
  }

  find(id: string): ArtifactLookup | undefined {
    const metadata = this.findMetadata(id);
    if (!metadata) return undefined;
    return {
      record: this.publicRecord({ ...metadata, sizeBytes: statSync(metadata.diskPath).size }),
      diskPath: metadata.diskPath,
    };
  }

  readJson<T>(id: string, expectedType?: string): { record: StoredArtifact; value: T } | undefined {
    const found = this.find(id);
    if (!found?.diskPath) return undefined;
    if (expectedType && found.record.type !== expectedType) return undefined;
    if (found.record.mediaType !== "application/json") return undefined;
    try {
      return {
        record: found.record,
        value: JSON.parse(readFileSync(found.diskPath, "utf8")) as T,
      };
    } catch {
      return undefined;
    }
  }

  readBuffer(id: string): { record: StoredArtifact; data: Buffer } | undefined {
    const found = this.find(id);
    if (!found?.diskPath) return undefined;
    try {
      return { record: found.record, data: readFileSync(found.diskPath) };
    } catch {
      return undefined;
    }
  }

  healthCheck(): boolean {
    return existsSync(this.root);
  }

  close(): void {}

  private findMetadata(id: string): ArtifactMetadata | undefined {
    if (!/^[0-9a-f-]{36}$/i.test(id) || !existsSync(this.root)) return undefined;
    for (const runEntry of readdirSync(this.root, { withFileTypes: true })) {
      if (!runEntry.isDirectory()) continue;
      const artifactDirectory = resolve(this.root, runEntry.name, id);
      const metadataPath = resolve(artifactDirectory, "metadata.json");
      if (!existsSync(metadataPath)) continue;
      try {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as ArtifactMetadata;
        if (!metadata.diskPath || !existsSync(metadata.diskPath)) return undefined;
        return metadata;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private publicRecord(record: ArtifactMetadata): StoredArtifact {
    const { diskPath: _diskPath, ...publicRecord } = record;
    return publicRecord;
  }
}
