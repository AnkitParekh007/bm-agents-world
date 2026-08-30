import type { CapabilityAdapter } from "../platform/capability-types.js";
import type { PackAdapterContext, PackGovernance } from "../pack-governance.js";
import type { AgentPack } from "../pack-registry.js";
import type { GovernedAgentSpec } from "../pack-runtime.js";
import type { CompiledWorkflowStep } from "../workflow-compiler.js";
import type { WorkflowRunContext } from "../workflow-executor.js";
import type { CapabilityStepBinding } from "../workflow-broker-runner.js";
import { availableFrontendCapabilities, FrontendMockAdapter } from "./frontend-capabilities.js";
import { FrontendPlanAdapter } from "./frontend-plan-adapter.js";
import { frontendGrantSpec, frontendRuntimeProvider } from "./frontend-grants.js";
import { buildFrontendTools, FRONTEND_CAPABILITY_PROMPT } from "./frontend-tools.js";

/**
 * frontend-angular pack governance — the platform's second governed vertical
 * (Phase 9).
 *
 * The point of this module is how little is in it. Everything structural — how
 * a pack's agents are planned, how a workflow compiles, how a capability is
 * requested, approved, and executed, how grants are enforced — is platform
 * machinery this pack does not restate. What a vertical actually owns is its
 * capabilities and their adapters, which specialists may use them, its prompts,
 * and its statement of which workflow steps are governed.
 */

function frontendSupervisorPrompt(specialistRuntimeIds: string[]): string {
  const roster = specialistRuntimeIds.map((id) => `- ${id}`).join("\n");
  return `

You are the frontend Angular supervisor. You own the run, its durable state,
approvals, and the final consolidated result. Coordinate the following specialist
agents, each scoped to its own governed capabilities:
${roster || "- (no specialists registered)"}

Run the workflow in order — story context, repository and framework profile,
change impact, implementation plan, then implementation, quality gates, review,
and finally the approved pull request and status update — reusing one
startFrontendRun runId across the whole workflow. You may perform any step
yourself using the governed tools, but keep each step scoped to the capability it
needs, respect the framework version profile the repository actually declares, and
never claim a step ran unless a tool result confirms it.`;
}

function frontendSpecialistPrompt(pack: AgentPack, specialist: GovernedAgentSpec): string {
  const purpose = specialist.purpose ?? "frontend specialist";
  const capabilities = specialist.capabilities ?? [];
  return `You are the frontend ${specialist.sourceId} specialist inside the ${pack.displayName} Agent, coordinated by the frontend-angular supervisor.

Your responsibility: ${purpose}

Stay strictly within your scope. You are accountable only for these governed
capabilities: ${capabilities.join(", ")}. Do not request or execute other
capabilities. Reuse the supervisor's startFrontendRun runId when one is provided,
return structured results the supervisor can consolidate, and never claim an
external system was touched unless a governed tool result confirms it.`;
}

/**
 * The pack's authoritative skill -> governed-capability binding map. A workflow
 * step is governed only when one of its declared skills appears here; every other
 * skill (risk scoring, impact analysis, component authoring, review) is
 * ungoverned reasoning the engine may delegate.
 *
 * As with QA, only skills whose capability the engine can drive from the run
 * inputs today are listed — the reads keyed by story and project. Implementation
 * planning, quality gates, and the draft-bearing writes need payloads assembled
 * from prior step outputs, and join this map as that assembly is wired.
 */
const FRONTEND_SKILL_CAPABILITY: Record<string, string> = {
  "frontend.story.read-context": "frontend.jira.story.read",
  "frontend.repo.map-workspace": "frontend.repository.context.read",
  "frontend.repo.detect-conventions": "frontend.repository.context.read",
  "frontend.repo.detect-protected-paths": "frontend.repository.context.read",
  "frontend.design.tokens": "frontend.design.tokens.read",
  "frontend.design.component-reuse": "frontend.design.tokens.read",
};

/**
 * Named workflow actions -> governed capabilities. An `action` is a declared
 * external side effect, so anything here that is *not* mapped fails the step
 * closed rather than being delegated.
 *
 * `git.push` is deliberately absent. The pack's release workflow declares a push
 * step, but this runtime has no governed push capability, so that workflow stops
 * at the push with an explicit refusal. That is the intended outcome: the honest
 * failure is a workflow that cannot complete, not a side effect that happens
 * outside governance.
 */
const FRONTEND_ACTION_CAPABILITY: Record<string, string> = {
  "bitbucket.pullrequest.create": "frontend.bitbucket.pullrequest.create",
  "jira.write": "frontend.jira.comment.post",
};

/**
 * Assembles the governed capability payload for a frontend workflow step from the
 * run inputs. Only identifiers flow here — a story key, a project, an approved
 * design-file id, an artifact id. No URL, path, command, selector, or credential
 * is ever placed on a model-reachable payload.
 */
function frontendWorkflowBinding(
  step: CompiledWorkflowStep,
  context: WorkflowRunContext,
): CapabilityStepBinding | undefined {
  const inputs = context.inputs ?? {};
  const capabilityId = step.action
    ? FRONTEND_ACTION_CAPABILITY[step.action]
    : step.skills.map((skill) => FRONTEND_SKILL_CAPABILITY[skill]).find(Boolean);
  if (!capabilityId) return undefined;

  const payload: Record<string, unknown> = {};
  const storyId = inputs.jiraIssueKey ?? inputs.storyId;
  if (typeof storyId === "string") payload.storyId = storyId;
  if (capabilityId === "frontend.design.tokens.read" && typeof inputs.designFileId === "string") {
    payload.designFileId = inputs.designFileId;
  }
  if (capabilityId === "frontend.bitbucket.pullrequest.create" && typeof inputs.pullRequestDraftArtifactId === "string") {
    payload.pullRequestDraftArtifactId = inputs.pullRequestDraftArtifactId;
  }
  if (capabilityId === "frontend.jira.comment.post" && typeof inputs.commentDraftArtifactId === "string") {
    payload.commentDraftArtifactId = inputs.commentDraftArtifactId;
  }
  return { capabilityId, payload };
}

function buildFrontendAdapters(context: PackAdapterContext): CapabilityAdapter[] {
  return [new FrontendMockAdapter(), new FrontendPlanAdapter(context.artifacts)];
}

export const frontendGovernance: PackGovernance = {
  runtimeProvider: frontendRuntimeProvider,
  capabilities: availableFrontendCapabilities,
  buildAdapters: buildFrontendAdapters,
  grantSpec: frontendGrantSpec,
  capabilityPrompt: FRONTEND_CAPABILITY_PROMPT,
  supervisorPrompt: frontendSupervisorPrompt,
  specialistPrompt: frontendSpecialistPrompt,
  buildTools: buildFrontendTools,
  resolveWorkflowBinding: frontendWorkflowBinding,
};
