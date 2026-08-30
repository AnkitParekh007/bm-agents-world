import assert from "node:assert/strict";
import test from "node:test";
import type { AdapterResult, CapabilityAdapter, CapabilityDefinition } from "./platform/capability-types.js";
import type { ArtifactRepository } from "./platform/artifact-store.js";
import { ArtifactStore } from "./platform/artifact-store.js";
import { composeGovernedPacks } from "./governed-packs.js";
import type { PackGovernance } from "./pack-governance.js";
import { qaGovernance } from "./qa/qa-governance.js";
import { availableQaCapabilities } from "./qa/qa-capabilities.js";
import { buildQaGrantRegistry, QA_SPECIALIST_CAPABILITIES, qaSpecialistAgentId } from "./qa/qa-grants.js";
import { frontendGovernance } from "./frontend/frontend-governance.js";
import { availableFrontendCapabilities } from "./frontend/frontend-capabilities.js";
import { frontendSpecialistAgentId } from "./frontend/frontend-grants.js";

/**
 * Composition is where a second vertical could quietly break the first: a
 * capability served by the wrong pack's adapter, or an agent bound to the wrong
 * pack's grant, would not throw — it would just be wrong. So these tests check
 * that QA comes through composition exactly as it did when it was the only pack,
 * and that every collision that could cause such a mix-up fails startup instead.
 */

const artifacts = new ArtifactStore() as ArtifactRepository;

function stubAdapter(id: string): CapabilityAdapter {
  return {
    id,
    execute: async (): Promise<AdapterResult> => ({ ok: true, mode: "mock", externalSideEffect: false, data: {} }),
  };
}

function stubCapability(id: string, adapterId = "stub-adapter"): CapabilityDefinition {
  return {
    id,
    system: "stub",
    action: "stub",
    description: "stub",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["qa"],
    adapterId,
  };
}

function stubPack(overrides: Partial<PackGovernance>): PackGovernance {
  return {
    ...frontendGovernance,
    capabilities: () => [],
    buildAdapters: () => [],
    grantSpec: () => ({}),
    ...overrides,
  };
}

test("QA's registered capabilities, adapters, and grants survive composition unchanged", () => {
  const composed = composeGovernedPacks({ artifacts });
  const qaIds = availableQaCapabilities().map((capability) => capability.id);

  // Every QA capability is still present, still declared by QA.
  for (const id of qaIds) {
    assert.ok(composed.capabilities.some((capability) => capability.id === id), `${id} must be registered`);
  }
  // Every QA capability's adapter is still registered under its declared id, so
  // the broker resolves it to the same adapter it always did.
  const adapterIds = new Set(composed.adapters.map((adapter) => adapter.id));
  for (const capability of availableQaCapabilities()) {
    assert.ok(adapterIds.has(capability.adapterId), `adapter ${capability.adapterId} must be registered`);
  }

  // Grants: identical answers to the single-pack registry, specialist by specialist.
  const single = buildQaGrantRegistry();
  for (const [specialistId, capabilities] of Object.entries(QA_SPECIALIST_CAPABILITIES)) {
    const agentId = qaSpecialistAgentId(specialistId);
    assert.deepEqual(composed.grants.grantsFor(agentId), single.grantsFor(agentId));
    for (const id of qaIds) {
      assert.equal(
        composed.grants.allows(agentId, id),
        single.allows(agentId, id),
        `${agentId} -> ${id} must be unchanged by composition`,
      );
    }
  }
  assert.equal(composed.grants.isUnrestricted("qa"), true);
});

test("both verticals are composed, and neither can use the other's capabilities", () => {
  const composed = composeGovernedPacks({ artifacts });
  assert.deepEqual(composed.packIds, ["qa", "frontend-angular"]);

  const frontendIds = availableFrontendCapabilities().map((capability) => capability.id);
  for (const id of frontendIds) {
    assert.ok(composed.capabilities.some((capability) => capability.id === id));
  }

  // A QA specialist cannot reach a frontend capability, and vice versa.
  assert.equal(composed.grants.allows(qaSpecialistAgentId("story-context"), "frontend.jira.story.read"), false);
  assert.equal(composed.grants.allows(frontendSpecialistAgentId("story-context"), "qa.jira.story.read"), false);
  assert.equal(composed.grants.allows(frontendSpecialistAgentId("story-context"), "frontend.jira.story.read"), true);

  // Each supervisor is unrestricted only over the composed set it coordinates.
  assert.equal(composed.grants.isUnrestricted("frontend-angular"), true);
});

test("an agent id no pack declared is denied, whatever else is loaded", () => {
  const composed = composeGovernedPacks({ artifacts });
  assert.equal(composed.grants.allows("frontend-angular.not-a-specialist", "frontend.jira.story.read"), false);
  assert.equal(composed.grants.isKnown("qa.browser_qa"), false);
});

test("two packs claiming one capability id fail startup", () => {
  assert.throws(
    () =>
      composeGovernedPacks({ artifacts }, [
        ["alpha", stubPack({ capabilities: () => [stubCapability("shared.read")] })],
        ["beta", stubPack({ capabilities: () => [stubCapability("shared.read")] })],
      ]),
    /Capability "shared\.read" is declared by both pack "alpha" and pack "beta"/,
  );
});

test("two packs registering one adapter id fail startup", () => {
  assert.throws(
    () =>
      composeGovernedPacks({ artifacts }, [
        ["alpha", stubPack({ buildAdapters: () => [stubAdapter("shared-adapter")] })],
        ["beta", stubPack({ buildAdapters: () => [stubAdapter("shared-adapter")] })],
      ]),
    /Adapter id "shared-adapter" is registered by both pack "alpha" and pack "beta"/,
  );
});

test("two packs claiming one agent id fail startup", () => {
  assert.throws(
    () =>
      composeGovernedPacks({ artifacts }, [
        ["alpha", stubPack({ grantSpec: () => ({ scoped: { "shared.agent": ["a.read"] } }) })],
        ["beta", stubPack({ grantSpec: () => ({ unrestricted: ["shared.agent"] }) })],
      ]),
    /Agent id "shared\.agent" is declared by both pack "alpha" and pack "beta"/,
  );
});

test("composition never relaxes the unknown-agent default", () => {
  // Even a pack that asks for legacy fall-through does not get it: the composed
  // registry is always built `unknown: "deny"`.
  const composed = composeGovernedPacks({ artifacts }, [
    ["legacy", stubPack({ grantSpec: () => ({ scoped: { "legacy.agent": ["a.read"] }, unknown: "allow" }) })],
  ]);
  assert.equal(composed.grants.allows("some.other.agent", "a.read"), false);
});
