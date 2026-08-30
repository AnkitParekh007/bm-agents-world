import { CapabilityGrantRegistry, type CapabilityGrantSpec } from "./platform/capability-grants.js";
import type { CapabilityAdapter, CapabilityDefinition } from "./platform/capability-types.js";
import { listPackGovernance, type PackAdapterContext, type PackGovernance } from "./pack-governance.js";

/**
 * Composes every governed pack into the single set of capabilities, adapters,
 * and grants the broker is built from (Phase 9).
 *
 * Before a second vertical existed, the composition root simply listed QA's
 * capabilities, QA's adapters, and QA's grant registry — correct, but a shape
 * that admits exactly one pack. This assembles them from the governance
 * registry instead, so a new vertical is a registered provider rather than an
 * edit to server startup.
 *
 * Composition is fail-closed on collisions. Two packs claiming the same
 * capability id, adapter id, or agent id is a governance defect, not something
 * to resolve by last-one-wins: whichever pack lost would silently have its
 * capability served by another pack's adapter, or its agent bound to another
 * pack's grant. Each is refused at startup.
 */

export interface ComposedGovernedPacks {
  capabilities: CapabilityDefinition[];
  adapters: CapabilityAdapter[];
  grants: CapabilityGrantRegistry;
  /** Ids of the packs that contributed, in registration order. */
  packIds: string[];
}

function mergeGrantSpecs(specs: Array<[string, CapabilityGrantSpec]>): CapabilityGrantSpec {
  const scoped: Record<string, readonly string[]> = {};
  const unrestricted: string[] = [];
  const owner = new Map<string, string>();

  const claim = (agentId: string, packId: string) => {
    const existing = owner.get(agentId);
    if (existing) {
      throw new Error(`Agent id "${agentId}" is declared by both pack "${existing}" and pack "${packId}".`);
    }
    owner.set(agentId, packId);
  };

  for (const [packId, spec] of specs) {
    for (const [agentId, capabilityIds] of Object.entries(spec.scoped ?? {})) {
      claim(agentId, packId);
      scoped[agentId] = capabilityIds;
    }
    for (const agentId of spec.unrestricted ?? []) {
      claim(agentId, packId);
      unrestricted.push(agentId);
    }
  }

  // `unknown: "deny"` is the platform default and is never relaxed by composition:
  // an agent id no pack declared has no authority, however many packs are loaded.
  return { scoped, unrestricted, unknown: "deny" };
}

export function composeGovernedPacks(
  context: PackAdapterContext,
  packs: Array<[string, PackGovernance]> = listPackGovernance(),
): ComposedGovernedPacks {
  const capabilities: CapabilityDefinition[] = [];
  const adapters: CapabilityAdapter[] = [];
  const capabilityOwner = new Map<string, string>();
  const adapterOwner = new Map<string, string>();

  for (const [packId, governance] of packs) {
    for (const capability of governance.capabilities()) {
      const existing = capabilityOwner.get(capability.id);
      if (existing) {
        throw new Error(`Capability "${capability.id}" is declared by both pack "${existing}" and pack "${packId}".`);
      }
      capabilityOwner.set(capability.id, packId);
      capabilities.push(capability);
    }

    for (const adapter of governance.buildAdapters(context)) {
      const existing = adapterOwner.get(adapter.id);
      if (existing) {
        throw new Error(`Adapter id "${adapter.id}" is registered by both pack "${existing}" and pack "${packId}".`);
      }
      adapterOwner.set(adapter.id, packId);
      adapters.push(adapter);
    }
  }

  const grants = new CapabilityGrantRegistry(
    mergeGrantSpecs(packs.map(([packId, governance]) => [packId, governance.grantSpec()])),
  );

  return { capabilities, adapters, grants, packIds: packs.map(([packId]) => packId) };
}
