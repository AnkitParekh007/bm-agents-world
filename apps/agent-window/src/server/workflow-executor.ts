import type { CompiledWorkflow, CompiledWorkflowStep } from "./workflow-compiler.js";

/**
 * Workflow executor (Phase 5).
 *
 * Walks a compiled workflow's execution waves and drives each step to a state.
 * The executor owns the orchestration that must be deterministic and governed:
 * wave ordering, approval-gate handling, and failure/skip propagation. The
 * actual work of a capability/agent step is delegated to an injected StepRunner
 * (the governed, broker-backed runner is the live piece validated separately),
 * so the orchestration is fully unit-testable with a mock runner.
 *
 * Semantics:
 * - A non-ok compiled workflow does not run (fail-closed; throws in strict mode).
 * - A step runs only once all its dependencies have completed.
 * - A gate step (human-approval / policy gate) completes only if its id is in
 *   `approvals`; otherwise it is left awaiting approval and its dependents block.
 * - A step whose dependency failed or was skipped is itself skipped.
 * - Re-running with `completedSteps` (and the prior `results`) resumes without
 *   re-executing already-completed work — the resume path after an approval.
 */

export type StepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "awaiting_approval"
  | "skipped";

export interface StepState {
  id: string;
  status: StepStatus;
  wave: number;
  startedAt?: string;
  finishedAt?: string;
  result?: unknown;
  error?: string;
}

export type WorkflowStatus = "completed" | "failed" | "awaiting_approval";

export interface WorkflowRunContext {
  runId: string;
  inputs?: Record<string, unknown>;
  /** Accumulated results of completed steps, keyed by step id (data flow). */
  results: Record<string, unknown>;
  /** Gate step ids that have been approved. */
  approvals?: ReadonlySet<string>;
  /** Step ids already completed in a prior run (resume without re-executing). */
  completedSteps?: ReadonlySet<string>;
}

export interface StepOutcome {
  status: "completed" | "failed" | "awaiting_approval";
  result?: unknown;
  error?: string;
}

export interface StepRunner {
  run(step: CompiledWorkflowStep, context: WorkflowRunContext): Promise<StepOutcome>;
}

export interface WorkflowRunResult {
  runId: string;
  workflowId: string;
  status: WorkflowStatus;
  steps: StepState[];
  /** The first step awaiting approval, when the run is paused. */
  pausedAt?: string;
  diagnostics: string[];
}

const GATE_TYPES = new Set(["human-approval", "policy-and-human-gate"]);

function isGate(step: CompiledWorkflowStep): boolean {
  return step.type ? GATE_TYPES.has(step.type) || /approval|gate/i.test(step.type) : false;
}

export async function executeWorkflow(
  compiled: CompiledWorkflow,
  runner: StepRunner,
  context: WorkflowRunContext,
  options: { strict?: boolean } = {},
): Promise<WorkflowRunResult> {
  if (!compiled.ok) {
    if (options.strict) {
      throw new Error(`Refusing to execute invalid workflow "${compiled.id}": ${compiled.diagnostics.join("; ")}`);
    }
    return {
      runId: context.runId,
      workflowId: compiled.id,
      status: "failed",
      steps: [],
      diagnostics: compiled.diagnostics,
    };
  }

  const states = new Map<string, StepState>(
    compiled.steps.map((step) => [step.id, { id: step.id, status: "pending" as StepStatus, wave: step.wave }]),
  );
  const stepById = new Map(compiled.steps.map((step) => [step.id, step]));
  const isCompleted = (id: string) => states.get(id)?.status === "completed";
  const isBlocked = (id: string) => {
    const status = states.get(id)?.status;
    return status === "failed" || status === "skipped";
  };

  for (const wave of compiled.order) {
    const toRun: CompiledWorkflowStep[] = [];
    for (const id of wave) {
      const step = stepById.get(id)!;
      const state = states.get(id)!;

      if (context.completedSteps?.has(id)) {
        state.status = "completed";
        state.result = context.results[id];
        continue;
      }
      if (step.dependsOn.every(isCompleted)) toRun.push(step);
      else if (step.dependsOn.some(isBlocked)) state.status = "skipped";
      // else: blocked by a gate/pending dependency — left pending for a resume.
    }

    await Promise.all(
      toRun.map(async (step) => {
        const state = states.get(step.id)!;
        state.startedAt = new Date().toISOString();

        if (isGate(step)) {
          if (context.approvals?.has(step.id)) {
            state.status = "completed";
            state.result = { approved: true };
            context.results[step.id] = state.result;
          } else {
            state.status = "awaiting_approval";
          }
        } else {
          state.status = "running";
          try {
            const outcome = await runner.run(step, context);
            state.status = outcome.status;
            state.result = outcome.result;
            state.error = outcome.error;
            if (outcome.status === "completed") context.results[step.id] = outcome.result;
          } catch (error) {
            state.status = "failed";
            state.error = error instanceof Error ? error.message : String(error);
          }
        }
        state.finishedAt = new Date().toISOString();
      }),
    );
  }

  const steps = [...states.values()].sort((a, b) => a.wave - b.wave || a.id.localeCompare(b.id));
  const status: WorkflowStatus = steps.some((step) => step.status === "failed")
    ? "failed"
    : steps.some((step) => step.status === "awaiting_approval" || step.status === "pending")
      ? "awaiting_approval"
      : "completed";
  const pausedAt = steps.find((step) => step.status === "awaiting_approval")?.id;

  return { runId: context.runId, workflowId: compiled.id, status, steps, pausedAt, diagnostics: [] };
}
