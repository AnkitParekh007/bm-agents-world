import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { AuditEvent, CapabilityAction, ExecutionContext } from "./capability-types.js";

export interface CapabilityRun {
  id: string;
  context: ExecutionContext;
  createdAt: string;
  updatedAt: string;
}

export interface CapabilityStore {
  upsertRun(context: ExecutionContext): CapabilityRun;
  getRun(runId: string): CapabilityRun | undefined;
  listRuns(limit?: number): CapabilityRun[];
  saveAction(action: CapabilityAction): void;
  getAction(actionId: string): CapabilityAction | undefined;
  listActionsForRun(runId: string): CapabilityAction[];
  appendAudit(event: AuditEvent, context: ExecutionContext): void;
  listAudit(limit?: number): AuditEvent[];
  close(): void;
}

function defaultDatabasePath(): string {
  return resolve(
    process.env.BM_STATE_DB_PATH?.trim() || process.cwd(),
    process.env.BM_STATE_DB_PATH?.trim() ? "" : ".bm-agents-runtime/state/qa-pilot.sqlite",
  );
}

function parseJson<T>(value: unknown): T {
  return JSON.parse(String(value)) as T;
}

export class SqliteCapabilityStore implements CapabilityStore {
  readonly path: string;
  private readonly db: DatabaseSync;

  constructor(path = defaultDatabasePath()) {
    this.path = path;
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS runs (
        run_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        environment TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        context_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_runs_tenant_project_updated
        ON runs(tenant_id, project_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS actions (
        action_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        action_json TEXT NOT NULL,
        FOREIGN KEY(run_id) REFERENCES runs(run_id)
      );
      CREATE INDEX IF NOT EXISTS idx_actions_run_updated
        ON actions(run_id, updated_at ASC);

      CREATE TABLE IF NOT EXISTS approvals (
        approval_id TEXT PRIMARY KEY,
        action_id TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        approval_json TEXT NOT NULL,
        FOREIGN KEY(action_id) REFERENCES actions(action_id)
      );

      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        event_json TEXT NOT NULL,
        FOREIGN KEY(run_id) REFERENCES runs(run_id)
      );
      CREATE INDEX IF NOT EXISTS idx_audit_run_timestamp
        ON audit_events(run_id, timestamp DESC);
    `);
  }

  upsertRun(context: ExecutionContext): CapabilityRun {
    const existing = this.getRun(context.runId);
    const now = new Date().toISOString();
    const createdAt = existing?.createdAt ?? context.requestedAt ?? now;
    const run: CapabilityRun = {
      id: context.runId,
      context,
      createdAt,
      updatedAt: now,
    };
    this.db.prepare(`
      INSERT INTO runs(run_id, tenant_id, project_id, user_id, environment, created_at, updated_at, context_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_id) DO UPDATE SET
        tenant_id=excluded.tenant_id,
        project_id=excluded.project_id,
        user_id=excluded.user_id,
        environment=excluded.environment,
        updated_at=excluded.updated_at,
        context_json=excluded.context_json
    `).run(
      context.runId,
      context.tenantId,
      context.projectId,
      context.userId,
      context.environment,
      createdAt,
      now,
      JSON.stringify(context),
    );
    return run;
  }

  getRun(runId: string): CapabilityRun | undefined {
    const row = this.db.prepare("SELECT context_json, created_at, updated_at FROM runs WHERE run_id = ?").get(runId) as
      | { context_json: string; created_at: string; updated_at: string }
      | undefined;
    if (!row) return undefined;
    return {
      id: runId,
      context: parseJson<ExecutionContext>(row.context_json),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  listRuns(limit = 100): CapabilityRun[] {
    const bounded = Math.max(1, Math.min(limit, 500));
    const rows = this.db.prepare("SELECT run_id, context_json, created_at, updated_at FROM runs ORDER BY updated_at DESC LIMIT ?").all(bounded) as Array<{
      run_id: string;
      context_json: string;
      created_at: string;
      updated_at: string;
    }>;
    return rows.map((row) => ({
      id: row.run_id,
      context: parseJson<ExecutionContext>(row.context_json),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  saveAction(action: CapabilityAction): void {
    this.upsertRun(action.context);
    this.db.prepare(`
      INSERT INTO actions(action_id, run_id, tenant_id, project_id, status, updated_at, action_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(action_id) DO UPDATE SET
        status=excluded.status,
        updated_at=excluded.updated_at,
        action_json=excluded.action_json
    `).run(
      action.id,
      action.context.runId,
      action.context.tenantId,
      action.context.projectId,
      action.status,
      action.updatedAt,
      JSON.stringify(action),
    );

    if (action.approval) {
      this.db.prepare(`
        INSERT INTO approvals(approval_id, action_id, status, payload_hash, expires_at, updated_at, approval_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(action_id) DO UPDATE SET
          approval_id=excluded.approval_id,
          status=excluded.status,
          payload_hash=excluded.payload_hash,
          expires_at=excluded.expires_at,
          updated_at=excluded.updated_at,
          approval_json=excluded.approval_json
      `).run(
        action.approval.id,
        action.id,
        action.approval.status,
        action.approval.payloadHash,
        action.approval.expiresAt,
        action.updatedAt,
        JSON.stringify(action.approval),
      );
    }
  }

  getAction(actionId: string): CapabilityAction | undefined {
    const row = this.db.prepare("SELECT action_json FROM actions WHERE action_id = ?").get(actionId) as
      | { action_json: string }
      | undefined;
    return row ? parseJson<CapabilityAction>(row.action_json) : undefined;
  }

  listActionsForRun(runId: string): CapabilityAction[] {
    const rows = this.db.prepare("SELECT action_json FROM actions WHERE run_id = ? ORDER BY updated_at ASC").all(runId) as Array<{ action_json: string }>;
    return rows.map((row) => parseJson<CapabilityAction>(row.action_json));
  }

  appendAudit(event: AuditEvent, context: ExecutionContext): void {
    this.upsertRun(context);
    this.db.prepare(`
      INSERT OR REPLACE INTO audit_events(id, run_id, tenant_id, project_id, timestamp, event_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.runId,
      context.tenantId,
      context.projectId,
      event.timestamp,
      JSON.stringify(event),
    );
  }

  listAudit(limit = 100): AuditEvent[] {
    const bounded = Math.max(1, Math.min(limit, 500));
    const rows = this.db.prepare("SELECT event_json FROM audit_events ORDER BY timestamp DESC LIMIT ?").all(bounded) as Array<{ event_json: string }>;
    return rows.map((row) => parseJson<AuditEvent>(row.event_json));
  }

  close(): void {
    this.db.close();
  }
}
