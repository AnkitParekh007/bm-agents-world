import { z } from "zod";
import type { AgentTelemetryService } from "./platform/agent-telemetry.js";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import type { AgentPack } from "./pack-registry.js";
import { PackRegistry } from "./pack-registry.js";
import { planGovernedAgents } from "./pack-runtime.js";
import { resolvePackGovernance } from "./pack-governance.js";
import { defineNeutralTool, type AgentDefinition, type NeutralTool } from "./runtime/agent-runtime.js";

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
 * Builds the platform's runtime-neutral agent definitions.
 *
 * The construction is fully generic: every pack is planned the same way. A pack
 * with no registered governance becomes a single introspection agent; a pack with
 * registered governance ({@link resolvePackGovernance}) is planned by the generic
 * governed-agent planner (Phase 3/4) into a supervisor plus one scoped specialist
 * per governed specialist, and its governance provider supplies the governed
 * tools and prompts. There is no pack-specific branch — QA is just the first
 * registered governance provider. A {@link RuntimeAdapter} turns these
 * definitions into a concrete runtime.
 */
export function buildAgentDefinitions(
  registry: PackRegistry,
  governedBroker: CapabilityBrokerContract,
  telemetry?: AgentTelemetryService,
): AgentDefinition[] {
  const model = modelName();
  const definitions: AgentDefinition[] = [];

  for (const pack of registry.packs) {
    const governance = resolvePackGovernance(pack.id);
    const compiled = governance ? registry.compiled(pack.id) : undefined;
    if (!governance || !compiled) {
      definitions.push({ id: pack.id, model, prompt: packPrompt(pack), tools: packTools(pack), maxSteps: 8 });
      continue;
    }

    const plan = planGovernedAgents(compiled, governance.runtimeProvider);
    if (plan.diagnostics.length > 0) {
      console.warn(`[bm-agents-world] governed agent plan for ${pack.id}: ${plan.diagnostics.join("; ")}`);
    }
    const supervisorId = plan.supervisor?.runtimeId ?? pack.id;
    const specialistIds = plan.specialists.map((specialist) => specialist.runtimeId);

    definitions.push({
      id: supervisorId,
      model,
      prompt: packPrompt(pack) + governance.capabilityPrompt + governance.supervisorPrompt(specialistIds),
      tools: [...packTools(pack), ...governance.buildTools(governedBroker, telemetry, supervisorId)],
      maxSteps: 16,
    });

    for (const specialist of plan.specialists) {
      definitions.push({
        id: specialist.runtimeId,
        model,
        prompt: governance.specialistPrompt(pack, specialist) + governance.capabilityPrompt,
        tools: [...packTools(pack), ...governance.buildTools(governedBroker, telemetry, specialist.runtimeId)],
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
