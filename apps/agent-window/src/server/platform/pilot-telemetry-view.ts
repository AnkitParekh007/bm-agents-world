import type { AgentRunUsage, AgentTelemetryStore } from "./agent-telemetry.js";
import type { CapabilityBroker } from "./capability-broker.js";
import type { QaPilotRunMetrics, QaPilotSummary } from "./qa-pilot-observability.js";

export interface QaRunModelUsage {
  status: "measured" | "partial" | "unavailable";
  agentRuns: number;
  measuredAgentRuns: number;
  modelCalls: number;
  toolCalls: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  costStatus: "configured_estimate" | "partial" | "unavailable";
  models: string[];
  providers: string[];
  traceIds: string[];
}

export interface CapabilityLatencyMetric {
  capabilityId: string;
  executions: number;
  averageMs: number;
  totalMs: number;
}

export interface QaRunExecutionTelemetry {
  measuredExecutions: number;
  averageCapabilityDurationMs: number | null;
  totalCapabilityDurationMs: number;
  byCapability: CapabilityLatencyMetric[];
}

export type EnrichedQaPilotRunMetrics = Omit<QaPilotRunMetrics, "modelUsage"> & {
  modelUsage: QaRunModelUsage;
  executionTelemetry: QaRunExecutionTelemetry;
};

export type EnrichedQaPilotSummary = Omit<QaPilotSummary, "modelUsageStatus"> & {
  modelUsageStatus: "measured" | "partial" | "unavailable";
  modelUsageCoverage: number | null;
  totalModelCalls: number;
  totalInputTokens: number | null;
  totalOutputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  costStatus: "configured_estimate" | "partial" | "unavailable";
  averageCapabilityDurationMs: number | null;
  measuredCapabilityExecutions: number;
};

function sumNullable(values: Array<number | null>): number | null {
  const measured = values.filter((value): value is number => value !== null);
  return measured.length ? measured.reduce((sum, value) => sum + value, 0) : null;
}

function aggregateUsage(agentRuns: AgentRunUsage[]): QaRunModelUsage {
  const measured = agentRuns.filter((run) => run.usageStatus === "measured");
  const costMeasured = measured.filter((run) => run.costStatus === "configured_estimate" && run.estimatedCostUsd !== null);
  const status: QaRunModelUsage["status"] = agentRuns.length === 0 || measured.length === 0
    ? "unavailable"
    : measured.length === agentRuns.length
      ? "measured"
      : "partial";
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

function executionTelemetry(runId: string, broker: CapabilityBroker): QaRunExecutionTelemetry {
  const actions = broker.listActionsForRun(runId).filter((action) => Number.isFinite(action.executionDurationMs));
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

export function enrichQaPilotRuns(
  runs: QaPilotRunMetrics[],
  telemetryStore: AgentTelemetryStore,
  broker: CapabilityBroker,
): EnrichedQaPilotRunMetrics[] {
  return runs.map((run) => {
    const { modelUsage: _legacyModelUsage, ...base } = run;
    return {
      ...base,
      modelUsage: aggregateUsage(telemetryStore.listForQaRun(run.runId)),
      executionTelemetry: executionTelemetry(run.runId, broker),
    };
  });
}

export function enrichQaPilotSummary(
  summary: QaPilotSummary,
  runs: EnrichedQaPilotRunMetrics[],
): EnrichedQaPilotSummary {
  const runsWithUsage = runs.filter((run) => run.modelUsage.status !== "unavailable");
  const fullyMeasuredRuns = runs.filter((run) => run.modelUsage.status === "measured");
  const costRuns = runs.filter((run) => run.modelUsage.estimatedCostUsd !== null);
  const input = sumNullable(runs.map((run) => run.modelUsage.inputTokens));
  const output = sumNullable(runs.map((run) => run.modelUsage.outputTokens));
  const totalTokens = sumNullable(runs.map((run) => run.modelUsage.totalTokens));
  const estimatedCost = sumNullable(runs.map((run) => run.modelUsage.estimatedCostUsd));
  const measuredDurations = runs.flatMap((run) => run.executionTelemetry.measuredExecutions
    ? [{ count: run.executionTelemetry.measuredExecutions, total: run.executionTelemetry.totalCapabilityDurationMs }]
    : []);
  const executionCount = measuredDurations.reduce((sum, item) => sum + item.count, 0);
  const executionTotal = measuredDurations.reduce((sum, item) => sum + item.total, 0);

  const modelUsageStatus: EnrichedQaPilotSummary["modelUsageStatus"] = runs.length === 0 || runsWithUsage.length === 0
    ? "unavailable"
    : fullyMeasuredRuns.length === runs.length
      ? "measured"
      : "partial";
  const costStatus: EnrichedQaPilotSummary["costStatus"] = costRuns.length === 0
    ? "unavailable"
    : costRuns.length === runs.length && runs.every((run) => run.modelUsage.costStatus === "configured_estimate")
      ? "configured_estimate"
      : "partial";
  const { modelUsageStatus: _legacyModelUsageStatus, ...baseSummary } = summary;

  return {
    ...baseSummary,
    modelUsageStatus,
    modelUsageCoverage: runs.length ? Number((runsWithUsage.length / runs.length).toFixed(4)) : null,
    totalModelCalls: runs.reduce((sum, run) => sum + run.modelUsage.modelCalls, 0),
    totalInputTokens: input,
    totalOutputTokens: output,
    totalTokens,
    estimatedCostUsd: estimatedCost === null ? null : Number(estimatedCost.toFixed(8)),
    costStatus,
    averageCapabilityDurationMs: executionCount ? Math.round(executionTotal / executionCount) : null,
    measuredCapabilityExecutions: executionCount,
  };
}
