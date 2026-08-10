import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import YAML from "yaml";

export interface PackSubAgent {
  id: string;
  role?: string;
  name?: string;
  purpose?: string;
  description?: string;
  enabled?: boolean;
}

export interface TaskGroup {
  name: string;
  tasks: string[];
}

export interface AgentPack {
  id: string;
  packName: string;
  displayName: string;
  version: string;
  supervisor: string;
  summary: string;
  projects: string[];
  environments: string[];
  subAgents: PackSubAgent[];
  skillCount: number;
  mcpCount: number;
  pluginCount: number;
  artifactCount: number;
  workflowCount: number;
  taskCount: number;
  taskGroups: TaskGroup[];
  policy: {
    production?: string;
    externalWrites?: string;
    secretValuesVisibleToModel?: boolean;
  };
  directory: string;
}

const ACRONYMS = new Map([
  ["qa", "QA"],
  ["ux", "UX"],
  ["ui", "UI"],
  ["api", "API"],
  ["db", "DB"],
  ["ai", "AI"],
  ["ml", "ML"],
  ["mlops", "MLOps"],
  ["sre", "SRE"],
  ["l2", "L2"],
  ["devops", "DevOps"],
  ["pyspark", "PySpark"],
]);

function titleCaseSlug(value: string): string {
  return value
    .replace(/-agent-pack$/, "")
    .split("-")
    .map((part) => ACRONYMS.get(part.toLowerCase()) ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function resolveRepoRoot(): string {
  const candidates = [
    process.env.BM_AGENTS_REPO_ROOT,
    resolve(process.cwd(), "../.."),
    process.cwd(),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "packs"))) return candidate;
  }

  throw new Error(
    "Unable to find the repository root. Set BM_AGENTS_REPO_ROOT to the bm-agents-world checkout.",
  );
}

function parseYamlFile(path: string): Record<string, any> {
  if (!existsSync(path)) return {};
  const parsed = YAML.parse(readFileSync(path, "utf8"));
  return parsed && typeof parsed === "object" ? parsed : {};
}

function firstArrayLength(value: Record<string, any>, preferredKeys: string[]): number {
  for (const key of preferredKeys) {
    if (Array.isArray(value[key])) return value[key].length;
  }

  for (const entry of Object.values(value)) {
    if (Array.isArray(entry)) return entry.length;
  }

  return 0;
}

function readSummary(packDirectory: string): string {
  const readmePath = resolve(packDirectory, "README.md");
  if (!existsSync(readmePath)) return "Governed BM Agents World agent pack.";

  const lines = readFileSync(readmePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim());

  return (
    lines.find((line) => line.length > 0 && !line.startsWith("#") && !line.startsWith("[")) ??
    "Governed BM Agents World agent pack."
  );
}

function readTaskGroups(packDirectory: string): TaskGroup[] {
  const docsDirectory = resolve(packDirectory, "docs");
  if (!existsSync(docsDirectory)) return [];

  const taskFile = readdirSync(docsDirectory).find((file) => /daily-task-catalog\.md$/i.test(file));
  if (!taskFile) return [];

  const groups: TaskGroup[] = [];
  let current: TaskGroup = { name: "General", tasks: [] };

  for (const rawLine of readFileSync(resolve(docsDirectory, taskFile), "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (current.tasks.length > 0) groups.push(current);
      current = { name: heading[1].replace(/^\d+\.\s*/, ""), tasks: [] };
      continue;
    }

    const task = line.match(/^\d+[.)]\s+(.+)$/);
    if (task) current.tasks.push(task[1]);
  }

  if (current.tasks.length > 0) groups.push(current);
  return groups;
}

function readSubAgents(packDirectory: string, configuredPath?: string): PackSubAgent[] {
  const registry = parseYamlFile(
    resolve(packDirectory, "config", configuredPath ?? "agent-registry.yaml"),
  );
  const agents = Array.isArray(registry.agents) ? registry.agents : [];
  return agents
    .filter((agent) => agent && typeof agent.id === "string")
    .map((agent) => ({
      id: agent.id,
      role: agent.role ?? agent.mode,
      name: agent.name,
      purpose: agent.purpose,
      description: agent.description,
      enabled: agent.enabled ?? true,
    }));
}

function countConfig(packDirectory: string, file: string, keys: string[]): number {
  return firstArrayLength(parseYamlFile(resolve(packDirectory, "config", file)), keys);
}

function loadPack(packDirectory: string): AgentPack | null {
  const manifestPath = resolve(packDirectory, "config", "pack-manifest.yaml");
  if (!existsSync(manifestPath)) return null;

  const manifest = parseYamlFile(manifestPath);
  const metadata = manifest.metadata ?? {};
  const spec = manifest.spec ?? {};
  const registries = spec.registries ?? {};
  const packName = metadata.name ?? basename(packDirectory);
  const id = basename(packDirectory).replace(/-agent-pack$/, "");
  const taskGroups = readTaskGroups(packDirectory);
  const workflowsDirectory = resolve(packDirectory, "workflows");

  return {
    id,
    packName,
    displayName: titleCaseSlug(packName),
    version: String(metadata.version ?? "1.0.0"),
    supervisor: String(spec.supervisor ?? "supervisor"),
    summary: readSummary(packDirectory),
    projects: Array.isArray(spec.projects) ? spec.projects.map(String) : [],
    environments: Array.isArray(spec.environments) ? spec.environments.map(String) : [],
    subAgents: readSubAgents(packDirectory, registries.agents),
    skillCount: countConfig(packDirectory, registries.skills ?? "skill-registry.yaml", ["skills"]),
    mcpCount: countConfig(packDirectory, registries.mcpServers ?? "mcp-registry.yaml", [
      "servers",
      "mcpServers",
      "mcp_servers",
    ]),
    pluginCount: countConfig(packDirectory, registries.plugins ?? "plugin-registry.yaml", ["plugins"]),
    artifactCount: countConfig(packDirectory, "artifact-registry.yaml", ["artifacts"]),
    workflowCount: existsSync(workflowsDirectory)
      ? readdirSync(workflowsDirectory).filter((file) => /\.ya?ml$/i.test(file)).length
      : 0,
    taskCount: taskGroups.reduce((total, group) => total + group.tasks.length, 0),
    taskGroups,
    policy: spec.defaultPolicy ?? {},
    directory: packDirectory,
  };
}

export function loadAgentPacks(): AgentPack[] {
  const packsDirectory = resolve(resolveRepoRoot(), "packs");
  return readdirSync(packsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadPack(resolve(packsDirectory, entry.name)))
    .filter((pack): pack is AgentPack => Boolean(pack))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export class PackRegistry {
  readonly packs: AgentPack[];
  private readonly byId: Map<string, AgentPack>;

  constructor(packs = loadAgentPacks()) {
    this.packs = packs;
    this.byId = new Map(packs.flatMap((pack) => [[pack.id, pack], [pack.packName, pack]]));
  }

  get(id: string): AgentPack | undefined {
    return this.byId.get(id);
  }

  listPublic() {
    return this.packs.map(({ directory: _directory, taskGroups: _taskGroups, ...pack }) => pack);
  }
}
