import { createHash, randomUUID } from "node:crypto";
import type {
  ActionStatus,
  ApprovalContract,
  AuditEvent,
  CapabilityAction,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "./capability-types.js";
import type { CapabilityRun } from "./capability-store.js";
import type { CapabilityBrokerContract } from "./capability-broker-contract.js";
import type { CapabilityGrantRegistry } from "./capability-grants.js";
import { ApprovedConnectorRegistry } from "./connector-registry.js";
import { createPolicyEngine, type PolicyDecision, type PolicyEvaluator } from "./policy-engine.js";
import { startActiveSpan } from "./telemetry.js";

const APPROVAL_TTL_MS = 10 * 60 * 1000;

export interface AsyncCapabilityStore {
  upsertRun(context: ExecutionContext): Promise<CapabilityRun>;
  getRun(runId: string): Promise<CapabilityRun | undefined>;
  listRuns(limit?: number): Promise<CapabilityRun[]>;
  saveAction(action: CapabilityAction): Promise<void>;
  getAction(actionId: string): Promise<CapabilityAction | undefined>;
  listActionsForRun(runId: string): Promise<CapabilityAction[]>;
  appendAudit(event: AuditEvent, context: ExecutionContext): Promise<void>;
  listAudit(limit?: number): Promise<AuditEvent[]>;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

function payloadHash(payload: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(payload))).digest("hex");
}

function legacyDecision(definition: CapabilityDefinition, context: ExecutionContext): PolicyDecision {
  if (!definition.allowedEnvironments.includes(context.environment)) {
    return { effect: "deny", riskLevel: definition.riskLevel, approvalMode: "none", reason: `Capability is not allowed in ${context.environment}.`, source: "local" };
  }
  if (context.environment === "prod" && definition.productionMutation) {
    return { effect: "deny", riskLevel: "L4", approvalMode: "privileged-process", reason: "Free-form production mutation is denied by pack policy.", source: "local" };
  }
  const riskLevel = context.environment === "prod" && definition.actionClass === "read" ? "L4" : definition.riskLevel;
  const needsApproval = ["L2", "L3", "L4"].includes(riskLevel);
  return {
    effect: needsApproval ? "approval" : "allow",
    riskLevel,
    approvalMode: riskLevel === "L4" ? "privileged-process" : needsApproval ? "human" : definition.approvalMode,
    reason: needsApproval ? `${riskLevel} requires governed approval.` : `${riskLevel} is permitted by standing policy.`,
    source: "local",
  };
}

/** Shared-store broker with optional centralized policy enforcement. */
export class AsyncCapabilityBroker implements CapabilityBrokerContract {
  private readonly definitions = new Map<string, CapabilityDefinition>();
  private readonly adapters = new Map<string, CapabilityAdapter>();
  private readonly policy?: PolicyEvaluator;

  constructor(
    definitions: CapabilityDefinition[],
    adapters: CapabilityAdapter[],
    private readonly store: AsyncCapabilityStore,
    policy?: PolicyEvaluator,
    private readonly grants?: CapabilityGrantRegistry,
  ) {
    for (const definition of definitions) this.definitions.set(definition.id, definition);
    for (const adapter of adapters) this.adapters.set(adapter.id, adapter);
    this.policy = policy ?? (process.env.BM_POLICY_MODE?.trim()
      ? createPolicyEngine(new ApprovedConnectorRegistry())
      : undefined);
  }

  listCapabilities(): CapabilityDefinition[] { return [...this.definitions.values()]; }
  startRun(context: ExecutionContext): Promise<CapabilityRun> { return this.store.upsertRun(context); }
  getRun(runId: string): Promise<CapabilityRun | undefined> { return this.store.getRun(runId); }
  listRuns(limit = 100): Promise<CapabilityRun[]> { return this.store.listRuns(limit); }
  listActionsForRun(runId: string): Promise<CapabilityAction[]> { return this.store.listActionsForRun(runId); }
  listAudit(limit = 100): Promise<AuditEvent[]> { return this.store.listAudit(limit); }

  async getAction(actionId: string): Promise<CapabilityAction | undefined> {
    const action = await this.store.getAction(actionId);
    if (action?.approval?.status === "pending" && Date.parse(action.approval.expiresAt) <= Date.now()) {
      action.approval.status = "expired";
      action.status = "rejected";
      action.updatedAt = new Date().toISOString();
      await this.store.saveAction(action);
    }
    return action;
  }

