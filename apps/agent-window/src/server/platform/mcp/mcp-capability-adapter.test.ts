import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityDefinition, ExecutionContext } from "../capability-types.js";
import type {
  ApprovedConnector,
  ApprovedConnectorTool,
  ConnectorAdmission,
  ConnectorAdmissionResolver,
} from "../connector-registry.js";
import { McpCapabilityAdapter } from "./mcp-capability-adapter.js";
import { McpConnectionManager } from "./mcp-connection-manager.js";
import type {
  McpServerConfig,
  McpSession,
  McpToolDescriptor,
  McpToolResult,
  McpTransport,
} from "./mcp-transport.js";

const CONFIG: McpServerConfig = {
  connectorId: "jira",
  transport: "streamable-http",
  endpointRef: { provider: "vault", name: "jira-endpoint", purpose: "mcp-endpoint" },
};

const DEFINITION: CapabilityDefinition = {
  id: "qa.jira.story.read",
  system: "jira",
  action: "story.read",
  description: "Read a Jira story",
  riskLevel: "L0",
  approvalMode: "none",
  actionClass: "read",
  externalWrite: false,
  productionMutation: false,
  allowedEnvironments: ["qa"],
  adapterId: "jira-mcp-adapter",
};

function context(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    runId: "run-1",
    userId: "user-1",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-1",
    requestedAt: new Date().toISOString(),
    ...overrides,
  };
}

const jiraConnector: ApprovedConnector = {
  id: "jira",
  displayName: "Jira Cloud",
  kind: "native-or-mcp",
  status: "approved",
  systems: ["jira"],
  transports: ["streamable-http"],
  auth: "server-secret",
  allowedPacks: ["qa"],
  tools: [],
};

const storyReadTool: ApprovedConnectorTool = {
  id: "story.read",
  capabilityIds: ["qa.jira.story.read"],
  actionClass: "read",
  maxRisk: "L4",
  environments: ["qa"],
};

function allowAdmission(overrides: Partial<ConnectorAdmission> = {}): ConnectorAdmissionResolver {
  return {
    admission: () => ({
      allowed: true,
      connector: jiraConnector,
      tool: storyReadTool,
      reason: "ok",
      ...overrides,
    }),
  };
}

function denyAdmission(reason: string): ConnectorAdmissionResolver {
  return { admission: () => ({ allowed: false, reason }) };
}

interface SessionScript {
  tools?: McpToolDescriptor[];
  call?: (name: string, args: Record<string, unknown>) => Promise<McpToolResult>;
}

class FakeSession implements McpSession {
  closed = false;
  constructor(readonly connectorId: string, private readonly script: SessionScript) {}
  async listTools(): Promise<McpToolDescriptor[]> {
    return this.script.tools ?? [{ name: "story.read" }];
  }
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    if (this.script.call) return this.script.call(name, args);
    return { isError: false, content: { name, args } };
  }
  async ping(): Promise<void> {}
  async close(): Promise<void> {
    this.closed = true;
  }
}

class FakeTransport implements McpTransport {
  connectCount = 0;
  constructor(private readonly plan: Array<SessionScript | Error>) {}
  async connect(config: McpServerConfig): Promise<McpSession> {
    const step = this.plan[Math.min(this.connectCount, this.plan.length - 1)];
    this.connectCount += 1;
    if (step instanceof Error) throw step;
    return new FakeSession(config.connectorId, step);
  }
}

function managerFor(transport: FakeTransport) {
  return new McpConnectionManager({
    transport,
    resolveConfig: () => CONFIG,
    sleep: async () => {},
    backoffBaseMs: 0,
  });
}

function adapterFor(registry: ConnectorAdmissionResolver, transport: FakeTransport) {
  return new McpCapabilityAdapter({
    id: "jira-mcp-adapter",
    connectorId: "jira",
    registry,
    manager: managerFor(transport),
  });
}

