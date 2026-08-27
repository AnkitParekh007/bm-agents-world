import assert from "node:assert/strict";
import test from "node:test";
import type {
  ApprovedConnector,
  ConnectorAdmission,
  McpConnectorSource,
} from "../connector-registry.js";
import { createMcpRuntime } from "./mcp-runtime.js";
import type { McpServerConfig, McpSession, McpToolResult, McpTransport } from "./mcp-transport.js";

/**
 * The runtime is the composition root the server's graceful shutdown closes, so
 * these tests pin the two things that matter operationally: it stays entirely
 * inert until a transport and a config resolver are both provisioned, and once
 * provisioned its shutdown genuinely tears the connections down.
 */

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

function source(): McpConnectorSource {
  return {
    mcpCapableConnectors: () => [
      { connector: connector("jira"), capabilityIds: ["qa.jira.story.read"] },
      { connector: connector("bitbucket"), capabilityIds: ["qa.bitbucket.change-impact.read"] },
    ],
    admission: (definition): ConnectorAdmission => ({
      allowed: false,
      reason: `Capability ${definition.id} is not admitted.`,
    }),
  };
}

class FakeSession implements McpSession {
  closed = 0;
  constructor(readonly connectorId: string) {}
  async listTools() {
    return [{ name: "story.read" }];
  }
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    return { isError: false, content: { name, args } };
  }
  async ping() {}
  async close() {
    this.closed += 1;
  }
}

class FakeTransport implements McpTransport {
  readonly sessions: FakeSession[] = [];
  async connect(config: McpServerConfig): Promise<McpSession> {
    const session = new FakeSession(config.connectorId);
    this.sessions.push(session);
    return session;
  }
}

test("stays disabled and inert when no transport is provisioned", async () => {
  const runtime = createMcpRuntime({ registry: source(), resolveConfig: () => CONFIG });

  assert.equal(runtime.status.enabled, false);
  assert.match(runtime.status.reason, /not provisioned \(no transport\)/);
  assert.equal(runtime.manager, undefined);
  assert.deepEqual(runtime.adapters, []);
  // The server awaits this on every shutdown, provisioned or not.
  await runtime.shutdown();
});

test("stays disabled when a transport exists but no config resolver does", () => {
  const runtime = createMcpRuntime({ registry: source(), transport: new FakeTransport() });

  assert.equal(runtime.status.enabled, false);
  assert.match(runtime.status.reason, /connection config resolver/);
  assert.equal(runtime.manager, undefined);
});

test("names both missing pieces when nothing is provisioned", () => {
  const runtime = createMcpRuntime({ registry: source() });

  assert.match(runtime.status.reason, /no transport and connection config resolver/);
});

test("builds one adapter per MCP-capable connector once provisioned", () => {
  const runtime = createMcpRuntime({
    registry: source(),
    transport: new FakeTransport(),
    resolveConfig: () => CONFIG,
  });

  assert.equal(runtime.status.enabled, true);
  assert.deepEqual(runtime.status.connectors, ["jira", "bitbucket"]);
  assert.deepEqual(runtime.status.adapterIds, ["jira-mcp-adapter", "bitbucket-mcp-adapter"]);
  assert.ok(runtime.manager);
});

test("shutdown closes live sessions and refuses further use", async () => {
  const transport = new FakeTransport();
  const runtime = createMcpRuntime({
    registry: source(),
    transport,
    resolveConfig: () => CONFIG,
  });
  const manager = runtime.manager!;
  await manager.acquire("jira");
  assert.equal(manager.state("jira"), "ready");

  await runtime.shutdown();

  assert.equal(transport.sessions.length, 1);
  assert.equal(transport.sessions[0].closed, 1);
  assert.equal(manager.state("jira"), "closed");
  await assert.rejects(() => manager.acquire("jira"), /is shut down/);
});

test("shutdown is idempotent under repeated signals", async () => {
  const transport = new FakeTransport();
  const runtime = createMcpRuntime({
    registry: source(),
    transport,
    resolveConfig: () => CONFIG,
  });
  await runtime.manager!.acquire("jira");

  await Promise.all([runtime.shutdown(), runtime.shutdown()]);
  await runtime.shutdown();

  assert.equal(transport.sessions[0].closed, 1);
});
