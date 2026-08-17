import type { AgentTelemetryService } from "./platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { AgentPack } from "./pack-registry.js";
import type { GovernedAgentSpec, PackRuntimeProvider } from "./pack-runtime.js";
import type { NeutralTool } from "./runtime/agent-runtime.js";
import { qaGovernance } from "./qa/qa-governance.js";

/**
 * Pack governance provider (finishes Phase 4).
 *
 * A governed pack contributes its governance here rather than being a branch in
 * the agent-construction algorithm. The generic planner (Phase 3/4) decides
 * *which* scoped agents a compiled pack has; a `PackGovernance` supplies the
 * pack-specific governance those agents need — the namespacing/grants provider,
 * the governed tools bound to an agent identity, and the capability/role prompts.
 *
 * With this, {@link buildAgentDefinitions} has no `if (pack.id === "qa")` seam:
 * it plans every pack generically and, when a pack has registered governance,
 * materializes a governed team from that provider. QA is simply the first
 * registered provider, not an exception.
 */
export interface PackGovernance {
  /** Namespacing + capability grants the generic planner uses. */
  runtimeProvider: PackRuntimeProvider;
  /** Governed capability protocol appended to the supervisor and every specialist. */
  capabilityPrompt: string;
  supervisorPrompt(specialistRuntimeIds: string[]): string;
  specialistPrompt(pack: AgentPack, specialist: GovernedAgentSpec): string;
  /** Governed tools bound to a specific agent identity. */
  buildTools(
    broker: CapabilityBrokerContract,
    telemetry: AgentTelemetryService | undefined,
    agentId: string,
  ): NeutralTool[];
}

/** The governed packs known to the platform, keyed by pack id. */
const PACK_GOVERNANCE: Record<string, PackGovernance> = {
  qa: qaGovernance,
};

/** The registered governance for a pack, or undefined for an ungoverned pack. */
export function resolvePackGovernance(packId: string): PackGovernance | undefined {
  return PACK_GOVERNANCE[packId];
}
