import type {
  AgentDefinition,
  NeutralTool,
  RuntimeAdapter,
  RuntimeAdapterOptions,
} from "./agent-runtime.js";

/**
 * In-process runtime adapter (Phase 6).
 *
 * A second, CopilotKit-free materialization of the exact same neutral agent
 * definitions. It exists to prove — and to let tests exercise — that the
 * platform's agents and governed tools no longer depend on any particular
 * runtime: the CopilotKit dependency is now one swappable adapter among others.
 * It materializes each definition into a plain callable agent whose tools can be
 * invoked directly (arguments validated through their zod schema), with no LLM
 * and no network. It is not a production chat runtime; it is the neutrality
 * proof and a harness for governed-tool behavior.
 */

export interface InProcessTool {
  name: string;
  description: string;
  /** Validates args against the tool schema, then runs the tool body. */
  invoke(args: unknown): Promise<unknown>;
}

export interface InProcessAgent {
  id: string;
  model: string;
  prompt: string;
  maxSteps: number;
  tools: Map<string, InProcessTool>;
  /** Convenience: validate-and-run a tool by name. Throws if the tool is absent. */
  callTool(name: string, args?: unknown): Promise<unknown>;
}

export interface InProcessRuntime {
  agents: Map<string, InProcessAgent>;
  agent(id: string): InProcessAgent | undefined;
}

function toInProcessTool(tool: NeutralTool): InProcessTool {
  return {
    name: tool.name,
    description: tool.description,
    async invoke(args: unknown): Promise<unknown> {
      // The neutral tool carries its own zod schema; validate at the boundary so
      // the in-process runtime enforces the same argument contract the LLM
      // runtime would, without any runtime-specific plumbing.
      const parsed = tool.parameters.parse(args ?? {});
      return tool.execute(parsed);
    },
  };
}

export const inProcessRuntimeAdapter: RuntimeAdapter<InProcessRuntime> = {
  name: "in-process",
  materialize(definitions: AgentDefinition[], _options: RuntimeAdapterOptions = {}): InProcessRuntime {
    const agents = new Map<string, InProcessAgent>();
    for (const definition of definitions) {
      const tools = new Map<string, InProcessTool>();
      for (const tool of definition.tools) tools.set(tool.name, toInProcessTool(tool));

      const agent: InProcessAgent = {
        id: definition.id,
        model: definition.model,
        prompt: definition.prompt,
        maxSteps: definition.maxSteps,
        tools,
        async callTool(name: string, args?: unknown): Promise<unknown> {
          const tool = tools.get(name);
          if (!tool) throw new Error(`Agent "${definition.id}" has no tool "${name}".`);
          return tool.invoke(args);
        },
      };
      agents.set(definition.id, agent);
    }

    return {
      agents,
      agent(id: string): InProcessAgent | undefined {
        return agents.get(id);
      },
    };
  },
};
