import type {
  McpServerConfig,
  McpSession,
  McpToolDescriptor,
  McpTransport,
} from "./mcp-transport.js";

/**
 * Lifecycle states for a single connector's MCP connection.
 *
 * idle       — never connected (or fully torn down and reusable)
 * connecting — a connect attempt is in flight
 * ready      — a live session is held and last known-good
 * degraded   — the last operation failed; the session is discarded, a
 *              reconnect is required before the connector can be used again
 * closed     — the manager has been shut down; no further use is permitted
 */
export type ConnectionState = "idle" | "connecting" | "ready" | "degraded" | "closed";

export interface ConnectionTransition {
  connectorId: string;
  from: ConnectionState;
  to: ConnectionState;
  at: number;
  reason: string;
}

export interface ConnectionManagerOptions {
  transport: McpTransport;
  /**
   * Server-side assembly of a connector's connection descriptor. Returns
   * `undefined` for a connector that has no provisioned config, which the
   * manager treats as fail-closed (it will not connect). This function is the
   * only place a real endpoint / credential is resolved, and it runs
   * out-of-band from any model context.
   */
  resolveConfig: (connectorId: string) => McpServerConfig | undefined;
  /** Injectable clock (ms). Defaults to Date.now. */
  now?: () => number;
  /** Injectable backoff wait. Defaults to a real timer. */
  sleep?: (ms: number) => Promise<void>;
  /** Total connect attempts per acquire/reconnect before failing closed. */
  maxAttempts?: number;
  /** Base backoff in ms; attempt N waits backoffBaseMs * 2^(N-1). */
  backoffBaseMs?: number;
  /** Observability hook fired on every state transition. */
  onTransition?: (transition: ConnectionTransition) => void;
}

interface ConnectionEntry {
  connectorId: string;
  state: ConnectionState;
  session?: McpSession;
  tools?: McpToolDescriptor[];
  connecting?: Promise<McpSession>;
  failures: number;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Owns the connect / health / reconnect / shutdown lifecycle for a set of MCP
 * connectors, keyed by connector id. It is deliberately unaware of governance:
 * admission (which capability may use which connector, in which environment) is
 * enforced by the caller (the capability adapter) before a session is ever
 * acquired. The manager's own fail-closed rules are narrow and structural: no
 * provisioned config means no connection, and exhausting the reconnect budget
 * leaves the connector degraded rather than silently returning a dead session.
 */
export class McpConnectionManager {
  private readonly transport: McpTransport;
  private readonly resolveConfig: (connectorId: string) => McpServerConfig | undefined;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly maxAttempts: number;
  private readonly backoffBaseMs: number;
  private readonly onTransition?: (transition: ConnectionTransition) => void;
  private readonly entries = new Map<string, ConnectionEntry>();
  private shuttingDown = false;

  constructor(options: ConnectionManagerOptions) {
    this.transport = options.transport;
    this.resolveConfig = options.resolveConfig;
    this.now = options.now ?? Date.now;
    this.sleep = options.sleep ?? defaultSleep;
    this.maxAttempts = Math.max(1, options.maxAttempts ?? 3);
    this.backoffBaseMs = Math.max(0, options.backoffBaseMs ?? 200);
    this.onTransition = options.onTransition;
  }

  /** Current lifecycle state for a connector (idle if never seen). */
  state(connectorId: string): ConnectionState {
    return this.entries.get(connectorId)?.state ?? "idle";
  }

  /** Tools discovered on the last successful connect, or undefined if never connected. */
  discoveredTools(connectorId: string): McpToolDescriptor[] | undefined {
    return this.entries.get(connectorId)?.tools;
  }

  /**
   * Return a ready session for the connector, connecting lazily. Concurrent
   * callers share a single in-flight connect. A connector left degraded by a
   * prior failure is reconnected here. Throws if the manager is shut down or the
   * connector cannot be brought up within the reconnect budget.
   */
  async acquire(connectorId: string): Promise<McpSession> {
    if (this.shuttingDown) {
      throw new Error(`MCP connection manager is shut down; cannot acquire ${connectorId}.`);
    }
    const entry = this.entryFor(connectorId);
    if (entry.state === "ready" && entry.session) return entry.session;
    if (entry.connecting) return entry.connecting;
    return this.connectWithBackoff(entry);
  }

