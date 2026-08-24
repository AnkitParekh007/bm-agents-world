import type { SecretReference } from "../capability-types.js";

/**
 * Neutral MCP transport seam.
 *
 * Nothing in this module imports an MCP SDK or opens a socket. It is the
 * boundary the rest of the platform codes against, so the connection manager,
 * the capability adapter, and their tests never depend on a live server. The
 * concrete stdio / streamable-http transports are thin adapters that implement
 * `McpTransport` and are validated in the user's environment; the tests inject
 * an in-memory fake instead.
 *
 * Security boundary: a server's real endpoint, command line, and credentials
 * live only in {@link McpServerConfig}, which is assembled server-side from the
 * approved connector plus a secret resolver. The model never supplies or sees
 * these values — it references a connector id and a capability id, and the
 * transport resolves the secret references behind them.
 */

export type McpTransportKind = "stdio" | "streamable-http" | "native-worker";

/**
 * Server-side connection descriptor. This is NEVER part of model context: the
 * endpoint and credentials are carried as {@link SecretReference} handles that
 * the transport resolves out-of-band, so no literal URL, command, or token is
 * typed onto a surface the planner can reach.
 */
export interface McpServerConfig {
  connectorId: string;
  transport: McpTransportKind;
  /** Handle to the server endpoint (URL / command), resolved by the transport. */
  endpointRef: SecretReference;
  /** Handle to the credential used to authenticate, resolved by the transport. */
  credentialRef?: SecretReference;
  /** Non-secret, non-sensitive transport hints (e.g. protocol version pin). */
  metadata?: Record<string, string>;
}

/** A tool advertised by a connected MCP server. */
export interface McpToolDescriptor {
  name: string;
  description?: string;
  /** JSON-schema-shaped input contract, as advertised. Opaque to the platform. */
  inputSchema?: unknown;
}

/** The result of a single MCP tool call. */
export interface McpToolResult {
  isError: boolean;
  content: unknown;
}

/**
 * A live MCP session. Implementations own exactly one server connection and are
 * single-use: once {@link close} resolves, the session is dead and the manager
 * discards it.
 */
export interface McpSession {
  readonly connectorId: string;
  listTools(): Promise<McpToolDescriptor[]>;
  callTool(toolName: string, args: Record<string, unknown>): Promise<McpToolResult>;
  /** Liveness probe. Rejects if the connection is no longer usable. */
  ping(): Promise<void>;
  close(): Promise<void>;
}

/** Opens sessions. One transport instance may open many sessions over time. */
export interface McpTransport {
  connect(config: McpServerConfig): Promise<McpSession>;
}
