import { randomUUID } from "node:crypto";
import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import type { CapabilityBroker } from "../platform/capability-broker.js";
import type { EnvironmentName, ExecutionContext } from "../platform/capability-types.js";
import { projectTestCatalogStatus } from "./qa-project-tests.js";

function contextFor(
  projectId: string,
  environment: EnvironmentName,
): ExecutionContext {
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
- You have server tools that represent governed QA capabilities. Use them for executable QA work instead of pretending an external system was accessed.
- Start with listQaCapabilities and listQaProjectTests when you need to understand executable QA scope.
- For an action, call requestQaCapabilityAction with the exact project, environment, capability, and payload.
- If the returned action status is ready, call executeQaCapabilityAction with that exact action id.
- If the returned action status is pending_approval, call the frontend human-in-the-loop tool reviewQaAction with the action id, capability id, risk level, summary, and payload hash. Only after the human approves should you call executeQaCapabilityAction using the same action id.
- Never substitute a new payload after approval. Approval is payload-hash-bound and expires.
- If the action is rejected, denied, expired, or failed, explain that status and do not bypass it.
- When result.mode is live and externalSideEffect is false, describe the result as real external evidence produced within the capability boundary.
- When result.mode is mock, describe it as a simulation and never imply an external system was contacted.
- For qa.playwright.test.run, use only the allowlisted story-smoke suite, include storyId and changedFiles from Bitbucket evidence, and never supply URLs, selectors, credentials, scripts, or test file paths. The server chooses the target, authenticated identity reference, and allowlisted cases.
- A successful live Playwright result includes test-execution-result and evidence-manifest artifacts. If tests fail, it can also include a bug-draft artifact. Surface their /api/qa/artifacts/... URIs and summarize evidence without inventing data.
- SecretReference metadata is safe to name, but never request or expose the referenced secret value or storage-state contents.
- A live read or browser result is evidence, not permission to perform a write. Jira bug creation and Teams posting remain mock-only in this slice even after approval.
- Current execution identity is a local development placeholder. Authentication/header-derived user identity is a later slice.
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
