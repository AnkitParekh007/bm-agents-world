import { randomUUID } from "node:crypto";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import type { ArtifactRepository, StoredArtifact } from "../platform/artifact-store.js";

function cleanText(value: unknown, max = 200): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

interface TraceNode {
  present: boolean;
  artifactId?: string;
  sha256?: string;
  reason?: string;
  [key: string]: unknown;
}

interface Finding {
  check: string;
  passed: boolean;
  detail: string;
}

/**
 * Correlates the evidence a single QA run has already produced — test plan,
 * execution result, and bug draft — into an immutable traceability artifact,
 * with consistency checks across the steps. There is no external event bus to
 * tap, so correlation is grounded strictly in the run's own persisted artifacts;
 * any reference to another run is reported as a failed finding, never trusted.
 */
export class IntegrationTraceAdapter implements CapabilityAdapter {
  readonly id = "qa-integration-trace-adapter";

  constructor(private readonly artifacts: ArtifactRepository) {}

  private async loadNode(
    id: string,
    expectedType: string,
    runId: string,
  ): Promise<{ node: TraceNode; value?: Record<string, unknown> }> {
    if (!id) return { node: { present: false, reason: "not-provided" } };
    const loaded = await this.artifacts.readJson<Record<string, unknown>>(id, expectedType);
    if (!loaded) return { node: { present: false, artifactId: id, reason: `not a ${expectedType} artifact or not found` } };
    if (loaded.record.runId !== runId) {
      return { node: { present: false, artifactId: id, reason: "belongs to a different run" } };
    }
    const record: StoredArtifact = loaded.record;
    return { node: { present: true, artifactId: record.id, sha256: record.sha256 }, value: loaded.value };
  }

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.integration.trace") {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Integration trace adapter does not implement ${definition.id}` };
    }

    try {
      const plan = await this.loadNode(cleanText(payload.testPlanArtifactId, 100), "test-plan", context.runId);
      const result = await this.loadNode(cleanText(payload.testResultArtifactId, 100), "test-execution-result", context.runId);
      const bug = await this.loadNode(cleanText(payload.bugDraftArtifactId, 100), "bug-draft", context.runId);

      const planStory = cleanText(plan.value?.storyId, 100);
      const resultStory = cleanText(String(result.value?.testCaseId ?? "").split(":")[0], 100);
      const bugStory = cleanText(bug.value?.parentIssue, 100);
      const payloadStory = cleanText(payload.storyId, 100);
      const resultStatus = cleanText(result.value?.status, 40);

      const storyIds = [payloadStory, planStory, resultStory, bugStory].filter(Boolean);
      const distinctStories = [...new Set(storyIds.map((story) => story.toLowerCase()))];

      const findings: Finding[] = [];

      findings.push({
        check: "same-run-references",
        passed: [plan.node, result.node, bug.node].every((node) => node.reason !== "belongs to a different run"),
        detail: "All provided artifacts must belong to this QA run.",
      });

      findings.push({
        check: "story-id-consistency",
        passed: distinctStories.length <= 1,
        detail: distinctStories.length <= 1
          ? `Story ids agree${storyIds.length ? ` (${storyIds[0]})` : " (none provided)"}.`
          : `Conflicting story ids across steps: ${distinctStories.join(", ")}.`,
      });

      if (result.node.present) {
        const failed = resultStatus === "failed";
        findings.push({
          check: "defect-consistency",
          passed: failed ? bug.node.present : !bug.node.present,
          detail: failed
            ? bug.node.present ? "Failed execution has a linked bug draft." : "Failed execution is missing a bug draft."
            : bug.node.present ? "Passing execution should not carry a bug draft." : "Passing execution has no defect, as expected.",
        });
      }

      if (plan.node.present) {
        const caseCount = Array.isArray(plan.value?.cases) ? (plan.value?.cases as unknown[]).length : 0;
        findings.push({
          check: "plan-has-cases",
          passed: caseCount > 0,
          detail: `Test plan defines ${caseCount} case(s).`,
        });
      }

      const trace = {
        traceId: randomUUID(),
        runId: context.runId,
        projectId: context.projectId,
        environment: context.environment,
        storyId: storyIds[0] || undefined,
        changedFiles: Array.isArray(payload.changedFiles) ? payload.changedFiles.map((item) => cleanText(item, 300)).filter(Boolean).slice(0, 200) : [],
        nodes: { testPlan: plan.node, testResult: result.node, bugDraft: bug.node },
        findings,
        consistent: findings.every((finding) => finding.passed),
        source: "bm-agents-world-integration-trace",
        generatedAt: new Date().toISOString(),
      };

      const artifact = await this.artifacts.writeJson(context.runId, "traceability", "integration-trace.json", trace, {
        classification: "internal-qa-evidence",
      });

      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          traceabilityArtifact: artifact,
          traceabilityArtifactId: artifact.id,
          storyId: trace.storyId,
          consistent: trace.consistent,
          findings,
          note: "Run-scoped QA traceability persisted as evidence. Correlation is grounded only in this run's artifacts; cross-run references are reported, not trusted.",
        },
      };
    } catch (error) {
      return { ok: false, mode: "live", externalSideEffect: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
