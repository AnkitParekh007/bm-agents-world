import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AgentTelemetryStore, type AgentRunUsage } from "./agent-telemetry.js";
import { CapabilityBroker } from "./capability-broker.js";
import type { CapabilityAdapter, CapabilityDefinition, ExecutionContext } from "./capability-types.js";
import { enrichQaPilotRuns, enrichQaPilotSummary } from "./pilot-telemetry-view.js";
import type { QaPilotRunMetrics, QaPilotSummary } from "./qa-pilot-observability.js";

const definition: CapabilityDefinition = {
  id: "qa.test.read",
  system: "test",
  action: "read",
  description: "test capability",
  riskLevel: "L0",
  approvalMode: "none",
  actionClass: "read",
  externalWrite: false,
  productionMutation: false,
  allowedEnvironments: ["qa"],
  adapterId: "test-adapter",
};

const adapter: CapabilityAdapter = {
  id: "test-adapter",
  execute: async () => ({ ok: true, mode: "live", externalSideEffect: false }),
};

function usage(runId: string, status: "measured" | "unavailable", tokens: number | null): AgentRunUsage {
  return {
    agentRunId: runId,
    threadId: `thread-${runId}`,
    tenantId: "tenant-a",
    userId: "qa@example.com",
    agentId: "qa",
    model: "openai:test-model",
    provider: "openai",
    startedAt: "2026-08-10T00:00:00.000Z",
    finishedAt: "2026-08-10T00:00:01.000Z",
    durationMs: 1000,
    eventCount: 10,
    toolCallCount: 2,
    modelCallCount: status === "measured" ? 1 : 0,
    inputTokens: tokens === null ? null : tokens - 20,
    outputTokens: tokens === null ? null : 20,
    totalTokens: tokens,
    usageStatus: status,
    estimatedCostUsd: status === "measured" ? 0.01 : null,
    costStatus: status === "measured" ? "configured_estimate" : "unavailable",
  };
}

function baseRun(runId: string): QaPilotRunMetrics {
  return {
    runId,
    tenantId: "tenant-a",
    projectId: "PCC",
    environment: "qa",
    userId: "qa@example.com",
    agentId: "qa",
    startedAt: "2026-08-10T00:00:00.000Z",
    finishedAt: "2026-08-10T00:00:02.000Z",
    durationMs: 2000,
    actionCount: 1,
    executedActions: 1,
    failedActions: 0,
    rejectedActions: 0,
    liveActions: 1,
    externalSideEffects: 0,
    approvalsRequested: 0,
    approvalsApproved: 0,
    approvalsRejected: 0,
    approvalLatencyMs: null,
    selectedTests: 0,
    passedTests: 0,
    failedTests: 0,
    bugDraftGenerated: false,
    duplicateCandidates: 0,
    jiraDefectCreated: false,
    capabilities: [],
    modelUsage: {
      status: "not_instrumented",
      calls: null,
      inputTokens: null,
      outputTokens: null,
      estimatedCostUsd: null,
    },
  };
}

function baseSummary(): QaPilotSummary {
  return {
    periodDays: 7,
    totalRuns: 1,
    evaluatedRuns: 0,
    evaluatedSuccessRate: null,
    averageUsefulnessScore: null,
    wouldUseAgainRate: null,
    falsePositiveDefectRate: null,
    averageManualOverrideMinutes: null,
    averageRunDurationMs: 2000,
    actionSuccessRate: 1,
    approvalRejectionRate: null,
    totalSelectedTests: 0,
    totalPassedTests: 0,
    totalFailedTests: 0,
    browserPassRate: null,
    bugDraftsGenerated: 0,
    jiraDefectsCreated: 0,
    liveActions: 1,
    externalSideEffects: 0,
    modelUsageStatus: "not_instrumented",
  };
}

test("QA observability distinguishes partial measured model usage and capability latency", async () => {
  const root = mkdtempSync(join(tmpdir(), "bm-pilot-telemetry-view-"));
  const telemetry = new AgentTelemetryStore(join(root, "telemetry.sqlite"));
  const broker = new CapabilityBroker([definition], [adapter]);
  const context: ExecutionContext = {
    runId: "11111111-1111-4111-8111-111111111111",
    userId: "qa@example.com",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-a",
    requestedAt: "2026-08-10T00:00:00.000Z",
  };
  try {
    const action = broker.requestAction(definition.id, context, {});
    await broker.executeAction(action.id);

    telemetry.saveRun(usage("agent-measured", "measured", 120));
    telemetry.saveRun(usage("agent-unavailable", "unavailable", null));
    telemetry.linkQaRun(context.runId, "agent-measured");
    telemetry.linkQaRun(context.runId, "agent-unavailable");

    const enriched = enrichQaPilotRuns([baseRun(context.runId)], telemetry, broker);
    const run = enriched[0]!;
    assert.equal(run.modelUsage.status, "partial");
    assert.equal(run.modelUsage.agentRuns, 2);
    assert.equal(run.modelUsage.measuredAgentRuns, 1);
    assert.equal(run.modelUsage.totalTokens, 120);
    assert.equal(run.modelUsage.estimatedCostUsd, 0.01);
    assert.equal(run.executionTelemetry.measuredExecutions, 1);
    assert.equal(run.executionTelemetry.byCapability[0]?.capabilityId, definition.id);

    const summary = enrichQaPilotSummary(baseSummary(), enriched);
    assert.equal(summary.modelUsageStatus, "partial");
    assert.equal(summary.modelUsageCoverage, 1);
    assert.equal(summary.totalModelCalls, 1);
    assert.equal(summary.totalTokens, 120);
    assert.equal(summary.estimatedCostUsd, 0.01);
    assert.equal(summary.measuredCapabilityExecutions, 1);
  } finally {
    telemetry.close();
    rmSync(root, { recursive: true, force: true });
  }
});
