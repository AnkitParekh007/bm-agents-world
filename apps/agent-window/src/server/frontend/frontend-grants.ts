import { CapabilityGrantRegistry, type CapabilityGrantSpec } from "../platform/capability-grants.js";
import type { PackRuntimeProvider } from "../pack-runtime.js";

/** Runtime agent id for the frontend supervisor that coordinates the whole run. */
export const FRONTEND_SUPERVISOR_AGENT_ID = "frontend-angular";

/**
 * Maps frontend-angular pack specialists (from the pack agent-registry) to the
 * governed capabilities each is responsible for. Only specialists listed here
 * are instantiated as their own scoped agent; the rest — the reviewers and
 * engineers whose work is reasoning over context the governed steps produced —
 * remain supervisor context. The keys are bare specialist ids as they appear in
 * the pack sub-agent registry.
 *
 * The scoping is deliberately narrow, and the interesting cases are the ones
 * that get *nothing*: `ui-implementation`, `state-rxjs`, and `api-integration`
 * write code in a developer's workspace, which is not a governed remote
 * capability in this runtime; `code-review`, `accessibility`, `performance`, and
 * `security` review artifacts that earlier steps already produced. Granting
 * those agents a capability "just in case" would widen the blast radius of a
 * compromised or confused specialist for no functional gain.
 */
export const FRONTEND_SPECIALIST_CAPABILITIES: Record<string, string[]> = {
  "story-context": ["frontend.jira.story.read"],
  "repository-context": ["frontend.repository.context.read"],
  "architecture-analyzer": ["frontend.plan.generate"],
  "design-system": ["frontend.design.tokens.read"],
  "build-pipeline": ["frontend.quality.gates.run"],
  "pr-release": ["frontend.bitbucket.pullrequest.create", "frontend.jira.comment.post"],
};

/** Namespaced runtime agent id for a frontend specialist (e.g. `frontend-angular.pr-release`). */
export function frontendSpecialistAgentId(specialistId: string): string {
  return `${FRONTEND_SUPERVISOR_AGENT_ID}.${specialistId}`;
}

/**
 * The frontend pack's contribution to the platform grant registry. Each
 * specialist is scoped to exactly its mapped capabilities; the supervisor is an
 * explicit unrestricted principal so it can drive any step it coordinates. As
 * with QA, enforcement happens in the broker before policy, and an agent id
 * matching no declaration is denied outright.
 */
export function frontendGrantSpec(): CapabilityGrantSpec {
  const scoped: Record<string, readonly string[]> = {};
  for (const [specialistId, capabilities] of Object.entries(FRONTEND_SPECIALIST_CAPABILITIES)) {
    scoped[frontendSpecialistAgentId(specialistId)] = capabilities;
  }
  return { scoped, unrestricted: [FRONTEND_SUPERVISOR_AGENT_ID] };
}

export function buildFrontendGrantRegistry(): CapabilityGrantRegistry {
  return new CapabilityGrantRegistry(frontendGrantSpec());
}

/**
 * Frontend implementation of the generic PackRuntimeProvider. Namespacing and
 * grants come from the same single source used to build the grant registry, so
 * the planned team and the enforced authority can never drift apart.
 */
export const frontendRuntimeProvider: PackRuntimeProvider = {
  packId: FRONTEND_SUPERVISOR_AGENT_ID,
  supervisorRuntimeId: () => FRONTEND_SUPERVISOR_AGENT_ID,
  specialistRuntimeId: (sourceId) => frontendSpecialistAgentId(sourceId),
  grantsFor: (sourceId) => FRONTEND_SPECIALIST_CAPABILITIES[sourceId],
};
