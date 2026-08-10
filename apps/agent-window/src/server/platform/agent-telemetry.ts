import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { DatabaseSync } from "node:sqlite";
import {
  AbstractAgent,
  Middleware,
  type BaseEvent,
  type RunAgentInput,
} from "@ag-ui/client";
import { context as otelContext, SpanStatusCode, trace } from "@opentelemetry/api";
import { Observable } from "rxjs";
import { currentRequestIdentity } from "./request-identity.js";

export type ModelUsageStatus = "measured" | "unavailable";
export type ModelCostStatus = "configured_estimate" | "unavailable";

export interface AgentRunUsage {
  agentRunId: string;
  threadId: string;
  tenantId: string;
  userId: string;
  agentId: string;
  model: string;
  provider: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  eventCount: number;
  toolCallCount: number;
  modelCallCount: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  usageStatus: ModelUsageStatus;
  estimatedCostUsd: number | null;
  costStatus: ModelCostStatus;
  traceId?: string;
  spanId?: string;
  error?: string;
}

interface ActiveAgentRun {
  agentRunId: string;
  agentId: string;
  model: string;
}

interface UsageEvidence {
  signature: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

const activeAgentRun = new AsyncLocalStorage<ActiveAgentRun>();

function providerFromModel(model: string): string {
  const separator = model.indexOf(":");
  return separator > 0 ? model.slice(0, separator).toLowerCase() : "unknown";
}

function numericField(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return undefined;
}

function candidateUsage(record: Record<string, unknown>, identity: string): UsageEvidence | undefined {
  const input = numericField(record, ["inputTokens", "input_tokens", "promptTokens", "prompt_tokens"]);
  const output = numericField(record, ["outputTokens", "output_tokens", "completionTokens", "completion_tokens"]);
  const total = numericField(record, ["totalTokens", "total_tokens"]);
  if (input === undefined && output === undefined && total === undefined) return undefined;
  const inputTokens = input ?? Math.max(0, (total ?? 0) - (output ?? 0));
  const outputTokens = output ?? Math.max(0, (total ?? 0) - inputTokens);
  const totalTokens = total ?? inputTokens + outputTokens;
  const signature = createHash("sha256")
    .update(`${identity}|${inputTokens}|${outputTokens}|${totalTokens}`)
    .digest("hex");
  return { signature, inputTokens, outputTokens, totalTokens };
}

export function collectUsageEvidence(value: unknown, seenObjects = new Set<unknown>(), inheritedId = "root"): UsageEvidence[] {
  if (!value || typeof value !== "object" || seenObjects.has(value)) return [];
  seenObjects.add(value);
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectUsageEvidence(entry, seenObjects, `${inheritedId}[${index}]`));
  }

  const record = value as Record<string, unknown>;
  const localId = String(
    record.id
      ?? record.message_id
      ?? record.response_id
      ?? record.responseId
      ?? record.run_id
      ?? record.runId
      ?? inheritedId,
  );
  const candidates: UsageEvidence[] = [];

  for (const key of ["usage", "usage_metadata", "usageMetadata", "tokenUsage", "token_usage"] as const) {
    const nested = record[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const candidate = candidateUsage(nested as Record<string, unknown>, `${localId}:${key}`);
      if (candidate) candidates.push(candidate);
    }
  }

  const direct = candidateUsage(record, `${localId}:direct`);
  if (direct) candidates.push(direct);

  for (const [key, nested] of Object.entries(record)) {
    if (["usage", "usage_metadata", "usageMetadata", "tokenUsage", "token_usage"].includes(key)) continue;
    if (nested && typeof nested === "object") {
      candidates.push(...collectUsageEvidence(nested, seenObjects, `${localId}:${key}`));
    }
  }
  return candidates;
}

function configuredTokenRates(): { input: number; output: number } | undefined {
  const input = Number(process.env.BM_MODEL_INPUT_USD_PER_1M_TOKENS);
  const output = Number(process.env.BM_MODEL_OUTPUT_USD_PER_1M_TOKENS);
  if (!Number.isFinite(input) || input < 0 || !Number.isFinite(output) || output < 0) return undefined;
  return { input, output };
}

