import type { PackGovernance } from "../pack-governance.js";
import type { AgentPack } from "../pack-registry.js";
import type { GovernedAgentSpec } from "../pack-runtime.js";
import type { CompiledWorkflowStep } from "../workflow-compiler.js";
import type { WorkflowRunContext } from "../workflow-executor.js";
import type { CapabilityStepBinding } from "../workflow-broker-runner.js";
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

/**
 * The QA pack's authoritative skill -> governed-capability binding map. A step is
 * governed by the live workflow engine only when its skill is listed here; every
 * other workflow skill (risk scoring, test planning, traceability, etc.) is
 * ungoverned reasoning the engine may delegate. A `tool`-bearing step (a concrete
 * side effect) is always governed and must be mapped — QA declares no such steps.
 *
 * Only skills whose governed capability the engine can drive from the run inputs
 * today are listed. That is currently the story/change reads, which are keyed by
 * the story id. Governed steps that need richer capability payloads assembled
 * from prior step outputs (test-plan generation, browser/api execution, defect
 * creation, status reporting) join this map as that payload assembly is wired.
 */
const QA_SKILL_CAPABILITY: Record<string, string> = {
  "qa.story.read-context": "qa.jira.story.read",
  "qa.change.frontend-impact": "qa.bitbucket.change-impact.read",
  "qa.change.backend-impact": "qa.bitbucket.change-impact.read",
  "qa.change.database-impact": "qa.bitbucket.change-impact.read",
};

/**
 * Assembles the governed capability payload for a QA workflow step from the run
 * inputs. Read/impact capabilities are keyed by the story; the model never sees
 * secret values, and only identifiers flow here — no URLs, selectors, or scripts.
 */
function qaWorkflowBinding(step: CompiledWorkflowStep, context: WorkflowRunContext): CapabilityStepBinding | undefined {
  if (!step.skill) return undefined;
  const capabilityId = QA_SKILL_CAPABILITY[step.skill];
  if (!capabilityId) return undefined;
  const inputs = context.inputs ?? {};
  const storyId = inputs.jiraIssueKey ?? inputs.storyId;
  const payload: Record<string, unknown> = {};
  if (typeof storyId === "string") payload.storyId = storyId;
  return { capabilityId, payload };
}

export const qaGovernance: PackGovernance = {
  runtimeProvider: qaRuntimeProvider,
  capabilityPrompt: QA_CAPABILITY_PROMPT,
  supervisorPrompt: qaSupervisorPrompt,
  specialistPrompt: qaSpecialistPrompt,
  buildTools: buildQaTools,
  resolveWorkflowBinding: qaWorkflowBinding,
};
