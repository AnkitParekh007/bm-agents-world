import { z } from "zod";

/**
 * Pack v2 schema (Phase 1).
 *
 * The pack corpus is heterogeneous — some manifests declare fields under
 * `spec`, others at the top level, and only some carry `kind`/`apiVersion`.
 * This schema is deliberately permissive: every field the loader treats as
 * optional stays optional, so the entire existing corpus validates cleanly.
 * Its teeth are structural — types must be right (a name is a string, an agent
 * list is a list of agents each with a non-empty id). A malformed manifest
 * (wrong types, an agent without an id, a registry map that is not string ->
 * string) is reported as invalid, and the loader can fail such a pack closed in
 * production while continuing to load it in development.
 *
 * Validation is decoupled from extraction: the loader still reads values from
 * the raw parsed YAML, so adopting the schema changes no field-reading
 * behaviour. Later phases build the compiled pack model on top of these types.
 */

const StringOrNumber = z.union([z.string(), z.number()]);

export const PackManifestMetadataSchema = z.object({
  name: z.string().min(1).optional(),
  version: StringOrNumber.optional(),
  owner: z.string().optional(),
});

export const PackDefaultPolicySchema = z.object({
  production: z.string().optional(),
  externalWrites: z.string().optional(),
  secretValuesVisibleToModel: z.boolean().optional(),
});

export const PackManifestSpecSchema = z.object({
  supervisor: z.string().optional(),
  projects: z.array(StringOrNumber).optional(),
  environments: z.array(StringOrNumber).optional(),
  registries: z.record(z.string(), z.string()).optional(),
  defaultPolicy: PackDefaultPolicySchema.optional(),
});

export const PackManifestSchema = z.object({
  apiVersion: z.string().optional(),
  kind: z.string().optional(),
  metadata: PackManifestMetadataSchema.optional(),
  spec: PackManifestSpecSchema.optional(),
});

export const PackAgentSchema = z.object({
  id: z.string().min(1),
  role: z.string().optional(),
  mode: z.string().optional(),
  name: z.string().optional(),
  purpose: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const AgentRegistrySchema = z.object({
  apiVersion: z.string().optional(),
  kind: z.string().optional(),
  agents: z.array(PackAgentSchema).optional(),
});

export type PackManifest = z.infer<typeof PackManifestSchema>;
export type AgentRegistryDocument = z.infer<typeof AgentRegistrySchema>;

export interface PackValidation {
  ok: boolean;
  issues: string[];
}

function issuesFromError(error: z.ZodError, source: string): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    return `${source}: ${path}: ${issue.message}`;
  });
}

/** Validates a parsed pack manifest, returning structural issues (empty = ok). */
export function validatePackManifest(raw: unknown): PackValidation {
  const result = PackManifestSchema.safeParse(raw);
  return result.success
    ? { ok: true, issues: [] }
    : { ok: false, issues: issuesFromError(result.error, "pack-manifest") };
}

/** Validates a parsed agent registry, returning structural issues (empty = ok). */
export function validateAgentRegistry(raw: unknown): PackValidation {
  const result = AgentRegistrySchema.safeParse(raw);
  return result.success
    ? { ok: true, issues: [] }
    : { ok: false, issues: issuesFromError(result.error, "agent-registry") };
}

/** Merges several validations into one (ok only when all are ok). */
export function mergeValidations(...validations: PackValidation[]): PackValidation {
  const issues = validations.flatMap((validation) => validation.issues);
  return { ok: issues.length === 0, issues };
}
