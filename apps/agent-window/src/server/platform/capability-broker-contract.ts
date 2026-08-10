import type { AuditEvent, CapabilityAction, CapabilityDefinition, ExecutionContext } from "./capability-types.js";
import type { CapabilityRun } from "./capability-store.js";

export type MaybePromise<T> = T | Promise<T>;

/**
 * Runtime-facing capability contract. The local SQLite broker is synchronous;
 * the shared Postgres broker is asynchronous. Callers must await MaybePromise
 * values so the same CopilotKit tools can run against either persistence mode.
 */
export interface CapabilityBrokerContract {
  listCapabilities(): CapabilityDefinition[];
  startRun(context: ExecutionContext): MaybePromise<CapabilityRun>;
  getRun(runId: string): MaybePromise<CapabilityRun | undefined>;
  listRuns(limit?: number): MaybePromise<CapabilityRun[]>;
  listActionsForRun(runId: string): MaybePromise<CapabilityAction[]>;
  listAudit(limit?: number): MaybePromise<AuditEvent[]>;
  getAction(actionId: string): MaybePromise<CapabilityAction | undefined>;
  requestAction(
    capabilityId: string,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): MaybePromise<CapabilityAction>;
  decideAction(
    actionId: string,
    decision: "approved" | "rejected",
    decidedBy: string,
    reason?: string,
  ): MaybePromise<CapabilityAction>;
  executeAction(actionId: string): Promise<CapabilityAction>;
}
