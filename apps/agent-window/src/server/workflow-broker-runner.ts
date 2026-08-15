import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { ExecutionContext } from "./platform/capability-types.js";
import type { CompiledWorkflowStep } from "./workflow-compiler.js";
import type { StepOutcome, StepRunner, WorkflowRunContext } from "./workflow-executor.js";

/**
 * Broker-backed step runner (Phase 5, live governance).
 *
 * Maps each capability/agent workflow step to a governed capability action and
 * drives it through the broker: request -> (approval-aware) -> execute. This is
 * what connects the compiled workflow pipeline to the live governance model —
 * an L0 read runs immediately, an L2+ write comes back awaiting approval (which
 * the executor treats as a pause), and a policy/grant denial fails the step.
 *
 * The step -> capability mapping and the ExecutionContext are supplied by the
 * pack (via `resolveCapability` / `buildContext`) because a workflow step's
 * skill/tool id is not itself a governed capability id. Steps with no capability
 * binding are treated as delegated work (completed by default, or failed when
 * `onUnmapped` is "fail").
 */

export interface CapabilityStepBinding {
  capabilityId: string;
  payload?: Record<string, unknown>;
}

export interface BrokerStepRunnerOptions {
  broker: CapabilityBrokerContract;
  resolveCapability(step: CompiledWorkflowStep, context: WorkflowRunContext): CapabilityStepBinding | undefined;
  buildContext(step: CompiledWorkflowStep, context: WorkflowRunContext): ExecutionContext;
  /** Behaviour for a step with no capability binding. Default: "complete". */
  onUnmapped?: "complete" | "fail";
}

export class BrokerStepRunner implements StepRunner {
  constructor(private readonly options: BrokerStepRunnerOptions) {}

  async run(step: CompiledWorkflowStep, context: WorkflowRunContext): Promise<StepOutcome> {
    const binding = this.options.resolveCapability(step, context);
    if (!binding) {
      return this.options.onUnmapped === "fail"
        ? { status: "failed", error: `Step "${step.id}" has no governed capability binding.` }
        : { status: "completed", result: { delegated: true } };
    }

    const executionContext = this.options.buildContext(step, context);
    const action = await this.options.broker.requestAction(binding.capabilityId, executionContext, binding.payload ?? {});

    if (action.status === "rejected") {
      return { status: "failed", error: action.policyReason, result: action };
    }
    if (action.status === "pending_approval") {
      return { status: "awaiting_approval", result: action };
    }
    if (action.status === "ready" || action.status === "approved") {
      const executed = await this.options.broker.executeAction(action.id);
      return executed.result?.ok
        ? { status: "completed", result: executed }
        : { status: "failed", error: executed.result?.error ?? "capability execution failed", result: executed };
    }

    return { status: "failed", error: `Unexpected action status "${action.status}" for step "${step.id}".`, result: action };
  }
}
