import { randomUUID } from "node:crypto";
import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import type { CapabilityBroker } from "../platform/capability-broker.js";
import type { EnvironmentName, ExecutionContext } from "../platform/capability-types.js";
import { projectTestCatalogStatus } from "./qa-project-tests.js";

function contextFor(projectId: string, environment: EnvironmentName): ExecutionContext {
  return {
    runId: randomUUID(),
    userId: "local-dev-user",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId,
    environment,
    tenantId: "local-dev",
    requestedAt: new Date().toISOString(),
  };
}

export const QA_CAPABILITY_PROMPT = `

QA capability execution protocol:
- Use governed server tools for executable QA work; never pretend an external system was accessed.
- Start with listQaCapabilities and listQaProjectTests when you need executable scope.
- For an action, call requestQaCapabilityAction with exact project, environment, capability, and payload. Execute only the returned immutable action id.
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
- Teams posting remains mock-only. Production browser execution and free-form production mutation are unavailable.
`;

export function buildQaTools(broker: CapabilityBroker) {
  const listCapabilities = defineTool({
    name: "listQaCapabilities",
    description: "List governed QA capabilities, risk levels, environments, and approval requirements.",
    parameters: z.object({}),
    execute: async () => ({ capabilities: broker.listCapabilities() }),
  });

  const listProjectTests = defineTool({
    name: "listQaProjectTests",
    description: "List public metadata for allowlisted project QA suites and whether a server-side authenticated identity reference is configured. Never returns secret values or selectors.",
    parameters: z.object({}),
    execute: async () => ({ projects: projectTestCatalogStatus() }),
  });

  const requestAction = defineTool({
    name: "requestQaCapabilityAction",
    description: "Create an immutable, policy-evaluated QA capability action before execution.",
    parameters: z.object({
      capabilityId: z.string().describe("Capability id from listQaCapabilities"),
      projectId: z.string().min(1).describe("Project id such as PCC, SOP, or DataBridge"),
      environment: z.enum(["playground", "qa", "prod"]),
      payload: z.record(z.string(), z.unknown()).default({}),
    }),
    execute: async ({ capabilityId, projectId, environment, payload }) =>
      broker.requestAction(capabilityId, contextFor(projectId, environment as EnvironmentName), payload),
  });

  const getAction = defineTool({
    name: "getQaCapabilityAction",
    description: "Read the server-side status of one previously requested QA action.",
    parameters: z.object({ actionId: z.string().uuid() }),
    execute: async ({ actionId }) => broker.getAction(actionId) ?? { error: "action_not_found", actionId },
  });

  const executeAction = defineTool({
    name: "executeQaCapabilityAction",
    description: "Execute a previously requested QA action only when server policy permits its current status.",
    parameters: z.object({ actionId: z.string().uuid() }),
    execute: async ({ actionId }) => broker.executeAction(actionId),
  });

  return [listCapabilities, listProjectTests, requestAction, getAction, executeAction];
}
