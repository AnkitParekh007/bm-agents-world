import type { StepStatus, WorkflowStatus } from "./workflow-executor.js";

/**
 * Authoritative workflow-run state (Phase 5.1).
 *
 * The server — not the caller — owns the truth about a workflow run: which steps
 * completed, which capability action each executable step is bound to, and
 * whether a gate has been approved. This store is what makes the workflow engine
 * resumable from server-side state, idempotent per (runId, stepId), and safe
 * against duplicate external side effects on retry/restart.
 *
 * It also materializes the audit chain the platform has been building toward —
 * pack provenance (packageHash) + workflow provenance (workflowHash) + runtime
 * (runtimeAdapter) at the run level, and, per step, the specialist identity, the
 * skill, the governed capability, the capability action, the input hash, and the
 * output artifacts — so "why did this external side effect happen?" is answerable
 * from persisted state alone.
 *
 * The in-memory implementation here is the tested reference and the contract a
 * durable (SQLite/Postgres) binding mirrors, exactly as the capability store does.
 */

export interface WorkflowRunRecord {
  runId: string;
  workflowId: string;
  /** Pack provenance: the compiled pack packageHash this run was launched from. */
  packageHash?: string;
  /** Workflow provenance: the compiled workflow contentHash. */
  workflowHash: string;
  /** Which runtime adapter materialized the agents for this run (e.g. "copilotkit"). */
  runtimeAdapter?: string;
  status: WorkflowStatus | "running";
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepRunRecord {
  runId: string;
  stepId: string;
  /** The canonical specialist identity this step is attributed to (authoritative). */
  agentId?: string;
  skillId?: string;
  capabilityId?: string;
  /** The governed capability action this step is bound to (idempotency anchor). */
  capabilityActionId?: string;
  /** Hash of the step's governed input payload. */
  inputHash?: string;
  outputArtifactIds: string[];
  status: StepStatus;
  /** Number of times this step has been driven (retry/restart aware). */
  attempt: number;
  error?: string;
  result?: unknown;
  startedAt?: string;
  finishedAt?: string;
}

export interface NewWorkflowRun {
  runId: string;
  workflowId: string;
  workflowHash: string;
  packageHash?: string;
  runtimeAdapter?: string;
}

export interface WorkflowRunStore {
  /** Creates the run if absent; returns the existing record on a resume (idempotent by runId). */
  createRun(input: NewWorkflowRun): WorkflowRunRecord;
  getRun(runId: string): WorkflowRunRecord | undefined;
  setRunStatus(runId: string, status: WorkflowRunRecord["status"]): void;
  /** Upserts a step run by (runId, stepId). */
  putStep(step: WorkflowStepRunRecord): void;
  getStep(runId: string, stepId: string): WorkflowStepRunRecord | undefined;
  listSteps(runId: string): WorkflowStepRunRecord[];
}

function stepKey(runId: string, stepId: string): string {
  // runId is a UUID (never contains "::"), so this composite key is injective.
  return `${runId}::${stepId}`;
}

export class InMemoryWorkflowRunStore implements WorkflowRunStore {
  private readonly runs = new Map<string, WorkflowRunRecord>();
  private readonly steps = new Map<string, WorkflowStepRunRecord>();

  createRun(input: NewWorkflowRun): WorkflowRunRecord {
    const existing = this.runs.get(input.runId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const record: WorkflowRunRecord = {
      runId: input.runId,
      workflowId: input.workflowId,
      workflowHash: input.workflowHash,
      packageHash: input.packageHash,
      runtimeAdapter: input.runtimeAdapter,
      status: "running",
      createdAt: now,
      updatedAt: now,
    };
    this.runs.set(input.runId, record);
    return record;
  }

  getRun(runId: string): WorkflowRunRecord | undefined {
    return this.runs.get(runId);
  }

  setRunStatus(runId: string, status: WorkflowRunRecord["status"]): void {
    const run = this.runs.get(runId);
    if (!run) return;
    run.status = status;
    run.updatedAt = new Date().toISOString();
  }

  putStep(step: WorkflowStepRunRecord): void {
    // Store a defensive copy so callers can't mutate persisted state in place.
    this.steps.set(stepKey(step.runId, step.stepId), { ...step, outputArtifactIds: [...step.outputArtifactIds] });
  }

  getStep(runId: string, stepId: string): WorkflowStepRunRecord | undefined {
    const step = this.steps.get(stepKey(runId, stepId));
    return step ? { ...step, outputArtifactIds: [...step.outputArtifactIds] } : undefined;
  }

  listSteps(runId: string): WorkflowStepRunRecord[] {
    return [...this.steps.values()]
      .filter((step) => step.runId === runId)
      .map((step) => ({ ...step, outputArtifactIds: [...step.outputArtifactIds] }))
      .sort((a, b) => a.stepId.localeCompare(b.stepId));
  }
}
