import type {
  ApprovalMode,
  CapabilityAction,
  CapabilityDefinition,
  EnvironmentName,
  RiskLevel,
} from "./platform/capability-types.js";
import type { CapabilityGrantRegistry } from "./platform/capability-grants.js";
import type { ApprovedConnector } from "./platform/connector-registry.js";
import type { GovernedAgentPlan } from "./pack-runtime.js";
import type { PackDrift } from "./pack-lock.js";

/**
 * Control plane (Phase 10) — the operator's read model of the governed platform.
 *
 * Everything here is a pure function over explicit inputs. That is deliberate:
 * the console exists to answer "what is this platform actually allowed to do,
 * and what is waiting on me?", and an answer computed from live server state and
 * rendered verbatim is trustworthy in a way that one assembled in the browser
 * from four endpoints is not. It also means the answers are unit-testable
 * without a browser, a runtime, or a network.
 *
 * The read model is pack-agnostic. Every existing operator surface is
 * `/api/qa/*`; a control plane that only understood QA would re-create the
 * single-vertical assumption the platform just finished removing.
 */

export const RISK_ORDER: RiskLevel[] = ["L0", "L1", "L2", "L3", "L4"];

/** How loudly the console should present a posture item. */
export type PostureLevel = "ok" | "attention" | "critical";

export interface PostureItem {
  id: string;
  label: string;
  level: PostureLevel;
  /** The short factual value shown next to the label. */
  value: string;
  /** One sentence explaining what the value means for an operator. */
  detail: string;
}

export interface CapabilityRow {
  id: string;
  packId: string;
  system: string;
  action: string;
  description: string;
  riskLevel: RiskLevel;
  approvalMode: ApprovalMode;
  actionClass: CapabilityDefinition["actionClass"];
  externalWrite: boolean;
  productionMutation: boolean;
  allowedEnvironments: EnvironmentName[];
  adapterId: string;
  /** Whether an adapter with this id is actually registered. */
  adapterRegistered: boolean;
  /** The approved connector that admits this capability, if any. */
  connectorId?: string;
  /** Agents allowed to request it: scoped grantees plus unrestricted principals. */
  grantedTo: string[];
}

export interface AgentRow {
  runtimeId: string;
  packId: string;
  sourceId: string;
  kind: "supervisor" | "specialist";
  purpose?: string;
  /** Undefined for an unrestricted principal, which is not capability-scoped. */
  capabilities?: string[];
  unrestricted: boolean;
}

export interface ApprovalRow {
  actionId: string;
  capabilityId: string;
  riskLevel: RiskLevel;
  packId: string;
  agentId: string;
  projectId: string;
  environment: EnvironmentName;
  requestedBy: string;
  requestedAt: string;
  payloadHash: string;
  externalWrite: boolean;
  /** Minutes the request has been waiting, from the supplied clock. */
  waitingMinutes: number;
  expiresAt?: string;
  expired: boolean;
}

export interface ControlPlaneOverview {
  governedPacks: string[];
  packCount: number;
  governedAgentCount: number;
  capabilityCount: number;
  /** Capability count per risk level, always covering L0–L4. */
  riskHistogram: Record<RiskLevel, number>;
  /** Capabilities that can write to an external system. */
  externalWriteCount: number;
  pendingApprovalCount: number;
  posture: PostureItem[];
}

export interface OverviewInputs {
  packCount: number;
  invalidPacks: Array<{ id: string; issues: string[] }>;
  plans: Array<[string, GovernedAgentPlan]>;
  capabilities: CapabilityDefinition[];
  pendingApprovals: number;
  packDrift?: PackDrift;
  persistenceMode: string;
  policyConfigured: boolean;
  mcp: { enabled: boolean; reason: string };
}

function emptyHistogram(): Record<RiskLevel, number> {
  return { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 };
}

export function riskHistogram(capabilities: CapabilityDefinition[]): Record<RiskLevel, number> {
  const histogram = emptyHistogram();
  for (const capability of capabilities) histogram[capability.riskLevel] += 1;
  return histogram;
}

