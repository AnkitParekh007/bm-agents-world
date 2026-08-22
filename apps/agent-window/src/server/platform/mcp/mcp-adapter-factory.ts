import type { CapabilityDefinition } from "../capability-types.js";
import type { ConnectorAdmission, McpConnectorSource } from "../connector-registry.js";
import { McpCapabilityAdapter } from "./mcp-capability-adapter.js";
import type { McpConnectionManager } from "./mcp-connection-manager.js";

export interface BuiltMcpAdapter {
  connectorId: string;
  /** Capability ids this connector's adapter can serve. */
  capabilityIds: string[];
  adapter: McpCapabilityAdapter;
}

export interface McpAdapterFactoryOptions {
  registry: McpConnectorSource;
  manager: McpConnectionManager;
  resolveToolName?: (admission: ConnectorAdmission, definition: CapabilityDefinition) => string;
}

/** The adapter id a connector's MCP adapter registers under. */
export function mcpAdapterId(connectorId: string): string {
  return `${connectorId}-mcp-adapter`;
}

/**
 * Stand up one governed {@link McpCapabilityAdapter} per MCP-capable connector
 * in the approved-connectors registry. A single adapter serves every capability
 * mapped to its connector — it resolves the capability → tool binding and
 * re-checks admission on each call — so the caller registers `adapter` with the
 * broker and points the covered capabilities' `adapterId` at
 * {@link mcpAdapterId}. Building an adapter grants nothing on its own: every
 * call still passes the adapter's fail-closed governance net and the shared
 * connection manager's lifecycle.
 *
 * This is the assembly seam only. It does not rewire an existing pack's
 * capabilities away from their native adapters — that swap is a per-pack,
 * environment-validated decision, kept out of this factory so the live pilot
 * never changes as a side effect of building MCP adapters.
 */
export function buildMcpAdapters(options: McpAdapterFactoryOptions): BuiltMcpAdapter[] {
  return options.registry.mcpCapableConnectors().map(({ connector, capabilityIds }) => ({
    connectorId: connector.id,
    capabilityIds,
    adapter: new McpCapabilityAdapter({
      id: mcpAdapterId(connector.id),
      connectorId: connector.id,
      registry: options.registry,
      manager: options.manager,
      resolveToolName: options.resolveToolName,
    }),
  }));
}
