import { AgentTelemetryStore } from "./agent-telemetry.js";
import { ArtifactStore, type ArtifactRepository } from "./artifact-store.js";
import { SqliteCapabilityStore } from "./capability-store.js";
import { PostgresRuntimeStore } from "./postgres-runtime-store.js";
import { QaPilotObservabilityStore } from "./qa-pilot-observability.js";
import { SharedAgentTelemetryBridge } from "./shared-agent-telemetry-bridge.js";
import { SupabaseArtifactStore } from "./supabase-artifact-store.js";

export interface PersistenceStatus {
  mode: "sqlite-filesystem" | "postgres-supabase";
  shared: boolean;
  state: { kind: "sqlite" | "postgres"; location: string };
  artifacts: { kind: ArtifactRepository["kind"]; location: string };
}

export interface LocalRuntimePersistence {
  mode: "sqlite-filesystem";
  shared: false;
  capabilityStore: SqliteCapabilityStore;
  observabilityStore: QaPilotObservabilityStore;
  telemetryServiceStore: AgentTelemetryStore;
  telemetryReadStore: AgentTelemetryStore;
  artifacts: ArtifactStore;
  status: PersistenceStatus;
  healthCheck(): Promise<{ state: boolean; artifacts: boolean }>;
  close(): Promise<void>;
}

export interface SharedRuntimePersistence {
  mode: "postgres-supabase";
  shared: true;
  capabilityStore: PostgresRuntimeStore;
  observabilityStore: PostgresRuntimeStore;
  telemetryServiceStore: SharedAgentTelemetryBridge;
  telemetryReadStore: PostgresRuntimeStore;
  artifacts: SupabaseArtifactStore;
  status: PersistenceStatus;
  healthCheck(): Promise<{ state: boolean; artifacts: boolean }>;
  close(): Promise<void>;
}

export type RuntimePersistence = LocalRuntimePersistence | SharedRuntimePersistence;

function persistenceMode(): "sqlite-filesystem" | "postgres-supabase" {
  const value = process.env.BM_PERSISTENCE_MODE?.trim().toLowerCase() || "sqlite-filesystem";
  if (value === "sqlite" || value === "local" || value === "sqlite-filesystem") return "sqlite-filesystem";
  if (value === "postgres" || value === "supabase" || value === "postgres-supabase") return "postgres-supabase";
  throw new Error(`Unsupported BM_PERSISTENCE_MODE: ${value}`);
}

export async function createRuntimePersistence(): Promise<RuntimePersistence> {
  if (persistenceMode() === "sqlite-filesystem") {
    const capabilityStore = new SqliteCapabilityStore();
    const observabilityStore = new QaPilotObservabilityStore(capabilityStore.path);
    const telemetryServiceStore = new AgentTelemetryStore(capabilityStore.path);
    const artifacts = new ArtifactStore();
    return {
      mode: "sqlite-filesystem",
      shared: false,
      capabilityStore,
      observabilityStore,
      telemetryServiceStore,
      telemetryReadStore: telemetryServiceStore,
      artifacts,
      status: {
        mode: "sqlite-filesystem",
        shared: false,
        state: { kind: "sqlite", location: capabilityStore.path },
        artifacts: { kind: artifacts.kind, location: artifacts.location },
      },
      async healthCheck() {
        return { state: true, artifacts: artifacts.healthCheck() };
      },
      async close() {
        observabilityStore.close();
        telemetryServiceStore.close();
        capabilityStore.close();
        artifacts.close();
      },
    };
  }

  const postgresUrl = process.env.BM_POSTGRES_URL?.trim() || "";
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || "";
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY?.trim() || "";
  if (!postgresUrl) throw new Error("BM_POSTGRES_URL is required when BM_PERSISTENCE_MODE=postgres-supabase");
  if (!supabaseUrl) throw new Error("SUPABASE_URL is required when BM_PERSISTENCE_MODE=postgres-supabase");
  if (!supabaseSecret) throw new Error("SUPABASE_SECRET_KEY is required when BM_PERSISTENCE_MODE=postgres-supabase");

  const shared = new PostgresRuntimeStore(postgresUrl);
  await shared.assertReady();
  const artifacts = new SupabaseArtifactStore(supabaseUrl, supabaseSecret);
  const telemetryServiceStore = new SharedAgentTelemetryBridge(shared);

  return {
    mode: "postgres-supabase",
    shared: true,
    capabilityStore: shared,
    observabilityStore: shared,
    telemetryServiceStore,
    telemetryReadStore: shared,
    artifacts,
    status: {
      mode: "postgres-supabase",
      shared: true,
      state: { kind: "postgres", location: shared.location },
      artifacts: { kind: artifacts.kind, location: artifacts.location },
    },
    async healthCheck() {
      const [state, artifactHealth] = await Promise.all([
        shared.healthCheck(),
        artifacts.healthCheck(),
      ]);
      return { state, artifacts: artifactHealth };
    },
    async close() {
      telemetryServiceStore.close();
      await artifacts.close();
      await shared.close();
    },
  };
}
