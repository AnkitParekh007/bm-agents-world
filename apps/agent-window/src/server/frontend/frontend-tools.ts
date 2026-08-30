import type { NeutralTool } from "../runtime/agent-runtime.js";
import type { AgentTelemetryService } from "../platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "../platform/capability-broker-contract.js";
import { buildGovernedCapabilityTools, type GovernedToolSurface } from "../platform/governed-capability-tools.js";
import { FRONTEND_SUPERVISOR_AGENT_ID } from "./frontend-grants.js";

/**
 * The frontend pack's governed tool surface.
 *
 * It is the shared broker protocol under different names — which is the point:
 * a second vertical needed a tool-name set and a capability prompt, not a second
 * implementation of request/approve/execute.
 */

export const FRONTEND_CAPABILITY_PROMPT = `

Frontend capability execution protocol:
- Use governed server tools for any work that touches Jira, the repository, the design system, quality gates, or a pull request. Never claim an external system was read or written unless a tool result confirms it.
- For every multi-step workflow, call startFrontendRun once with the exact project/environment and reuse the returned runId in every requestFrontendCapabilityAction call for that workflow.
- Start with listFrontendCapabilities when you need executable scope.
- After reading the story and repository context, request and execute frontend.plan.generate with a non-empty summary, affectedComponents, steps, and rollback. The server persists an immutable implementation-plan artifact; treat that artifact as the plan of record for every later step.
- For an action, call requestFrontendCapabilityAction with exact runId, project, environment, capability, and payload. Execute only the returned immutable action id.
- If status is pending_approval, the action needs human approval. Execute only after it is approved, and only that same action id.
- Approval is payload-hash-bound and expires. Never substitute a new payload after approval.
- Writing code is your own work in the developer's workspace; it is not a governed capability and must never be reported as one. Only Jira reads, repository context reads, design-token reads, quality gates, pull-request creation, and Jira comments go through capabilities.
- For frontend.bitbucket.pullrequest.create and frontend.jira.comment.post, supply only the immutable draft artifact identifiers. Do not reconstruct the title, description, or comment body in the action payload; the server reloads the exact approved artifact.
- You cannot approve or merge a pull request, publish a package, deploy, write to a database, or write production configuration. No capability exists for these — do not attempt to reach them through another capability.
- SecretReference metadata is safe to name, but never request or expose secret values.
- Always report mode=live vs mode=mock honestly, and never claim a live side effect on a mock result.
`;

export const FRONTEND_TOOL_SURFACE: GovernedToolSurface = {
  packName: "frontend-angular-agent-pack",
  defaultAgentId: FRONTEND_SUPERVISOR_AGENT_ID,
  label: "frontend",
  names: {
    listCapabilities: "listFrontendCapabilities",
    startRun: "startFrontendRun",
    requestAction: "requestFrontendCapabilityAction",
    getAction: "getFrontendCapabilityAction",
    executeAction: "executeFrontendCapabilityAction",
  },
};

export function buildFrontendTools(
  broker: CapabilityBrokerContract,
  telemetry?: AgentTelemetryService,
  agentId: string = FRONTEND_SUPERVISOR_AGENT_ID,
): NeutralTool[] {
  return buildGovernedCapabilityTools(FRONTEND_TOOL_SURFACE, broker, telemetry, agentId);
}
