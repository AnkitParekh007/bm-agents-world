import { z } from "zod";
import type { AgentTelemetryService } from "./platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { AgentPack } from "./pack-registry.js";
import { PackRegistry } from "./pack-registry.js";
import { buildQaTools, QA_CAPABILITY_PROMPT } from "./qa/qa-tools.js";
import {
  QA_SPECIALIST_CAPABILITIES,
  QA_SUPERVISOR_AGENT_ID,
  qaRuntimeProvider,
  qaSpecialistAgentId,
} from "./qa/qa-grants.js";
import { planGovernedAgents } from "./pack-runtime.js";
import { defineNeutralTool, type AgentDefinition, type NeutralTool } from "./runtime/agent-runtime.js";

/** A scoped specialist agent to instantiate: its identity, prompt inputs, and grant. */
interface SpecialistSpec {
  sourceId: string;
  runtimeId: string;
  purpose: string;
  capabilities: string[];
}

/** True when the generic (pack-agnostic) agent-construction path is enabled. */
function genericAgentsEnabled(): boolean {
  return process.env.BM_GENERIC_AGENTS?.trim().toLowerCase() === "true";
}

const DEFAULT_MODEL = "openai:gpt-5.4-mini";

function modelName(): string {
  return process.env.AI_MODEL?.trim() || DEFAULT_MODEL;
}

function packPrompt(pack: AgentPack): string {
  const specialists = pack.subAgents
    .filter((agent) => agent.id !== pack.supervisor && agent.enabled !== false)
    .slice(0, 24)
    .map((agent) => `- ${agent.id}: ${agent.purpose ?? agent.description ?? agent.role ?? "specialist"}`)
    .join("\n");

  return `You are the ${pack.displayName} Agent inside BM Agents World.

Your operating pack is ${pack.packName} version ${pack.version}. Treat the pack metadata exposed by your tools as your operating contract.

Pack summary:
${pack.summary}

Supervisor: ${pack.supervisor}
Projects currently declared by the pack: ${pack.projects.join(", ") || "not configured"}
Environments currently declared by the pack: ${pack.environments.join(", ") || "not configured"}
Tasks: ${pack.taskCount}
Skills: ${pack.skillCount}
MCP definitions: ${pack.mcpCount}
Plugins/adapters: ${pack.pluginCount}
Artifacts: ${pack.artifactCount}
Workflows: ${pack.workflowCount}

Specialists represented by the pack:
${specialists || "- No specialist registry entries were discovered."}

Operating rules for this implementation stage:
1. Be explicit about what is implemented versus only described by the pack.
2. Use the pack introspection tools when the user asks about tasks, skills, sub-agents, MCPs, workflows, or policy.
3. Never claim Jira, Bitbucket, database, browser, cloud, or production actions were executed unless a real tool for that action is available in the current run.
4. Respect least privilege. Raw secret values must never be requested or exposed to the model.
5. Free-form production mutation is not available from this runtime.
6. External writes must pass through a capability/approval path when one is implemented for the selected pack; otherwise prepare plans/drafts only.
7. Prefer structured, actionable output that can later become BM Agent Foundry artifacts.
`;
}

function qaSupervisorPrompt(specialistIds: string[]): string {
  const roster = specialistIds.map((id) => `- ${id}`).join("\n");
  return `

You are the QA supervisor. You own the run, its durable state, approvals, and the
final consolidated result. Coordinate the following specialist agents, each scoped
to its own governed capabilities:
${roster || "- (no specialists registered)"}

Run the workflow in order — story context, change impact, test design, execution
(browser/api/database), integration traceability, then defect handling and
reporting — reusing one startQaRun runId across the whole workflow. You may perform
any step yourself using the governed tools, but keep each step scoped to the
capability it needs, and never claim a step ran unless a tool result confirms it.`;
}

function qaSpecialistPrompt(pack: AgentPack, specialistId: string, purpose: string, capabilities: string[]): string {
  return `You are the QA ${specialistId} specialist inside the ${pack.displayName} Agent, coordinated by the qa supervisor.

Your responsibility: ${purpose}

Stay strictly within your scope. You are accountable only for these governed
capabilities: ${capabilities.join(", ")}. Do not request or execute other
capabilities. Reuse the supervisor's startQaRun runId when one is provided, return
structured results the supervisor can consolidate, and never claim an external
system was touched unless a governed tool result confirms it.`;
}

function packTools(pack: AgentPack): NeutralTool[] {
  const overview = defineNeutralTool({
    name: "getPackOverview",
    description: "Return the loaded operating metadata for this agent pack.",
    parameters: z.object({}),
    execute: async () => ({
      id: pack.id,
      name: pack.displayName,
      packName: pack.packName,
      version: pack.version,
      supervisor: pack.supervisor,
      projects: pack.projects,
      environments: pack.environments,
      counts: {
        tasks: pack.taskCount,
        subAgents: pack.subAgents.length,
        skills: pack.skillCount,
        mcpServers: pack.mcpCount,
        plugins: pack.pluginCount,
        artifacts: pack.artifactCount,
        workflows: pack.workflowCount,
      },
      policy: pack.policy,
    }),
  });

  const subAgents = defineNeutralTool({
    name: "listPackSubAgents",
    description: "List the supervisor and specialist agents declared by this pack.",
    parameters: z.object({}),
    execute: async () => ({ agents: pack.subAgents }),
  });

  const tasks = defineNeutralTool({
    name: "listPackTasks",
    description: "List daily tasks from this pack, optionally narrowed to one task group.",
    parameters: z.object({
      group: z.string().optional().describe("Case-insensitive task group name or partial name"),
      limit: z.number().int().min(1).max(100).default(30),
    }),
    execute: async ({ group, limit }) => {
      const selected = group
        ? pack.taskGroups.filter((item) => item.name.toLowerCase().includes(group.toLowerCase()))
        : pack.taskGroups;
      const flattened = selected.flatMap((item) =>
        item.tasks.map((task) => ({ group: item.name, task })),
      );
      return {
        totalInPack: pack.taskCount,
        matched: flattened.length,
        tasks: flattened.slice(0, limit),
      };
    },
  });

  return [overview, subAgents, tasks];
}

