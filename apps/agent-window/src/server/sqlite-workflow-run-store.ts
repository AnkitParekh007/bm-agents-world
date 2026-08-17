import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  NewWorkflowRun,
  WorkflowRunRecord,
  WorkflowRunStore,
  WorkflowStepRunRecord,
} from "./workflow-run-store.js";
import type { StepStatus } from "./workflow-executor.js";

/**
 * Durable workflow-run store (Phase 5.2).
 *
 * The SQLite binding of {@link WorkflowRunStore}, mirroring the capability store
 * so a restart or failover does not destroy the authoritative workflow state the
 * engine relies on to resume, stay idempotent, and avoid duplicate side effects.
 * It persists the same audit-chain columns the in-memory reference store models
 * (run provenance + per-step identity/capability/action/hash/artifacts), and
 * satisfies the identical behavioural contract (createRun idempotent by runId,
 * putStep upsert by (runId, stepId), run-scoped listing).
 */
function defaultDatabasePath(): string {
  const configured = process.env.BM_WORKFLOW_DB_PATH?.trim();
  if (configured) return configured;
  return resolve(process.cwd(), ".bm-agents-runtime/state/workflow-runs.sqlite");
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

interface StepRow {
  agent_id: string | null;
  skill_id: string | null;
  capability_id: string | null;
  capability_action_id: string | null;
  input_hash: string | null;
  output_artifact_ids: string;
  status: string;
  attempt: number;
  error: string | null;
  result_json: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export class SqliteWorkflowRunStore implements WorkflowRunStore {
  readonly path: string;
  private readonly db: DatabaseSync;

  constructor(path = defaultDatabasePath()) {
    this.path = path;
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_runs (
        run_id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        package_hash TEXT,
        workflow_hash TEXT NOT NULL,
        runtime_adapter TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workflow_step_runs (
        run_id TEXT NOT NULL,
        step_id TEXT NOT NULL,
        agent_id TEXT,
        skill_id TEXT,
        capability_id TEXT,
        capability_action_id TEXT,
        input_hash TEXT,
        output_artifact_ids TEXT NOT NULL,
        status TEXT NOT NULL,
        attempt INTEGER NOT NULL,
        error TEXT,
        result_json TEXT,
        started_at TEXT,
        finished_at TEXT,
        PRIMARY KEY (run_id, step_id),
        FOREIGN KEY (run_id) REFERENCES workflow_runs(run_id)
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_step_runs_run
        ON workflow_step_runs(run_id, step_id);
    `);
  }

  createRun(input: NewWorkflowRun): WorkflowRunRecord {
    const existing = this.getRun(input.runId);
    if (existing) return existing;
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO workflow_runs(run_id, workflow_id, package_hash, workflow_hash, runtime_adapter, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'running', ?, ?)
      ON CONFLICT(run_id) DO NOTHING
    `).run(
      input.runId,
      input.workflowId,
      input.packageHash ?? null,
      input.workflowHash,
      input.runtimeAdapter ?? null,
      now,
      now,
    );
    // Re-read so a concurrent creator's row wins deterministically.
    return this.getRun(input.runId)!;
  }

  getRun(runId: string): WorkflowRunRecord | undefined {
    const row = this.db.prepare(`
      SELECT workflow_id, package_hash, workflow_hash, runtime_adapter, status, created_at, updated_at
      FROM workflow_runs WHERE run_id = ?
    `).get(runId) as
      | {
          workflow_id: string;
          package_hash: string | null;
          workflow_hash: string;
          runtime_adapter: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        }
      | undefined;
    if (!row) return undefined;
    return {
      runId,
      workflowId: row.workflow_id,
      packageHash: row.package_hash ?? undefined,
      workflowHash: row.workflow_hash,
      runtimeAdapter: row.runtime_adapter ?? undefined,
      status: row.status as WorkflowRunRecord["status"],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  setRunStatus(runId: string, status: WorkflowRunRecord["status"]): void {
    this.db.prepare("UPDATE workflow_runs SET status = ?, updated_at = ? WHERE run_id = ?").run(
      status,
      new Date().toISOString(),
      runId,
    );
  }

  putStep(step: WorkflowStepRunRecord): void {
    this.db.prepare(`
      INSERT INTO workflow_step_runs(
        run_id, step_id, agent_id, skill_id, capability_id, capability_action_id,
        input_hash, output_artifact_ids, status, attempt, error, result_json, started_at, finished_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_id, step_id) DO UPDATE SET
        agent_id=excluded.agent_id,
        skill_id=excluded.skill_id,
        capability_id=excluded.capability_id,
        capability_action_id=excluded.capability_action_id,
        input_hash=excluded.input_hash,
        output_artifact_ids=excluded.output_artifact_ids,
        status=excluded.status,
        attempt=excluded.attempt,
        error=excluded.error,
        result_json=excluded.result_json,
        started_at=excluded.started_at,
        finished_at=excluded.finished_at
    `).run(
      step.runId,
      step.stepId,
      step.agentId ?? null,
      step.skillId ?? null,
      step.capabilityId ?? null,
      step.capabilityActionId ?? null,
      step.inputHash ?? null,
      JSON.stringify(step.outputArtifactIds ?? []),
      step.status,
      step.attempt,
      step.error ?? null,
      step.result === undefined ? null : JSON.stringify(step.result),
      step.startedAt ?? null,
      step.finishedAt ?? null,
    );
  }

  getStep(runId: string, stepId: string): WorkflowStepRunRecord | undefined {
    const row = this.db.prepare(`
      SELECT agent_id, skill_id, capability_id, capability_action_id, input_hash,
             output_artifact_ids, status, attempt, error, result_json, started_at, finished_at
      FROM workflow_step_runs WHERE run_id = ? AND step_id = ?
    `).get(runId, stepId) as StepRow | undefined;
    return row ? this.rowToStep(runId, stepId, row) : undefined;
  }

  listSteps(runId: string): WorkflowStepRunRecord[] {
    const rows = this.db.prepare(`
      SELECT step_id, agent_id, skill_id, capability_id, capability_action_id, input_hash,
             output_artifact_ids, status, attempt, error, result_json, started_at, finished_at
      FROM workflow_step_runs WHERE run_id = ? ORDER BY step_id ASC
    `).all(runId) as unknown as Array<StepRow & { step_id: string }>;
    return rows.map((row) => this.rowToStep(runId, row.step_id, row));
  }

  close(): void {
    this.db.close();
  }

  private rowToStep(runId: string, stepId: string, row: StepRow): WorkflowStepRunRecord {
    return {
      runId,
      stepId,
      agentId: row.agent_id ?? undefined,
      skillId: row.skill_id ?? undefined,
      capabilityId: row.capability_id ?? undefined,
      capabilityActionId: row.capability_action_id ?? undefined,
      inputHash: row.input_hash ?? undefined,
      outputArtifactIds: parseJson<string[]>(row.output_artifact_ids, []),
      status: row.status as StepStatus,
      attempt: row.attempt,
      error: row.error ?? undefined,
      result: row.result_json === null ? undefined : parseJson<unknown>(row.result_json, undefined),
      startedAt: row.started_at ?? undefined,
      finishedAt: row.finished_at ?? undefined,
    };
  }
}
