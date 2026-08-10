import type { AgentRunUsage } from "./agent-telemetry.js";
import type { CapabilityBrokerContract } from "./capability-broker-contract.js";
import type { PostgresRuntimeStore } from "./postgres-runtime-store.js";
import type { QaPilotRunMetrics, QaPilotSummary } from "./qa-pilot-observability.js";
import {
  enrichQaPilotSummary,
  type EnrichedQaPilotRunMetrics,
  type EnrichedQaPilotSummary,
  type QaRunExecutionTelemetry,
  type QaRunModelUsage,
} from "./pilot-telemetry-view.js";

function sumNullable(values: Array<number | null>): number | null {
  const measured = values.filter((value): value is number => value !== null);
  return measured.length ? measured.reduce((sum, value) => sum + value, 0) : null;
}

function aggregateUsage(agentRuns: AgentRunUsage[]): QaRunModelUsage {
  const measured = agentRuns.filter((run) => run.usageStatus === "measured");
  const costMeasured = measured.filter((run) => run.costStatus === "configured_estimate" && run.estimatedCostUsd !== null);
  const status: QaRunModelUsage["status"] = agentRuns.length === 0 || measured.length === 0
    ? "unavailable"
    : measured.length === agentRuns.length ? "measured" : "partial";
  const costStatus: QaRunModelUsage["costStatus"] = costMeasured.length === 0
    ? "unavailable"
    : costMeasured.length === measured.length && measured.length === agentRuns.length
      ? "configured_estimate"
      : "partial";
  return {
    status,
    agentRuns: agentRuns.length,
    measuredAgentRuns: measured.length,
    modelCalls: measured.reduce((sum, run) => sum + run.modelCallCount, 0),
    toolCalls: agentRuns.reduce((sum, run) => sum + run.toolCallCount, 0),
    inputTokens: sumNullable(measured.map((run) => run.inputTokens)),
    outputTokens: sumNullable(measured.map((run) => run.outputTokens)),
    totalTokens: sumNullable(measured.map((run) => run.totalTokens)),
    estimatedCostUsd: sumNullable(costMeasured.map((run) => run.estimatedCostUsd)),
    costStatus,
    models: [...new Set(agentRuns.map((run) => run.model))].sort(),
    providers: [...new Set(agentRuns.map((run) => run.provider))].sort(),
    traceIds: [...new Set(agentRuns.map((run) => run.traceId).filter((value): value is string => Boolean(value)))],
  };
}

async function executionTelemetry(runId: string, broker: CapabilityBrokerContract): Promise<QaRunExecutionTelemetry> {
  const actions = (await broker.listActionsForRun(runId)).filter((action) => Number.isFinite(action.executionDurationMs));
  const byCapability = new Map<string, { executions: number; totalMs: number }>();
  for (const action of actions) {
    const duration = Math.max(0, Number(action.executionDurationMs));
    const current = byCapability.get(action.capabilityId) ?? { executions: 0, totalMs: 0 };
    current.executions += 1;
    current.totalMs += duration;
    byCapability.set(action.capabilityId, current);
  }
  const total = actions.reduce((sum, action) => sum + Math.max(0, Number(action.executionDurationMs)), 0);
  return {
    measuredExecutions: actions.length,
    averageCapabilityDurationMs: actions.length ? Math.round(total / actions.length) : null,
    totalCapabilityDurationMs: total,
    byCapability: [...byCapability.entries()]
      .map(([capabilityId, metric]) => ({
        capabilityId,
        executions: metric.executions,
        totalMs: metric.totalMs,
        averageMs: Math.round(metric.totalMs / metric.executions),
      }))
      .sort((left, right) => right.totalMs - left.totalMs),
  };
}

export async function enrichQaPilotRunsShared(
  runs: QaPilotRunMetrics[],
  store: PostgresRuntimeStore,
  broker: CapabilityBrokerContract,
): Promise<EnrichedQaPilotRunMetrics[]> {
  return Promise.all(runs.map(async (run) => {
    const { modelUsage: _legacyModelUsage, ...base } = run;
    const [usage, execution] = await Promise.all([
      store.listForQaRun(run.runId),
      executionTelemetry(run.runId, broker),
    ]);
    return {
      ...base,
      modelUsage: aggregateUsage(usage),
      executionTelemetry: execution,
    };
  }));
}

export async function enrichQaPilotSummaryShared(
  summary: QaPilotSummary,
  runs: EnrichedQaPilotRunMetrics[],
): Promise<EnrichedQaPilotSummary> {
  return enrichQaPilotSummary(summary, runs);
}