test("an admitted capability executes via the MCP session", async () => {
  const transport = new FakeTransport([
    { call: async (name, args) => ({ isError: false, content: { name, args } }) },
  ]);
  const adapter = adapterFor(allowAdmission(), transport);

  const result = await adapter.execute(DEFINITION, context(), { storyId: "PCC-1" });

  assert.equal(result.ok, true);
  assert.equal(result.mode, "live");
  assert.equal(result.externalSideEffect, false);
  assert.deepEqual(result.data, { name: "story.read", args: { storyId: "PCC-1" } });
});

test("a denied capability fails closed without touching the server", async () => {
  const transport = new FakeTransport([{}]);
  const adapter = adapterFor(denyAdmission("Connector jira is disabled."), transport);

  const result = await adapter.execute(DEFINITION, context(), { storyId: "PCC-1" });

  assert.equal(result.ok, false);
  assert.equal(result.error, "Connector jira is disabled.");
  assert.equal(transport.connectCount, 0);
});

test("a capability mapped to a different connector fails closed", async () => {
  const transport = new FakeTransport([{}]);
  const otherConnector: ApprovedConnector = { ...jiraConnector, id: "bitbucket" };
  const adapter = adapterFor(
    allowAdmission({ connector: otherConnector }),
    transport,
  );

  const result = await adapter.execute(DEFINITION, context(), {});

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /maps to connector bitbucket, not jira/);
  assert.equal(transport.connectCount, 0);
});

test("a native-only connector cannot be served over MCP", async () => {
  const transport = new FakeTransport([{}]);
  const nativeConnector: ApprovedConnector = { ...jiraConnector, kind: "native" };
  const adapter = adapterFor(allowAdmission({ connector: nativeConnector }), transport);

  const result = await adapter.execute(DEFINITION, context(), {});

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /native-only/);
  assert.equal(transport.connectCount, 0);
});

test("a tool the server does not advertise fails closed", async () => {
  const transport = new FakeTransport([{ tools: [{ name: "something.else" }] }]);
  const adapter = adapterFor(allowAdmission(), transport);

  const result = await adapter.execute(DEFINITION, context(), {});

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /does not advertise tool story\.read/);
});

test("a tool error result maps to a failed adapter result", async () => {
  const transport = new FakeTransport([
    { call: async () => ({ isError: true, content: "rate limited" }) },
  ]);
  const adapter = adapterFor(allowAdmission(), transport);

  const result = await adapter.execute(DEFINITION, context(), {});

  assert.equal(result.ok, false);
  assert.equal(result.error, "rate limited");
});

test("a dropped session is reconnected and the call retried once", async () => {
  let attempts = 0;
  const transport = new FakeTransport([
    {
      call: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("connection reset");
        return { isError: false, content: { retried: true } };
      },
    },
  ]);
  const adapter = adapterFor(allowAdmission(), transport);

  const result = await adapter.execute(DEFINITION, context(), {});

  assert.equal(result.ok, true);
  assert.deepEqual(result.data, { retried: true });
  assert.equal(transport.connectCount, 2); // initial + reconnect
});

test("externalSideEffect follows the capability definition", async () => {
  const transport = new FakeTransport([
    { tools: [{ name: "bug.create" }], call: async () => ({ isError: false, content: {} }) },
  ]);
  const writeConnector: ApprovedConnector = { ...jiraConnector };
  const writeTool: ApprovedConnectorTool = {
    ...storyReadTool,
    id: "bug.create",
    capabilityIds: ["qa.jira.bug.create"],
    actionClass: "external-write",
  };
  const registry: ConnectorAdmissionResolver = {
    admission: () => ({ allowed: true, connector: writeConnector, tool: writeTool, reason: "ok" }),
  };
  const adapter = new McpCapabilityAdapter({
    id: "jira-mcp-adapter",
    connectorId: "jira",
    registry,
    manager: managerFor(transport),
  });

  const writeDefinition: CapabilityDefinition = {
    ...DEFINITION,
    id: "qa.jira.bug.create",
    action: "bug.create",
    actionClass: "external-write",
    externalWrite: true,
  };
  const result = await adapter.execute(writeDefinition, context(), { summary: "x" });

  assert.equal(result.ok, true);
  assert.equal(result.externalSideEffect, true);
});
