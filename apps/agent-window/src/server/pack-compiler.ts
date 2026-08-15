import { canonicalHash } from "./platform/canonical.js";
import type { AgentPack } from "./pack-registry.js";

/**
 * Pack compiler (Phase 2).
 *
 * Turns a loaded pack into a deterministic, normalized definition plus a stable
 * content hash. The compiled form is the unit of identity for a pack: the same
 * pack always compiles to the same `contentHash` regardless of key ordering or
 * incidental field order, and any change to what the pack actually declares
 * (version, supervisor, agents, projects, policy, counts) changes the hash.
 * This is the provenance primitive that release/drift governance builds on.
 */

export interface CompiledAgent {
  id: string;
  role?: string;
  purpose?: string;
  enabled: boolean;
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
  /** SHA-256 of the normalized definition above (excludes this field). */
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

/** Compiles a loaded pack into its deterministic, content-addressed form. */
export function compilePack(pack: AgentPack): CompiledPack {
  const definition = {
    id: pack.id,
    packName: pack.packName,
    version: pack.version,
    supervisor: pack.supervisor,
    projects: sortedStrings(pack.projects),
    environments: sortedStrings(pack.environments),
    agents: compileAgents(pack),
    counts: {
      skills: pack.skillCount,
      mcpServers: pack.mcpCount,
      plugins: pack.pluginCount,
      artifacts: pack.artifactCount,
      workflows: pack.workflowCount,
      tasks: pack.taskCount,
      subAgents: pack.subAgents.length,
    },
    policy: {
      production: pack.policy.production,
      externalWrites: pack.policy.externalWrites,
      secretValuesVisibleToModel: pack.policy.secretValuesVisibleToModel,
    },
    valid: pack.validation.ok,
  };

  return { ...definition, contentHash: canonicalHash(definition) };
}
