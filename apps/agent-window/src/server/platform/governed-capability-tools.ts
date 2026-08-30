import { randomUUID } from "node:crypto";
import { z } from "zod";
import { defineNeutralTool, type NeutralTool } from "../runtime/agent-runtime.js";
import type { AgentTelemetryService } from "./agent-telemetry.js";
import type { CapabilityBrokerContract } from "./capability-broker-contract.js";
import type { EnvironmentName, ExecutionContext } from "./capability-types.js";
import {
  assertProjectAccess,
  canAccessExecutionContext,
  currentRequestIdentity,
} from "./request-identity.js";

/**
 * The governed capability tool surface, shared by every governed pack.
 *
 * Requesting a capability action, binding it to a durable run, checking its
 * server-side status, and executing it after approval is the platform's
 * protocol, not any one vertical's. It was written for QA first; extracting it
 * here is what lets a second vertical be a pack's worth of governance rather
 * than a second copy of the broker protocol.
 *
 * Everything pack-specific is a parameter: the tool names an agent sees, the
 * label used in descriptions, the pack recorded on every {@link ExecutionContext},
 * and any extra pack-owned tools. The bodies — identity checks, project-access
 * assertions, run-scope matching, and per-agent attribution — are identical for
 * all packs, which is exactly the property that makes governance uniform.
 */

export interface GovernedToolNames {
  listCapabilities: string;
  startRun: string;
  requestAction: string;
  getAction: string;
  executeAction: string;
}

export interface GovernedToolSurface {
  /** Pack name recorded on every ExecutionContext (e.g. `qa-agent-pack`). */
  packName: string;
  /** Agent id used when a caller does not bind a specific one. */
  defaultAgentId: string;
  /** Noun used in tool descriptions and errors (e.g. `QA`, `frontend`). */
  label: string;
  names: GovernedToolNames;
  /** Pack-owned tools, listed directly after the capability listing. */
  extraTools?: NeutralTool[];
}

export function buildGovernedCapabilityTools(
  surface: GovernedToolSurface,
  broker: CapabilityBrokerContract,
  telemetry: AgentTelemetryService | undefined,
  agentId: string = surface.defaultAgentId,
): NeutralTool[] {
  const { label, names } = surface;
  // Links the current agent run to the governed run id for telemetry. The
  // service method is QA-named for historical reasons; the linkage itself is
  // pack-neutral.
  const linkRun = (runId: string) => telemetry?.linkCurrentAgentRunToQaRun(runId);

  function contextFor(projectId: string, environment: EnvironmentName, runId = randomUUID()): ExecutionContext {
    const identity = currentRequestIdentity();
    assertProjectAccess(identity, projectId);
    return {
      runId,
      userId: identity.userId,
      agentId,
      packId: surface.packName,
      projectId,
      environment,
      tenantId: identity.tenantId,
      requestedAt: new Date().toISOString(),
    };
  }

  async function actionForCurrentIdentity(actionId: string) {
    const action = await broker.getAction(actionId);
    if (!action) return undefined;
    if (!canAccessExecutionContext(currentRequestIdentity(), action.context)) {
      throw new Error("Current identity is not authorized for this action scope.");
    }
    return action;
  }

  const listCapabilities = defineNeutralTool({
    name: names.listCapabilities,
    description: `List governed ${label} capabilities, risk levels, environments, and approval requirements.`,
    parameters: z.object({}),
    execute: async () => ({ capabilities: broker.listCapabilities() }),
  });

  const startRun = defineNeutralTool({
    name: names.startRun,
    description: `Start one durable ${label} workflow run scoped to the current authenticated identity, project, and environment.`,
    parameters: z.object({
      projectId: z.string().min(1),
      environment: z.enum(["playground", "qa", "prod"]),
    }),
    execute: async ({ projectId, environment }) => {
      const run = await broker.startRun(contextFor(projectId, environment as EnvironmentName));
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

  const requestAction = defineNeutralTool({
    name: names.requestAction,
    description: `Create an immutable, policy-evaluated ${label} capability action inside a durable ${label} run.`,
    parameters: z.object({
      runId: z.string().uuid().optional().describe(`Run id from ${names.startRun}. Omit only for backward-compatible single actions.`),
      capabilityId: z.string().describe(`Capability id from ${names.listCapabilities}`),
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
        if (!run) throw new Error(`${label} run was not found or has expired from the configured store.`);
        if (!canAccessExecutionContext(identity, run.context)) throw new Error(`Current identity cannot access this ${label} run.`);
        if (run.context.projectId !== projectId || run.context.environment !== environment) {
          throw new Error(`Action scope must match the durable ${label} run project and environment.`);
        }
        // Reuse the durable run's project/environment/identity scope, but
        // attribute this action to the specialist that actually requested it so
        // the broker's capability grant is enforced per specialist, not per run.
        context = { ...run.context, agentId };
      } else {
        context = contextFor(projectId, environment as EnvironmentName);
      }
      linkRun(context.runId);
      return await broker.requestAction(capabilityId, context, payload);
    },
  });

  const getAction = defineNeutralTool({
    name: names.getAction,
    description: `Read the server-side status of one previously requested ${label} action in the current identity scope.`,
    parameters: z.object({ actionId: z.string().uuid() }),
    execute: async ({ actionId }) => {
      const action = await actionForCurrentIdentity(actionId);
      if (action) linkRun(action.context.runId);
      return action ?? { error: "action_not_found", actionId };
    },
  });

  const executeAction = defineNeutralTool({
    name: names.executeAction,
    description: `Execute a previously requested ${label} action only when server policy and current identity scope permit it.`,
    parameters: z.object({ actionId: z.string().uuid() }),
    execute: async ({ actionId }) => {
      const action = await actionForCurrentIdentity(actionId);
      if (!action) throw new Error("Action not found");
      linkRun(action.context.runId);
      return broker.executeAction(actionId);
    },
  });

  return [listCapabilities, ...(surface.extraTools ?? []), startRun, requestAction, getAction, executeAction];
}