function estimateCost(inputTokens: number | null, outputTokens: number | null): {
  value: number | null;
  status: ModelCostStatus;
} {
  const rates = configuredTokenRates();
  if (!rates || inputTokens === null || outputTokens === null) return { value: null, status: "unavailable" };
  const value = (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
  return { value: Number(value.toFixed(8)), status: "configured_estimate" };
}

export class AgentTelemetryStore {
  private readonly db: DatabaseSync;

  constructor(readonly path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_run_usage (
        agent_run_id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        model TEXT NOT NULL,
        provider TEXT NOT NULL,
        started_at TEXT NOT NULL,
        finished_at TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        event_count INTEGER NOT NULL,
        tool_call_count INTEGER NOT NULL,
        model_call_count INTEGER NOT NULL,
        input_tokens INTEGER,
        output_tokens INTEGER,
        total_tokens INTEGER,
        usage_status TEXT NOT NULL,
        estimated_cost_usd REAL,
        cost_status TEXT NOT NULL,
        trace_id TEXT,
        span_id TEXT,
        error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_agent_usage_tenant_started
        ON agent_run_usage(tenant_id, started_at DESC);

      CREATE TABLE IF NOT EXISTS qa_run_agent_links (
        qa_run_id TEXT NOT NULL,
        agent_run_id TEXT NOT NULL,
        linked_at TEXT NOT NULL,
        PRIMARY KEY(qa_run_id, agent_run_id)
      );
      CREATE INDEX IF NOT EXISTS idx_qa_agent_links_agent
        ON qa_run_agent_links(agent_run_id);
    `);
  }

  saveRun(run: AgentRunUsage): void {
    this.db.prepare(`
      INSERT INTO agent_run_usage(
        agent_run_id, thread_id, tenant_id, user_id, agent_id, model, provider,
        started_at, finished_at, duration_ms, event_count, tool_call_count, model_call_count,
        input_tokens, output_tokens, total_tokens, usage_status,
        estimated_cost_usd, cost_status, trace_id, span_id, error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(agent_run_id) DO UPDATE SET
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
    `).run(
      run.agentRunId, run.threadId, run.tenantId, run.userId, run.agentId, run.model, run.provider,
      run.startedAt, run.finishedAt, run.durationMs, run.eventCount, run.toolCallCount, run.modelCallCount,
      run.inputTokens, run.outputTokens, run.totalTokens, run.usageStatus,
      run.estimatedCostUsd, run.costStatus, run.traceId ?? null, run.spanId ?? null, run.error ?? null,
    );
  }

  linkQaRun(qaRunId: string, agentRunId: string): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO qa_run_agent_links(qa_run_id, agent_run_id, linked_at)
      VALUES (?, ?, ?)
    `).run(qaRunId, agentRunId, new Date().toISOString());
  }

  listForQaRun(qaRunId: string): AgentRunUsage[] {
    const rows = this.db.prepare(`
      SELECT usage.*
      FROM agent_run_usage usage
      JOIN qa_run_agent_links link ON link.agent_run_id = usage.agent_run_id
      WHERE link.qa_run_id = ?
      ORDER BY usage.started_at ASC
    `).all(qaRunId) as unknown as Array<Record<string, unknown>>;
    return rows.map((row) => ({
      agentRunId: String(row.agent_run_id),
      threadId: String(row.thread_id),
      tenantId: String(row.tenant_id),
      userId: String(row.user_id),
      agentId: String(row.agent_id),
      model: String(row.model),
      provider: String(row.provider),
      startedAt: String(row.started_at),
      finishedAt: String(row.finished_at),
      durationMs: Number(row.duration_ms),
      eventCount: Number(row.event_count),
      toolCallCount: Number(row.tool_call_count),
      modelCallCount: Number(row.model_call_count),
      inputTokens: row.input_tokens === null ? null : Number(row.input_tokens),
      outputTokens: row.output_tokens === null ? null : Number(row.output_tokens),
      totalTokens: row.total_tokens === null ? null : Number(row.total_tokens),
      usageStatus: String(row.usage_status) as ModelUsageStatus,
      estimatedCostUsd: row.estimated_cost_usd === null ? null : Number(row.estimated_cost_usd),
      costStatus: String(row.cost_status) as ModelCostStatus,
      traceId: row.trace_id ? String(row.trace_id) : undefined,
      spanId: row.span_id ? String(row.span_id) : undefined,
      error: row.error ? String(row.error) : undefined,
    }));
  }

  close(): void {
    this.db.close();
  }
}

export class AgentTelemetryService {
  constructor(private readonly store: AgentTelemetryStore) {}

  currentAgentRunId(): string | undefined {
    return activeAgentRun.getStore()?.agentRunId;
  }

  linkCurrentAgentRunToQaRun(qaRunId: string): void {
    const current = activeAgentRun.getStore();
    if (current) this.store.linkQaRun(qaRunId, current.agentRunId);
  }

  middleware(agentId: string, model: string): Middleware {
    const service = this;
    return new class extends Middleware {
      run(input: RunAgentInput, next: AbstractAgent): Observable<BaseEvent> {
        const startedAt = new Date().toISOString();
        const started = Date.now();
        let identity: ReturnType<typeof currentRequestIdentity>;
        try {
          identity = currentRequestIdentity();
        } catch {
          identity = { userId: "unknown", tenantId: "unknown", projectIds: [], source: "local-dev" };
        }

        const tracer = trace.getTracer("bm-agents-world.agent", "0.1.0");
        const span = tracer.startSpan("bm.agent.run", {
          attributes: {
            "bm.agent.id": agentId,
            "bm.agent.run_id": input.runId,
            "bm.thread.id": input.threadId,
            "bm.tenant.id": identity.tenantId,
            "bm.user.id": identity.userId,
            "gen_ai.system": providerFromModel(model),
            "gen_ai.request.model": model,
          },
        });
        const spanContext = span.spanContext();
        const evidence = new Map<string, UsageEvidence>();
        let eventCount = 0;
        let toolCallCount = 0;
        let runError: string | undefined;

        const initial: AgentRunUsage = {
          agentRunId: input.runId,
          threadId: input.threadId,
          tenantId: identity.tenantId,
          userId: identity.userId,
          agentId,
          model,
          provider: providerFromModel(model),
          startedAt,
          finishedAt: startedAt,
          durationMs: 0,
          eventCount: 0,
          toolCallCount: 0,
          modelCallCount: 0,
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          usageStatus: "unavailable",
          estimatedCostUsd: null,
          costStatus: "unavailable",
          traceId: trace.isSpanContextValid(spanContext) ? spanContext.traceId : undefined,
          spanId: trace.isSpanContextValid(spanContext) ? spanContext.spanId : undefined,
        };
        service.store.saveRun(initial);

        const otelCtx = trace.setSpan(otelContext.active(), span);
        const active: ActiveAgentRun = { agentRunId: input.runId, agentId, model };
        let finalized = false;

        const finalize = () => {
          if (finalized) return;
          finalized = true;
          const usages = [...evidence.values()];
          const inputTokens = usages.length ? usages.reduce((sum, item) => sum + item.inputTokens, 0) : null;
          const outputTokens = usages.length ? usages.reduce((sum, item) => sum + item.outputTokens, 0) : null;
          const totalTokens = usages.length ? usages.reduce((sum, item) => sum + item.totalTokens, 0) : null;
          const cost = estimateCost(inputTokens, outputTokens);
          if (inputTokens !== null) span.setAttribute("gen_ai.usage.input_tokens", inputTokens);
          if (outputTokens !== null) span.setAttribute("gen_ai.usage.output_tokens", outputTokens);
          span.setAttribute("bm.agent.event_count", eventCount);
          span.setAttribute("bm.agent.tool_call_count", toolCallCount);
          span.setAttribute("bm.agent.model_call_count", usages.length);
          if (!runError) span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          service.store.saveRun({
            ...initial,
            finishedAt: new Date().toISOString(),
            durationMs: Math.max(0, Date.now() - started),
            eventCount,
            toolCallCount,
            modelCallCount: usages.length,
            inputTokens,
            outputTokens,
            totalTokens,
            usageStatus: usages.length ? "measured" : "unavailable",
            estimatedCostUsd: cost.value,
            costStatus: cost.status,
            error: runError,
          });
        };

        return new Observable<BaseEvent>((subscriber) => {
          const subscription = activeAgentRun.run(active, () => otelContext.with(otelCtx, () =>
            this.runNextWithState(input, next).subscribe({
              next: ({ event }) => {
                eventCount += 1;
                if (String(event.type) === "TOOL_CALL_START") toolCallCount += 1;
                for (const item of collectUsageEvidence(event)) evidence.set(item.signature, item);
                subscriber.next(event);
              },
              error: (error) => {
                runError = error instanceof Error ? error.message : String(error);
                span.recordException(error instanceof Error ? error : new Error(runError));
                span.setStatus({ code: SpanStatusCode.ERROR, message: runError });
                subscriber.error(error);
                finalize();
              },
              complete: () => {
                subscriber.complete();
                finalize();
              },
            }),
          ));

          return () => {
            subscription.unsubscribe();
            finalize();
          };
        });
      }
    }();
  }
}
