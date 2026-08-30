/**
 * Control-plane API types and fetch helpers.
 *
 * The console deliberately holds no governance logic: every judgement — posture
 * level, risk ordering, who may use a capability, how long an approval has been
 * waiting — is computed by the server and rendered here verbatim. These are the
 * response shapes of `/api/control-plane/*`, mirroring `server/control-plane.ts`.
 *
 * The console imports nothing from the agent runtime, which is what lets an
 * operator open it while the chat runtime is unavailable — precisely when the
 * platform's posture is most worth looking at.
 */

export type RiskLevel = "L0" | "L1" | "L2" | "L3" | "L4";
export type PostureLevel = "ok" | "attention" | "critical";
export type EnvironmentName = "playground" | "qa" | "prod";

export interface PostureItem {
  id: string;
  label: string;
  level: PostureLevel;
  value: string;
  detail: string;
}

export interface ControlPlaneOverview {
  governedPacks: string[];
  packCount: number;
  governedAgentCount: number;
  capabilityCount: number;
  riskHistogram: Record<RiskLevel, number>;
  externalWriteCount: number;
  pendingApprovalCount: number;
  posture: PostureItem[];
}

export interface CapabilityRow {
  id: string;
  packId: string;
  system: string;
  action: string;
  description: string;
  riskLevel: RiskLevel;
  approvalMode: "none" | "standing-policy" | "human" | "privileged-process";
  actionClass: "read" | "test" | "mutation" | "external-write";
  externalWrite: boolean;
  productionMutation: boolean;
  allowedEnvironments: EnvironmentName[];
  adapterId: string;
  adapterRegistered: boolean;
  connectorId?: string;
  grantedTo: string[];
}

export interface AgentRow {
  runtimeId: string;
  packId: string;
  sourceId: string;
  kind: "supervisor" | "specialist";
  purpose?: string;
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
  waitingMinutes: number;
  expiresAt?: string;
  expired: boolean;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return (await response.json()) as T;
}

export const controlPlaneApi = {
  overview: () => getJson<ControlPlaneOverview>("/api/control-plane/overview"),
  capabilities: () => getJson<{ capabilities: CapabilityRow[] }>("/api/control-plane/capabilities"),
  agents: () => getJson<{ agents: AgentRow[] }>("/api/control-plane/agents"),
  approvals: () => getJson<{ approvals: ApprovalRow[] }>("/api/control-plane/approvals"),
};

/** Human phrasing for a waiting duration the server measured in minutes. */
export function formatWaiting(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
