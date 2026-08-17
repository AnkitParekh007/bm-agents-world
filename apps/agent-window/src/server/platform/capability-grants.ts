/**
 * Per-agent capability allowlist ("who may even ask").
 *
 * The broker evaluates a grant before any environment or policy check. The
 * registry knows three kinds of principal, and — crucially — an agent id it has
 * never heard of is the fourth:
 *
 *   - scoped        an explicit allowlist; may request only those capabilities.
 *   - unrestricted  a declared supervisor / system principal; may request any
 *                   capability (the risk/approval path still applies downstream).
 *   - unknown       an id in neither list. Denied by default (fail closed).
 *
 * Making "unrestricted" an explicit declaration rather than the absence of a
 * grant is a deliberate security choice: a typo'd or spoofed agent id
 * (`qa.browser_qа` for `qa.browser-qa`) must collapse to *no* authority, not to
 * unrestricted access. The old behaviour — unknown ids fall through to whatever
 * later policy allows — is retained only when a registry is explicitly built in
 * `unknown: "allow"` mode for backward compatibility.
 */

export interface CapabilityGrantSpec {
  /** Agents constrained to an explicit capability allowlist. */
  scoped?: Record<string, readonly string[]>;
  /** Principals explicitly allowed any capability (supervisors, system). */
  unrestricted?: readonly string[];
  /**
   * How to treat an agent id present in neither list.
   * "deny" (default) fails closed; "allow" restores the legacy fall-through.
   */
  unknown?: "deny" | "allow";
}

export class CapabilityGrantRegistry {
  private readonly scoped = new Map<string, ReadonlySet<string>>();
  private readonly unrestricted = new Set<string>();
  private readonly unknownMode: "deny" | "allow";

  constructor(spec: CapabilityGrantSpec = {}) {
    for (const [agentId, capabilityIds] of Object.entries(spec.scoped ?? {})) {
      this.scoped.set(agentId, new Set(capabilityIds));
    }
    for (const agentId of spec.unrestricted ?? []) this.unrestricted.add(agentId);
    this.unknownMode = spec.unknown ?? "deny";
  }

  /** True when the agent is constrained by an explicit capability allowlist. */
  isScoped(agentId: string): boolean {
    return this.scoped.has(agentId);
  }

  /** True when the agent is a declared unrestricted principal (supervisor/system). */
  isUnrestricted(agentId: string): boolean {
    return this.unrestricted.has(agentId);
  }

  /** True when the registry has an explicit declaration for the agent. */
  isKnown(agentId: string): boolean {
    return this.scoped.has(agentId) || this.unrestricted.has(agentId);
  }

  /**
   * True when the agent may request the capability. Unrestricted principals may
   * request anything; scoped agents may request only their granted capabilities;
   * an unknown id is denied unless the registry runs in legacy "allow" mode.
   */
  allows(agentId: string, capabilityId: string): boolean {
    if (this.unrestricted.has(agentId)) return true;
    const set = this.scoped.get(agentId);
    if (set) return set.has(capabilityId);
    return this.unknownMode === "allow";
  }

  /** The capabilities granted to a scoped agent (empty for others). */
  grantsFor(agentId: string): string[] {
    return [...(this.scoped.get(agentId) ?? [])];
  }
}