/**
 * The posture strip: the handful of facts an operator should see before
 * anything else. Each item states what is true, not what to do — an operator
 * reading "3 packs failed validation" needs the number, not an exhortation.
 */
export function buildPosture(inputs: OverviewInputs): PostureItem[] {
  const items: PostureItem[] = [];

  items.push(
    inputs.invalidPacks.length === 0
      ? {
          id: "pack-validation",
          label: "Pack validation",
          level: "ok",
          value: `${inputs.packCount} valid`,
          detail: "Every loaded pack satisfies the Pack v2 contract.",
        }
      : {
          id: "pack-validation",
          label: "Pack validation",
          level: "critical",
          value: `${inputs.invalidPacks.length} invalid`,
          detail: `Invalid packs fail closed in production: ${inputs.invalidPacks.map((pack) => pack.id).join(", ")}.`,
        },
  );

  const drift = inputs.packDrift;
  items.push(
    !drift
      ? {
          id: "pack-lock",
          label: "Pack lock",
          level: "attention",
          value: "no lock",
          detail: "No committed pack lock, so pack drift cannot be detected.",
        }
      : drift.ok
        ? {
            id: "pack-lock",
            label: "Pack lock",
            level: "ok",
            value: "no drift",
            detail: "Every pack matches the committed lock.",
          }
        : {
            id: "pack-lock",
            label: "Pack lock",
            level: "critical",
            value: `${drift.added.length + drift.removed.length + drift.changed.length} changed`,
            detail: "Loaded packs differ from the committed lock; released content and running content disagree.",
          },
  );

  items.push({
    id: "approvals",
    label: "Awaiting approval",
    level: inputs.pendingApprovals === 0 ? "ok" : "attention",
    value: String(inputs.pendingApprovals),
    detail:
      inputs.pendingApprovals === 0
        ? "No governed action is waiting on a human decision."
        : "Governed actions are paused until a human decides; each approval is bound to its exact payload.",
  });

  items.push({
    id: "policy",
    label: "Central policy",
    level: inputs.policyConfigured ? "ok" : "attention",
    value: inputs.policyConfigured ? "configured" : "local only",
    detail: inputs.policyConfigured
      ? "A central policy engine evaluates every governed action."
      : "No central policy engine; capability risk, grants, and approvals still apply.",
  });

  items.push({
    id: "persistence",
    label: "Persistence",
    level: "ok",
    value: inputs.persistenceMode,
    detail: "Where run, action, and approval state is durably recorded.",
  });

  items.push({
    id: "mcp",
    label: "MCP connections",
    level: "ok",
    value: inputs.mcp.enabled ? "enabled" : "disabled",
    detail: inputs.mcp.reason,
  });

  return items;
}

export function buildOverview(inputs: OverviewInputs): ControlPlaneOverview {
  const governedAgentCount = inputs.plans.reduce(
    (total, [, plan]) => total + (plan.supervisor ? 1 : 0) + plan.specialists.length,
    0,
  );
  return {
    governedPacks: inputs.plans.map(([packId]) => packId),
    packCount: inputs.packCount,
    governedAgentCount,
    capabilityCount: inputs.capabilities.length,
    riskHistogram: riskHistogram(inputs.capabilities),
    externalWriteCount: inputs.capabilities.filter((capability) => capability.externalWrite).length,
    pendingApprovalCount: inputs.pendingApprovals,
    posture: buildPosture(inputs),
  };
}

/**
 * Which agents may request a capability. Scoped grantees are listed explicitly;
 * unrestricted principals are appended because "the supervisor can also do this"
 * is exactly what an operator auditing a capability needs to see.
 */
function grantedTo(capabilityId: string, agents: AgentRow[]): string[] {
  return agents
    .filter((agent) => (agent.unrestricted ? true : agent.capabilities?.includes(capabilityId) ?? false))
    .map((agent) => agent.runtimeId);
}

