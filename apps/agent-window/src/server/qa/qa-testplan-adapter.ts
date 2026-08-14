import { randomUUID } from "node:crypto";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import type { ArtifactRepository } from "../platform/artifact-store.js";
import { projectTestCatalogStatus } from "./qa-project-tests.js";

type Priority = "critical" | "high" | "medium" | "low";
const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

function cleanText(value: unknown, max = 2000): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function stringList(value: unknown, limit = 40, max = 500): string[] {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, max)).filter(Boolean).slice(0, limit)
    : [];
}

interface NormalizedStep {
  action: string;
  expected: string;
  data?: string;
}

interface NormalizedCase {
  id: string;
  title: string;
  priority: Priority;
  preconditions: string[];
  steps: NormalizedStep[];
  expectedResult: string;
  tags: string[];
  requirementIds: string[];
}

function normalizeCases(value: unknown): NormalizedCase[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 100)
    .map((raw, index): NormalizedCase | undefined => {
      if (!raw || typeof raw !== "object") return undefined;
      const record = raw as Record<string, unknown>;
      const title = cleanText(record.title, 255);
      if (!title) return undefined;
      const priority = PRIORITIES.includes(record.priority as Priority) ? (record.priority as Priority) : "medium";
      const steps: NormalizedStep[] = Array.isArray(record.steps)
        ? record.steps
            .slice(0, 50)
            .map((rawStep) => {
              const step = (rawStep ?? {}) as Record<string, unknown>;
              return {
                action: cleanText(step.action, 1000),
                expected: cleanText(step.expected, 1000),
                data: cleanText(step.data, 1000) || undefined,
              };
            })
            .filter((step) => step.action || step.expected)
        : [];
      return {
        id: cleanText(record.id, 100) || `TC-${index + 1}`,
        title,
        priority,
        preconditions: stringList(record.preconditions, 20),
        steps,
        expectedResult: cleanText(record.expectedResult, 3000),
        tags: stringList(record.tags, 20, 60),
        requirementIds: stringList(record.requirementIds, 30, 100),
      };
    })
    .filter((testCase): testCase is NormalizedCase => Boolean(testCase));
}

/** Best-effort traceability from the plan to the allowlisted automated suite. */
function automatedCoverage(projectId: string): { suite: string; allowlistedCaseIds: string[] } {
  try {
    const profile = projectTestCatalogStatus().find(
      (item) => item.projectId.toLowerCase() === projectId.toLowerCase(),
    );
    const suite = profile?.suites.find((item) => item.id === "story-smoke");
    return { suite: "story-smoke", allowlistedCaseIds: suite ? suite.cases.map((testCase) => testCase.id) : [] };
  } catch {
    return { suite: "story-smoke", allowlistedCaseIds: [] };
  }
}

/**
 * Persists a governed, story-scoped QA test plan as an immutable run artifact.
 * The plan content is model-authored (test design is a reasoning task); the
 * server validates the required structure, records real project/environment/run
 * scope, and links the allowlisted automated suite for traceability. It performs
 * no external side effect.
 */
export class QaTestPlanAdapter implements CapabilityAdapter {
  readonly id = "qa-testplan-adapter";

  constructor(private readonly artifacts: ArtifactRepository) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.testplan.generate") {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Test plan adapter does not implement ${definition.id}` };
    }

    try {
      const scope = stringList(payload.scope, 40);
      const testTypes = stringList(payload.testTypes, 20, 100);
      const entryCriteria = stringList(payload.entryCriteria, 30);
      const exitCriteria = stringList(payload.exitCriteria, 30);
      if (!scope.length || !testTypes.length || !entryCriteria.length || !exitCriteria.length) {
        throw new Error("A test plan requires non-empty scope, testTypes, entryCriteria, and exitCriteria.");
      }

      const cases = normalizeCases(payload.cases);
      const plan = {
        artifactId: randomUUID(),
        storyId: cleanText(payload.storyId, 100) || undefined,
        projectId: context.projectId,
        environment: context.environment,
        scope,
        outOfScope: stringList(payload.outOfScope, 40),
        testTypes,
        entryCriteria,
        exitCriteria,
        approvalLevel: cleanText(payload.approvalLevel, 40) || undefined,
        cases,
        automatedCoverage: automatedCoverage(context.projectId),
        source: "bm-agents-world-test-design",
        generatedAt: new Date().toISOString(),
      };

      const artifact = await this.artifacts.writeJson(context.runId, "test-plan", "test-plan.json", plan, {
        classification: "internal-qa-plan",
      });

      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          testPlanArtifact: artifact,
          testPlanArtifactId: artifact.id,
          testPlanSha256: artifact.sha256,
          storyId: plan.storyId,
          caseCount: cases.length,
          automatedCoverage: plan.automatedCoverage,
          note: "Immutable story-scoped QA test plan persisted as evidence. Plan content is model-authored; scope and criteria were validated server-side. No external system was written.",
        },
      };
    } catch (error) {
      return { ok: false, mode: "live", externalSideEffect: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
