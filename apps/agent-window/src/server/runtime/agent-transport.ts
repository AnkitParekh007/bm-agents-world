import type { RequestHandler } from "express";

/**
 * Transport abstraction (Phase 6.5).
 *
 * {@link RuntimeAdapter} decoupled the platform from CopilotKit on the
 * *materialization* side — neutral agent definitions become a concrete runtime
 * object through a swappable adapter. This is the matching seam on the *serving*
 * side: a materialized runtime is exposed over HTTP through a swappable
 * transport, so `index.ts` no longer hard-depends on
 * `@copilotkit/runtime/v2/express`. Selecting a different agent protocol becomes
 * selecting a different transport here, exactly as selecting a different runtime
 * is selecting a different adapter.
 *
 * The seam abstracts the agent protocol/runtime (CopilotKit today), not the HTTP
 * framework: the platform stays on Express, so a transport yields an Express
 * {@link RequestHandler} the server mounts with `app.use(...)`.
 */

/**
 * Cross-origin policy for a transport, expressed neutrally so callers never name
 * a runtime-specific option shape. `false` disables CORS (production, same-origin
 * served build); an origin allowlist is mapped by the concrete transport.
 */
export type TransportCorsPolicy = false | { readonly allowedOrigins: readonly string[] };

/** Mount options for a transport, in runtime-neutral terms. */
export interface AgentTransportOptions {
  /** Base path the agent protocol is served under (e.g. `/api/copilotkit`). */
  readonly basePath: string;
  readonly cors: TransportCorsPolicy;
}

/** Exposes a materialized runtime over HTTP as an Express handler. */
export interface AgentTransport<TRuntime> {
  readonly name: string;
  handler(runtime: TRuntime, options: AgentTransportOptions): RequestHandler;
}