  async requestAction(capabilityId: string, context: ExecutionContext, payload: Record<string, unknown>): Promise<CapabilityAction> {
    const definition = this.definitions.get(capabilityId);
    if (!definition) throw new Error(`Unknown capability: ${capabilityId}`);

    await this.startRun(context);
    const now = new Date();
    const hash = payloadHash(payload);
    const actionId = randomUUID();

    if (this.grants && !this.grants.allows(context.agentId, capabilityId)) {
      const denied: CapabilityAction = {
        id: actionId,
        capabilityId,
        context,
        payload,
        payloadHash: hash,
        riskLevel: definition.riskLevel,
        approvalMode: "none",
        status: "rejected",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        policyReason: `Agent ${context.agentId} is not granted capability ${capabilityId}.`,
      };
      await this.saveAction(denied);
      await this.audit("action.denied", denied, "system", "capability-broker", {
        reason: denied.policyReason,
        grant: "denied",
      });
      return denied;
    }

    const policy = this.policy ? await this.policy.evaluate(definition, context) : legacyDecision(definition, context);
    const policyDecision = {
      effect: policy.effect,
      source: this.policy ? policy.source : "legacy" as const,
      decisionId: policy.decisionId,
      connectorId: policy.connectorId,
      toolId: policy.toolId,
    };

    if (policy.effect === "deny") {
      const denied: CapabilityAction = {
        id: actionId,
        capabilityId,
        context,
        payload,
        payloadHash: hash,
        riskLevel: policy.riskLevel,
        approvalMode: policy.approvalMode,
        status: "rejected",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        policyReason: policy.reason,
        policyDecision,
      };
      await this.saveAction(denied);
      await this.audit("action.denied", denied, "system", "capability-broker", this.policyMetadata(policy));
      return denied;
    }

    const needsApproval = policy.effect === "approval";
    const approval: ApprovalContract | undefined = needsApproval ? {
      id: randomUUID(), actionId, payloadHash: hash, riskLevel: policy.riskLevel, status: "pending",
      requestedAt: now.toISOString(), expiresAt: new Date(now.getTime() + APPROVAL_TTL_MS).toISOString(),
    } : undefined;

    const action: CapabilityAction = {
      id: actionId,
      capabilityId,
      context,
      payload,
      payloadHash: hash,
      riskLevel: policy.riskLevel,
      approvalMode: policy.approvalMode,
      status: needsApproval ? "pending_approval" : "ready",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      approval,
      policyReason: policy.reason,
      policyDecision,
    };

    await this.saveAction(action);
    await this.audit("action.requested", action, "agent", context.agentId, this.policyMetadata(policy));
    if (approval) await this.audit("approval.requested", action, "system", "capability-broker", this.policyMetadata(policy));
    return action;
  }

  async decideAction(actionId: string, decision: "approved" | "rejected", decidedBy: string, reason?: string): Promise<CapabilityAction> {
    const action = await this.getAction(actionId);
    if (!action) throw new Error("Action not found");
    if (!action.approval) throw new Error("This action does not require approval");
    if (action.approval.status !== "pending") throw new Error(`Approval is already ${action.approval.status}`);
    if (action.approval.payloadHash !== action.payloadHash) throw new Error("Payload hash mismatch; approval cannot be applied");

    const now = new Date().toISOString();
    action.approval.status = decision;
    action.approval.decidedAt = now;
    action.approval.decidedBy = decidedBy;
    action.approval.reason = reason;
    action.status = decision === "approved" ? "approved" : "rejected";
    action.updatedAt = now;
    await this.saveAction(action);
    await this.audit(decision === "approved" ? "approval.approved" : "approval.rejected", action, "human", decidedBy, { reason, ...action.policyDecision });
    return action;
  }

