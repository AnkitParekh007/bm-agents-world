import { createHash, randomUUID } from "node:crypto";
import type {
  ActionStatus,
  ApprovalContract,
  AuditEvent,
  CapabilityAction,
  CapabilityAdapter,
  CapabilityDefinition,
  EnvironmentName,
  ExecutionContext,
  RiskLevel,
} from "./capability-types.js";
import type { CapabilityRun } from "./capability-store.js";
import type { CapabilityBrokerContract } from "./capability-broker-contract.js";
import { startActiveSpan } from "./telemetry.js";

const APPROVAL_TTL_MS = 10 * 60 * 1000;
const RISK_REQUIRES_HUMAN = new Set<RiskLevel>(["L2", "L3", "L4"]);

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
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(payload)))
    .digest("hex");
}

function effectiveRisk(definition: CapabilityDefinition, environment: EnvironmentName): RiskLevel {
  if (environment === "prod" && definition.actionClass === "read") return "L4";
  return definition.riskLevel;
}

/**
 * Shared-store broker. It intentionally mirrors the local CapabilityBroker
 * policy semantics while awaiting every persistence boundary so another pod can
 * immediately observe runs, approvals, actions and audit events.
 */
export class AsyncCapabilityBroker implements CapabilityBrokerContract {
  private readonly definitions = new Map<string, CapabilityDefinition>();
  private readonly adapters = new Map<string, CapabilityAdapter>();

  constructor(
    definitions: CapabilityDefinition[],
    adapters: CapabilityAdapter[],
    private readonly store: AsyncCapabilityStore,
  ) {
    for (const definition of definitions) this.definitions.set(definition.id, definition);
    for (const adapter of adapters) this.adapters.set(adapter.id, adapter);
  }

  listCapabilities(): CapabilityDefinition[] {
    return [...this.definitions.values()];
  }

  startRun(context: ExecutionContext): Promise<CapabilityRun> {
    return this.store.upsertRun(context);
  }

  getRun(runId: string): Promise<CapabilityRun | undefined> {
    return this.store.getRun(runId);
  }

  listRuns(limit = 100): Promise<CapabilityRun[]> {
    return this.store.listRuns(limit);
  }

  listActionsForRun(runId: string): Promise<CapabilityAction[]> {
    return this.store.listActionsForRun(runId);
  }

  listAudit(limit = 100): Promise<AuditEvent[]> {
    return this.store.listAudit(limit);
  }

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

  async requestAction(
    capabilityId: string,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<CapabilityAction> {
    const definition = this.definitions.get(capabilityId);
    if (!definition) throw new Error(`Unknown capability: ${capabilityId}`);

    await this.startRun(context);
    const now = new Date();
    const hash = payloadHash(payload);
    const riskLevel = effectiveRisk(definition, context.environment);
    const actionId = randomUUID();

    if (!definition.allowedEnvironments.includes(context.environment)) {
      const denied: CapabilityAction = {
        id: actionId,
        capabilityId,
        context,
        payload,
        payloadHash: hash,
        riskLevel,
        approvalMode: definition.approvalMode,
        status: "rejected",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        policyReason: `Capability is not allowed in ${context.environment}.`,
      };
      await this.saveAction(denied);
      await this.audit("action.denied", denied, "system", "capability-broker", { reason: denied.policyReason });
      return denied;
    }

    if (context.environment === "prod" && definition.productionMutation) {
      const denied: CapabilityAction = {
        id: actionId,
        capabilityId,
        context,
        payload,
        payloadHash: hash,
        riskLevel: "L4",
        approvalMode: "privileged-process",
        status: "rejected",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        policyReason: "Free-form production mutation is denied by the QA pack policy.",
      };
      await this.saveAction(denied);
      await this.audit("action.denied", denied, "system", "capability-broker", { reason: denied.policyReason });
      return denied;
    }

    const needsApproval = RISK_REQUIRES_HUMAN.has(riskLevel);
    const approval: ApprovalContract | undefined = needsApproval
      ? {
          id: randomUUID(),
          actionId,
          payloadHash: hash,
          riskLevel,
          status: "pending",
          requestedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + APPROVAL_TTL_MS).toISOString(),
        }
      : undefined;

    const action: CapabilityAction = {
      id: actionId,
      capabilityId,
      context,
      payload,
      payloadHash: hash,
      riskLevel,
      approvalMode: needsApproval ? "human" : definition.approvalMode,
      status: needsApproval ? "pending_approval" : "ready",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      approval,
      policyReason: needsApproval
        ? `${riskLevel} requires a payload-bound human approval.`
        : riskLevel === "L1"
          ? "L1 is permitted by the current standing test policy."
          : "L0 scoped read is permitted automatically.",
    };

    await this.saveAction(action);
    await this.audit("action.requested", action, "agent", context.agentId);
    if (approval) await this.audit("approval.requested", action, "system", "capability-broker");
    return action;
  }

