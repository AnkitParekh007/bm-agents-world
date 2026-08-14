import type { CompiledPack } from "./pack-compiler.js";

/**
 * Generalized agent registry (Phase 3).
 *
 * Resolves the runtime agent model for ANY pack from its compiled definition —
 * the supervisor and the specialist agents — validating references and reporting
 * diagnostics instead of silently coercing. This is the pack-agnostic path that
 * Phase 4 uses to retire the `if (pack.id === "qa")` special-casing: it is built
 * and tested in isolation first (parallel + flagged) so the generic model can be
 * proven equivalent to today's QA construction before anything is deleted.
 *
 * Non-destructive: resolution never throws in lenient mode; callers that need
 * fail-closed behaviour pass `{ strict: true }`, which throws when the pack's
 * agent references do not resolve.
 */

export type AgentKind = "supervisor" | "specialist";

export interface ResolvedAgent {
  /** The pack agent id as declared in the agent registry. */
  id: string;
  kind: AgentKind;
  role?: string;
  purpose?: string;
  enabled: boolean;
}

export interface ResolvedAgentModel {
  packId: string;
  /** The supervisor reference declared by the pack manifest. */
  supervisorRef: string;
  supervisor?: ResolvedAgent;
  specialists: ResolvedAgent[];
  diagnostics: string[];
  /** True when every declared reference resolved. */
  ok: boolean;
}

/**
 * Resolves the supervisor and specialists for a compiled pack. The supervisor
 * is the agent whose id matches the pack's declared supervisor reference; every
 * other enabled agent is a specialist. Disabled agents are excluded, and a
 * supervisor reference that matches no agent is recorded as a diagnostic.
 */
export function resolvePackAgents(
  pack: CompiledPack,
  options: { strict?: boolean } = {},
): ResolvedAgentModel {
  const diagnostics: string[] = [];
  const supervisorRef = pack.supervisor;

  const supervisorAgent = pack.agents.find((agent) => agent.id === supervisorRef);
  if (!supervisorAgent) {
    diagnostics.push(
      `supervisor "${supervisorRef}" is not present in the agent registry for pack "${pack.id}"`,
    );
  }

  const supervisor: ResolvedAgent | undefined = supervisorAgent
    ? { id: supervisorAgent.id, kind: "supervisor", role: supervisorAgent.role, purpose: supervisorAgent.purpose, enabled: true }
    : undefined;

  const specialists: ResolvedAgent[] = pack.agents
    .filter((agent) => agent.id !== supervisorRef && agent.enabled)
    .map((agent) => ({ id: agent.id, kind: "specialist" as const, role: agent.role, purpose: agent.purpose, enabled: true }));

  const ok = diagnostics.length === 0;
  if (!ok && options.strict) {
    throw new Error(`Pack "${pack.id}" agent model failed to resolve:\n  - ${diagnostics.join("\n  - ")}`);
  }

  return { packId: pack.id, supervisorRef, supervisor, specialists, diagnostics, ok };
}
