import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { CapabilityAction, ExecutionContext } from "./capability-types.js";
import { SqliteCapabilityStore } from "./capability-store.js";
import { QaPilotObservabilityStore } from "./qa-pilot-observability.js";

function context(runId: string, projectId = "PCC"): ExecutionContext {
  return {
    runId,
    userId: "qa.engineer@example.com",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId,
    environment: "qa",
    tenantId: "tenant-a",
    requestedAt: "2026-08-10T05:00:00.000Z",
  };
}

function action(
  id: string,
  capabilityId: string,
  runContext: ExecutionContext,
  overrides: Partial<CapabilityAction> = {},
): CapabilityAction {
  return {
    id,
    capabilityId,
    context: runContext,
    payload: {},
    payloadHash: `${id}-hash`,
    riskLevel: "L1",
    approvalMode: "standing-policy",
    status: "executed",
    createdAt: "2026-08-10T05:00:01.000Z",
    updatedAt: "2026-08-10T05:00:05.000Z",
    policyReason: "test",
    result: { ok: true, mode: "live", externalSideEffect: false },
    ...overrides,
  };
}

test("derives QA pilot metrics from persisted run actions and stores human evaluation", () => {
  const root = mkdtempSync(join(tmpdir(), "bm-observability-"));
  const databasePath = join(root, "qa.sqlite");
  const capabilityStore = new SqliteCapabilityStore(databasePath);
  try {
    const runContext = context("run-observe-1");
    const run = capabilityStore.upsertRun(runContext);

    capabilityStore.saveAction(action("playwright", "qa.playwright.test.run", runContext, {
      updatedAt: "2026-08-10T05:00:15.000Z",
      result: {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          execution: {
            selectedCases: ["baseline", "supplier-search", "api-check"],
            passed: 2,
            failed: 1,
          },
          bugDraftArtifact: { id: "bug-draft-1" },
        },
      },
    }));

    capabilityStore.saveAction(action("duplicates", "qa.jira.duplicate.search", runContext, {
      updatedAt: "2026-08-10T05:00:20.000Z",
      result: {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: { candidates: [{ key: "PCC-10" }, { key: "PCC-11" }] },
      },
    }));

    capabilityStore.saveAction(action("jira-create", "qa.jira.bug.create", runContext, {
      riskLevel: "L3",
      approvalMode: "human",
      updatedAt: "2026-08-10T05:00:35.000Z",
      approval: {
        id: "approval-1",
        actionId: "jira-create",
        payloadHash: "jira-create-hash",
        riskLevel: "L3",
        status: "approved",
        requestedAt: "2026-08-10T05:00:25.000Z",
        expiresAt: "2026-08-10T05:10:25.000Z",
        decidedAt: "2026-08-10T05:00:30.000Z",
        decidedBy: "qa.lead@example.com",
      },
      result: {
        ok: true,
        mode: "live",
        externalSideEffect: true,
        data: { key: "PCC-900" },
      },
    }));

    capabilityStore.saveAction(action("failed-read", "qa.database.validation.read", runContext, {
      status: "failed",
      updatedAt: "2026-08-10T05:00:40.000Z",
      result: { ok: false, mode: "mock", externalSideEffect: false, error: "not configured" },
    }));

    capabilityStore.close();
    const observability = new QaPilotObservabilityStore(databasePath);
    try {
      const metrics = observability.listRunMetrics({ tenantId: "tenant-a", projectIds: ["PCC"], limit: 10 });
      assert.equal(metrics.length, 1);
      const item = metrics[0]!;
      assert.equal(item.selectedTests, 3);
      assert.equal(item.passedTests, 2);
      assert.equal(item.failedTests, 1);
      assert.equal(item.bugDraftGenerated, true);
      assert.equal(item.duplicateCandidates, 2);
      assert.equal(item.jiraDefectCreated, true);
      assert.equal(item.liveActions, 3);
      assert.equal(item.externalSideEffects, 1);
      assert.equal(item.executedActions, 3);
      assert.equal(item.failedActions, 1);
      assert.equal(item.approvalsApproved, 1);
      assert.equal(item.approvalLatencyMs, 5000);
      assert.equal(item.modelUsage.status, "not_instrumented");

      const saved = observability.saveEvaluation(run, "qa.lead@example.com", {
        outcome: "partially_successful",
        usefulnessScore: 4,
        wouldUseAgain: true,
        falsePositiveDefect: false,
        manualOverrideMinutes: 7,
        notes: "Useful first pilot run.",
      });
      assert.equal(saved.runId, run.id);
      assert.equal(observability.getEvaluation(run.id)?.usefulnessScore, 4);

      const summary = observability.summary({ tenantId: "tenant-a", projectIds: ["PCC"], limit: 20 }, 7);
      assert.equal(summary.totalRuns, 1);
      assert.equal(summary.evaluatedRuns, 1);
      assert.equal(summary.averageUsefulnessScore, 4);
      assert.equal(summary.wouldUseAgainRate, 1);
      assert.equal(summary.falsePositiveDefectRate, 0);
      assert.equal(summary.averageManualOverrideMinutes, 7);
      assert.equal(summary.actionSuccessRate, 0.75);
      assert.equal(summary.browserPassRate, 0.6667);
      assert.equal(summary.bugDraftsGenerated, 1);
      assert.equal(summary.jiraDefectsCreated, 1);
    } finally {
      observability.close();
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("observability scopes run metrics by tenant and authorized project", () => {
  const root = mkdtempSync(join(tmpdir(), "bm-observability-scope-"));
  const databasePath = join(root, "qa.sqlite");
  const capabilityStore = new SqliteCapabilityStore(databasePath);
  try {
    capabilityStore.upsertRun(context("run-pcc", "PCC"));
    capabilityStore.upsertRun(context("run-sop", "SOP"));
    capabilityStore.close();

    const observability = new QaPilotObservabilityStore(databasePath);
    try {
      assert.equal(observability.listRunMetrics({ tenantId: "tenant-a", projectIds: ["PCC"] }).length, 1);
      assert.equal(observability.listRunMetrics({ tenantId: "tenant-a", projectIds: ["PCC", "SOP"], projectId: "SOP" }).length, 1);
      assert.equal(observability.listRunMetrics({ tenantId: "tenant-a", projectIds: ["PCC"], projectId: "SOP" }).length, 0);
      assert.equal(observability.listRunMetrics({ tenantId: "tenant-b", projectIds: ["PCC", "SOP"] }).length, 0);
    } finally {
      observability.close();
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