export function buildAgentRows(
  plans: Array<[string, GovernedAgentPlan]>,
  grants: CapabilityGrantRegistry,
): AgentRow[] {
  const rows: AgentRow[] = [];
  for (const [packId, plan] of plans) {
    if (plan.supervisor) {
      rows.push({
        runtimeId: plan.supervisor.runtimeId,
        packId,
        sourceId: plan.supervisor.sourceId,
        kind: "supervisor",
        purpose: plan.supervisor.purpose,
        unrestricted: grants.isUnrestricted(plan.supervisor.runtimeId),
      });
    }
    for (const specialist of plan.specialists) {
      rows.push({
        runtimeId: specialist.runtimeId,
        packId,
        sourceId: specialist.sourceId,
        kind: "specialist",
        purpose: specialist.purpose,
        capabilities: specialist.capabilities ?? [],
        unrestricted: grants.isUnrestricted(specialist.runtimeId),
      });
    }
  }
  return rows;
}

export interface CapabilityInventoryInputs {
  capabilities: CapabilityDefinition[];
  /** Owning pack per capability id, from composition. */
  capabilityPack: Map<string, string>;
  registeredAdapterIds: Set<string>;
  connectors: ApprovedConnector[];
  agents: AgentRow[];
}

export function buildCapabilityRows(inputs: CapabilityInventoryInputs): CapabilityRow[] {
  const connectorFor = new Map<string, string>();
  for (const connector of inputs.connectors) {
    for (const tool of connector.tools) {
      for (const capabilityId of tool.capabilityIds) connectorFor.set(capabilityId, connector.id);
    }
  }

  return inputs.capabilities
    .map((capability): CapabilityRow => ({
      id: capability.id,
      packId: inputs.capabilityPack.get(capability.id) ?? "unknown",
      system: capability.system,
      action: capability.action,
      description: capability.description,
      riskLevel: capability.riskLevel,
      approvalMode: capability.approvalMode,
      actionClass: capability.actionClass,
      externalWrite: capability.externalWrite,
      productionMutation: capability.productionMutation,
      allowedEnvironments: capability.allowedEnvironments,
      adapterId: capability.adapterId,
      adapterRegistered: inputs.registeredAdapterIds.has(capability.adapterId),
      connectorId: connectorFor.get(capability.id),
      grantedTo: grantedTo(capability.id, inputs.agents),
    }))
    .sort((a, b) =>
      RISK_ORDER.indexOf(b.riskLevel) - RISK_ORDER.indexOf(a.riskLevel) || a.id.localeCompare(b.id),
    );
}

/**
 * Actions waiting on a human, highest risk and longest waiting first. An
 * approval whose contract has expired is still listed — it is not silently
 * dropped, because an operator needs to see that a decision was never made.
 */
export function buildApprovalRows(
  actions: CapabilityAction[],
  capabilities: CapabilityDefinition[],
  now: number = Date.now(),
): ApprovalRow[] {
  const externalWrite = new Map(capabilities.map((capability) => [capability.id, capability.externalWrite]));

  return actions
    .filter((action) => action.status === "pending_approval")
    .map((action): ApprovalRow => {
      const requestedAt = action.approval?.requestedAt ?? action.createdAt;
      const expiresAt = action.approval?.expiresAt;
      return {
        actionId: action.id,
        capabilityId: action.capabilityId,
        riskLevel: action.riskLevel,
        packId: action.context.packId,
        agentId: action.context.agentId,
        projectId: action.context.projectId,
        environment: action.context.environment,
        requestedBy: action.context.userId,
        requestedAt,
        payloadHash: action.payloadHash,
        externalWrite: externalWrite.get(action.capabilityId) ?? false,
        waitingMinutes: Math.max(0, Math.floor((now - Date.parse(requestedAt)) / 60000)),
        expiresAt,
        expired: expiresAt ? Date.parse(expiresAt) <= now : false,
      };
    })
    .sort(
      (a, b) =>
        RISK_ORDER.indexOf(b.riskLevel) - RISK_ORDER.indexOf(a.riskLevel) ||
        b.waitingMinutes - a.waitingMinutes ||
        a.actionId.localeCompare(b.actionId),
    );
}

/** The worst posture level present, for a single at-a-glance indicator. */
export function overallPosture(items: PostureItem[]): PostureLevel {
  if (items.some((item) => item.level === "critical")) return "critical";
  if (items.some((item) => item.level === "attention")) return "attention";
  return "ok";
}
