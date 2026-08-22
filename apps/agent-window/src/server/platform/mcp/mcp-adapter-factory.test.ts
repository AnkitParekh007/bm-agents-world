import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityDefinition, ExecutionContext } from "../capability-types.js";
import type {
  ApprovedConnector,
  ApprovedConnectorTool,
  ConnectorAdmission,
  McpConnectorSource,
} from "../connector-registry.js";
import { buildMcpAdapters, mcpAdapterId } from "./mcp-adapter-factory.js";
import { McpConnectionManager } from "./mcp-connection-manager.js";
import type { McpServerConfig, McpSession, McpToolResult, McpTransport } from "./mcp-transport.js";

const CONFIG: McpServerConfig = {
  connectorId: "jira",
  transport: "streamable-http",
  endpointRef: { provider: "vault", name: "jira-endpoint", purpose: "mcp-endpoint" },
};

function connector(id: string): ApprovedConnector {
  return {
    id,
    displayName: id,
    kind: "native-or-mcp",
    status: "approved",
    systems: [id],
    transports: ["streamable-http"],
    auth: "server-secret",
    allowedPacks: ["qa"],
    tools: [],
  };
}

function tool(capabilityId: string): ApprovedConnectorTool {
  return {
    id: "story.read",
    capabilityIds: [capabilityId],
    actionClass: "read",
    maxRisk: "L4",
    environments: ["qa"],
  };
}

/** A source advertising two MCP-capable connectors and admitting jira only. */
function source(): McpConnectorSource {
  return {
    mcpCapableConnectors: () => [
      { connector: connector("jira"), capabilityIds: ["qa.jira.story.read"] },
      { connector: connector("bitbucket"), capabilityIds: ["qa.bitbucket.change-impact.read"] },
    ],
    admission: (definition): ConnectorAdmission => {
      if (definition.id === "qa.jira.story.read") {
        return { allowed: true, connector: connector("jira"), tool: tool(definition.id), reason: "ok" };
      }
      return { allowed: false, reason: `Capability ${definition.id} is not admitted.` };
    },
  };
}

class FakeSession implements McpSession {
  constructor(readonly connectorId: string) {}
  async listTools() {
    return [{ name: "story.read" }];
  }
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    return { isError: false, content: { name, args } };
  }
  async ping() {}
  async close() {}
}

class FakeTransport implements McpTransport {
  async connect(config: McpServerConfig): Promise<McpSession> {
    return new FakeSession(config.connectorId);
  }
}

function manager() {
  return new McpConnectionManager({
    transport: new FakeTransport(),
    resolveConfig: () => CONFIG,
    sleep: async () => {},
  });
}

const DEFINITION: CapabilityDefinition = {
  id: "qa.jira.story.read",
  system: "jira",
  action: "story.read",
  description: "Read a story",
  riskLevel: "L0",
  approvalMode: "none",
  actionClass: "read",
  externalWrite: false,
  productionMutation: false,
  allowedEnvironments: ["qa"],
  adapterId: mcpAdapterId("jira"),
};

const CONTEXT: ExecutionContext = {
  runId: "run-1",
  userId: "user-1",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-1",
  requestedAt: new Date().toISOString(),
};

test("one adapter is built per MCP-capable connector, with stable ids", () => {
  const built = buildMcpAdapters({ registry: source(), manager: manager() });

  assert.deepEqual(
    built.map((b) => b.connectorId),
    ["jira", "bitbucket"],
  );
  assert.deepEqual(
    built.map((b) => b.adapter.id),
    ["jira-mcp-adapter", "bitbucket-mcp-adapter"],
  );
  assert.deepEqual(built[0].capabilityIds, ["qa.jira.story.read"]);
});

test("a built adapter governs execution through the shared manager", async () => {
  const built = buildMcpAdapters({ registry: source(), manager: manager() });
  const jira = built.find((b) => b.connectorId === "jira")!;

  const result = await jira.adapter.execute(DEFINITION, CONTEXT, { storyId: "PCC-1" });

  assert.equal(result.ok, true);
  assert.equal(result.mode, "live");
  assert.deepEqual(result.data, { name: "story.read", args: { storyId: "PCC-1" } });
});

test("a built adapter still fails closed on an unadmitted capability", async () => {
  const built = buildMcpAdapters({ registry: source(), manager: manager() });
  const bitbucket = built.find((b) => b.connectorId === "bitbucket")!;

  const bbDefinition: CapabilityDefinition = {
    ...DEFINITION,
    id: "qa.bitbucket.change-impact.read",
    system: "bitbucket",
    adapterId: mcpAdapterId("bitbucket"),
  };
  const result = await bitbucket.adapter.execute(bbDefinition, CONTEXT, {});

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /is not admitted/);
});
