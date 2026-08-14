import type { CompiledPack } from "./pack-compiler.js";
import { resolvePackAgents, type AgentKind } from "./pack-agents.js";

/**
 * Pack runtime planning (Phase 4, parallel + flagged).
 *
 * A `PackRuntimeProvider` supplies the pack-specific pieces the generic runtime
 * needs — how to namespace an agent id, and which governed capabilities each
 * specialist is granted. `planGovernedAgents` combines a provider with the
 * generic agent model (Phase 3) to produce a fully-described, pack-agnostic plan
 * of which scoped agents to instantiate and what each is bound to.
 *
 * Planning is a pure function separated from BuiltInAgent construction so the
 * generic path can be proven equivalent to today's QA special-case in tests
 * (which cannot run the CopilotKit runtime) before that special-case is retired.
 */

export interface PackRuntimeProvider {
  packId: string;
  /** Runtime agent id (namespaced) for a supervisor pack-agent. */
  supervisorRuntimeId(sourceId: string): string;
  /** Runtime agent id (namespaced) for a specialist pack-agent. */
  specialistRuntimeId(sourceId: string): string;
  /**
   * Capabilities granted to a specialist, or undefined when the specialist is
   * not governed (and therefore not instantiated as its own scoped agent).
   */
  grantsFor(sourceId: string): string[] | undefined;
}

export interface GovernedAgentSpec {
  /** Runtime id used to key the agent and bind its governed tools. */
  runtimeId: string;
  /** Pack agent id as declared in the registry. */
  sourceId: string;
  kind: AgentKind;
  purpose?: string;
  /** Granted capability ids; undefined for the supervisor (unscoped). */
  capabilities?: string[];
}

export interface GovernedAgentPlan {
  packId: string;
  supervisor?: GovernedAgentSpec;
  specialists: GovernedAgentSpec[];
  diagnostics: string[];
  ok: boolean;
}

/**
 * Plans the governed multi-agent team for a compiled pack: the (unscoped)
 * supervisor plus one scoped specialist per governed specialist. Specialists
 * without a grant from the provider are left as supervisor context, exactly as
 * the current QA construction does.
 */
export function planGovernedAgents(
  pack: CompiledPack,
  provider: PackRuntimeProvider,
  options: { strict?: boolean } = {},
): GovernedAgentPlan {
  const model = resolvePackAgents(pack, options);
  const diagnostics = [...model.diagnostics];

  const supervisor: GovernedAgentSpec | undefined = model.supervisor
    ? {
        runtimeId: provider.supervisorRuntimeId(model.supervisor.id),
        sourceId: model.supervisor.id,
        kind: "supervisor",
        purpose: model.supervisor.purpose,
      }
    : undefined;

  const specialists: GovernedAgentSpec[] = model.specialists.flatMap((agent) => {
    const capabilities = provider.grantsFor(agent.id);
    if (!capabilities) return [];
    return [
      {
        runtimeId: provider.specialistRuntimeId(agent.id),
        sourceId: agent.id,
        kind: "specialist" as const,
        purpose: agent.purpose,
        capabilities,
      },
    ];
  });

  const ok = model.ok;
  return { packId: pack.id, supervisor, specialists, diagnostics, ok };
}
