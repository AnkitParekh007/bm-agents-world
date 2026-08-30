import { randomUUID } from "node:crypto";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import type { ArtifactRepository } from "../platform/artifact-store.js";

function cleanText(value: unknown, max = 2000): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function stringList(value: unknown, limit = 40, max = 500): string[] {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, max)).filter(Boolean).slice(0, limit)
    : [];
}

interface NormalizedChange {
  path: string;
  kind: "add" | "modify" | "delete";
  rationale: string;
}

const CHANGE_KINDS: NormalizedChange["kind"][] = ["add", "modify", "delete"];

function normalizeChanges(value: unknown): NormalizedChange[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 100)
    .map((raw): NormalizedChange | undefined => {
      if (!raw || typeof raw !== "object") return undefined;
      const record = raw as Record<string, unknown>;
      const path = cleanText(record.path, 400);
      if (!path) return undefined;
      const kind = CHANGE_KINDS.includes(record.kind as NormalizedChange["kind"])
        ? (record.kind as NormalizedChange["kind"])
        : "modify";
      return { path, kind, rationale: cleanText(record.rationale, 1000) };
    })
    .filter((change): change is NormalizedChange => Boolean(change));
}

/**
 * Persists a governed, story-scoped implementation plan as an immutable run
 * artifact — the frontend counterpart of the QA test-plan adapter.
 *
 * The plan's content is model-authored, because deciding how to implement a
 * story is reasoning. What the server owns is everything that makes the plan
 * evidence rather than prose: the required structure is validated, the real
 * project / environment / run scope is stamped on, and the result is written
 * once to immutable storage so later steps (and any human approving a write)
 * refer to the exact plan that was reviewed. It performs no external side
 * effect and touches no file in the target repository.
 */
export class FrontendPlanAdapter implements CapabilityAdapter {
  readonly id = "frontend-plan-adapter";

  constructor(private readonly artifacts: ArtifactRepository) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "frontend.plan.generate") {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Frontend plan adapter does not implement ${definition.id}` };
    }

    try {
      const summary = cleanText(payload.summary, 3000);
      const affectedComponents = stringList(payload.affectedComponents, 60, 200);
      const steps = stringList(payload.steps, 60);
      const rollback = stringList(payload.rollback, 30);
      if (!summary || !affectedComponents.length || !steps.length || !rollback.length) {
        throw new Error("An implementation plan requires a non-empty summary, affectedComponents, steps, and rollback.");
      }

      const changes = normalizeChanges(payload.changes);
      const plan = {
        artifactId: randomUUID(),
        storyId: cleanText(payload.storyId, 100) || undefined,
        projectId: context.projectId,
        environment: context.environment,
        summary,
        affectedComponents,
        changes,
        steps,
        rollback,
        risks: stringList(payload.risks, 30),
        outOfScope: stringList(payload.outOfScope, 40),
        testStrategy: stringList(payload.testStrategy, 30),
        accessibilityNotes: stringList(payload.accessibilityNotes, 30),
        source: "bm-agents-world-frontend-planning",
        generatedAt: new Date().toISOString(),
      };

      const artifact = await this.artifacts.writeJson(
        context.runId,
        "implementation-plan",
        "implementation-plan.json",
        plan,
        { classification: "internal-engineering-plan" },
      );

      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          implementationPlanArtifact: artifact,
          implementationPlanArtifactId: artifact.id,
          implementationPlanSha256: artifact.sha256,
          storyId: plan.storyId,
          changeCount: changes.length,
          note: "Immutable story-scoped implementation plan persisted as evidence. Plan content is model-authored; structure and scope were validated server-side. No repository or external system was written.",
        },
      };
    } catch (error) {
      return { ok: false, mode: "live", externalSideEffect: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
