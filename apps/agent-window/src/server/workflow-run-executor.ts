import type { CompiledWorkflow, CompiledWorkflowStep } from "./workflow-compiler.js";
import {
  isGate,
  type StepOutcome,
  type StepState,
  type StepStatus,
  type WorkflowRunContext,
  type WorkflowRunResult,
  type WorkflowStatus,
} from "./workflow-executor.js";
import type { WorkflowRunStore, WorkflowStepRunRecord } from "./workflow-run-store.js";

/**
 * Stateful, governed workflow executor (Phase 5.1).
 *
 * Unlike the stateless {@link executeWorkflow}, this executor treats the
 * {@link WorkflowRunStore} as the single source of truth:
 *
 * - Resume is exclusively from server-side state. There is no caller-supplied
 *   `approvals` / `completedSteps` set — a run resumes from what the store
 *   recorded, so a client cannot assert a step is done or a gate is approved.
 * - Idempotent per (runId, stepId). A step already completed in the store is
 *   never re-run, which prevents duplicate external side effects on retry/restart.
 * - Capability actions are bound and reused. An awaiting step carries its
 *   capabilityActionId; on resume the runner reuses that exact action rather than
 *   requesting a new one — no duplicate Jira issue, no re-charged side effect.
 * - Approvals are authoritative. A capability gate resolves from the broker action
 *   state (via the runner's resume); an explicit approval-gate step resolves only
 *   when the server has recorded it complete.
 *
 * Specialist identity is set by the runner from the compiled workflow step (see
 * the broker runner's `resolveAgentId`), so a workflow cannot route around the
 * per-specialist capability grants.
 */

export interface GovernedStepOutcome extends StepOutcome {
  agentId?: string;
  capabilityId?: string;
  capabilityActionId?: string;
  inputHash?: string;
  outputArtifactIds?: string[];
}

export interface GovernedStepRunner {
  run(step: CompiledWorkflowStep, context: WorkflowRunContext): Promise<GovernedStepOutcome>;
  /** Resume an awaiting step from its bound capability action (never re-requests). */
  resume?(
    step: CompiledWorkflowStep,
    context: WorkflowRunContext,
    capabilityActionId: string,
  ): Promise<GovernedStepOutcome>;
}

export interface WorkflowRunLaunch {
  runId: string;
  packageHash?: string;
  runtimeAdapter?: string;
  inputs?: Record<string, unknown>;
}

function toStepState(record: WorkflowStepRunRecord, wave: number): StepState {
  return {
    id: record.stepId,
    status: record.status,
    wave,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    result: record.result,
    error: record.error,
  };
}

