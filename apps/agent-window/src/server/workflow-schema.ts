import { z } from "zod";

/**
 * Workflow schema (Phase 5, generalized in Phase 9).
 *
 * Pack workflows are declarative DAGs: ordered steps, each carrying the agent /
 * tool / gate that runs it and the steps it depends on. This schema validates
 * that structure permissively (packs vary), leaving DAG-level checks —
 * uniqueness, resolvable dependencies, acyclicity — to the compiler.
 *
 * Packs authored independently use different but equivalent dialects. QA writes
 * the DAG at the document root with one `skill` per step; the frontend pack
 * nests it under `spec` and lists several skills under `uses`. Both are valid
 * statements of the same graph, so the schema accepts either and
 * {@link normalizeWorkflowDocument} reduces them to one shape the compiler
 * consumes. Adding a dialect here is what a new vertical costs — the compiler,
 * executor, and governed runner never learn about packs.
 */

const StringOrNumber = z.union([z.string(), z.number()]);

export const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  agent: z.string().optional(),
  tool: z.string().optional(),
  skill: z.string().optional(),
  /** Multi-skill dialect: a step may list the skills it exercises. */
  uses: z.array(z.string()).optional(),
  type: z.string().optional(),
  /**
   * A named external operation (`git.push`, `jira.write`). Like `tool` this
   * declares a concrete side effect, so the governed runner refuses to run one
   * that a pack has not bound to a capability.
   */
  action: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  parallelGroup: z.string().optional(),
  idempotent: z.boolean().optional(),
});

const WorkflowBodySchema = z.object({
  trigger: z.string().optional(),
  initialState: z.string().optional(),
  inputs: z.array(z.string()).optional(),
  steps: z.array(WorkflowStepSchema).optional(),
  outputs: z.array(z.string()).optional(),
});

export const WorkflowSchema = WorkflowBodySchema.extend({
  apiVersion: z.string().optional(),
  kind: z.string().optional(),
  metadata: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      version: StringOrNumber.optional(),
    })
    .optional(),
  /** Nested dialect: the same body under `spec`. */
  spec: WorkflowBodySchema.optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowDocument = z.infer<typeof WorkflowSchema>;

export interface WorkflowValidation {
  ok: boolean;
  issues: string[];
}

export function validateWorkflow(raw: unknown): WorkflowValidation {
  const result = WorkflowSchema.safeParse(raw);
  if (result.success) return { ok: true, issues: [] };
  return {
    ok: false,
    issues: result.error.issues.map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      return `workflow: ${path}: ${issue.message}`;
    }),
  };
}

/** One dialect-independent step: skills are always a list, id always resolved. */
export interface NormalizedWorkflowStep extends Omit<WorkflowStep, "uses"> {
  skills: string[];
}

export interface NormalizedWorkflow {
  id: string;
  steps: NormalizedWorkflowStep[];
  /** True when the document declared a step list at all (empty is not the same as absent). */
  declaresSteps: boolean;
}

/**
 * Reduces either dialect to one shape. A step's skills come from `skill`,
 * `uses`, or both; `skill` is kept as the first entry so single-skill packs
 * compile to exactly what they did before this generalization.
 */
export function normalizeWorkflowDocument(raw: unknown): NormalizedWorkflow {
  const document = (raw ?? {}) as WorkflowDocument;
  const body = Array.isArray(document.steps) ? document : document.spec ?? {};
  const rawSteps = Array.isArray(body.steps) ? body.steps : undefined;
  const id = document.metadata?.id ?? document.metadata?.name ?? "workflow";

  const steps = (rawSteps ?? []).map((step): NormalizedWorkflowStep => {
    const { uses, ...rest } = step;
    const skills = [step.skill, ...(uses ?? [])].filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    return { ...rest, skill: skills[0], skills: [...new Set(skills)] };
  });

  return { id, steps, declaresSteps: rawSteps !== undefined };
}
