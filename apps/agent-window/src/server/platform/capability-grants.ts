/**
 * Per-agent capability allowlist ("who may even ask").
 *
 * The broker evaluates a grant before any environment or policy check: an agent
 * whose id is present in the registry may request only the capabilities listed
 * for it, and every other capability is denied up front — authorization becomes
 * code rather than a line in a prompt. Agent ids that are absent from the
 * registry are intentionally unscoped by this layer (pack supervisors that
 * coordinate every step, and packs that declare no specialist scoping); the
 * remaining environment, production-mutation, approval, and central-policy
 * checks still apply to them unchanged.
 */
export class CapabilityGrantRegistry {
  private readonly grants = new Map<string, ReadonlySet<string>>();

  constructor(grants: Record<string, readonly string[]> = {}) {
    for (const [agentId, capabilityIds] of Object.entries(grants)) {
      this.grants.set(agentId, new Set(capabilityIds));
    }
  }

  /** True when the agent is constrained by an explicit grant allowlist. */
  isScoped(agentId: string): boolean {
    return this.grants.has(agentId);
  }

  /**
   * True when the agent may request the capability. Unscoped agents (absent
   * from the registry) may request anything; scoped agents may request only
   * their granted capabilities.
   */
  allows(agentId: string, capabilityId: string): boolean {
    const set = this.grants.get(agentId);
    return set ? set.has(capabilityId) : true;
  }

  /** The capabilities granted to a scoped agent (empty for unscoped agents). */
  grantsFor(agentId: string): string[] {
    return [...(this.grants.get(agentId) ?? [])];
  }
}
