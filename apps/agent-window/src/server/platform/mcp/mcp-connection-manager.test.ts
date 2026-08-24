import assert from "node:assert/strict";
import test from "node:test";
import { McpConnectionManager, type ConnectionTransition } from "./mcp-connection-manager.js";
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
  credentialRef: { provider: "vault", name: "jira-token", purpose: "mcp-auth" },
};

interface SessionScript {
  tools?: McpToolDescriptor[];
  ping?: () => Promise<void>;
  call?: (name: string, args: Record<string, unknown>) => Promise<McpToolResult>;
}

class FakeSession implements McpSession {
  closed = false;
  callCount = 0;
  constructor(
    readonly connectorId: string,
    private readonly script: SessionScript,
  ) {}
  async listTools(): Promise<McpToolDescriptor[]> {
    return this.script.tools ?? [{ name: "story.read" }];
  }
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    this.callCount += 1;
    if (this.script.call) return this.script.call(name, args);
    return { isError: false, content: { name, args } };
  }
  async ping(): Promise<void> {
    if (this.script.ping) return this.script.ping();
  }
  async close(): Promise<void> {
    this.closed = true;
  }
}

/** A transport whose connect behaviour is programmable per attempt. */
class FakeTransport implements McpTransport {
  connectCount = 0;
  sessions: FakeSession[] = [];
  constructor(private readonly plan: Array<SessionScript | Error>) {}
  async connect(config: McpServerConfig): Promise<McpSession> {
    const step = this.plan[Math.min(this.connectCount, this.plan.length - 1)];
    this.connectCount += 1;
    if (step instanceof Error) throw step;
    const session = new FakeSession(config.connectorId, step);
    this.sessions.push(session);
    return session;
  }
}

function managerWith(
  transport: FakeTransport,
  overrides: Partial<Parameters<typeof buildManager>[1]> = {},
) {
  return buildManager(transport, overrides);
}

function buildManager(
  transport: FakeTransport,
  overrides: {
    resolveConfig?: (id: string) => McpServerConfig | undefined;
    transitions?: ConnectionTransition[];
    sleeps?: number[];
    maxAttempts?: number;
  } = {},
) {
  const transitions = overrides.transitions ?? [];
  const sleeps = overrides.sleeps ?? [];
  return new McpConnectionManager({
    transport,
    resolveConfig: overrides.resolveConfig ?? (() => CONFIG),
    now: () => 1_000,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    maxAttempts: overrides.maxAttempts ?? 3,
    backoffBaseMs: 100,
    onTransition: (t) => transitions.push(t),
  });
}

test("acquire connects lazily and discovers tools", async () => {
  const transport = new FakeTransport([{ tools: [{ name: "story.read" }, { name: "bug.create" }] }]);
  const manager = managerWith(transport);

  assert.equal(manager.state("jira"), "idle");
  const session = await manager.acquire("jira");

  assert.equal(transport.connectCount, 1);
  assert.equal(manager.state("jira"), "ready");
  assert.deepEqual(
    manager.discoveredTools("jira")?.map((t) => t.name),
    ["story.read", "bug.create"],
  );
  assert.equal(session.connectorId, "jira");
});

test("concurrent acquires share a single connect", async () => {
  const transport = new FakeTransport([{}]);
  const manager = managerWith(transport);

  const [a, b] = await Promise.all([manager.acquire("jira"), manager.acquire("jira")]);

  assert.equal(transport.connectCount, 1);
  assert.equal(a, b);
});

test("a ready session is reused without reconnecting", async () => {
  const transport = new FakeTransport([{}]);
  const manager = managerWith(transport);

  const first = await manager.acquire("jira");
  const second = await manager.acquire("jira");

  assert.equal(transport.connectCount, 1);
  assert.equal(first, second);
});

test("missing connection config fails closed", async () => {
  const transport = new FakeTransport([{}]);
  const manager = managerWith(transport, { resolveConfig: () => undefined });

  await assert.rejects(() => manager.acquire("jira"), /No MCP connection config is provisioned/);
  assert.equal(transport.connectCount, 0);
  assert.equal(manager.state("jira"), "degraded");
});

test("health check failure degrades the connector and forces reconnect", async () => {
  let live = true;
  const transport = new FakeTransport([
    { ping: async () => { if (!live) throw new Error("dead"); } },
    {},
  ]);
  const manager = managerWith(transport);

  const first = await manager.acquire("jira");
  assert.equal(await manager.healthCheck("jira"), true);

  live = false;
  assert.equal(await manager.healthCheck("jira"), false);
  assert.equal(manager.state("jira"), "degraded");
  assert.equal((first as FakeSession).closed, true);

  const second = await manager.acquire("jira");
  assert.equal(transport.connectCount, 2);
  assert.notEqual(first, second);
  assert.equal(manager.state("jira"), "ready");
});

test("connect retries with exponential backoff and recovers", async () => {
  const sleeps: number[] = [];
  const transport = new FakeTransport([new Error("boom-1"), new Error("boom-2"), {}]);
  const manager = managerWith(transport, { sleeps });

  const session = await manager.acquire("jira");

  assert.equal(transport.connectCount, 3);
  assert.deepEqual(sleeps, [100, 200]); // base * 2^0, base * 2^1
  assert.equal(manager.state("jira"), "ready");
  assert.ok(session);
});

test("exhausting the reconnect budget fails closed and stays degraded", async () => {
  const transport = new FakeTransport([new Error("x"), new Error("y"), new Error("z")]);
  const manager = managerWith(transport, { maxAttempts: 3 });

  await assert.rejects(() => manager.acquire("jira"), /after 3 attempt\(s\)/);
  assert.equal(transport.connectCount, 3);
  assert.equal(manager.state("jira"), "degraded");
});

test("shutdown closes sessions and refuses further acquires", async () => {
  const transport = new FakeTransport([{}]);
  const manager = managerWith(transport);

  const session = await manager.acquire("jira");
  await manager.shutdown();

  assert.equal((session as FakeSession).closed, true);
  assert.equal(manager.state("jira"), "closed");
  await assert.rejects(() => manager.acquire("jira"), /shut down/);
});

test("transitions are reported for observability", async () => {
  const transitions: ConnectionTransition[] = [];
  const transport = new FakeTransport([{}]);
  const manager = managerWith(transport, { transitions });

  await manager.acquire("jira");

  const path = transitions.map((t) => t.to);
  assert.deepEqual(path, ["connecting", "ready"]);
  assert.ok(transitions.every((t) => t.connectorId === "jira" && t.at === 1_000));
});
