import { BuiltInAgent, CopilotRuntime, defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import type { CapabilityBroker } from "./platform/capability-broker.js";
import type { AgentPack } from "./pack-registry.js";
import { PackRegistry } from "./pack-registry.js";
import { buildQaTools, QA_CAPABILITY_PROMPT } from "./qa/qa-tools.js";

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

function packTools(pack: AgentPack) {
  const overview = defineTool({
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

  const subAgents = defineTool({
    name: "listPackSubAgents",
    description: "List the supervisor and specialist agents declared by this pack.",
    parameters: z.object({}),
    execute: async () => ({ agents: pack.subAgents }),
  });

  const tasks = defineTool({
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

function worldTools(registry: PackRegistry) {
  const listPacks = defineTool({
    name: "listAgentPacks",
    description: "List all BM Agents World packs discovered from the repository.",
    parameters: z.object({}),
    execute: async () => ({ packs: registry.listPublic() }),
  });

  const inspectPack = defineTool({
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

export function buildCopilotRuntime(
  registry: PackRegistry,
  qaBroker: CapabilityBroker,
): CopilotRuntime {
  const agents: Record<string, BuiltInAgent> = {};

  for (const pack of registry.packs) {
    const isQa = pack.id === "qa";
    agents[pack.id] = new BuiltInAgent({
      model: modelName(),
      prompt: packPrompt(pack) + (isQa ? QA_CAPABILITY_PROMPT : ""),
      tools: isQa ? [...packTools(pack), ...buildQaTools(qaBroker)] : packTools(pack),
      maxSteps: isQa ? 16 : 8,
    });
  }

  agents.default = new BuiltInAgent({
    model: modelName(),
    prompt: `You are the BM Agents World Supervisor. You help users discover the right organizational agent and understand the packs currently loaded by the platform. Use your tools rather than inventing pack capabilities. Do not claim an external system action has happened unless an actual capability tool is available and its result confirms a live external side effect. The currently loaded pack ids are: ${registry.packs.map((pack) => pack.id).join(", ")}.`,
    tools: worldTools(registry),
    maxSteps: 6,
  });

  return new CopilotRuntime({
    agents,
    forwardHeaders: {
      allow: ["authorization", "x-user-id", "x-project-id", "x-project-ids", "x-tenant-id"],
    },
  });
}
