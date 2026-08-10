import { AgentTelemetryStore, type AgentRunUsage } from "./agent-telemetry.js";
import type { PostgresRuntimeStore } from "./postgres-runtime-store.js";

/**
 * AgentTelemetryService currently writes from RxJS lifecycle callbacks where
 * awaiting would alter stream semantics. This adapter preserves that interface
 * while sending writes to the authoritative Postgres store. Reads in shared
 * mode use PostgresRuntimeStore directly through the async telemetry view.
 */
export class SharedAgentTelemetryBridge extends AgentTelemetryStore {
  constructor(private readonly shared: PostgresRuntimeStore) {
    super(":memory:");
  }

  override saveRun(run: AgentRunUsage): void {
    void this.shared.saveRun(run).catch((error) => {
      console.error("[bm-agents-world] shared agent telemetry write failed", error);
    });
  }

  override linkQaRun(qaRunId: string, agentRunId: string): void {
    void this.shared.linkQaRun(qaRunId, agentRunId).catch((error) => {
      console.error("[bm-agents-world] shared agent telemetry link failed", error);
    });
  }

  override close(): void {
    super.close();
  }
}
