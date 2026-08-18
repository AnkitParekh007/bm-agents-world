import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { EnvironmentName, ExecutionContext } from "./platform/capability-types.js";
import type { AgentPack, PackRegistry } from "./pack-registry.js";
import { resolvePackGovernance, type PackGovernance } from "./pack-governance.js";
import { compileWorkflow, type CompiledWorkflow, type CompiledWorkflowStep } from "./workflow-compiler.js";
import type { WorkflowRunResult } from "./workflow-executor.js";
import { BrokerStepRunner } from "./workflow-broker-runner.js";
import { executeWorkflowRun } from "./workflow-run-executor.js";
import type { WorkflowRunRecord, WorkflowRunStore, WorkflowStepRunRecord } from "./workflow-run-store.js";

/**
 * Governed workflow run service (Phase 5.2, live wiring).
 *
 * Connects the hardened workflow engine to the live request path: given a pack,
 * a workflow, and an authenticated scope, it loads the pack's compiled workflow,
 * builds a broker-backed governed runner from the pack's governance, and drives
 * the run through {@link executeWorkflowRun} against a durable
 * {@link WorkflowRunStore}. All the Phase 5.1 guarantees apply on this path:
 * authoritative specialist identity (from the compiled step, not the caller),
 * pack-decided governed-vs-reasoning steps, authoritative approvals, idempotency,
 * and resume from persisted server state. Launching with an existing runId
 * resumes that run.
 */

export type WorkflowServiceErrorCode =
  | "pack_not_found"
  | "pack_not_governed"
  | "workflow_not_found"
  | "workflow_invalid";

export class WorkflowServiceError extends Error {
  constructor(readonly code: WorkflowServiceErrorCode, message: string) {
    super(message);
    this.name = "WorkflowServiceError";
  }
}

export interface WorkflowLaunchScope {
  projectId: string;
  environment: EnvironmentName;
  userId: string;
  tenantId: string;
}

export interface WorkflowRunView {
  run: WorkflowRunRecord;
  steps: WorkflowStepRunRecord[];
}

export interface GovernedWorkflowServiceDeps {
  registry: PackRegistry;
  broker: CapabilityBrokerContract;
  store: WorkflowRunStore;
}

/** Loads and compiles a pack's workflow by id, guarding against path traversal. */
export function loadCompiledWorkflow(pack: AgentPack, workflowId: string): CompiledWorkflow | undefined {
  // A workflow id must be a bare file stem — never a path.
  if (!/^[a-zA-Z0-9._-]+$/.test(workflowId)) return undefined;
  const file = resolve(pack.directory, "workflows", `${workflowId}.yaml`);
  if (!existsSync(file)) return undefined;
  const raw = YAML.parse(readFileSync(file, "utf8"));
  const knownAgents = new Set([...pack.subAgents.map((agent) => agent.id), pack.supervisor]);
  return compileWorkflow(raw, { knownAgents });
}

function resolveStepAgent(
  governance: PackGovernance,
  pack: AgentPack,
  step: CompiledWorkflowStep,
): string | undefined {
  if (!step.agent) return undefined;
  return step.agent === pack.supervisor
    ? governance.runtimeProvider.supervisorRuntimeId(step.agent)
    : governance.runtimeProvider.specialistRuntimeId(step.agent);
}

export class GovernedWorkflowService {
  constructor(private readonly deps: GovernedWorkflowServiceDeps) {}

  async launch(
    packId: string,
    workflowId: string,
    scope: WorkflowLaunchScope,
    options: { runId?: string; inputs?: Record<string, unknown> } = {},
  ): Promise<WorkflowRunResult> {
    const pack = this.deps.registry.get(packId);
    if (!pack) throw new WorkflowServiceError("pack_not_found", `Unknown pack "${packId}".`);

    const governance = resolvePackGovernance(packId);
    if (!governance) {
      throw new WorkflowServiceError("pack_not_governed", `Pack "${packId}" has no governed workflow support.`);
    }

    const compiled = loadCompiledWorkflow(pack, workflowId);
    if (!compiled) {
      throw new WorkflowServiceError("workflow_not_found", `Workflow "${workflowId}" not found in pack "${packId}".`);
    }
    if (!compiled.ok) {
      throw new WorkflowServiceError("workflow_invalid", `Workflow "${workflowId}" failed to compile: ${compiled.diagnostics.join("; ")}`);
    }

    const runId = options.runId ?? randomUUID();
    const runner = new BrokerStepRunner({
      broker: this.deps.broker,
      resolveCapability: (step, context) => governance.resolveWorkflowBinding(step, context),
      buildContext: (_step, context): ExecutionContext => ({
        runId: context.runId,
        userId: scope.userId,
        agentId: "", // authoritative agent id is set from the compiled step below
        packId: pack.packName,
        projectId: scope.projectId,
        environment: scope.environment,
        tenantId: scope.tenantId,
        requestedAt: new Date().toISOString(),
      }),
      resolveAgentId: (step) => resolveStepAgent(governance, pack, step),
    });

    const packageHash = this.deps.registry.compiled(packId)?.contentHash;
    return executeWorkflowRun(compiled, runner, this.deps.store, {
      runId,
      packageHash,
      runtimeAdapter: "copilotkit",
      inputs: options.inputs,
    });
  }

  /** The authoritative persisted view of a run, or undefined when unknown. */
  getRun(runId: string): WorkflowRunView | undefined {
    const run = this.deps.store.getRun(runId);
    if (!run) return undefined;
    return { run, steps: this.deps.store.listSteps(runId) };
  }
}
