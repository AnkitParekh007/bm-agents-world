import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../capability-types.js";
import type { ConnectorAdmission, ConnectorAdmissionResolver } from "../connector-registry.js";
import type { McpConnectionManager } from "./mcp-connection-manager.js";
import type { McpToolResult } from "./mcp-transport.js";

export interface McpCapabilityAdapterOptions {
  /** CapabilityAdapter id, referenced by CapabilityDefinition.adapterId. */
  id: string;
  /** The single connector this adapter is bound to. */
  connectorId: string;
  registry: ConnectorAdmissionResolver;
  manager: McpConnectionManager;
  /**
   * Map an admitted capability to the tool name the MCP server advertises.
   * Defaults to the approved connector tool id. Override when the server's
   * advertised name differs from the registry tool id.
   */
  resolveToolName?: (admission: ConnectorAdmission, definition: CapabilityDefinition) => string;
}

/**
 * Backs a governed capability with a live MCP tool call.
 *
 * It implements the same {@link CapabilityAdapter} contract as every native
 * adapter, so the broker drives it identically — request → policy → approval →
 * execute — with no broker changes. Governance is enforced here as a
 * fail-closed net, independent of the policy engine that already gated the
 * action: the capability must be centrally admitted for this exact connector,
 * environment, and pack; the connector must be MCP-capable; and the mapped tool
 * must actually be advertised by the connected server (deny-unregistered on the
 * server side too). Any gap fails closed with a reason and no side effect.
 *
 * Security boundary: the payload forwarded to the server is the governed
 * capability payload (model-supplied identifiers), never a raw query, URL, or
 * script; credentials and endpoints stay inside the connection config the
 * transport resolves, and are never read from or written back into the result.
 */
export class McpCapabilityAdapter implements CapabilityAdapter {
  readonly id: string;
  private readonly connectorId: string;
  private readonly registry: ConnectorAdmissionResolver;
  private readonly manager: McpConnectionManager;
  private readonly resolveToolName: (
    admission: ConnectorAdmission,
    definition: CapabilityDefinition,
  ) => string;

  constructor(options: McpCapabilityAdapterOptions) {
    this.id = options.id;
    this.connectorId = options.connectorId;
    this.registry = options.registry;
    this.manager = options.manager;
    this.resolveToolName =
      options.resolveToolName ?? ((admission) => admission.tool?.id ?? "");
  }

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    const externalSideEffect = definition.externalWrite;

    const admission = this.registry.admission(definition, context.packId, context.environment);
    if (!admission.allowed) {
      return this.fail(externalSideEffect, admission.reason);
    }
    if (admission.connector?.id !== this.connectorId) {
      return this.fail(
        externalSideEffect,
        `Capability ${definition.id} maps to connector ${admission.connector?.id ?? "none"}, not ${this.connectorId}.`,
      );
    }
    if (admission.connector.kind === "native") {
      return this.fail(
        externalSideEffect,
        `Connector ${this.connectorId} is native-only and cannot be served over MCP.`,
      );
    }

    const toolName = this.resolveToolName(admission, definition);
    if (!toolName) {
      return this.fail(externalSideEffect, `No MCP tool is mapped for capability ${definition.id}.`);
    }

    let session;
    try {
      session = await this.manager.acquire(this.connectorId);
    } catch (error) {
      return this.fail(externalSideEffect, errorMessage(error));
    }

    const advertised = this.manager.discoveredTools(this.connectorId);
    if (advertised && !advertised.some((tool) => tool.name === toolName)) {
      return this.fail(
        externalSideEffect,
        `MCP connector ${this.connectorId} does not advertise tool ${toolName}.`,
      );
    }

    let result: McpToolResult;
    try {
      result = await session.callTool(toolName, payload);
    } catch (error) {
      // A dropped session is the one failure worth a single retry: reconnect
      // and call once more. Any second failure is reported, not retried.
      try {
        const fresh = await this.manager.reconnect(this.connectorId);
        result = await fresh.callTool(toolName, payload);
      } catch (retryError) {
        return this.fail(externalSideEffect, errorMessage(retryError), errorMessage(error));
      }
    }

    if (result.isError) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect,
        error: stringifyContent(result.content),
      };
    }

    return {
      ok: true,
      mode: "live",
      externalSideEffect,
      data: result.content,
    };
  }

  private fail(externalSideEffect: boolean, error: string, priorError?: string): AdapterResult {
    return {
      ok: false,
      mode: "live",
      externalSideEffect,
      error: priorError ? `${error} (after retry; initial failure: ${priorError})` : error,
    };
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function stringifyContent(content: unknown): string {
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}
