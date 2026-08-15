import { canonicalHash, canonicalize } from "./platform/canonical.js";
import type { AgentPack, PackWorkflowContent } from "./pack-registry.js";

/**
 * Pack compiler (Phase 2).
 *
 * Turns a loaded pack into a deterministic, normalized definition plus a stable
 * content hash. The compiled form is the unit of identity for a pack: the same
 * pack always compiles to the same `contentHash` regardless of key ordering or
 * incidental field order, and any change to what the pack actually declares
 * changes the hash.
 *
 * Crucially, identity is computed *per component* from the real normalized
 * contents of each governance-bearing registry — not from item counts. Swapping
 * one skill for another (count unchanged), relaxing an approval policy, or
 * editing a permission row all change the relevant component hash and therefore
 * the package hash. `contentHash` (the package hash) is the hash of the
 * component-hash record, so drift governance can both detect *that* a pack
 * changed and report *which* component changed.
 */

export interface CompiledAgent {
  id: string;
  role?: string;
  purpose?: string;
  enabled: boolean;
}

export interface PackComponentHashes {
  /** Identity fields: id, name, version, supervisor, projects, environments, default policy. */
  manifest: string;
  agents: string;
  skills: string;
  mcpServers: string;
  plugins: string;
  artifacts: string;
  workflows: string;
  /** approval-policies.yaml */
  policies: string;
  /** permission-matrix.csv */
  permissions: string;
}

export interface CompiledPack {
  id: string;
  packName: string;
  version: string;
  supervisor: string;
  projects: string[];
  environments: string[];
  agents: CompiledAgent[];
  counts: {
    skills: number;
    mcpServers: number;
    plugins: number;
    artifacts: number;
    workflows: number;
    tasks: number;
    subAgents: number;
  };
  policy: {
    production?: string;
    externalWrites?: string;
    secretValuesVisibleToModel?: boolean;
  };
  valid: boolean;
  /** Per-component content hashes (the basis for `contentHash`). */
  components: PackComponentHashes;
  /** SHA-256 of the component-hash record above — the pack (package) hash. */
  contentHash: string;
}

function sortedStrings(values: string[]): string[] {
  return [...values].map(String).sort((a, b) => a.localeCompare(b));
}

function compileAgents(pack: AgentPack): CompiledAgent[] {
  return pack.subAgents
    .map((agent) => ({
      id: agent.id,
      role: agent.role,
      purpose: agent.purpose,
      enabled: agent.enabled !== false,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Canonicalizes a list and sorts it by its canonical form, so a registry's hash
 * is sensitive to the content of each entry but insensitive to entry order
 * (reordering a registry is not drift; changing an entry is).
 */
function normalizeList(items: unknown): unknown[] {
  const array = Array.isArray(items) ? items : [];
  return array
    .map((item) => canonicalize(item))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

/** Workflows keep their file identity; content is canonicalized, order by name. */
function normalizeWorkflows(items: PackWorkflowContent[] | undefined): unknown[] {
  return [...(items ?? [])]
    .map((workflow) => ({ name: workflow.name, content: canonicalize(workflow.content) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Compiles a loaded pack into its deterministic, content-addressed form. */
export function compilePack(pack: AgentPack): CompiledPack {
  const projects = sortedStrings(pack.projects);
  const environments = sortedStrings(pack.environments);
  const agents = compileAgents(pack);
  const policy = {
    production: pack.policy.production,
    externalWrites: pack.policy.externalWrites,
    secretValuesVisibleToModel: pack.policy.secretValuesVisibleToModel,
  };
  const content = pack.content;

  const components: PackComponentHashes = {
    manifest: canonicalHash({
      id: pack.id,
      packName: pack.packName,
      version: pack.version,
      supervisor: pack.supervisor,
      projects,
      environments,
      policy,
    }),
    agents: canonicalHash(agents),
    skills: canonicalHash(normalizeList(content?.skills)),
    mcpServers: canonicalHash(normalizeList(content?.mcpServers)),
    plugins: canonicalHash(normalizeList(content?.plugins)),
    artifacts: canonicalHash(normalizeList(content?.artifacts)),
    workflows: canonicalHash(normalizeWorkflows(content?.workflows)),
    policies: canonicalHash(canonicalize(content?.policies ?? {})),
    permissions: canonicalHash(content?.permissions ?? ""),
  };

  return {
    id: pack.id,
    packName: pack.packName,
    version: pack.version,
    supervisor: pack.supervisor,
    projects,
    environments,
    agents,
    counts: {
      skills: pack.skillCount,
      mcpServers: pack.mcpCount,
      plugins: pack.pluginCount,
      artifacts: pack.artifactCount,
      workflows: pack.workflowCount,
      tasks: pack.taskCount,
      subAgents: pack.subAgents.length,
    },
    policy,
    valid: pack.validation.ok,
    components,
    contentHash: canonicalHash(components),
  };
}
