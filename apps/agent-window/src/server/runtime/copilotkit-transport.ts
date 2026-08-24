import { createCopilotExpressHandler } from "@copilotkit/runtime/v2/express";
import type { CopilotRuntime } from "@copilotkit/runtime/v2";
import type { AgentTransport } from "./agent-transport.js";
import { toCopilotExpressOptions } from "./copilotkit-transport-options.js";

/**
 * CopilotKit Express transport (Phase 6.5).
 *
 * The one module that binds the neutral {@link AgentTransport} seam to
 * `@copilotkit/runtime/v2/express` — the transport counterpart of
 * `copilotkit-adapter.ts`. Keeping the `createCopilotExpressHandler` value
 * import confined here is what lets `index.ts` mount the runtime without naming
 * CopilotKit, and what makes swapping the agent protocol a one-module change.
 *
 * The handler factory is injectable purely so the option mapping can be observed
 * in tests; production uses the real `createCopilotExpressHandler`. The mapping
 * itself lives in {@link ./copilotkit-transport-options.js} and is verified
 * independently of a CopilotKit install.
 */
export type CopilotExpressHandlerFactory = typeof createCopilotExpressHandler;

export function createCopilotKitExpressTransport(
  handlerFactory: CopilotExpressHandlerFactory = createCopilotExpressHandler,
): AgentTransport<CopilotRuntime> {
  return {
    name: "copilotkit-express",
    handler: (runtime, options) => handlerFactory(toCopilotExpressOptions(runtime, options)),
  };
}

/** Default transport used by the server composition root. */
export const copilotKitExpressTransport = createCopilotKitExpressTransport();
