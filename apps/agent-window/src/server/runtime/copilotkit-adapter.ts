import { BuiltInAgent, CopilotRuntime, defineTool } from "@copilotkit/runtime/v2";
import type {
  AgentDefinition,
  NeutralTool,
  RuntimeAdapter,
  RuntimeAdapterOptions,
} from "./agent-runtime.js";

/**
 * CopilotKit runtime adapter (Phase 6).
 *
 * The one module that maps the platform's neutral agent/tool model onto
 * CopilotKit's `BuiltInAgent` / `CopilotRuntime` / `defineTool`. Every neutral
 * tool becomes a `defineTool` with identical fields, and each definition becomes
 * a `BuiltInAgent` with its telemetry middleware bound to the agent id — so the
 * runtime this produces is byte-for-byte what the pilot built before the neutral
 * layer existed. Keeping this the only CopilotKit-aware module is exactly what
 * makes the dependency swappable.
 */

export const DEFAULT_FORWARD_HEADERS = [
  "authorization",
  "x-user-id",
  "x-project-id",
  "x-project-ids",
  "x-tenant-id",
] as const;

/** Maps a single neutral tool onto a CopilotKit tool with the same fields. */
export function toCopilotTool(tool: NeutralTool) {
  return defineTool({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    // Neutral tools may return synchronously; CopilotKit expects a Promise.
    execute: async (args: unknown) => tool.execute(args),
  });
}

export const copilotKitRuntimeAdapter: RuntimeAdapter<CopilotRuntime> = {
  name: "copilotkit",
  materialize(definitions: AgentDefinition[], options: RuntimeAdapterOptions = {}): CopilotRuntime {
    const agents: Record<string, BuiltInAgent> = {};
    for (const definition of definitions) {
      const agent = new BuiltInAgent({
        model: definition.model,
        prompt: definition.prompt,
        tools: definition.tools.map(toCopilotTool),
        maxSteps: definition.maxSteps,
      });
      if (options.telemetry) agent.use(options.telemetry.middleware(definition.id, definition.model));
      agents[definition.id] = agent;
    }

    return new CopilotRuntime({
      agents,
      forwardHeaders: { allow: [...(options.forwardHeaders ?? DEFAULT_FORWARD_HEADERS)] },
    });
  },
};
