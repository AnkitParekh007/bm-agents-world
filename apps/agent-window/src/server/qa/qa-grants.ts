import { CapabilityGrantRegistry } from "../platform/capability-grants.js";
import type { PackRuntimeProvider } from "../pack-runtime.js";

/** Runtime agent id for the QA supervisor that coordinates the whole run. */
export const QA_SUPERVISOR_AGENT_ID = "qa";

/**
 * Maps QA pack specialists (from the pack agent-registry) to the governed
 * capabilities they are responsible for. Only specialists listed here are
 * instantiated as their own scoped agent; the rest remain supervisor context.
 * The keys are bare specialist ids as they appear in the pack sub-agent
 * registry; {@link qaSpecialistAgentId} derives the namespaced runtime id.
 */
export const QA_SPECIALIST_CAPABILITIES: Record<string, string[]> = {
  "story-context": ["qa.jira.story.read"],
  "change-impact": ["qa.bitbucket.change-impact.read"],
  "test-design": ["qa.testplan.generate"],
  "browser-qa": ["qa.playwright.test.run"],
  "api-qa": ["qa.api.contract.test"],
  "database-validation": ["qa.database.validation.read"],
  "integration-qa": ["qa.integration.trace"],
  "defect-investigator": ["qa.jira.duplicate.search", "qa.jira.bug.create"],
  "qa-reporter": ["qa.teams.status.post"],
};

/** Namespaced runtime agent id for a QA specialist (e.g. `qa.browser-qa`). */
export function qaSpecialistAgentId(specialistId: string): string {
  return `${QA_SUPERVISOR_AGENT_ID}.${specialistId}`;
}

/**
 * Builds the broker-enforced capability grant for the QA pack. Each specialist
 * agent is scoped to exactly its mapped capabilities; the supervisor is declared
 * as an explicit unrestricted principal so it can drive any step it coordinates.
 * Enforcement happens in the broker before policy, so a specialist that reaches
 * outside its grant (e.g. `qa.browser-qa` requesting `qa.jira.bug.create`) is
 * denied up front — and, because the registry fails closed, so is any agent id
 * that matches no declaration (a typo'd or spoofed specialist id).
 */
export function buildQaGrantRegistry(): CapabilityGrantRegistry {
  const scoped: Record<string, readonly string[]> = {};
  for (const [specialistId, capabilities] of Object.entries(QA_SPECIALIST_CAPABILITIES)) {
    scoped[qaSpecialistAgentId(specialistId)] = capabilities;
  }
  return new CapabilityGrantRegistry({ scoped, unrestricted: [QA_SUPERVISOR_AGENT_ID] });
}

/**
 * QA implementation of the generic PackRuntimeProvider. Namespacing and grants
 * come from the same single source used to build the broker grant registry, so
 * the generic runtime path plans exactly the QA team the special-case builds.
 */
export const qaRuntimeProvider: PackRuntimeProvider = {
  packId: QA_SUPERVISOR_AGENT_ID,
  supervisorRuntimeId: () => QA_SUPERVISOR_AGENT_ID,
  specialistRuntimeId: (sourceId) => qaSpecialistAgentId(sourceId),
  grantsFor: (sourceId) => QA_SPECIALIST_CAPABILITIES[sourceId],
};
