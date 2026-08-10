import { randomUUID } from "node:crypto";
import { Pool, type PoolConfig } from "pg";
import type { AsyncCapabilityStore } from "./async-capability-broker.js";
import type { AgentRunUsage, ModelCostStatus, ModelUsageStatus } from "./agent-telemetry.js";
import type { CapabilityRun } from "./capability-store.js";
import type { AuditEvent, CapabilityAction, ExecutionContext } from "./capability-types.js";
import type {
  CapabilityMetric,
  PilotRunEvaluation,
  PilotRunEvaluationInput,
  PilotRunOutcome,
  QaPilotRunMetrics,
  QaPilotSummary,
} from "./qa-pilot-observability.js";

const SCHEMA = "bm_agents_world";
const EXPECTED_SCHEMA_VERSION = 1;

export interface SharedObservabilityScope {
  tenantId: string;
  projectIds: string[];
  projectId?: string;
  since?: string;
  limit?: number;
}

function parseJson<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function rate(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return Number((numerator / denominator).toFixed(4));
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

function cleanNotes(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().slice(0, 2000);
  return cleaned || undefined;
}

function normalizeEvaluation(input: PilotRunEvaluationInput): PilotRunEvaluationInput {
  const outcomes: PilotRunOutcome[] = ["successful", "partially_successful", "failed", "abandoned"];
  if (!outcomes.includes(input.outcome)) throw new Error("Invalid pilot run outcome");
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

function evaluationFromRow(row: Record<string, any>): PilotRunEvaluation {
  return {
    id: String(row.evaluation_id),
    runId: String(row.run_id),
    tenantId: String(row.tenant_id),
    projectId: String(row.project_id),
    reviewerUserId: String(row.reviewer_user_id),
    outcome: String(row.outcome) as PilotRunOutcome,
    usefulnessScore: Number(row.usefulness_score),
    wouldUseAgain: Boolean(row.would_use_again),
    falsePositiveDefect: Boolean(row.false_positive_defect),
    manualOverrideMinutes: Number(row.manual_override_minutes),
    notes: row.notes == null ? undefined : String(row.notes),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function agentUsageFromRow(row: Record<string, any>): AgentRunUsage {
  return {
    agentRunId: String(row.agent_run_id),
    threadId: String(row.thread_id),
    tenantId: String(row.tenant_id),
    userId: String(row.user_id),
    agentId: String(row.agent_id),
    model: String(row.model),
    provider: String(row.provider),
    startedAt: new Date(row.started_at).toISOString(),
    finishedAt: new Date(row.finished_at).toISOString(),
    durationMs: Number(row.duration_ms),
    eventCount: Number(row.event_count),
    toolCallCount: Number(row.tool_call_count),
    modelCallCount: Number(row.model_call_count),
    inputTokens: row.input_tokens == null ? null : Number(row.input_tokens),
    outputTokens: row.output_tokens == null ? null : Number(row.output_tokens),
    totalTokens: row.total_tokens == null ? null : Number(row.total_tokens),
    usageStatus: String(row.usage_status) as ModelUsageStatus,
    estimatedCostUsd: row.estimated_cost_usd == null ? null : Number(row.estimated_cost_usd),
    costStatus: String(row.cost_status) as ModelCostStatus,
    traceId: row.trace_id ? String(row.trace_id) : undefined,
    spanId: row.span_id ? String(row.span_id) : undefined,
    error: row.error ? String(row.error) : undefined,
  };
}

export class PostgresRuntimeStore implements AsyncCapabilityStore {
  readonly kind = "postgres" as const;
  readonly location = "shared-postgres";
  private readonly pool: Pool;

  constructor(connectionString: string, config: Partial<PoolConfig> = {}) {
    if (!connectionString.trim()) throw new Error("BM_POSTGRES_URL is required for shared Postgres persistence");
    this.pool = new Pool({
      connectionString,
      max: Math.max(1, Math.min(Number(process.env.BM_POSTGRES_POOL_MAX ?? 10), 30)),
      application_name: "bm-agents-world-agent-window",
      statement_timeout: Math.max(1000, Math.min(Number(process.env.BM_POSTGRES_STATEMENT_TIMEOUT_MS ?? 15000), 60000)),
      ...config,
    });
  }

  async assertReady(): Promise<void> {
    const result = await this.pool.query(
      `select version from ${SCHEMA}.schema_meta where key = 'runtime_schema' limit 1`,
    ).catch((error) => {
      throw new Error(`Shared Postgres schema is unavailable: ${error instanceof Error ? error.message : String(error)}`);
    });
    const version = Number(result.rows[0]?.version);
    if (version !== EXPECTED_SCHEMA_VERSION) {
      throw new Error(`Shared Postgres schema version ${version || "missing"} does not match expected ${EXPECTED_SCHEMA_VERSION}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query("select 1 as ok");
      return true;
    } catch {
      return false;
    }
  }

  async upsertRun(context: ExecutionContext): Promise<CapabilityRun> {
    const existing = await this.getRun(context.runId);
    const now = new Date().toISOString();
    const createdAt = existing?.createdAt ?? context.requestedAt ?? now;
    await this.pool.query(`
      insert into ${SCHEMA}.runs(
        run_id, tenant_id, project_id, user_id, environment, created_at, updated_at, context_json
      ) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
      on conflict(run_id) do update set
        tenant_id=excluded.tenant_id,
        project_id=excluded.project_id,
        user_id=excluded.user_id,
        environment=excluded.environment,
        updated_at=excluded.updated_at,
        context_json=excluded.context_json
    `, [context.runId, context.tenantId, context.projectId, context.userId, context.environment, createdAt, now, JSON.stringify(context)]);
    return { id: context.runId, context, createdAt, updatedAt: now };
  }

  async getRun(runId: string): Promise<CapabilityRun | undefined> {
    const result = await this.pool.query(
      `select context_json, created_at, updated_at from ${SCHEMA}.runs where run_id = $1`,
      [runId],
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      id: runId,
      context: parseJson<ExecutionContext>(row.context_json),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async listRuns(limit = 100): Promise<CapabilityRun[]> {
    const bounded = Math.max(1, Math.min(limit, 500));
    const result = await this.pool.query(
      `select run_id, context_json, created_at, updated_at from ${SCHEMA}.runs order by updated_at desc limit $1`,
      [bounded],
    );
    return result.rows.map((row) => ({
      id: String(row.run_id),
      context: parseJson<ExecutionContext>(row.context_json),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }));
  }

  async saveAction(action: CapabilityAction): Promise<void> {
    await this.upsertRun(action.context);
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      await client.query(`
        insert into ${SCHEMA}.actions(action_id, run_id, tenant_id, project_id, status, updated_at, action_json)
        values ($1,$2,$3,$4,$5,$6,$7::jsonb)
        on conflict(action_id) do update set
          status=excluded.status,
          updated_at=excluded.updated_at,
          action_json=excluded.action_json
      `, [action.id, action.context.runId, action.context.tenantId, action.context.projectId, action.status, action.updatedAt, JSON.stringify(action)]);
      if (action.approval) {
        await client.query(`
          insert into ${SCHEMA}.approvals(
            approval_id, action_id, status, payload_hash, expires_at, updated_at, approval_json
          ) values ($1,$2,$3,$4,$5,$6,$7::jsonb)
          on conflict(action_id) do update set
            approval_id=excluded.approval_id,
            status=excluded.status,
            payload_hash=excluded.payload_hash,
            expires_at=excluded.expires_at,
            updated_at=excluded.updated_at,
            approval_json=excluded.approval_json
        `, [
          action.approval.id,
          action.id,
          action.approval.status,
          action.approval.payloadHash,
          action.approval.expiresAt,
          action.updatedAt,
          JSON.stringify(action.approval),
        ]);
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async getAction(actionId: string): Promise<CapabilityAction | undefined> {
    const result = await this.pool.query(`select action_json from ${SCHEMA}.actions where action_id = $1`, [actionId]);
    return result.rows[0] ? parseJson<CapabilityAction>(result.rows[0].action_json) : undefined;
  }

  async listActionsForRun(runId: string): Promise<CapabilityAction[]> {
    const result = await this.pool.query(
      `select action_json from ${SCHEMA}.actions where run_id = $1 order by updated_at asc`,
      [runId],
    );
    return result.rows.map((row) => parseJson<CapabilityAction>(row.action_json));
  }

  async appendAudit(event: AuditEvent, context: ExecutionContext): Promise<void> {
    await this.upsertRun(context);
    await this.pool.query(`
      insert into ${SCHEMA}.audit_events(id, run_id, tenant_id, project_id, timestamp, event_json)
      values ($1,$2,$3,$4,$5,$6::jsonb)
      on conflict(id) do update set timestamp=excluded.timestamp, event_json=excluded.event_json
    `, [event.id, event.runId, context.tenantId, context.projectId, event.timestamp, JSON.stringify(event)]);
  }

  async listAudit(limit = 100): Promise<AuditEvent[]> {
    const bounded = Math.max(1, Math.min(limit, 500));
    const result = await this.pool.query(
      `select event_json from ${SCHEMA}.audit_events order by timestamp desc limit $1`,
      [bounded],
    );
    return result.rows.map((row) => parseJson<AuditEvent>(row.event_json));
  }

  async saveEvaluation(
    run: CapabilityRun,
    reviewerUserId: string,
    input: PilotRunEvaluationInput,
  ): Promise<PilotRunEvaluation> {
    const normalized = normalizeEvaluation(input);
    const existing = await this.getEvaluation(run.id);
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
    await this.pool.query(`
      insert into ${SCHEMA}.qa_run_evaluations(
        evaluation_id, run_id, tenant_id, project_id, reviewer_user_id,
        outcome, usefulness_score, would_use_again, false_positive_defect,
        manual_override_minutes, notes, created_at, updated_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      on conflict(run_id) do update set
        reviewer_user_id=excluded.reviewer_user_id,
        outcome=excluded.outcome,
        usefulness_score=excluded.usefulness_score,
        would_use_again=excluded.would_use_again,
        false_positive_defect=excluded.false_positive_defect,
        manual_override_minutes=excluded.manual_override_minutes,
        notes=excluded.notes,
        updated_at=excluded.updated_at
    `, [
      evaluation.id,
      evaluation.runId,
      evaluation.tenantId,
      evaluation.projectId,
      evaluation.reviewerUserId,
      evaluation.outcome,
      evaluation.usefulnessScore,
      evaluation.wouldUseAgain,
      evaluation.falsePositiveDefect,
      evaluation.manualOverrideMinutes,
      evaluation.notes ?? null,
      evaluation.createdAt,
      evaluation.updatedAt,
    ]);
    return evaluation;
  }

  async getEvaluation(runId: string): Promise<PilotRunEvaluation | undefined> {
    const result = await this.pool.query(`select * from ${SCHEMA}.qa_run_evaluations where run_id = $1`, [runId]);
    return result.rows[0] ? evaluationFromRow(result.rows[0]) : undefined;
  }

  async listRunMetrics(scope: SharedObservabilityScope): Promise<QaPilotRunMetrics[]> {
    const allowedProjects = [...new Set(scope.projectIds.map((item) => item.trim()).filter(Boolean))];
    if (!allowedProjects.length) return [];
    if (scope.projectId && !allowedProjects.includes(scope.projectId)) return [];
    const selectedProjects = scope.projectId ? [scope.projectId] : allowedProjects;
    const bounded = Math.max(1, Math.min(scope.limit ?? 200, 500));
    const params: unknown[] = [scope.tenantId, selectedProjects];
    let sql = `select run_id, context_json, created_at, updated_at from ${SCHEMA}.runs where tenant_id = $1 and project_id = any($2::text[])`;
    if (scope.since) {
      params.push(scope.since);
      sql += ` and created_at >= $${params.length}`;
    }
    params.push(bounded);
    sql += ` order by updated_at desc limit $${params.length}`;
    const result = await this.pool.query(sql, params);
    return Promise.all(result.rows.map(async (row) => {
      const run: CapabilityRun = {
        id: String(row.run_id),
        context: parseJson<ExecutionContext>(row.context_json),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      };
      const [actions, evaluation] = await Promise.all([
        this.listActionsForRun(run.id),
        this.getEvaluation(run.id),
      ]);
      return this.metricsForRun(run, actions, evaluation);
    }));
  }

  async summary(scope: SharedObservabilityScope, periodDays: number): Promise<QaPilotSummary> {
    const runs = await this.listRunMetrics(scope);
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

  async saveRun(run: AgentRunUsage): Promise<void> {
    await this.pool.query(`
      insert into ${SCHEMA}.agent_run_usage(
        agent_run_id, thread_id, tenant_id, user_id, agent_id, model, provider,
        started_at, finished_at, duration_ms, event_count, tool_call_count, model_call_count,
        input_tokens, output_tokens, total_tokens, usage_status,
        estimated_cost_usd, cost_status, trace_id, span_id, error
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      on conflict(agent_run_id) do update set
        finished_at=excluded.finished_at,
        duration_ms=excluded.duration_ms,
        event_count=excluded.event_count,
        tool_call_count=excluded.tool_call_count,
        model_call_count=excluded.model_call_count,
        input_tokens=excluded.input_tokens,
        output_tokens=excluded.output_tokens,
        total_tokens=excluded.total_tokens,
        usage_status=excluded.usage_status,
        estimated_cost_usd=excluded.estimated_cost_usd,
        cost_status=excluded.cost_status,
        trace_id=excluded.trace_id,
        span_id=excluded.span_id,
        error=excluded.error
    `, [
      run.agentRunId, run.threadId, run.tenantId, run.userId, run.agentId, run.model, run.provider,
      run.startedAt, run.finishedAt, run.durationMs, run.eventCount, run.toolCallCount, run.modelCallCount,
      run.inputTokens, run.outputTokens, run.totalTokens, run.usageStatus,
      run.estimatedCostUsd, run.costStatus, run.traceId ?? null, run.spanId ?? null, run.error ?? null,
    ]);
  }

  async linkQaRun(qaRunId: string, agentRunId: string): Promise<void> {
    await this.pool.query(`
      insert into ${SCHEMA}.qa_run_agent_links(qa_run_id, agent_run_id, linked_at)
      values ($1,$2,$3) on conflict do nothing
    `, [qaRunId, agentRunId, new Date().toISOString()]);
  }

  async listForQaRun(qaRunId: string): Promise<AgentRunUsage[]> {
    const result = await this.pool.query(`
      select usage.* from ${SCHEMA}.agent_run_usage usage
      join ${SCHEMA}.qa_run_agent_links link on link.agent_run_id = usage.agent_run_id
      where link.qa_run_id = $1 order by usage.started_at asc
    `, [qaRunId]);
    return result.rows.map(agentUsageFromRow);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private metricsForRun(
    run: CapabilityRun,
    actions: CapabilityAction[],
    evaluation?: PilotRunEvaluation,
  ): QaPilotRunMetrics {
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
        selectedTests += Array.isArray(execution?.selectedCases) ? execution.selectedCases.length : 0;
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

    const finishedAt = actions.reduce((latest, action) => action.updatedAt > latest ? action.updatedAt : latest, run.updatedAt);
    const durationMs = Math.max(0, Date.parse(finishedAt) - Date.parse(run.createdAt));
    return {
      runId: run.id,
      tenantId: run.context.tenantId,
      projectId: run.context.projectId,
      environment: run.context.environment,
      userId: run.context.userId,
      agentId: run.context.agentId,
      startedAt: run.createdAt,
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
      evaluation,
      modelUsage: {
        status: "not_instrumented",
        calls: null,
        inputTokens: null,
        outputTokens: null,
        estimatedCostUsd: null,
      },
    };
  }
}