  /**
   * Probe a connector's liveness. Marks it degraded (and drops the session) on
   * failure so the next acquire reconnects. A connector that was never connected
   * stays idle. Returns whether the connector is currently healthy.
   */
  async healthCheck(connectorId: string): Promise<boolean> {
    const entry = this.entries.get(connectorId);
    if (!entry || entry.state !== "ready" || !entry.session) return false;
    try {
      await entry.session.ping();
      return true;
    } catch (error) {
      await this.discard(entry, `health check failed: ${errorMessage(error)}`);
      return false;
    }
  }

  /**
   * Force a fresh connection: discard any held session, then connect with the
   * full backoff budget. Used after a call detects a dropped session.
   */
  async reconnect(connectorId: string): Promise<McpSession> {
    if (this.shuttingDown) {
      throw new Error(`MCP connection manager is shut down; cannot reconnect ${connectorId}.`);
    }
    const entry = this.entryFor(connectorId);
    await this.discard(entry, "explicit reconnect");
    return this.connectWithBackoff(entry);
  }

  /** Gracefully close every session and refuse further use. Idempotent. */
  async shutdown(): Promise<void> {
    this.shuttingDown = true;
    const closes: Promise<void>[] = [];
    for (const entry of this.entries.values()) {
      const session = entry.session;
      entry.session = undefined;
      entry.connecting = undefined;
      if (session) closes.push(session.close().catch(() => undefined));
      this.transition(entry, "closed", "manager shutdown");
    }
    await Promise.all(closes);
  }

  private entryFor(connectorId: string): ConnectionEntry {
    let entry = this.entries.get(connectorId);
    if (!entry) {
      entry = { connectorId, state: "idle", failures: 0 };
      this.entries.set(connectorId, entry);
    }
    return entry;
  }

  private connectWithBackoff(entry: ConnectionEntry): Promise<McpSession> {
    const attempt = this.runConnect(entry);
    entry.connecting = attempt;
    return attempt.finally(() => {
      if (entry.connecting === attempt) entry.connecting = undefined;
    });
  }

  private async runConnect(entry: ConnectionEntry): Promise<McpSession> {
    const config = this.resolveConfig(entry.connectorId);
    if (!config) {
      this.transition(entry, "degraded", "no provisioned connection config");
      throw new Error(`No MCP connection config is provisioned for connector ${entry.connectorId}.`);
    }

    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      if (this.shuttingDown) {
        throw new Error(`MCP connection manager is shut down; aborting connect for ${entry.connectorId}.`);
      }
      this.transition(entry, "connecting", `connect attempt ${attempt}/${this.maxAttempts}`);
      try {
        const session = await this.transport.connect(config);
        const tools = await session.listTools();
        entry.session = session;
        entry.tools = tools;
        entry.failures = 0;
        this.transition(entry, "ready", `connected with ${tools.length} tool(s)`);
        return session;
      } catch (error) {
        lastError = error;
        entry.failures += 1;
        if (attempt < this.maxAttempts) {
          this.transition(entry, "degraded", `connect attempt ${attempt} failed: ${errorMessage(error)}`);
          await this.sleep(this.backoffBaseMs * 2 ** (attempt - 1));
        }
      }
    }
    this.transition(entry, "degraded", `connect exhausted after ${this.maxAttempts} attempt(s)`);
    throw new Error(
      `Unable to connect to MCP connector ${entry.connectorId} after ${this.maxAttempts} attempt(s): ${errorMessage(lastError)}`,
    );
  }

  private async discard(entry: ConnectionEntry, reason: string): Promise<void> {
    const session = entry.session;
    entry.session = undefined;
    entry.tools = undefined;
    if (entry.state !== "closed") this.transition(entry, "degraded", reason);
    if (session) await session.close().catch(() => undefined);
  }

  private transition(entry: ConnectionEntry, to: ConnectionState, reason: string): void {
    const from = entry.state;
    entry.state = to;
    this.onTransition?.({ connectorId: entry.connectorId, from, to, at: this.now(), reason });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
