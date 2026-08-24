import type { AgentTransportOptions } from "./agent-transport.js";

/**
 * Pure mapping from the neutral {@link AgentTransportOptions} onto the option
 * object CopilotKit's Express handler expects. Kept in its own module with no
 * value import from `@copilotkit/*`, so the mapping — the one place a byte-for-
 * byte behaviour regression (base path, single-route mode, CORS shape) could
 * hide — is unit-testable without CopilotKit installed. The concrete transport
 * ({@link ./copilotkit-transport.js}) composes this with the real handler
 * factory. Generic over the runtime type so this module stays CopilotKit-free.
 */
export interface CopilotExpressOptions<TRuntime> {
  runtime: TRuntime;
  basePath: string;
  /** CopilotKit serves every agent on one route in this deployment. */
  mode: "single-route";
  /** CopilotKit's CORS shape: `false`, or an origin allowlist. */
  cors: false | { origin: string[] };
}

export function toCopilotExpressOptions<TRuntime>(
  runtime: TRuntime,
  options: AgentTransportOptions,
): CopilotExpressOptions<TRuntime> {
  return {
    runtime,
    basePath: options.basePath,
    mode: "single-route",
    cors: options.cors === false ? false : { origin: [...options.cors.allowedOrigins] },
  };
}
