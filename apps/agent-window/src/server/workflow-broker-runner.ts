import { canonicalHash } from "./platform/canonical.js";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { CapabilityAction, ExecutionContext } from "./platform/capability-types.js";
import { isExecutable, type WorkflowRunContext } from "./workflow-executor.js";
import type { CompiledWorkflowStep } from "./workflow-compiler.js";
import type { GovernedStepOutcome, GovernedStepRunner } from "./workflow-run-executor.js";

/**
 * Broker-backed step runner (Phase 5, hardened in 5.1).
 *
 * Maps each executable workflow step to a governed capability action and drives
 * it through the broker: request -> (approval-aware) -> execute. Hardening:
 *
 * - Canonical specialist identity. The ExecutionContext.agentId is derived from
 *   the compiled workflow step (via `resolveAgentId`), never from a caller who
 *   could name any identity, so a workflow cannot route around the per-specialist
 *   capability grants. A governed step whose identity cannot be resolved fails
 *   closed.
 * - Fail-closed on unmapped executable steps. A step that declares a skill/tool
 *   but resolves to no capability binding is refused, not silently delegated.
 *   Only non-executable steps may be delegated (and only when `onUnmapped` allows).
 * - Idempotent resume. `resume` reuses the exact bound capability action instead
 *   of requesting a new one, so approving and continuing a paused run never
 *   produces a duplicate external side effect.
 *
 * The step -> capability mapping, the base ExecutionContext, and the agent
 * identity are supplied by the pack (a step's skill/tool id is not itself a
 * governed capability id, and the mapping from a workflow agent to a runtime
 * specialist id is pack-specific).
 */

export interface CapabilityStepBinding {
  capabilityId: string;
  payload?: Record<string, unknown>;
}

export interface BrokerStepRunnerOptions {
  broker: CapabilityBrokerContract;
  resolveCapability(step: CompiledWorkflowStep, context: WorkflowRunContext): CapabilityStepBinding | undefined;
  /** Base execution scope (project/environment/identity/runId). The agent id is overridden below. */
  buildContext(step: CompiledWorkflowStep, context: WorkflowRunContext): ExecutionContext;
  /**
   * Authoritative specialist identity for the step, derived from the compiled
   * workflow agent. When provided it always wins over `buildContext`'s agentId;
   * returning undefined for a governed step fails the step closed.
   */
  resolveAgentId?(step: CompiledWorkflowStep, context: WorkflowRunContext): string | undefined;
  /** Behaviour for a NON-executable step with no capability binding. Default: "complete". */
  onUnmapped?: "complete" | "fail";
}

export class BrokerStepRunner implements GovernedStepRunner {
  constructor(private readonly options: BrokerStepRunnerOptions) {}

  async run(step: CompiledWorkflowStep, context: WorkflowRunContext): Promise<GovernedStepOutcome> {
    const binding = this.options.resolveCapability(step, context);

    if (!binding) {
      // An executable step (declares a skill/tool) with no governed binding must
      // never run as free work — fail closed regardless of onUnmapped.
      if (isExecutable(step)) {
        return {
          status: "failed",
          error: `Executable step "${step.id}" (${step.skill ?? step.tool}) has no governed capability binding; refusing to run unmapped executable work.`,
        };
      }
      return this.options.onUnmapped === "fail"
        ? { status: "failed", error: `Step "${step.id}" has no governed capability binding.` }
        : { status: "completed", result: { delegated: true } };
    }

    const agentId = this.deriveAgentId(step, context);
    if (!agentId) {
      return {
        status: "failed",
        error: `Cannot attribute governed step "${step.id}" to a specialist identity; refusing to run without authoritative agent identity.`,
      };
    }

    const payload = binding.payload ?? {};
    const inputHash = canonicalHash({ capabilityId: binding.capabilityId, payload });
    const executionContext: ExecutionContext = { ...this.options.buildContext(step, context), agentId };
    const action = await this.options.broker.requestAction(binding.capabilityId, executionContext, payload);
    return this.fromAction(step, action, { agentId, capabilityId: binding.capabilityId, inputHash });
  }

  /**
   * Resume an awaiting step from its already-bound capability action. This never
   * calls requestAction again — it reads the authoritative action state and, if
   * approval has landed, executes that same action, so a resumed run cannot
   * double-fire an external side effect.
   */
  async resume(
    step: CompiledWorkflowStep,
    _context: WorkflowRunContext,
    capabilityActionId: string,
  ): Promise<GovernedStepOutcome> {
    const action = await this.options.broker.getAction(capabilityActionId);
    if (!action) {
      return { status: "failed", error: `Bound capability action "${capabilityActionId}" for step "${step.id}" was not found.` };
    }
    const meta = { agentId: action.context.agentId, capabilityId: action.capabilityId, capabilityActionId: action.id };

    // Already executed on a prior attempt: report completion without re-executing.
    if (action.status === "executed") {
      return action.result?.ok
        ? { status: "completed", result: action, ...meta, outputArtifactIds: artifactIdsOf(action) }
        : { status: "failed", error: action.result?.error ?? "capability execution failed", result: action, ...meta };
    }
    return this.fromAction(step, action, meta);
  }

  private deriveAgentId(step: CompiledWorkflowStep, context: WorkflowRunContext): string | undefined {
    if (this.options.resolveAgentId) return this.options.resolveAgentId(step, context);
    return this.options.buildContext(step, context).agentId;
  }

  private async fromAction(
    step: CompiledWorkflowStep,
    action: CapabilityAction,
    meta: { agentId?: string; capabilityId?: string; inputHash?: string; capabilityActionId?: string },
  ): Promise<GovernedStepOutcome> {
    const base = { ...meta, capabilityActionId: meta.capabilityActionId ?? action.id, result: action as unknown };

    if (action.status === "rejected") return { ...base, status: "failed", error: action.policyReason };
    if (action.status === "pending_approval") return { ...base, status: "awaiting_approval" };
    if (action.status === "ready" || action.status === "approved") {
      const executed = await this.options.broker.executeAction(action.id);
      return executed.result?.ok
        ? { ...meta, capabilityActionId: executed.id, status: "completed", result: executed, outputArtifactIds: artifactIdsOf(executed) }
        : { ...meta, capabilityActionId: executed.id, status: "failed", error: executed.result?.error ?? "capability execution failed", result: executed };
    }
    return { ...base, status: "failed", error: `Unexpected action status "${action.status}" for step "${step.id}".` };
  }
}

/** Best-effort extraction of output artifact ids from a capability result. */
function artifactIdsOf(action: CapabilityAction): string[] {
  const data = action.result?.data as { artifactId?: string; artifactIds?: string[] } | undefined;
  if (!data) return [];
  if (Array.isArray(data.artifactIds)) return data.artifactIds.filter((id): id is string => typeof id === "string");
  if (typeof data.artifactId === "string") return [data.artifactId];
  return [];
}
