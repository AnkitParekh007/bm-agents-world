import type { CapabilityBrokerContract } from "../platform/capability-broker-contract.js";
import type { AgentTelemetryService } from "../platform/agent-telemetry.js";
import type { PackRegistry } from "../pack-registry.js";
import { buildAgentDefinitions } from "../copilot.js";
import { copilotKitRuntimeAdapter } from "./copilotkit-adapter.js";

/**
 * Composition root for the CopilotKit runtime (Phase 6).
 *
 * Builds the platform's runtime-neutral agent definitions (no CopilotKit) and
 * materializes them through the CopilotKit adapter. This is the single seam
 * where the neutral definitions meet the concrete runtime; selecting a different
 * runtime would be selecting a different adapter here.
 */
export function buildCopilotRuntime(
  registry: PackRegistry,
  qaBroker: CapabilityBrokerContract,
  telemetry?: AgentTelemetryService,
) {
  const definitions = buildAgentDefinitions(registry, qaBroker, telemetry);
  return copilotKitRuntimeAdapter.materialize(definitions, { telemetry });
}
