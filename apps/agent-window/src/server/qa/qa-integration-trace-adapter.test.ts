import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { ArtifactStore } from "../platform/artifact-store.js";
import type { ExecutionContext } from "../platform/capability-types.js";
import { QA_CAPABILITIES } from "./qa-capabilities.js";
import { IntegrationTraceAdapter } from "./qa-integration-trace-adapter.js";

const context: ExecutionContext = {
  runId: "run-trace",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-test",
  requestedAt: "2026-08-14T00:00:00.000Z",
};

const definition = QA_CAPABILITIES.find((item) => item.id === "qa.integration.trace");

test("correlates a consistent run's plan, failed result, and bug draft", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-trace-"));
  try {
    const store = new ArtifactStore(dir);
    const plan = store.writeJson(context.runId, "test-plan", "test-plan.json", { storyId: "PCC-123", cases: [{ title: "c1" }] });
    const result = store.writeJson(context.runId, "test-execution-result", "test-result.json", { runId: context.runId, testCaseId: "PCC-123:story-smoke", status: "failed" });
    const bug = store.writeJson(context.runId, "bug-draft", "bug-draft.json", { title: "x", parentIssue: "PCC-123" });

    const adapter = new IntegrationTraceAdapter(store);
    const output = await adapter.execute(definition, context, {
      storyId: "PCC-123",
      testPlanArtifactId: plan.id,
      testResultArtifactId: result.id,
      bugDraftArtifactId: bug.id,
    });

    assert.equal(output.ok, true);
    const data = output.data as any;
    assert.equal(data.consistent, true);
    assert.equal(data.findings.find((f: any) => f.check === "story-id-consistency").passed, true);
    assert.equal(data.findings.find((f: any) => f.check === "defect-consistency").passed, true);

    const loaded = store.readJson<any>(data.traceabilityArtifactId, "traceability");
    assert.ok(loaded);
    assert.equal(loaded!.record.runId, context.runId);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("flags a cross-run artifact reference and refuses to trust it", async () => {
  assert.ok(definition);
  const dir = mkdtempSync(resolve(tmpdir(), "bm-trace-"));
  try {
    const store = new ArtifactStore(dir);
    const plan = store.writeJson(context.runId, "test-plan", "test-plan.json", { storyId: "PCC-123", cases: [{ title: "c1" }] });
    // Bug draft written under a DIFFERENT run must not be trusted.
    const foreignBug = store.writeJson("some-other-run", "bug-draft", "bug-draft.json", { title: "x", parentIssue: "PCC-999" });

    const adapter = new IntegrationTraceAdapter(store);
    const output = await adapter.execute(definition, context, {
      storyId: "PCC-123",
      testPlanArtifactId: plan.id,
      bugDraftArtifactId: foreignBug.id,
    });

    assert.equal(output.ok, true);
    const data = output.data as any;
    assert.equal(data.consistent, false);
    assert.equal(data.findings.find((f: any) => f.check === "same-run-references").passed, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
