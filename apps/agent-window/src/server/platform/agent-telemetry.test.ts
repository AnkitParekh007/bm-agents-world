import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AgentTelemetryStore, collectUsageEvidence, type AgentRunUsage } from "./agent-telemetry.js";

test("usage extraction accepts provider metadata and ignores unrelated numbers", () => {
  const event = {
    type: "RAW",
    id: "response-1",
    rawEvent: {
      response: {
        id: "response-1",
        usage: {
          input_tokens: 120,
          output_tokens: 30,
          total_tokens: 150,
        },
        latency_ms: 999,
      },
    },
  };

  const evidence = collectUsageEvidence(event);
  assert.ok(evidence.some((item) => item.inputTokens === 120 && item.outputTokens === 30 && item.totalTokens === 150));
  assert.ok(!evidence.some((item) => item.totalTokens === 999));
});

test("agent telemetry persists measured usage and durable QA links", () => {
  const root = mkdtempSync(join(tmpdir(), "bm-agent-telemetry-"));
  const path = join(root, "state.sqlite");
  const store = new AgentTelemetryStore(path);
  try {
    const usage: AgentRunUsage = {
      agentRunId: "agent-run-1",
      threadId: "thread-1",
      tenantId: "tenant-a",
      userId: "qa@example.com",
      agentId: "qa",
      model: "openai:test-model",
      provider: "openai",
      startedAt: "2026-08-10T00:00:00.000Z",
      finishedAt: "2026-08-10T00:00:02.000Z",
      durationMs: 2000,
      eventCount: 12,
      toolCallCount: 3,
      modelCallCount: 2,
      inputTokens: 1000,
      outputTokens: 200,
      totalTokens: 1200,
      usageStatus: "measured",
      estimatedCostUsd: 0.0123,
      costStatus: "configured_estimate",
      traceId: "0123456789abcdef0123456789abcdef",
      spanId: "0123456789abcdef",
    };
    store.saveRun(usage);
    store.linkQaRun("qa-run-1", usage.agentRunId);

    const rows = store.listForQaRun("qa-run-1");
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.inputTokens, 1000);
    assert.equal(rows[0]?.modelCallCount, 2);
    assert.equal(rows[0]?.estimatedCostUsd, 0.0123);
    assert.equal(rows[0]?.traceId, usage.traceId);
  } finally {
    store.close();
    rmSync(root, { recursive: true, force: true });
  }
});