  async decideAction(
    actionId: string,
    decision: "approved" | "rejected",
    decidedBy: string,
    reason?: string,
  ): Promise<CapabilityAction> {
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
    await this.audit(
      decision === "approved" ? "approval.approved" : "approval.rejected",
      action,
      "human",
      decidedBy,
      { reason },
    );
    return action;
  }

  async executeAction(actionId: string): Promise<CapabilityAction> {
    const action = await this.getAction(actionId);
    if (!action) throw new Error("Action not found");
    if (!(["ready", "approved"] as ActionStatus[]).includes(action.status)) {
      throw new Error(`Action ${action.id} cannot execute from status ${action.status}`);
    }
    if (action.approval && action.approval.payloadHash !== action.payloadHash) throw new Error("Payload changed after approval");

    const definition = this.definitions.get(action.capabilityId);
    if (!definition) throw new Error(`Capability ${action.capabilityId} is no longer registered`);
    const adapter = this.adapters.get(definition.adapterId);
    if (!adapter) throw new Error(`Adapter ${definition.adapterId} is not registered`);

    const executionStarted = Date.now();
    action.status = "executing";
    action.executionStartedAt = new Date(executionStarted).toISOString();
    action.updatedAt = action.executionStartedAt;
    await this.saveAction(action);
    await this.audit("action.executing", action, "system", "capability-broker");

    return startActiveSpan(
      "bm.capability.execute",
      {
        "bm.capability.id": action.capabilityId,
        "bm.action.id": action.id,
        "bm.run.id": action.context.runId,
        "bm.tenant.id": action.context.tenantId,
        "bm.project.id": action.context.projectId,
        "bm.environment": action.context.environment,
        "bm.risk.level": action.riskLevel,
        "bm.adapter.id": adapter.id,
      },
      async (span) => {
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
            mode: action.result.mode,
            externalSideEffect: action.result.externalSideEffect,
            durationMs: action.executionDurationMs,
            error: action.result.error,
          });
          return action;
        } catch (error) {
          action.status = "failed";
          action.executionFinishedAt = new Date().toISOString();
          action.executionDurationMs = Math.max(0, Date.now() - executionStarted);
          action.updatedAt = action.executionFinishedAt;
          action.result = {
            ok: false,
            mode: "mock",
            externalSideEffect: false,
            error: error instanceof Error ? error.message : String(error),
          };
          span.setAttribute("bm.capability.duration_ms", action.executionDurationMs);
          await this.saveAction(action);
          await this.audit("action.failed", action, "system", adapter.id, {
            durationMs: action.executionDurationMs,
            error: action.result.error,
          });
          return action;
        }
      },
    );
  }

  private saveAction(action: CapabilityAction): Promise<void> {
    return this.store.saveAction(action);
  }

  private async audit(
    event: AuditEvent["event"],
    action: CapabilityAction,
    actorType: AuditEvent["actorType"],
    actorId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const auditEvent: AuditEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      runId: action.context.runId,
      actorType,
      actorId,
      event,
      actionId: action.id,
      capabilityId: action.capabilityId,
      payloadHash: action.payloadHash,
      metadata,
    };
    await this.store.appendAudit(auditEvent, action.context);
  }
}
