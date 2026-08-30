import type { AgentTelemetryService } from "./platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { CapabilityAdapter, CapabilityDefinition } from "./platform/capability-types.js";
import type { CapabilityGrantSpec } from "./platform/capability-grants.js";
import type { ArtifactRepository } from "./platform/artifact-store.js";
import type { AgentPack } from "./pack-registry.js";
import type { GovernedAgentSpec, PackRuntimeProvider } from "./pack-runtime.js";
import type { NeutralTool } from "./runtime/agent-runtime.js";
import type { CompiledWorkflowStep } from "./workflow-compiler.js";
import type { WorkflowRunContext } from "./workflow-executor.js";
import type { CapabilityStepBinding } from "./workflow-broker-runner.js";
import { qaGovernance } from "./qa/qa-governance.js";
import { frontendGovernance } from "./frontend/frontend-governance.js";

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
/** Server-side dependencies a pack's capability adapters may need. */
export interface PackAdapterContext {
  artifacts: ArtifactRepository;
}

export interface PackGovernance {
  /** Namespacing + capability grants the generic planner uses. */
  runtimeProvider: PackRuntimeProvider;
  /**
   * The governed capabilities this pack registers with the broker, already
   * filtered to those the deployment can actually execute. A capability absent
   * here cannot be requested at all — which is how a pack expresses a denied
   * action (no capability, rather than a capability that refuses).
   */
  capabilities(): CapabilityDefinition[];
  /** The adapters backing those capabilities. Adapter ids must be unique platform-wide. */
  buildAdapters(context: PackAdapterContext): CapabilityAdapter[];
  /** Per-agent capability allowlist contributed to the platform grant registry. */
  grantSpec(): CapabilityGrantSpec;
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
  /**
   * Maps a workflow step to the governed capability it must go through, or
   * undefined when the step is ungoverned reasoning. This binding map is the
   * pack's authoritative statement of what is governed: the live workflow engine
   * treats a mapped step as governed-executable (and fails it closed if the
   * capability cannot be satisfied) and an unmapped skill step as reasoning it
   * may delegate. A step declaring a `tool` (a concrete side effect) is always
   * governed and must be mapped.
   */
  resolveWorkflowBinding(
    step: CompiledWorkflowStep,
    context: WorkflowRunContext,
  ): CapabilityStepBinding | undefined;
}

/** The governed packs known to the platform, keyed by pack id. */
const PACK_GOVERNANCE: Record<string, PackGovernance> = {
  qa: qaGovernance,
  "frontend-angular": frontendGovernance,
};

/** The registered governance for a pack, or undefined for an ungoverned pack. */
export function resolvePackGovernance(packId: string): PackGovernance | undefined {
  return PACK_GOVERNANCE[packId];
}

/** Every registered governed pack, as `[packId, governance]` in registration order. */
export function listPackGovernance(): Array<[string, PackGovernance]> {
  return Object.entries(PACK_GOVERNANCE);
}
