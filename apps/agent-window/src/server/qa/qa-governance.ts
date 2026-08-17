import type { PackGovernance } from "../pack-governance.js";
import type { AgentPack } from "../pack-registry.js";
import type { GovernedAgentSpec } from "../pack-runtime.js";
import { qaRuntimeProvider } from "./qa-grants.js";
import { buildQaTools, QA_CAPABILITY_PROMPT } from "./qa-tools.js";

/**
 * QA pack governance (finishes Phase 4).
 *
 * The QA-specific prompts, governed tools, and namespacing/grants provider,
 * assembled into a single {@link PackGovernance} that plugs into the generic
 * agent-construction path. There is no longer any QA branch in that path — this
 * provider is registered like any other governed pack would be.
 */

function qaSupervisorPrompt(specialistRuntimeIds: string[]): string {
  const roster = specialistRuntimeIds.map((id) => `- ${id}`).join("\n");
  return `

You are the QA supervisor. You own the run, its durable state, approvals, and the
final consolidated result. Coordinate the following specialist agents, each scoped
to its own governed capabilities:
${roster || "- (no specialists registered)"}

Run the workflow in order — story context, change impact, test design, execution
(browser/api/database), integration traceability, then defect handling and
reporting — reusing one startQaRun runId across the whole workflow. You may perform
any step yourself using the governed tools, but keep each step scoped to the
capability it needs, and never claim a step ran unless a tool result confirms it.`;
}

function qaSpecialistPrompt(pack: AgentPack, specialist: GovernedAgentSpec): string {
  const purpose = specialist.purpose ?? "QA specialist";
  const capabilities = specialist.capabilities ?? [];
  return `You are the QA ${specialist.sourceId} specialist inside the ${pack.displayName} Agent, coordinated by the qa supervisor.

Your responsibility: ${purpose}

Stay strictly within your scope. You are accountable only for these governed
capabilities: ${capabilities.join(", ")}. Do not request or execute other
capabilities. Reuse the supervisor's startQaRun runId when one is provided, return
structured results the supervisor can consolidate, and never claim an external
system was touched unless a governed tool result confirms it.`;
}

export const qaGovernance: PackGovernance = {
  runtimeProvider: qaRuntimeProvider,
  capabilityPrompt: QA_CAPABILITY_PROMPT,
  supervisorPrompt: qaSupervisorPrompt,
  specialistPrompt: qaSpecialistPrompt,
  buildTools: buildQaTools,
};
