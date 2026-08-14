import { randomUUID } from "node:crypto";
import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import type { AgentTelemetryService } from "../platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "../platform/capability-broker-contract.js";
import type { EnvironmentName, ExecutionContext } from "../platform/capability-types.js";
import {
  assertProjectAccess,
  canAccessExecutionContext,
  currentRequestIdentity,
} from "../platform/request-identity.js";
import { projectTestCatalogStatus } from "./qa-project-tests.js";
import { QA_SUPERVISOR_AGENT_ID } from "./qa-grants.js";

function contextFor(agentId: string, projectId: string, environment: EnvironmentName, runId = randomUUID()): ExecutionContext {
  const identity = currentRequestIdentity();
  assertProjectAccess(identity, projectId);
  return {
    runId,
    userId: identity.userId,
    agentId,
    packId: "qa-agent-pack",
    projectId,
    environment,
    tenantId: identity.tenantId,
    requestedAt: new Date().toISOString(),
  };
}

async function actionForCurrentIdentity(broker: CapabilityBrokerContract, actionId: string) {
  const action = await broker.getAction(actionId);
  if (!action) return undefined;
  if (!canAccessExecutionContext(currentRequestIdentity(), action.context)) {
    throw new Error("Current identity is not authorized for this action scope.");
  }
  return action;
}

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

export function buildQaTools(
  broker: CapabilityBrokerContract,
  telemetry?: AgentTelemetryService,
  agentId: string = QA_SUPERVISOR_AGENT_ID,
) {
  const linkRun = (runId: string) => telemetry?.linkCurrentAgentRunToQaRun(runId);

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

  const startRun = defineTool({
    name: "startQaRun",
    description: "Start one durable QA workflow run scoped to the current authenticated identity, project, and environment.",
    parameters: z.object({
      projectId: z.string().min(1),
      environment: z.enum(["playground", "qa", "prod"]),
    }),
    execute: async ({ projectId, environment }) => {
      const run = await broker.startRun(contextFor(agentId, projectId, environment as EnvironmentName));
      linkRun(run.id);
      return {
        runId: run.id,
        projectId: run.context.projectId,
        environment: run.context.environment,
        requestedBy: run.context.userId,
        tenantId: run.context.tenantId,
      };
    },
  });

  const requestAction = defineTool({
    name: "requestQaCapabilityAction",
    description: "Create an immutable, policy-evaluated QA capability action inside a durable QA run.",
    parameters: z.object({
      runId: z.string().uuid().optional().describe("Run id from startQaRun. Omit only for backward-compatible single actions."),
      capabilityId: z.string().describe("Capability id from listQaCapabilities"),
      projectId: z.string().min(1).describe("Project id such as PCC, SOP, or DataBridge"),
      environment: z.enum(["playground", "qa", "prod"]),
      payload: z.record(z.string(), z.unknown()).default({}),
    }),
    execute: async ({ runId, capabilityId, projectId, environment, payload }) => {
      const identity = currentRequestIdentity();
      assertProjectAccess(identity, projectId);
      let context: ExecutionContext;
      if (runId) {
        const run = await broker.getRun(runId);
        if (!run) throw new Error("QA run was not found or has expired from the configured store.");
        if (!canAccessExecutionContext(identity, run.context)) throw new Error("Current identity cannot access this QA run.");
        if (run.context.projectId !== projectId || run.context.environment !== environment) {
          throw new Error("Action scope must match the durable QA run project and environment.");
        }
        // Reuse the durable run's project/environment/identity scope, but
        // attribute this action to the specialist that actually requested it so
        // the broker's capability grant is enforced per specialist, not per run.
        context = { ...run.context, agentId };
      } else {
        context = contextFor(agentId, projectId, environment as EnvironmentName);
      }
      linkRun(context.runId);
      return await broker.requestAction(capabilityId, context, payload);
    },
  });

  const getAction = defineTool({
    name: "getQaCapabilityAction",
    description: "Read the server-side status of one previously requested QA action in the current identity scope.",
    parameters: z.object({ actionId: z.string().uuid() }),
    execute: async ({ actionId }) => {
      const action = await actionForCurrentIdentity(broker, actionId);
      if (action) linkRun(action.context.runId);
      return action ?? { error: "action_not_found", actionId };
    },
  });

  const executeAction = defineTool({
    name: "executeQaCapabilityAction",
    description: "Execute a previously requested QA action only when server policy and current identity scope permit it.",
    parameters: z.object({ actionId: z.string().uuid() }),
    execute: async ({ actionId }) => {
      const action = await actionForCurrentIdentity(broker, actionId);
      if (!action) throw new Error("Action not found");
      linkRun(action.context.runId);
      return broker.executeAction(actionId);
    },
  });

  return [listCapabilities, listProjectTests, startRun, requestAction, getAction, executeAction];
}
