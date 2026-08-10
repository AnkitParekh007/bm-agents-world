import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { CapabilityAction, ExecutionContext } from "./capability-types.js";
import type { CapabilityRun } from "./capability-store.js";

export type PilotRunOutcome = "successful" | "partially_successful" | "failed" | "abandoned";

export interface PilotRunEvaluationInput {
  outcome: PilotRunOutcome;
  usefulnessScore: number;
  wouldUseAgain: boolean;
  falsePositiveDefect: boolean;
  manualOverrideMinutes: number;
  notes?: string;
}

export interface PilotRunEvaluation extends PilotRunEvaluationInput {
  id: string;
  runId: string;
  tenantId: string;
  projectId: string;
  reviewerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapabilityMetric {
  capabilityId: string;
  requested: number;
  executed: number;
  failed: number;
  rejected: number;
  live: number;
  externalSideEffects: number;
}

export interface QaPilotRunMetrics {
  runId: string;
  tenantId: string;
  projectId: string;
  environment: string;
  userId: string;
  agentId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  actionCount: number;
  executedActions: number;
  failedActions: number;
  rejectedActions: number;
  liveActions: number;
  externalSideEffects: number;
  approvalsRequested: number;
  approvalsApproved: number;
  approvalsRejected: number;
  approvalLatencyMs: number | null;
  selectedTests: number;
  passedTests: number;
  failedTests: number;
  bugDraftGenerated: boolean;
  duplicateCandidates: number;
  jiraDefectCreated: boolean;
  capabilities: CapabilityMetric[];
  evaluation?: PilotRunEvaluation;
  modelUsage: {
    status: "not_instrumented";
    calls: null;
    inputTokens: null;
    outputTokens: null;
    estimatedCostUsd: null;
  };
}

export interface QaPilotSummary {
  periodDays: number;
  projectId?: string;
  totalRuns: number;
  evaluatedRuns: number;
  evaluatedSuccessRate: number | null;
  averageUsefulnessScore: number | null;
  wouldUseAgainRate: number | null;
  falsePositiveDefectRate: number | null;
  averageManualOverrideMinutes: number | null;
  averageRunDurationMs: number | null;
  actionSuccessRate: number | null;
  approvalRejectionRate: number | null;
  totalSelectedTests: number;
  totalPassedTests: number;
  totalFailedTests: number;
  browserPassRate: number | null;
  bugDraftsGenerated: number;
  jiraDefectsCreated: number;
  liveActions: number;
  externalSideEffects: number;
  modelUsageStatus: "not_instrumented";
}

interface ObservabilityScope {
  tenantId: string;
  projectIds: string[];
  projectId?: string;
  since?: string;
  limit?: number;
}

interface RunRow {
  run_id: string;
  context_json: string;
  created_at: string;
  updated_at: string;
}

interface ActionRow {
  action_json: string;
}

function asRecord(value: unknown): Record<string, any> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, any>
    : undefined;
}

function boundedNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function rate(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return Number((numerator / denominator).toFixed(4));
}

function cleanNotes(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().slice(0, 2000);
  return cleaned || undefined;
}

function normalizeEvaluation(input: PilotRunEvaluationInput): PilotRunEvaluationInput {
  const outcome: PilotRunOutcome[] = ["successful", "partially_successful", "failed", "abandoned"];
  if (!outcome.includes(input.outcome)) throw new Error("Invalid pilot run outcome");
  const usefulnessScore = Math.round(Number(input.usefulnessScore));
  if (!Number.isFinite(usefulnessScore) || usefulnessScore < 1 || usefulnessScore > 5) {
    throw new Error("usefulnessScore must be an integer from 1 to 5");
  }
  const manualOverrideMinutes = Math.round(Number(input.manualOverrideMinutes));
  if (!Number.isFinite(manualOverrideMinutes) || manualOverrideMinutes < 0 || manualOverrideMinutes > 480) {
    throw new Error("manualOverrideMinutes must be between 0 and 480");
  }
  return {
    outcome: input.outcome,
    usefulnessScore,
    wouldUseAgain: input.wouldUseAgain === true,
    falsePositiveDefect: input.falsePositiveDefect === true,
    manualOverrideMinutes,
    notes: cleanNotes(input.notes),
  };
}

