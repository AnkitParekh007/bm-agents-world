import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";

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

interface ArtifactMetadata extends StoredArtifact {
  diskPath: string;
}

function defaultRoot(): string {
  return resolve(process.env.BM_ARTIFACT_ROOT?.trim() || process.cwd(), ".bm-agents-runtime", "artifacts");
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "artifact";
}

function mediaTypeFor(filename: string): string {
  switch (extname(filename).toLowerCase()) {
    case ".json": return "application/json";
    case ".png": return "image/png";
    case ".zip": return "application/zip";
    case ".txt": return "text/plain; charset=utf-8";
    default: return "application/octet-stream";
  }
}

export class ArtifactStore {
  readonly root: string;

  constructor(root = defaultRoot()) {
    this.root = root;
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

  find(id: string): { record: StoredArtifact; diskPath: string } | undefined {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
    if (!existsSync(this.root)) return undefined;

    const runDirectories = require("node:fs").readdirSync(this.root, { withFileTypes: true });
    for (const runEntry of runDirectories) {
      if (!runEntry.isDirectory()) continue;
      const artifactDirectory = resolve(this.root, runEntry.name, id);
      const metadataPath = resolve(artifactDirectory, "metadata.json");
      if (!existsSync(metadataPath)) continue;
      try {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as ArtifactMetadata;
        if (!metadata.diskPath || !existsSync(metadata.diskPath)) return undefined;
        const size = statSync(metadata.diskPath).size;
        return {
          record: this.publicRecord({ ...metadata, sizeBytes: size }),
          diskPath: metadata.diskPath,
        };
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
