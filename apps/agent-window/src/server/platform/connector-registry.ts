import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type { ActionStatus, CapabilityDefinition, EnvironmentName, RiskLevel } from "./capability-types.js";

export type ConnectorStatus = "approved" | "pilot" | "disabled";
export type ConnectorKind = "mcp" | "native" | "native-or-mcp";

export interface ApprovedConnectorTool {
  id: string;
  capabilityIds: string[];
  actionClass: CapabilityDefinition["actionClass"];
  maxRisk: RiskLevel;
  environments: EnvironmentName[];
  approval?: "human" | "privileged-process";
}

export interface ApprovedConnector {
  id: string;
  displayName: string;
  kind: ConnectorKind;
  status: ConnectorStatus;
  systems: string[];
  transports: string[];
  auth: string;
  allowedPacks: string[];
  tools: ApprovedConnectorTool[];
}

export interface ConnectorAdmission {
  allowed: boolean;
  connector?: ApprovedConnector;
  tool?: ApprovedConnectorTool;
  reason: string;
}

function repoRoot(): string {
  const candidates = [process.env.BM_AGENTS_REPO_ROOT, resolve(process.cwd(), "../.."), process.cwd()]
    .filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "packs"))) return candidate;
  }
  throw new Error("Unable to locate BM Agents World repository root");
}

function normalizePackId(packId: string): string {
  return packId.replace(/-agent-pack$/, "");
}

export class ApprovedConnectorRegistry {
  private readonly connectors: ApprovedConnector[];
  private readonly byCapability = new Map<string, { connector: ApprovedConnector; tool: ApprovedConnectorTool }>();

  constructor(path = process.env.BM_CONNECTOR_REGISTRY_PATH?.trim() || resolve(repoRoot(), "config", "approved-connectors.yaml")) {
    const document = YAML.parse(readFileSync(path, "utf8")) as Record<string, any>;
    const entries = Array.isArray(document.connectors) ? document.connectors : [];
    this.connectors = entries.map((entry): ApprovedConnector => ({
      id: String(entry.id),
      displayName: String(entry.displayName ?? entry.id),
      kind: String(entry.kind ?? "mcp") as ConnectorKind,
      status: String(entry.status ?? "disabled") as ConnectorStatus,
      systems: Array.isArray(entry.systems) ? entry.systems.map(String) : [],
      transports: Array.isArray(entry.transports) ? entry.transports.map(String) : [],
      auth: String(entry.auth ?? "unspecified"),
      allowedPacks: Array.isArray(entry.allowedPacks) ? entry.allowedPacks.map(String) : [],
      tools: Array.isArray(entry.tools) ? entry.tools.map((tool: any): ApprovedConnectorTool => ({
        id: String(tool.id),
        capabilityIds: Array.isArray(tool.capabilityIds) ? tool.capabilityIds.map(String) : [],
        actionClass: String(tool.actionClass ?? "read") as CapabilityDefinition["actionClass"],
        maxRisk: String(tool.maxRisk ?? "L0") as RiskLevel,
        environments: Array.isArray(tool.environments) ? tool.environments.map(String) as EnvironmentName[] : [],
        approval: tool.approval ? String(tool.approval) as ApprovedConnectorTool["approval"] : undefined,
      })) : [],
    }));

    for (const connector of this.connectors) {
      for (const tool of connector.tools) {
        for (const capabilityId of tool.capabilityIds) {
          if (this.byCapability.has(capabilityId)) throw new Error(`Capability ${capabilityId} is registered by multiple connectors`);
          this.byCapability.set(capabilityId, { connector, tool });
        }
      }
    }
  }

  listPublic() {
    return this.connectors.map((connector) => ({
      id: connector.id,
      displayName: connector.displayName,
      kind: connector.kind,
      status: connector.status,
      systems: connector.systems,
      transports: connector.transports,
      auth: connector.auth,
      allowedPacks: connector.allowedPacks,
      tools: connector.tools.map(({ capabilityIds, ...tool }) => ({ ...tool, capabilityCount: capabilityIds.length })),
    }));
  }

  admission(definition: CapabilityDefinition, packId: string, environment: EnvironmentName): ConnectorAdmission {
    const mapped = this.byCapability.get(definition.id);
    if (!mapped) return { allowed: false, reason: `Capability ${definition.id} is not present in the approved connector registry.` };
    const { connector, tool } = mapped;
    if (connector.status === "disabled") return { allowed: false, connector, tool, reason: `Connector ${connector.id} is disabled.` };
    const normalizedPack = normalizePackId(packId);
    if (!connector.allowedPacks.includes("*") && !connector.allowedPacks.includes(normalizedPack)) {
      return { allowed: false, connector, tool, reason: `Connector ${connector.id} is not approved for pack ${normalizedPack}.` };
    }
    if (!tool.environments.includes(environment)) {
      return { allowed: false, connector, tool, reason: `Tool ${connector.id}.${tool.id} is not approved in ${environment}.` };
    }
    if (tool.actionClass !== definition.actionClass) {
      return { allowed: false, connector, tool, reason: `Connector registry action class does not match ${definition.id}.` };
    }
    return { allowed: true, connector, tool, reason: `${connector.id}.${tool.id} is centrally approved.` };
  }
}