function worldTools(registry: PackRegistry): NeutralTool[] {
  const listPacks = defineNeutralTool({
    name: "listAgentPacks",
    description: "List all BM Agents World packs discovered from the repository.",
    parameters: z.object({}),
    execute: async () => ({ packs: registry.listPublic() }),
  });

  const inspectPack = defineNeutralTool({
    name: "inspectAgentPack",
    description: "Inspect one agent pack by runtime id or pack name.",
    parameters: z.object({
      packId: z.string().describe("Runtime id such as qa or java-developer, or the pack directory name"),
    }),
    execute: async ({ packId }) => {
      const pack = registry.get(packId);
      if (!pack) {
        return {
          found: false,
          available: registry.packs.map((item) => item.id),
        };
      }

      return {
        found: true,
        pack: {
          ...registry.listPublic().find((item) => item.id === pack.id),
          subAgents: pack.subAgents,
          taskGroups: pack.taskGroups.map((group) => ({
            name: group.name,
            count: group.tasks.length,
          })),
        },
      };
    },
  });

  return [listPacks, inspectPack];
}

/**
 * Derives the scoped QA specialist agents to instantiate. With BM_GENERIC_AGENTS
 * enabled this runs through the pack-agnostic planner (proven equivalent to the
 * special-case in tests); otherwise it uses the QA capability map directly. Both
 * produce the same team, so the pilot is never regressed while the generic path
 * is validated in a live environment.
 */
function deriveQaSpecialistSpecs(pack: AgentPack, registry: PackRegistry): SpecialistSpec[] {
  if (genericAgentsEnabled()) {
    const compiled = registry.compiled(pack.id);
    if (compiled) {
      const plan = planGovernedAgents(compiled, qaRuntimeProvider);
      if (plan.diagnostics.length > 0) {
        console.warn(`[bm-agents-world] generic agent plan for ${pack.id}: ${plan.diagnostics.join("; ")}`);
      }
      const byId = new Map(pack.subAgents.map((agent) => [agent.id, agent]));
      return plan.specialists.map((spec) => {
        const source = byId.get(spec.sourceId);
        return {
          sourceId: spec.sourceId,
          runtimeId: spec.runtimeId,
          purpose: source?.purpose ?? source?.description ?? source?.role ?? spec.purpose ?? "QA specialist",
          capabilities: spec.capabilities ?? [],
        };
      });
    }
  }
  return pack.subAgents
    .filter((specialist) => QA_SPECIALIST_CAPABILITIES[specialist.id])
    .map((specialist) => ({
      sourceId: specialist.id,
      runtimeId: qaSpecialistAgentId(specialist.id),
      purpose: specialist.purpose ?? specialist.description ?? specialist.role ?? "QA specialist",
      capabilities: QA_SPECIALIST_CAPABILITIES[specialist.id],
    }));
}

/**
 * Builds the platform's runtime-neutral agent definitions.
 *
 * This is the whole agent/tool wiring — the default supervisor, one agent per
 * pack, and the QA multi-agent team (a supervisor plus one scoped specialist per
 * registered specialist that maps to a governed capability) — expressed with no
 * dependency on any agent runtime. A {@link RuntimeAdapter} turns these into a
 * concrete runtime; the CopilotKit adapter reproduces exactly the team the pilot
 * ran before this layer existed. The QA specialist set is derived from the
 * generic planner (flagged) or the QA special-case map; both yield the same team.
 */
export function buildAgentDefinitions(
  registry: PackRegistry,
  qaBroker: CapabilityBrokerContract,
  telemetry?: AgentTelemetryService,
): AgentDefinition[] {
  const model = modelName();
  const definitions: AgentDefinition[] = [];

  for (const pack of registry.packs) {
    if (pack.id !== "qa") {
      definitions.push({ id: pack.id, model, prompt: packPrompt(pack), tools: packTools(pack), maxSteps: 8 });
      continue;
    }

    const specialistSpecs = deriveQaSpecialistSpecs(pack, registry);
    const specialistIds = specialistSpecs.map((spec) => spec.runtimeId);

    definitions.push({
      id: pack.id,
      model,
      prompt: packPrompt(pack) + QA_CAPABILITY_PROMPT + qaSupervisorPrompt(specialistIds),
      tools: [...packTools(pack), ...buildQaTools(qaBroker, telemetry, QA_SUPERVISOR_AGENT_ID)],
      maxSteps: 16,
    });

    for (const spec of specialistSpecs) {
      definitions.push({
        id: spec.runtimeId,
        model,
        prompt:
          qaSpecialistPrompt(pack, spec.sourceId, spec.purpose, spec.capabilities) + QA_CAPABILITY_PROMPT,
        tools: [...packTools(pack), ...buildQaTools(qaBroker, telemetry, spec.runtimeId)],
        maxSteps: 10,
      });
    }
  }

  definitions.push({
    id: "default",
    model,
    prompt: `You are the BM Agents World Supervisor. You help users discover the right organizational agent and understand the packs currently loaded by the platform. Use your tools rather than inventing pack capabilities. Do not claim an external system action has happened unless an actual capability tool is available and its result confirms a live external side effect. The currently loaded pack ids are: ${registry.packs.map((pack) => pack.id).join(", ")}.`,
    tools: worldTools(registry),
    maxSteps: 6,
  });

  return definitions;
}
