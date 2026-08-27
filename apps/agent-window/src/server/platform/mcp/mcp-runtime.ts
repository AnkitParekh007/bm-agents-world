import type { McpConnectorSource } from "../connector-registry.js";
import { buildMcpAdapters, type BuiltMcpAdapter } from "./mcp-adapter-factory.js";
import { McpConnectionManager, type ConnectionTransition } from "./mcp-connection-manager.js";
import type { McpServerConfig, McpTransport } from "./mcp-transport.js";

/**
 * Composition root for the server's MCP layer.
 *
 * Phase 7 built the lifecycle (`McpConnectionManager`), the governed adapter,
 * and the per-connector factory, but nothing owned them at runtime — so no
 * connection was ever tied to the process, and there was nothing for the
 * server's graceful shutdown to close. This module is that owner: one place
 * where the manager and its adapters are stood up, and one `shutdown()` the
 * server awaits alongside its stores.
 *
 * Two properties are deliberate.
 *
 * **Off unless provisioned.** A live MCP layer needs both a transport and a
 * server-side connection-config resolver; a concrete stdio / streamable-http
 * transport is validated in a real environment and is not wired here. Absent
 * either one, the runtime reports disabled, builds no adapter, opens no socket,
 * and its `shutdown()` is a no-op — the fail-closed default, and today's
 * behaviour for every deployment.
 *
 * **Building grants nothing.** The runtime does not register its adapters with
 * the capability broker and does not repoint any pack's capabilities away from
 * their native adapters. That swap is a per-pack, environment-validated
 * decision, kept out of here so standing up the MCP layer can never change the
 * live pilot as a side effect.
 */
export interface McpRuntimeStatus {
  enabled: boolean;
  /** Human-readable explanation, surfaced on `/api/health`. */
  reason: string;
  /** Connector ids an adapter was built for (empty when disabled). */
  connectors: string[];
  /** Adapter ids those adapters would register under, if ever registered. */
  adapterIds: string[];
}

export interface McpRuntimeOptions {
  registry: McpConnectorSource;
  /**
   * The transport sessions are opened over. Omitted until a concrete transport
   * is provisioned for the environment, which keeps the runtime disabled.
   */
  transport?: McpTransport;
  /**
   * Server-side assembly of a connector's connection descriptor — the only
   * place an endpoint or credential handle is resolved, out of band from any
   * model context. Omitted keeps the runtime disabled.
   */
  resolveConfig?: (connectorId: string) => McpServerConfig | undefined;
  onTransition?: (transition: ConnectionTransition) => void;
}

export interface McpRuntime {
  readonly status: McpRuntimeStatus;
  /** Undefined while disabled: no manager exists, so nothing can connect. */
  readonly manager: McpConnectionManager | undefined;
  readonly adapters: readonly BuiltMcpAdapter[];
  /** Closes every live session and refuses further use. Idempotent. */
  shutdown(): Promise<void>;
}

export function createMcpRuntime(options: McpRuntimeOptions): McpRuntime {
  const { transport, resolveConfig } = options;
  if (!transport || !resolveConfig) {
    const missing = [!transport && "transport", !resolveConfig && "connection config resolver"]
      .filter((value): value is string => Boolean(value))
      .join(" and ");
    return {
      status: {
        enabled: false,
        reason: `MCP is not provisioned (no ${missing}); no connection is opened.`,
        connectors: [],
        adapterIds: [],
      },
      manager: undefined,
      adapters: [],
      shutdown: async () => undefined,
    };
  }

  const manager = new McpConnectionManager({
    transport,
    resolveConfig,
    onTransition: options.onTransition,
  });
  const adapters = buildMcpAdapters({ registry: options.registry, manager });
  // Shutdown is memoized so concurrent signal handlers share one teardown.
  let teardown: Promise<void> | undefined;

  return {
    status: {
      enabled: true,
      reason: `MCP provisioned for ${adapters.length} connector(s); adapters are built but not registered with the broker.`,
      connectors: adapters.map((entry) => entry.connectorId),
      adapterIds: adapters.map((entry) => entry.adapter.id),
    },
    manager,
    adapters,
    shutdown: () => (teardown ??= manager.shutdown()),
  };
}
