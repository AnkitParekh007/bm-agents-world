import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { ArtifactStore } from "../platform/artifact-store.js";
import type { ExecutionContext } from "../platform/capability-types.js";
import { QA_CAPABILITIES } from "./qa-capabilities.js";
import { QaTestPlanAdapter } from "./qa-testplan-adapter.js";

const context: ExecutionContext = {
  runId: "run-testplan",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-test",
  requestedAt: "2026-08-14T00:00:00.000Z",
};

const definition = QA_CAPABILITIES.find((item) => item.id === "qa.testplan.generate");

test("a valid plan is persisted as an immutable run-scoped test-plan artifact", async () => {
  assert.ok(definition, "qa.testplan.generate must be registered");
  const directory = mkdtempSync(resolve(tmpdir(), "bm-testplan-"));
  try {
    const store = new ArtifactStore(directory);
    const adapter = new QaTestPlanAdapter(store);
    const result = await adapter.execute(definition, context, {
      storyId: "PCC-123",
      scope: ["Supplier search happy path", "Authorization filtering"],
      testTypes: ["functional", "regression"],
      entryCriteria: ["Story is Ready for QA", "QA environment is deployed"],
      exitCriteria: ["All critical cases pass", "No open blockers"],
      cases: [
        {
          title: "Search returns only authorized suppliers",
          priority: "high",
          steps: [{ action: "Open supplier search", expected: "Search form is visible" }],
          expectedResult: "Only authorized suppliers are returned",
          tags: ["search", "authorization"],
        },
        { title: "", priority: "nonsense" },
      ],
    });

    assert.equal(result.ok, true);
    assert.equal(result.externalSideEffect, false);
    const data = result.data as any;
    assert.ok(data.testPlanArtifactId);
    assert.equal(data.caseCount, 1, "the empty-title case must be dropped");

    const loaded = store.readJson<any>(data.testPlanArtifactId, "test-plan");
    assert.ok(loaded);
    assert.equal(loaded!.record.runId, "run-testplan");
    assert.equal(loaded!.value.projectId, "PCC");
    assert.equal(loaded!.value.environment, "qa");
    assert.equal(loaded!.value.cases.length, 1);
    assert.equal(loaded!.value.cases[0].priority, "high");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("a plan missing required sections is rejected before any artifact is written", async () => {
  assert.ok(definition);
  const directory = mkdtempSync(resolve(tmpdir(), "bm-testplan-"));
  try {
    const store = new ArtifactStore(directory);
    const adapter = new QaTestPlanAdapter(store);
    const result = await adapter.execute(definition, context, {
      scope: [],
      testTypes: ["functional"],
      entryCriteria: ["ready"],
      exitCriteria: ["done"],
    });
    assert.equal(result.ok, false);
    assert.match(result.error ?? "", /scope|testTypes|entryCriteria|exitCriteria/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