export async function executeWorkflowRun(
  compiled: CompiledWorkflow,
  runner: GovernedStepRunner,
  store: WorkflowRunStore,
  launch: WorkflowRunLaunch,
  options: { strict?: boolean } = {},
): Promise<WorkflowRunResult> {
  const { runId } = launch;
  store.createRun({
    runId,
    workflowId: compiled.id,
    workflowHash: compiled.contentHash,
    packageHash: launch.packageHash,
    runtimeAdapter: launch.runtimeAdapter,
  });

  if (!compiled.ok) {
    if (options.strict) {
      throw new Error(`Refusing to execute invalid workflow "${compiled.id}": ${compiled.diagnostics.join("; ")}`);
    }
    store.setRunStatus(runId, "failed");
    return { runId, workflowId: compiled.id, status: "failed", steps: [], diagnostics: compiled.diagnostics };
  }

  const stepById = new Map(compiled.steps.map((step) => [step.id, step]));
  const waveOf = new Map(compiled.steps.map((step) => [step.id, step.wave]));

  // Seed the in-run status/result view from authoritative server state.
  const status = new Map<string, StepStatus>();
  const results: Record<string, unknown> = {};
  for (const record of store.listSteps(runId)) {
    status.set(record.stepId, record.status);
    if (record.status === "completed") results[record.stepId] = record.result;
  }

  const context: WorkflowRunContext = { runId, inputs: launch.inputs, results };

  const persist = (step: CompiledWorkflowStep, patch: Partial<WorkflowStepRunRecord>): void => {
    const prior = store.getStep(runId, step.id);
    const next: WorkflowStepRunRecord = {
      runId,
      stepId: step.id,
      agentId: patch.agentId ?? prior?.agentId,
      skillId: patch.skillId ?? prior?.skillId ?? step.skill,
      capabilityId: patch.capabilityId ?? prior?.capabilityId,
      capabilityActionId: patch.capabilityActionId ?? prior?.capabilityActionId,
      inputHash: patch.inputHash ?? prior?.inputHash,
      outputArtifactIds: patch.outputArtifactIds ?? prior?.outputArtifactIds ?? [],
      status: patch.status ?? prior?.status ?? "pending",
      attempt: patch.attempt ?? prior?.attempt ?? 0,
      error: patch.error ?? (patch.status === "completed" ? undefined : prior?.error),
      result: "result" in patch ? patch.result : prior?.result,
      startedAt: patch.startedAt ?? prior?.startedAt,
      finishedAt: patch.finishedAt ?? prior?.finishedAt,
    };
    store.putStep(next);
    status.set(step.id, next.status);
  };

  const depState = (id: string): StepStatus | undefined => status.get(id);

  for (const wave of compiled.order) {
    await Promise.all(
      wave.map(async (id) => {
        const step = stepById.get(id)!;
        const prior = store.getStep(runId, id);

        // Idempotent: a completed step is never re-executed (duplicate-side-effect safe).
        if (prior?.status === "completed") {
          results[id] = prior.result;
          return;
        }

        // Failure/skip propagation from dependencies.
        if (step.dependsOn.some((dep) => depState(dep) === "failed" || depState(dep) === "skipped")) {
          persist(step, { status: "skipped", finishedAt: new Date().toISOString() });
          return;
        }

        // Blocked by an unfinished (gate/awaiting/pending) dependency — leave for a later resume.
        if (!step.dependsOn.every((dep) => depState(dep) === "completed")) {
          if (!prior) persist(step, { status: "pending" });
          return;
        }

        const attempt = (prior?.attempt ?? 0) + 1;
        const startedAt = new Date().toISOString();

        // Approval gate: authoritative — resolves complete only when the server has
        // recorded it (an approver writes the completed step-run out of band). It is
        // never satisfied by a caller-provided approval set.
        if (isGate(step)) {
          persist(step, { status: "awaiting_approval", attempt, startedAt });
          return;
        }

        // Executable / agent step.
        const outcome =
          prior?.status === "awaiting_approval" && prior.capabilityActionId && runner.resume
            ? await runner.resume(step, context, prior.capabilityActionId)
            : await runner.run(step, context);

        persist(step, {
          status: outcome.status,
          agentId: outcome.agentId,
          capabilityId: outcome.capabilityId,
          capabilityActionId: outcome.capabilityActionId,
          inputHash: outcome.inputHash,
          outputArtifactIds: outcome.outputArtifactIds,
          result: outcome.result,
          error: outcome.error,
          attempt,
          startedAt,
          finishedAt: new Date().toISOString(),
        });
        if (outcome.status === "completed") results[id] = outcome.result;
      }),
    );
  }

  const steps = store
    .listSteps(runId)
    .map((record) => toStepState(record, waveOf.get(record.stepId) ?? -1))
    .sort((a, b) => a.wave - b.wave || a.id.localeCompare(b.id));

  const runStatus: WorkflowStatus = steps.some((step) => step.status === "failed")
    ? "failed"
    : steps.some((step) => step.status === "awaiting_approval" || step.status === "pending")
      ? "awaiting_approval"
      : "completed";
  const pausedAt = steps.find((step) => step.status === "awaiting_approval")?.id;

  store.setRunStatus(runId, runStatus);
  return { runId, workflowId: compiled.id, status: runStatus, steps, pausedAt, diagnostics: [] };
}