  async executeAction(actionId: string): Promise<CapabilityAction> {
    const action = await this.getAction(actionId);
    if (!action) throw new Error("Action not found");
    if (!(["ready", "approved"] as ActionStatus[]).includes(action.status)) throw new Error(`Action ${action.id} cannot execute from status ${action.status}`);
    if (action.approval && action.approval.payloadHash !== action.payloadHash) throw new Error("Payload changed after approval");

    const definition = this.definitions.get(action.capabilityId);
    if (!definition) throw new Error(`Capability ${action.capabilityId} is no longer registered`);

    if (this.policy) {
      const currentPolicy = await this.policy.evaluate(definition, action.context);
      if (currentPolicy.effect === "deny") {
        await this.audit("action.denied", action, "system", "central-policy", this.policyMetadata(currentPolicy));
        throw new Error(`Central policy denied execution: ${currentPolicy.reason}`);
      }
      if (currentPolicy.riskLevel !== action.riskLevel || currentPolicy.approvalMode !== action.approvalMode) {
        await this.audit("action.denied", action, "system", "central-policy", { ...this.policyMetadata(currentPolicy), reason: "policy_changed_after_request" });
        throw new Error("Central policy changed after the action was requested; create a new action and approval.");
      }
    }

    const adapter = this.adapters.get(definition.adapterId);
    if (!adapter) throw new Error(`Adapter ${definition.adapterId} is not registered`);

    const executionStarted = Date.now();
    action.status = "executing";
    action.executionStartedAt = new Date(executionStarted).toISOString();
    action.updatedAt = action.executionStartedAt;
    await this.saveAction(action);
    await this.audit("action.executing", action, "system", "capability-broker", action.policyDecision);

    return startActiveSpan("bm.capability.execute", {
      "bm.capability.id": action.capabilityId,
      "bm.action.id": action.id,
      "bm.run.id": action.context.runId,
      "bm.tenant.id": action.context.tenantId,
      "bm.project.id": action.context.projectId,
      "bm.environment": action.context.environment,
      "bm.risk.level": action.riskLevel,
      "bm.adapter.id": adapter.id,
      "bm.policy.source": action.policyDecision?.source ?? "legacy",
      "bm.connector.id": action.policyDecision?.connectorId ?? "unmapped",
    }, async (span) => {
      try {
        action.result = await adapter.execute(definition, action.context, action.payload);
        action.status = action.result.ok ? "executed" : "failed";
        action.executionFinishedAt = new Date().toISOString();
        action.executionDurationMs = Math.max(0, Date.now() - executionStarted);
        action.updatedAt = action.executionFinishedAt;
        span.setAttribute("bm.capability.mode", action.result.mode);
        span.setAttribute("bm.capability.external_side_effect", action.result.externalSideEffect);
        span.setAttribute("bm.capability.duration_ms", action.executionDurationMs);
        await this.saveAction(action);
        await this.audit(action.result.ok ? "action.executed" : "action.failed", action, "system", adapter.id, {
          mode: action.result.mode, externalSideEffect: action.result.externalSideEffect,
          durationMs: action.executionDurationMs, error: action.result.error, ...action.policyDecision,
        });
        return action;
      } catch (error) {
        action.status = "failed";
        action.executionFinishedAt = new Date().toISOString();
        action.executionDurationMs = Math.max(0, Date.now() - executionStarted);
        action.updatedAt = action.executionFinishedAt;
        action.result = { ok: false, mode: "mock", externalSideEffect: false, error: error instanceof Error ? error.message : String(error) };
        span.setAttribute("bm.capability.duration_ms", action.executionDurationMs);
        await this.saveAction(action);
        await this.audit("action.failed", action, "system", adapter.id, { durationMs: action.executionDurationMs, error: action.result.error, ...action.policyDecision });
        return action;
      }
    });
  }

  private saveAction(action: CapabilityAction): Promise<void> { return this.store.saveAction(action); }

  private policyMetadata(policy: PolicyDecision): Record<string, unknown> {
    return { policySource: policy.source, policyDecisionId: policy.decisionId, connectorId: policy.connectorId, toolId: policy.toolId, riskLevel: policy.riskLevel, approvalMode: policy.approvalMode, reason: policy.reason };
  }

  private async audit(event: AuditEvent["event"], action: CapabilityAction, actorType: AuditEvent["actorType"], actorId: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.store.appendAudit({
      id: randomUUID(), timestamp: new Date().toISOString(), runId: action.context.runId,
      actorType, actorId, event, actionId: action.id, capabilityId: action.capabilityId,
      payloadHash: action.payloadHash, metadata,
    }, action.context);
  }
}
