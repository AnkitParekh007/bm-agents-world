import type { ApprovalMode, CapabilityDefinition, ExecutionContext, RiskLevel } from "./capability-types.js";
import { ApprovedConnectorRegistry, type ConnectorAdmission } from "./connector-registry.js";

export interface PolicyDecision {
  effect: "allow" | "deny" | "approval";
  riskLevel: RiskLevel;
  approvalMode: ApprovalMode;
  reason: string;
  source: "local" | "opa";
  decisionId?: string;
  connectorId?: string;
  toolId?: string;
}

export interface PolicyEvaluator {
  evaluate(definition: CapabilityDefinition, context: ExecutionContext): Promise<PolicyDecision>;
  healthCheck(): Promise<boolean>;
  status(): { mode: string; source: string; failClosed: boolean };
}

const RISK_ORDER: RiskLevel[] = ["L0", "L1", "L2", "L3", "L4"];
const EFFECT_ORDER: PolicyDecision["effect"][] = ["allow", "approval", "deny"];

function maxRisk(left: RiskLevel, right: RiskLevel): RiskLevel {
  return RISK_ORDER[Math.max(RISK_ORDER.indexOf(left), RISK_ORDER.indexOf(right))] ?? "L4";
}

function stricterEffect(left: PolicyDecision["effect"], right: PolicyDecision["effect"]): PolicyDecision["effect"] {
  return EFFECT_ORDER[Math.max(EFFECT_ORDER.indexOf(left), EFFECT_ORDER.indexOf(right))] ?? "deny";
}

function approvalFor(effect: PolicyDecision["effect"], riskLevel: RiskLevel, baseline: ApprovalMode, requested: ApprovalMode): ApprovalMode {
  if (riskLevel === "L4") return "privileged-process";
  if (effect === "approval") {
    return baseline === "privileged-process" || requested === "privileged-process" ? "privileged-process" : "human";
  }
  if (effect === "deny") return requested === "privileged-process" ? "privileged-process" : baseline;
  return baseline;
}

function baselineDecision(definition: CapabilityDefinition, context: ExecutionContext, admission: ConnectorAdmission): PolicyDecision {
  if (!admission.allowed) {
    return {
      effect: "deny",
      riskLevel: definition.riskLevel,
      approvalMode: "none",
      reason: admission.reason,
      source: "local",
      connectorId: admission.connector?.id,
      toolId: admission.tool?.id,
    };
  }
  if (!definition.allowedEnvironments.includes(context.environment)) {
    return { effect: "deny", riskLevel: definition.riskLevel, approvalMode: "none", reason: `Capability is not allowed in ${context.environment}.`, source: "local", connectorId: admission.connector?.id, toolId: admission.tool?.id };
  }
  if (context.environment === "prod" && definition.productionMutation) {
    return { effect: "deny", riskLevel: "L4", approvalMode: "privileged-process", reason: "Free-form production mutation is denied.", source: "local", connectorId: admission.connector?.id, toolId: admission.tool?.id };
  }

  const riskLevel = context.environment === "prod" && definition.actionClass === "read"
    ? maxRisk(definition.riskLevel, "L4")
    : definition.riskLevel;
  const requiresApproval = ["L2", "L3", "L4"].includes(riskLevel);
  return {
    effect: requiresApproval ? "approval" : "allow",
    riskLevel,
    approvalMode: riskLevel === "L4" ? "privileged-process" : requiresApproval ? "human" : definition.approvalMode,
    reason: requiresApproval ? `${riskLevel} requires governed approval.` : `${riskLevel} is permitted by standing policy.`,
    source: "local",
    connectorId: admission.connector?.id,
    toolId: admission.tool?.id,
  };
}

export class LocalPolicyEngine implements PolicyEvaluator {
  constructor(private readonly connectors: ApprovedConnectorRegistry) {}

  async evaluate(definition: CapabilityDefinition, context: ExecutionContext): Promise<PolicyDecision> {
    return baselineDecision(definition, context, this.connectors.admission(definition, context.packId, context.environment));
  }
  async healthCheck() { return true; }
  status() { return { mode: "local", source: "approved-connectors.yaml", failClosed: true }; }
}

export class OpaPolicyEngine implements PolicyEvaluator {
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly connectors: ApprovedConnectorRegistry,
    baseUrl = process.env.BM_OPA_URL?.trim() || "http://127.0.0.1:8181",
  ) {
    this.endpoint = `${baseUrl.replace(/\/$/, "")}/v1/data/bm/agents/world/decision`;
    this.timeoutMs = Math.max(250, Math.min(Number(process.env.BM_OPA_TIMEOUT_MS ?? 1500), 10000));
  }

  async evaluate(definition: CapabilityDefinition, context: ExecutionContext): Promise<PolicyDecision> {
    const admission = this.connectors.admission(definition, context.packId, context.environment);
    const baseline = baselineDecision(definition, context, admission);
    if (!admission.allowed || baseline.effect === "deny") return baseline;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: { definition, context, connector: admission.connector, tool: admission.tool, baseline } }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`OPA returned HTTP ${response.status}`);
      const body = await response.json() as { result?: Partial<PolicyDecision>; decision_id?: string };
      const result = body.result;
      if (!result?.effect || !result.riskLevel || !result.approvalMode) throw new Error("OPA decision is undefined or incomplete");

      const effect = stricterEffect(baseline.effect, result.effect);
      const riskLevel = maxRisk(baseline.riskLevel, result.riskLevel);
      const approvalMode = approvalFor(effect, riskLevel, baseline.approvalMode, result.approvalMode);
      const bounded = effect !== result.effect || riskLevel !== result.riskLevel || approvalMode !== result.approvalMode;
      return {
        effect,
        riskLevel,
        approvalMode,
        reason: bounded
          ? `OPA decision was bounded by the capability/connector minimum. OPA reason: ${String(result.reason ?? "not provided")}`
          : String(result.reason ?? "OPA policy decision"),
        source: "opa",
        decisionId: body.decision_id,
        connectorId: admission.connector?.id,
        toolId: admission.tool?.id,
      };
    } catch (error) {
      return {
        effect: "deny",
        riskLevel: maxRisk(baseline.riskLevel, "L4"),
        approvalMode: "privileged-process",
        reason: `OPA unavailable; fail-closed policy denied the action: ${error instanceof Error ? error.message : String(error)}`,
        source: "opa",
        connectorId: admission.connector?.id,
        toolId: admission.tool?.id,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const base = this.endpoint.split("/v1/data/")[0];
      const response = await fetch(`${base}/health?plugins`, { signal: AbortSignal.timeout(this.timeoutMs) });
      return response.ok;
    } catch { return false; }
  }

  status() { return { mode: "opa", source: this.endpoint, failClosed: true }; }
}

export function createPolicyEngine(connectors: ApprovedConnectorRegistry): PolicyEvaluator {
  const mode = process.env.BM_POLICY_MODE?.trim().toLowerCase() || "local";
  if (mode === "opa") return new OpaPolicyEngine(connectors);
  if (mode === "local") return new LocalPolicyEngine(connectors);
  throw new Error(`Unsupported BM_POLICY_MODE: ${mode}`);
}
