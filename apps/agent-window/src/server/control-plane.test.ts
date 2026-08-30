import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityGrantRegistry } from "./platform/capability-grants.js";
import type { ApprovedConnector } from "./platform/connector-registry.js";
import type { CapabilityAction, CapabilityDefinition } from "./platform/capability-types.js";
import type { GovernedAgentPlan } from "./pack-runtime.js";
import {
  buildAgentRows,
  buildApprovalRows,
  buildCapabilityRows,
  buildOverview,
  buildPosture,
  overallPosture,
  riskHistogram,
  type OverviewInputs,
} from "./control-plane.js";

/**
 * The control plane's whole value is that an operator can trust what it says, so
 * these tests are about the claims it makes: that a capability's "who may use
 * this" includes unrestricted supervisors, that drift and invalid packs are
 * surfaced as critical rather than smoothed over, and that a stale approval is
 * shown rather than dropped.
 */

function capability(overrides: Partial<CapabilityDefinition> & { id: string }): CapabilityDefinition {
  return {
    system: "jira",
    action: "story.read",
    description: "read",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["qa"],
    adapterId: "adapter-a",
    ...overrides,
  };
}

function plan(packId: string): GovernedAgentPlan {
  return {
    packId,
    supervisor: { runtimeId: packId, sourceId: `${packId}-supervisor`, kind: "supervisor", purpose: "coordinate" },
    specialists: [
      {
        runtimeId: `${packId}.reader`,
        sourceId: "reader",
        kind: "specialist",
        purpose: "read things",
        capabilities: ["a.read"],
      },
      {
        runtimeId: `${packId}.writer`,
        sourceId: "writer",
        kind: "specialist",
        purpose: "write things",
        capabilities: ["a.write"],
      },
    ],
    diagnostics: [],
    ok: true,
  };
}

const grants = new CapabilityGrantRegistry({
  scoped: { "alpha.reader": ["a.read"], "alpha.writer": ["a.write"] },
  unrestricted: ["alpha"],
});

function overviewInputs(overrides: Partial<OverviewInputs> = {}): OverviewInputs {
  return {
    packCount: 23,
    invalidPacks: [],
    plans: [["alpha", plan("alpha")]],
    capabilities: [capability({ id: "a.read" }), capability({ id: "a.write", riskLevel: "L3", externalWrite: true })],
    pendingApprovals: 0,
    packDrift: { ok: true, added: [], removed: [], changed: [] },
    persistenceMode: "local-sqlite",
    policyConfigured: false,
    mcp: { enabled: false, reason: "MCP is not provisioned (no transport); no connection is opened." },
    ...overrides,
  };
}

test("the risk histogram always covers every level", () => {
  assert.deepEqual(riskHistogram([]), { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 });
  assert.deepEqual(
    riskHistogram([capability({ id: "a" }), capability({ id: "b", riskLevel: "L3" }), capability({ id: "c", riskLevel: "L3" })]),
    { L0: 1, L1: 0, L2: 0, L3: 2, L4: 0 },
  );
});

test("the overview counts governed agents across every pack, supervisors included", () => {
  const overview = buildOverview(overviewInputs({ plans: [["alpha", plan("alpha")], ["beta", plan("beta")]] }));
  assert.deepEqual(overview.governedPacks, ["alpha", "beta"]);
  assert.equal(overview.governedAgentCount, 6);
  assert.equal(overview.capabilityCount, 2);
  assert.equal(overview.externalWriteCount, 1);
});

test("invalid packs and lock drift are surfaced as critical, not smoothed over", () => {
  const clean = buildPosture(overviewInputs());
  assert.equal(overallPosture(clean), "attention", "an unconfigured central policy is worth attention");
  assert.equal(clean.find((item) => item.id === "pack-validation")?.level, "ok");
  assert.equal(clean.find((item) => item.id === "pack-lock")?.level, "ok");

  const broken = buildPosture(
    overviewInputs({
      invalidPacks: [{ id: "bad-pack", issues: ["missing manifest"] }],
      packDrift: { ok: false, added: [], removed: [], changed: [{ id: "qa", expected: "a", actual: "b" }] },
    }),
  );
  assert.equal(overallPosture(broken), "critical");
  const validation = broken.find((item) => item.id === "pack-validation")!;
  assert.equal(validation.level, "critical");
  assert.match(validation.detail, /bad-pack/);
  assert.equal(broken.find((item) => item.id === "pack-lock")?.level, "critical");
});

test("a missing pack lock is attention, not silent success", () => {
  const posture = buildPosture(overviewInputs({ packDrift: undefined }));
  const lock = posture.find((item) => item.id === "pack-lock")!;
  assert.equal(lock.level, "attention");
  assert.equal(lock.value, "no lock");
});

test("pending approvals raise the posture and carry the payload-binding explanation", () => {
  const posture = buildPosture(overviewInputs({ pendingApprovals: 3 }));
  const approvals = posture.find((item) => item.id === "approvals")!;
  assert.equal(approvals.level, "attention");
  assert.equal(approvals.value, "3");
  assert.match(approvals.detail, /bound to its exact payload/);
});

test("agent rows describe the whole governed roster with its scoping", () => {
  const rows = buildAgentRows([["alpha", plan("alpha")]], grants);
  assert.deepEqual(
    rows.map((row) => [row.runtimeId, row.kind, row.unrestricted]),
    [
      ["alpha", "supervisor", true],
      ["alpha.reader", "specialist", false],
      ["alpha.writer", "specialist", false],
    ],
  );
  assert.deepEqual(rows[1].capabilities, ["a.read"]);
});

