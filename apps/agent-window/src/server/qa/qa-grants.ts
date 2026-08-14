import { CapabilityGrantRegistry } from "../platform/capability-grants.js";

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
 * agent is scoped to exactly its mapped capabilities; the supervisor is left
 * unscoped so it can drive any step it coordinates. Enforcement happens in the
 * broker before policy, so a specialist that tries to reach outside its grant
 * (e.g. `qa.browser-qa` requesting `qa.jira.bug.create`) is denied up front.
 */
export function buildQaGrantRegistry(): CapabilityGrantRegistry {
  const grants: Record<string, readonly string[]> = {};
  for (const [specialistId, capabilities] of Object.entries(QA_SPECIALIST_CAPABILITIES)) {
    grants[qaSpecialistAgentId(specialistId)] = capabilities;
  }
  return new CapabilityGrantRegistry(grants);
}
