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
import type { CapabilityRun, CapabilityStore } from "./capability-store.js";

const APPROVAL_TTL_MS = 10 * 60 * 1000;
const RISK_REQUIRES_HUMAN = new Set<RiskLevel>(["L2", "L3", "L4"]);

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

function effectiveRisk(
  definition: CapabilityDefinition,
  environment: EnvironmentName,
): RiskLevel {
  if (environment === "prod" && definition.actionClass === "read") return "L4";
  return definition.riskLevel;
}

export class CapabilityBroker {
  private readonly definitions = new Map<string, CapabilityDefinition>();
  private readonly adapters = new Map<string, CapabilityAdapter>();
  private readonly actions = new Map<string, CapabilityAction>();
  private readonly runs = new Map<string, CapabilityRun>();
  private readonly auditEvents: AuditEvent[] = [];

  constructor(
    definitions: CapabilityDefinition[],
    adapters: CapabilityAdapter[],
    private readonly store?: CapabilityStore,
  ) {
    for (const definition of definitions) this.definitions.set(definition.id, definition);
    for (const adapter of adapters) this.adapters.set(adapter.id, adapter);
  }

  listCapabilities(): CapabilityDefinition[] {
    return [...this.definitions.values()];
  }

  startRun(context: ExecutionContext): CapabilityRun {
    const run = this.store?.upsertRun(context) ?? {
      id: context.runId,
      context,
      createdAt: context.requestedAt,
      updatedAt: new Date().toISOString(),
    };
    this.runs.set(run.id, run);
    return run;
  }

  getRun(runId: string): CapabilityRun | undefined {
    const persisted = this.store?.getRun(runId);
    if (persisted) this.runs.set(runId, persisted);
    return persisted ?? this.runs.get(runId);
  }

  listRuns(limit = 100): CapabilityRun[] {
    if (this.store) return this.store.listRuns(limit);
    return [...this.runs.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, Math.max(1, Math.min(limit, 500)));
  }

  listActionsForRun(runId: string): CapabilityAction[] {
    if (this.store) return this.store.listActionsForRun(runId);
    return [...this.actions.values()]
      .filter((action) => action.context.runId === runId)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  }

  listAudit(limit = 100): AuditEvent[] {
    if (this.store) return this.store.listAudit(limit);
    return this.auditEvents.slice(-Math.max(1, Math.min(limit, 500))).reverse();
  }

  getAction(actionId: string): CapabilityAction | undefined {
    const persisted = this.store?.getAction(actionId);
    if (persisted) this.actions.set(actionId, persisted);
    const action = persisted ?? this.actions.get(actionId);
    if (action?.approval?.status === "pending" && Date.parse(action.approval.expiresAt) <= Date.now()) {
      action.approval.status = "expired";
      action.status = "rejected";
      action.updatedAt = new Date().toISOString();
      this.saveAction(action);
    }
    return action;
  }

  requestAction(
    capabilityId: string,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): CapabilityAction {
    const definition = this.definitions.get(capabilityId);
    if (!definition) throw new Error(`Unknown capability: ${capabilityId}`);

    this.startRun(context);
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
      this.saveAction(denied);
      this.audit("action.denied", denied, "system", "capability-broker", {
        reason: denied.policyReason,
      });
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
      this.saveAction(denied);
      this.audit("action.denied", denied, "system", "capability-broker", {
        reason: denied.policyReason,
      });
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

    this.saveAction(action);
    this.audit("action.requested", action, "agent", context.agentId);
    if (approval) this.audit("approval.requested", action, "system", "capability-broker");
    return action;
  }

  decideAction(
    actionId: string,
    decision: "approved" | "rejected",
    decidedBy: string,
    reason?: string,
  ): CapabilityAction {
    const action = this.getAction(actionId);
    if (!action) throw new Error("Action not found");
    if (!action.approval) throw new Error("This action does not require approval");
    if (action.approval.status !== "pending") {
      throw new Error(`Approval is already ${action.approval.status}`);
    }
    if (action.approval.payloadHash !== action.payloadHash) {
      throw new Error("Payload hash mismatch; approval cannot be applied");
    }

    const now = new Date().toISOString();
    action.approval.status = decision;
    action.approval.decidedAt = now;
    action.approval.decidedBy = decidedBy;
    action.approval.reason = reason;
    action.status = decision === "approved" ? "approved" : "rejected";
    action.updatedAt = now;
    this.saveAction(action);

    this.audit(
      decision === "approved" ? "approval.approved" : "approval.rejected",
      action,
      "human",
      decidedBy,
      { reason },
    );
    return action;
  }

  async executeAction(actionId: string): Promise<CapabilityAction> {
    const action = this.getAction(actionId);
    if (!action) throw new Error("Action not found");

    if (!(["ready", "approved"] as ActionStatus[]).includes(action.status)) {
      throw new Error(`Action ${action.id} cannot execute from status ${action.status}`);
    }

    if (action.approval && action.approval.payloadHash !== action.payloadHash) {
      throw new Error("Payload changed after approval");
    }

    const definition = this.definitions.get(action.capabilityId);
    if (!definition) throw new Error(`Capability ${action.capabilityId} is no longer registered`);
    const adapter = this.adapters.get(definition.adapterId);
    if (!adapter) throw new Error(`Adapter ${definition.adapterId} is not registered`);

    action.status = "executing";
    action.updatedAt = new Date().toISOString();
    this.saveAction(action);
    this.audit("action.executing", action, "system", "capability-broker");

    try {
      action.result = await adapter.execute(definition, action.context, action.payload);
      action.status = action.result.ok ? "executed" : "failed";
      action.updatedAt = new Date().toISOString();
      this.saveAction(action);
      this.audit(
        action.result.ok ? "action.executed" : "action.failed",
        action,
        "system",
        adapter.id,
        {
          mode: action.result.mode,
          externalSideEffect: action.result.externalSideEffect,
          error: action.result.error,
        },
      );
      return action;
    } catch (error) {
      action.status = "failed";
      action.updatedAt = new Date().toISOString();
      action.result = {
        ok: false,
        mode: "mock",
        externalSideEffect: false,
        error: error instanceof Error ? error.message : String(error),
      };
      this.saveAction(action);
      this.audit("action.failed", action, "system", adapter.id, {
        error: action.result.error,
      });
      return action;
    }
  }

  private saveAction(action: CapabilityAction): void {
    this.actions.set(action.id, action);
    this.store?.saveAction(action);
    const run = this.store?.getRun(action.context.runId);
    if (run) this.runs.set(run.id, run);
  }

  private audit(
    event: AuditEvent["event"],
    action: CapabilityAction,
    actorType: AuditEvent["actorType"],
    actorId: string,
    metadata?: Record<string, unknown>,
  ) {
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
    this.auditEvents.push(auditEvent);
    this.store?.appendAudit(auditEvent, action.context);
  }
}