test("a capability lists its scoped grantees AND the unrestricted principals", () => {
  const rows = buildCapabilityRows({
    capabilities: [capability({ id: "a.read" }), capability({ id: "a.write", riskLevel: "L3", adapterId: "missing" })],
    capabilityPack: new Map([["a.read", "alpha"], ["a.write", "alpha"]]),
    registeredAdapterIds: new Set(["adapter-a"]),
    connectors: [],
    agents: buildAgentRows([["alpha", plan("alpha")]], grants),
  });

  const read = rows.find((row) => row.id === "a.read")!;
  // The supervisor can drive any step it coordinates, which an operator
  // auditing "who can read stories" must see.
  assert.deepEqual(read.grantedTo, ["alpha", "alpha.reader"]);
  assert.equal(read.packId, "alpha");
});

test("a capability pointing at an unregistered adapter is flagged", () => {
  const rows = buildCapabilityRows({
    capabilities: [capability({ id: "a.write", adapterId: "not-registered" })],
    capabilityPack: new Map([["a.write", "alpha"]]),
    registeredAdapterIds: new Set(["adapter-a"]),
    connectors: [],
    agents: [],
  });
  assert.equal(rows[0].adapterRegistered, false);
});

test("capabilities are ordered by risk, highest first", () => {
  const rows = buildCapabilityRows({
    capabilities: [
      capability({ id: "low", riskLevel: "L0" }),
      capability({ id: "highest", riskLevel: "L4" }),
      capability({ id: "high", riskLevel: "L3" }),
    ],
    capabilityPack: new Map(),
    registeredAdapterIds: new Set(),
    connectors: [],
    agents: [],
  });
  assert.deepEqual(rows.map((row) => row.id), ["highest", "high", "low"]);
});

test("the admitting connector is resolved from the approved registry", () => {
  const connector: ApprovedConnector = {
    id: "jira",
    displayName: "Jira",
    kind: "native-or-mcp",
    status: "approved",
    systems: ["jira"],
    transports: ["native-http"],
    auth: "server-secret",
    allowedPacks: ["alpha"],
    tools: [{ id: "story.read", capabilityIds: ["a.read"], actionClass: "read", maxRisk: "L4", environments: ["qa"] }],
  };
  const rows = buildCapabilityRows({
    capabilities: [capability({ id: "a.read" }), capability({ id: "unmapped" })],
    capabilityPack: new Map(),
    registeredAdapterIds: new Set(["adapter-a"]),
    connectors: [connector],
    agents: [],
  });
  assert.equal(rows.find((row) => row.id === "a.read")?.connectorId, "jira");
  assert.equal(rows.find((row) => row.id === "unmapped")?.connectorId, undefined);
});

function action(overrides: Partial<CapabilityAction> & { id: string }): CapabilityAction {
  return {
    capabilityId: "a.write",
    context: {
      runId: "run-1",
      userId: "dev-1",
      agentId: "alpha.writer",
      packId: "alpha-pack",
      projectId: "PCC",
      environment: "qa",
      tenantId: "tenant-1",
      requestedAt: "2026-08-30T10:00:00.000Z",
    },
    payload: {},
    payloadHash: "hash-1",
    riskLevel: "L3",
    approvalMode: "human",
    status: "pending_approval",
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
    policyReason: "human approval required",
    ...overrides,
  };
}

const NOW = Date.parse("2026-08-30T11:00:00.000Z");

test("only pending actions are listed, ordered by risk then waiting time", () => {
  const rows = buildApprovalRows(
    [
      action({ id: "executed-already", status: "executed" }),
      action({ id: "low-risk", riskLevel: "L1" }),
      action({ id: "older-high", createdAt: "2026-08-30T09:00:00.000Z" }),
      action({ id: "newer-high" }),
    ],
    [capability({ id: "a.write", riskLevel: "L3", externalWrite: true })],
    NOW,
  );

  assert.deepEqual(rows.map((row) => row.actionId), ["older-high", "newer-high", "low-risk"]);
  assert.equal(rows[0].waitingMinutes, 120);
  assert.equal(rows[1].waitingMinutes, 60);
  assert.equal(rows[0].externalWrite, true);
});

test("an expired approval is shown as expired, never dropped", () => {
  const rows = buildApprovalRows(
    [
      action({
        id: "stale",
        approval: {
          id: "approval-1",
          actionId: "stale",
          payloadHash: "hash-1",
          riskLevel: "L3",
          status: "pending",
          requestedAt: "2026-08-30T09:00:00.000Z",
          expiresAt: "2026-08-30T10:00:00.000Z",
        },
      }),
    ],
    [capability({ id: "a.write" })],
    NOW,
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].expired, true);
  // The approval contract's own requestedAt wins over the action's createdAt.
  assert.equal(rows[0].waitingMinutes, 120);
});

test("approval rows carry the scope an approver needs to judge the request", () => {
  const rows = buildApprovalRows([action({ id: "one" })], [capability({ id: "a.write" })], NOW);
  const row = rows[0];
  assert.equal(row.agentId, "alpha.writer");
  assert.equal(row.projectId, "PCC");
  assert.equal(row.environment, "qa");
  assert.equal(row.requestedBy, "dev-1");
  assert.equal(row.payloadHash, "hash-1");
});
