export type RiskLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export type ApprovalMode =
  | "none"
  | "standing-policy"
  | "human"
  | "privileged-process";

export type ActionStatus =
  | "ready"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "executing"
  | "executed"
  | "failed";

export type EnvironmentName = "playground" | "qa" | "prod";

export interface ExecutionContext {
  runId: string;
  userId: string;
  agentId: string;
  packId: string;
  projectId: string;
  environment: EnvironmentName;
  tenantId: string;
  requestedAt: string;
}

/** A model may see this reference, but never the secret value behind it. */
export interface SecretReference {
  provider: "vault" | "environment" | "workload-identity";
  name: string;
  version?: string;
  purpose: string;
}

export interface CapabilityDefinition {
  id: string;
  system: string;
  action: string;
  description: string;
  riskLevel: RiskLevel;
  approvalMode: ApprovalMode;
  actionClass: "read" | "test" | "mutation" | "external-write";
  externalWrite: boolean;
  productionMutation: boolean;
  allowedEnvironments: EnvironmentName[];
  adapterId: string;
}

export interface AppliedPolicyDecision extends Record<string, unknown> {
  effect: "allow" | "deny" | "approval";
  source: "local" | "opa" | "legacy";
  decisionId?: string;
  connectorId?: string;
  toolId?: string;
}

export interface ApprovalContract {
  id: string;
  actionId: string;
  payloadHash: string;
  riskLevel: RiskLevel;
  status: "pending" | "approved" | "rejected" | "expired";
  requestedAt: string;
  expiresAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
}

export interface CapabilityAction {
  id: string;
  capabilityId: string;
  context: ExecutionContext;
  payload: Record<string, unknown>;
  payloadHash: string;
  riskLevel: RiskLevel;
  approvalMode: ApprovalMode;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
  executionStartedAt?: string;
  executionFinishedAt?: string;
  executionDurationMs?: number;
  approval?: ApprovalContract;
  result?: AdapterResult;
  policyReason: string;
  policyDecision?: AppliedPolicyDecision;
}

export interface AdapterResult {
  ok: boolean;
  mode: "mock" | "live";
  externalSideEffect: boolean;
  data?: unknown;
  error?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  runId: string;
  actorType: "human" | "agent" | "system";
  actorId: string;
  event:
    | "action.requested"
    | "approval.requested"
    | "approval.approved"
    | "approval.rejected"
    | "action.executing"
    | "action.executed"
    | "action.failed"
    | "action.denied";
  actionId?: string;
  capabilityId?: string;
  payloadHash?: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilityAdapter {
  id: string;
  execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult>;
}
