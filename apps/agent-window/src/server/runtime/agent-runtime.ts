import type { z, ZodType } from "zod";
import type { AgentTelemetryService } from "../platform/agent-telemetry.js";

/**
 * Runtime abstraction (Phase 6).
 *
 * The platform describes its agents and tools in a runtime-neutral model that
 * carries no dependency on any particular agent runtime (CopilotKit today). A
 * {@link RuntimeAdapter} then materializes those neutral definitions onto a
 * concrete runtime. This is what lets the governance/pack layer stop hard-
 * depending on CopilotKit: swapping runtimes is swapping the adapter, and the
 * agent/tool definitions — prompts, governed tools, specialist wiring — stay
 * exactly the same.
 */

/** A runtime-neutral tool: the same shape every adapter maps onto its own tool type. */
export interface NeutralTool {
  name: string;
  description: string;
  /** Zod schema for the tool arguments (zod is runtime-agnostic, not CopilotKit). */
  parameters: ZodType;
  execute: (args: any) => Promise<unknown> | unknown;
}

/**
 * Declares a neutral tool with argument types inferred from its schema, so tool
 * bodies keep the same ergonomics as before while carrying no CopilotKit import.
 */
export function defineNeutralTool<Schema extends ZodType>(tool: {
  name: string;
  description: string;
  parameters: Schema;
  execute: (args: z.infer<Schema>) => Promise<unknown> | unknown;
}): NeutralTool {
  return tool as NeutralTool;
}

/** A runtime-neutral agent definition — no runtime types leak into it. */
export interface AgentDefinition {
  /** Agent id: the key in the runtime's agent map and its telemetry binding id. */
  id: string;
  model: string;
  prompt: string;
  tools: NeutralTool[];
  maxSteps: number;
}

export interface RuntimeAdapterOptions {
  telemetry?: AgentTelemetryService;
  /** Request headers a transport is allowed to forward (adapter-specific use). */
  forwardHeaders?: readonly string[];
}

/** Materializes neutral agent definitions into a concrete runtime object. */
export interface RuntimeAdapter<TRuntime> {
  readonly name: string;
  materialize(definitions: AgentDefinition[], options?: RuntimeAdapterOptions): TRuntime;
}

export interface AgentDefinitionSummary {
  id: string;
  model: string;
  maxSteps: number;
  toolNames: string[];
}

/** A stable, comparable summary of a definition set (used to assert equivalence). */
export function summarizeAgentDefinitions(definitions: AgentDefinition[]): AgentDefinitionSummary[] {
  return definitions.map((definition) => ({
    id: definition.id,
    model: definition.model,
    maxSteps: definition.maxSteps,
    toolNames: definition.tools.map((tool) => tool.name),
  }));
}