export class QaPilotObservabilityStore {
  private readonly db: DatabaseSync;

  constructor(readonly path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS qa_run_evaluations (
        evaluation_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL UNIQUE,
        tenant_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        reviewer_user_id TEXT NOT NULL,
        outcome TEXT NOT NULL,
        usefulness_score INTEGER NOT NULL,
        would_use_again INTEGER NOT NULL,
        false_positive_defect INTEGER NOT NULL,
        manual_override_minutes INTEGER NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(run_id) REFERENCES runs(run_id)
      );
      CREATE INDEX IF NOT EXISTS idx_qa_eval_tenant_project_updated
        ON qa_run_evaluations(tenant_id, project_id, updated_at DESC);
    `);
  }

  saveEvaluation(
    run: CapabilityRun,
    reviewerUserId: string,
    input: PilotRunEvaluationInput,
  ): PilotRunEvaluation {
    const normalized = normalizeEvaluation(input);
    const existing = this.getEvaluation(run.id);
    const now = new Date().toISOString();
    const evaluation: PilotRunEvaluation = {
      id: existing?.id ?? randomUUID(),
      runId: run.id,
      tenantId: run.context.tenantId,
      projectId: run.context.projectId,
      reviewerUserId,
      ...normalized,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.db.prepare(`
      INSERT INTO qa_run_evaluations(
        evaluation_id, run_id, tenant_id, project_id, reviewer_user_id,
        outcome, usefulness_score, would_use_again, false_positive_defect,
        manual_override_minutes, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_id) DO UPDATE SET
        reviewer_user_id=excluded.reviewer_user_id,
        outcome=excluded.outcome,
        usefulness_score=excluded.usefulness_score,
        would_use_again=excluded.would_use_again,
        false_positive_defect=excluded.false_positive_defect,
        manual_override_minutes=excluded.manual_override_minutes,
        notes=excluded.notes,
        updated_at=excluded.updated_at
    `).run(
      evaluation.id,
      evaluation.runId,
      evaluation.tenantId,
      evaluation.projectId,
      evaluation.reviewerUserId,
      evaluation.outcome,
      evaluation.usefulnessScore,
      evaluation.wouldUseAgain ? 1 : 0,
      evaluation.falsePositiveDefect ? 1 : 0,
      evaluation.manualOverrideMinutes,
      evaluation.notes ?? null,
      evaluation.createdAt,
      evaluation.updatedAt,
    );
    return evaluation;
  }

  getEvaluation(runId: string): PilotRunEvaluation | undefined {
    const row = this.db.prepare("SELECT * FROM qa_run_evaluations WHERE run_id = ?").get(runId) as Record<string, any> | undefined;
    return row ? this.evaluationFromRow(row) : undefined;
  }

  listRunMetrics(scope: ObservabilityScope): QaPilotRunMetrics[] {
    const allowedProjects = [...new Set(scope.projectIds.map((item) => item.trim()).filter(Boolean))];
    if (!allowedProjects.length) return [];
    if (scope.projectId && !allowedProjects.includes(scope.projectId)) return [];
    const selectedProjects = scope.projectId ? [scope.projectId] : allowedProjects;
    const placeholders = selectedProjects.map(() => "?").join(",");
    const params: Array<string | number> = [scope.tenantId, ...selectedProjects];
    let sql = `
      SELECT run_id, context_json, created_at, updated_at
      FROM runs
      WHERE tenant_id = ? AND project_id IN (${placeholders})
    `;
    if (scope.since) {
      sql += " AND created_at >= ?";
      params.push(scope.since);
    }
    sql += " ORDER BY updated_at DESC LIMIT ?";
    params.push(Math.max(1, Math.min(scope.limit ?? 200, 500)));

    const rows = this.db.prepare(sql).all(...params) as unknown as RunRow[];
    return rows.map((row) => this.metricsForRun(row));
  }

  summary(scope: ObservabilityScope, periodDays: number): QaPilotSummary {
    const runs = this.listRunMetrics(scope);
    const evaluations = runs.flatMap((run) => run.evaluation ? [run.evaluation] : []);
    const successfulEvaluations = evaluations.filter((item) => item.outcome === "successful").length;
    const wouldUseAgain = evaluations.filter((item) => item.wouldUseAgain).length;
    const falsePositive = evaluations.filter((item) => item.falsePositiveDefect).length;
    const totalCompletedActions = runs.reduce((sum, run) => sum + run.executedActions + run.failedActions, 0);
    const totalExecutedActions = runs.reduce((sum, run) => sum + run.executedActions, 0);
    const approvalsDecided = runs.reduce((sum, run) => sum + run.approvalsApproved + run.approvalsRejected, 0);
    const approvalsRejected = runs.reduce((sum, run) => sum + run.approvalsRejected, 0);
    const selectedTests = runs.reduce((sum, run) => sum + run.selectedTests, 0);
    const passedTests = runs.reduce((sum, run) => sum + run.passedTests, 0);
    const failedTests = runs.reduce((sum, run) => sum + run.failedTests, 0);

    return {
      periodDays,
      projectId: scope.projectId,
      totalRuns: runs.length,
      evaluatedRuns: evaluations.length,
      evaluatedSuccessRate: rate(successfulEvaluations, evaluations.length),
      averageUsefulnessScore: evaluations.length
        ? Number((evaluations.reduce((sum, item) => sum + item.usefulnessScore, 0) / evaluations.length).toFixed(2))
        : null,
      wouldUseAgainRate: rate(wouldUseAgain, evaluations.length),
      falsePositiveDefectRate: rate(falsePositive, evaluations.length),
      averageManualOverrideMinutes: average(evaluations.map((item) => item.manualOverrideMinutes)),
      averageRunDurationMs: average(runs.map((run) => run.durationMs)),
      actionSuccessRate: rate(totalExecutedActions, totalCompletedActions),
      approvalRejectionRate: rate(approvalsRejected, approvalsDecided),
      totalSelectedTests: selectedTests,
      totalPassedTests: passedTests,
      totalFailedTests: failedTests,
      browserPassRate: rate(passedTests, passedTests + failedTests),
      bugDraftsGenerated: runs.filter((run) => run.bugDraftGenerated).length,
      jiraDefectsCreated: runs.filter((run) => run.jiraDefectCreated).length,
      liveActions: runs.reduce((sum, run) => sum + run.liveActions, 0),
      externalSideEffects: runs.reduce((sum, run) => sum + run.externalSideEffects, 0),
      modelUsageStatus: "not_instrumented",
    };
  }

  close(): void {
    this.db.close();
  }

  private metricsForRun(row: RunRow): QaPilotRunMetrics {
    const context = JSON.parse(row.context_json) as ExecutionContext;
    const actionRows = this.db.prepare("SELECT action_json FROM actions WHERE run_id = ? ORDER BY updated_at ASC").all(row.run_id) as unknown as ActionRow[];
    const actions = actionRows.map((item) => JSON.parse(item.action_json) as CapabilityAction);
    const capabilityMap = new Map<string, CapabilityMetric>();
    let selectedTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let bugDraftGenerated = false;
    let duplicateCandidates = 0;
    let jiraDefectCreated = false;
    let liveActions = 0;
    let externalSideEffects = 0;
    const approvalLatencies: number[] = [];

    for (const action of actions) {
      const metric = capabilityMap.get(action.capabilityId) ?? {
        capabilityId: action.capabilityId,
        requested: 0,
        executed: 0,
        failed: 0,
        rejected: 0,
        live: 0,
        externalSideEffects: 0,
      };
      metric.requested += 1;
      if (action.status === "executed") metric.executed += 1;
      if (action.status === "failed") metric.failed += 1;
      if (action.status === "rejected") metric.rejected += 1;
      if (action.result?.mode === "live") {
        metric.live += 1;
        liveActions += 1;
      }
      if (action.result?.externalSideEffect) {
        metric.externalSideEffects += 1;
        externalSideEffects += 1;
      }
      capabilityMap.set(action.capabilityId, metric);

      if (action.approval?.requestedAt && action.approval.decidedAt) {
        const latency = Date.parse(action.approval.decidedAt) - Date.parse(action.approval.requestedAt);
        if (Number.isFinite(latency) && latency >= 0) approvalLatencies.push(latency);
      }

      const data = asRecord(action.result?.data);
      if (action.capabilityId === "qa.playwright.test.run") {
        const execution = asRecord(data?.execution);
        const selected = Array.isArray(execution?.selectedCases) ? execution.selectedCases.length : 0;
        selectedTests += selected;
        passedTests += boundedNumber(execution?.passed);
        failedTests += boundedNumber(execution?.failed);
        bugDraftGenerated ||= Boolean(data?.bugDraftArtifact);
      }
      if (action.capabilityId === "qa.jira.duplicate.search") {
        duplicateCandidates += Array.isArray(data?.candidates) ? data.candidates.length : 0;
      }
      if (action.capabilityId === "qa.jira.bug.create") {
        jiraDefectCreated ||= action.result?.mode === "live" && action.result?.externalSideEffect === true && action.result?.ok === true;
      }
    }

    const finishedAt = actions.reduce((latest, action) => action.updatedAt > latest ? action.updatedAt : latest, row.updated_at);
    const durationMs = Math.max(0, Date.parse(finishedAt) - Date.parse(row.created_at));

    return {
      runId: row.run_id,
      tenantId: context.tenantId,
      projectId: context.projectId,
      environment: context.environment,
      userId: context.userId,
      agentId: context.agentId,
      startedAt: row.created_at,
      finishedAt,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      actionCount: actions.length,
      executedActions: actions.filter((action) => action.status === "executed").length,
      failedActions: actions.filter((action) => action.status === "failed").length,
      rejectedActions: actions.filter((action) => action.status === "rejected").length,
      liveActions,
      externalSideEffects,
      approvalsRequested: actions.filter((action) => Boolean(action.approval)).length,
      approvalsApproved: actions.filter((action) => action.approval?.status === "approved").length,
      approvalsRejected: actions.filter((action) => ["rejected", "expired"].includes(action.approval?.status ?? "")).length,
      approvalLatencyMs: average(approvalLatencies),
      selectedTests,
      passedTests,
      failedTests,
      bugDraftGenerated,
      duplicateCandidates,
      jiraDefectCreated,
      capabilities: [...capabilityMap.values()].sort((a, b) => a.capabilityId.localeCompare(b.capabilityId)),
      evaluation: this.getEvaluation(row.run_id),
      modelUsage: {
        status: "not_instrumented",
        calls: null,
        inputTokens: null,
        outputTokens: null,
        estimatedCostUsd: null,
      },
    };
  }

  private evaluationFromRow(row: Record<string, any>): PilotRunEvaluation {
    return {
      id: String(row.evaluation_id),
      runId: String(row.run_id),
      tenantId: String(row.tenant_id),
      projectId: String(row.project_id),
      reviewerUserId: String(row.reviewer_user_id),
      outcome: String(row.outcome) as PilotRunOutcome,
      usefulnessScore: Number(row.usefulness_score),
      wouldUseAgain: Number(row.would_use_again) === 1,
      falsePositiveDefect: Number(row.false_positive_defect) === 1,
      manualOverrideMinutes: Number(row.manual_override_minutes),
      notes: row.notes == null ? undefined : String(row.notes),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }
}
