import { z } from "zod";
import { defineNeutralTool, type NeutralTool } from "../runtime/agent-runtime.js";
import type { AgentTelemetryService } from "../platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "../platform/capability-broker-contract.js";
import { buildGovernedCapabilityTools, type GovernedToolSurface } from "../platform/governed-capability-tools.js";
import { projectTestCatalogStatus } from "./qa-project-tests.js";
import { QA_SUPERVISOR_AGENT_ID } from "./qa-grants.js";

/**
 * QA's governed tool surface.
 *
 * The broker protocol itself lives in the shared
 * {@link buildGovernedCapabilityTools}; QA contributes only what is genuinely
 * QA's — its tool names, its capability prompt, and one pack-owned tool that
 * lists allowlisted project test suites. The resulting surface is identical to
 * the hand-written one this replaced (names, order, descriptions, and parameter
 * schemas), which `qa-tools.test.ts` pins.
 */

export const QA_CAPABILITY_PROMPT = `

QA capability execution protocol:
- Use governed server tools for executable QA work; never pretend an external system was accessed.
- For every multi-step workflow, call startQaRun once with the exact project/environment and reuse the returned runId in every requestQaCapabilityAction call for that workflow.
- Start with listQaCapabilities and listQaProjectTests when you need executable scope.
- After reading the story and change impact, request and execute qa.testplan.generate with non-empty scope, testTypes, entryCriteria, and exitCriteria plus story-derived cases. The server persists an immutable test-plan artifact for traceability; use it to justify which tests to run.
- For an action, call requestQaCapabilityAction with exact runId, project, environment, capability, and payload. Execute only the returned immutable action id.
- If status is pending_approval, call reviewQaAction with the exact action id, capability id, risk level, summary, and payload hash. Execute only after human approval.
- Approval is payload-hash-bound and expires. Never substitute a new payload after approval.
- For qa.playwright.test.run, include storyId and changedFiles from Bitbucket evidence only. Never supply URLs, selectors, credentials, scripts, or test file paths.
- A failed Playwright result can include bugDraftArtifact. Treat that immutable artifact as the only source for Jira defect creation.
- Before Jira creation, request and execute qa.jira.duplicate.search with payload {bugDraftArtifactId, bugDraftSha256}. Report candidates.
- To create a Jira bug, request qa.jira.bug.create using only {bugDraftArtifactId, bugDraftSha256}. Do not reconstruct title, description, severity, evidence, or parent story in the action payload. The server reloads the exact artifact.
- When qa.jira.bug.create returns pending_approval, call reviewQaAction. The frontend review card loads the exact bug draft and current duplicate candidates from the server. Only after approval may you execute that same action id.
- If the Jira create result has mode=live and externalSideEffect=true, report the returned Jira key as a real created defect. If mode=mock, explicitly say no Jira issue was created.
- The Jira adapter rechecks duplicates immediately before the POST and may fail safely if a high-confidence duplicate appears.
- SecretReference metadata is safe to name, but never request or expose secret values or storage-state contents.
- Teams posting, database validation, and API contract checks run live only when their server-side integration is configured; otherwise they return an explicit mock. Always report mode=live vs mode=mock honestly and never claim a live side effect on a mock result. Production browser execution and free-form production mutation are unavailable.
`;

/** QA's own tool: allowlisted project suites and whether a live identity is configured. */
const listProjectTests = defineNeutralTool({
  name: "listQaProjectTests",
  description: "List public metadata for allowlisted project QA suites and whether a server-side authenticated identity reference is configured. Never returns secret values or selectors.",
  parameters: z.object({}),
  execute: async () => ({ projects: projectTestCatalogStatus() }),
});

export const QA_TOOL_SURFACE: GovernedToolSurface = {
  packName: "qa-agent-pack",
  defaultAgentId: QA_SUPERVISOR_AGENT_ID,
  label: "QA",
  names: {
    listCapabilities: "listQaCapabilities",
    startRun: "startQaRun",
    requestAction: "requestQaCapabilityAction",
    getAction: "getQaCapabilityAction",
    executeAction: "executeQaCapabilityAction",
  },
  extraTools: [listProjectTests],
};

export function buildQaTools(
  broker: CapabilityBrokerContract,
  telemetry?: AgentTelemetryService,
  agentId: string = QA_SUPERVISOR_AGENT_ID,
): NeutralTool[] {
  return buildGovernedCapabilityTools(QA_TOOL_SURFACE, broker, telemetry, agentId);
}
