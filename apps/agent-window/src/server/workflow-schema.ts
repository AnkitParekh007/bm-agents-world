import { z } from "zod";

/**
 * Workflow schema (Phase 5).
 *
 * Pack workflows are declarative DAGs: ordered steps, each carrying the agent /
 * tool / gate that runs it and the steps it depends on. This schema validates
 * that structure permissively (packs vary), leaving DAG-level checks —
 * uniqueness, resolvable dependencies, acyclicity — to the compiler.
 */

const StringOrNumber = z.union([z.string(), z.number()]);

export const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  agent: z.string().optional(),
  tool: z.string().optional(),
  skill: z.string().optional(),
  type: z.string().optional(),
  action: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  parallelGroup: z.string().optional(),
  idempotent: z.boolean().optional(),
});

export const WorkflowSchema = z.object({
  apiVersion: z.string().optional(),
  kind: z.string().optional(),
  metadata: z.object({ id: z.string().optional(), version: StringOrNumber.optional() }).optional(),
  trigger: z.string().optional(),
  inputs: z.array(z.string()).optional(),
  steps: z.array(WorkflowStepSchema).optional(),
  outputs: z.array(z.string()).optional(),
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
