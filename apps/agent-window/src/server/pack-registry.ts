import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import YAML from "yaml";
import {
  mergeValidations,
  validateAgentRegistry,
  validatePackManifest,
  type PackValidation,
} from "./pack-schema.js";
import { compilePack, type CompiledPack } from "./pack-compiler.js";

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

export interface PackWorkflowContent {
  name: string;
  content: unknown;
}

/**
 * The actual normalized contents of a pack's governance-bearing registries —
 * not just their counts. This is what the Phase 2 compiler hashes per component
 * so that a change to *what* a registry declares (a skill swapped, an approval
 * policy relaxed, a permission row edited) changes the pack hash even when the
 * item count is unchanged.
 */
export interface PackContent {
  skills: unknown[];
  mcpServers: unknown[];
  plugins: unknown[];
  artifacts: unknown[];
  workflows: PackWorkflowContent[];
  /** Parsed approval-policies.yaml ({} when absent). */
  policies: unknown;
  /** Raw permission-matrix.csv, line-endings normalized ("" when absent). */
  permissions: string;
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
  /** Normalized registry contents used for per-component hashing (Phase 2). */
  content?: PackContent;
  validation: PackValidation;
  directory: string;
}

/**
 * In strict mode an invalid pack is failed closed (never loaded); otherwise it
 * loads with its validation issues recorded for observability. Strict mode is
 * on in production and can be forced with BM_PACK_STRICT.
 */
function packStrictMode(): boolean {
  const flag = process.env.BM_PACK_STRICT?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV === "production";
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

function firstArray(value: Record<string, any>, preferredKeys: string[]): any[] {
  for (const key of preferredKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  for (const entry of Object.values(value)) {
    if (Array.isArray(entry)) return entry;
  }

  return [];
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

function readSubAgents(registry: Record<string, any>): PackSubAgent[] {
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

function readConfigList(packDirectory: string, file: string, keys: string[]): any[] {
  return firstArray(parseYamlFile(resolve(packDirectory, "config", file)), keys);
}

function readWorkflowContents(workflowsDirectory: string): PackWorkflowContent[] {
  if (!existsSync(workflowsDirectory)) return [];
  return readdirSync(workflowsDirectory)
    .filter((file) => /\.ya?ml$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({ name: file, content: parseYamlFile(resolve(workflowsDirectory, file)) }));
}

function readPermissionMatrix(packDirectory: string): string {
  const path = resolve(packDirectory, "config", "permission-matrix.csv");
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

function loadPack(packDirectory: string): AgentPack | null {
  const manifestPath = resolve(packDirectory, "config", "pack-manifest.yaml");
  if (!existsSync(manifestPath)) return null;

  const manifest = parseYamlFile(manifestPath);
  const metadata = manifest.metadata ?? {};
  const spec = manifest.spec ?? {};
  const registries = spec.registries ?? {};
  const agentRegistry = parseYamlFile(
    resolve(packDirectory, "config", registries.agents ?? "agent-registry.yaml"),
  );

  const validation = mergeValidations(
    validatePackManifest(manifest),
    validateAgentRegistry(agentRegistry),
  );
  if (!validation.ok && packStrictMode()) {
    console.warn(
      `[bm-agents-world] pack ${basename(packDirectory)} failed schema validation and was skipped (strict mode):\n  - ${validation.issues.join("\n  - ")}`,
    );
    return null;
  }

  const packName =
    typeof metadata.name === "string" && metadata.name.length > 0
      ? metadata.name
      : basename(packDirectory);
  const id = basename(packDirectory).replace(/-agent-pack$/, "");
  const taskGroups = readTaskGroups(packDirectory);
  const workflowsDirectory = resolve(packDirectory, "workflows");

  const skills = readConfigList(packDirectory, registries.skills ?? "skill-registry.yaml", ["skills"]);
  const mcpServers = readConfigList(packDirectory, registries.mcpServers ?? "mcp-registry.yaml", [
    "servers",
    "mcpServers",
    "mcp_servers",
  ]);
  const plugins = readConfigList(packDirectory, registries.plugins ?? "plugin-registry.yaml", ["plugins"]);
  const artifacts = readConfigList(packDirectory, "artifact-registry.yaml", ["artifacts"]);
  const workflows = readWorkflowContents(workflowsDirectory);
  const policies = parseYamlFile(resolve(packDirectory, "config", "approval-policies.yaml"));
  const permissions = readPermissionMatrix(packDirectory);

  return {
    id,
    packName,
    displayName: titleCaseSlug(packName),
    version: String(metadata.version ?? "1.0.0"),
    supervisor: String(spec.supervisor ?? "supervisor"),
    summary: readSummary(packDirectory),
    projects: Array.isArray(spec.projects) ? spec.projects.map(String) : [],
    environments: Array.isArray(spec.environments) ? spec.environments.map(String) : [],
    subAgents: readSubAgents(agentRegistry),
    skillCount: skills.length,
    mcpCount: mcpServers.length,
    pluginCount: plugins.length,
    artifactCount: artifacts.length,
    workflowCount: workflows.length,
    taskCount: taskGroups.reduce((total, group) => total + group.tasks.length, 0),
    taskGroups,
    policy: spec.defaultPolicy ?? {},
    content: { skills, mcpServers, plugins, artifacts, workflows, policies, permissions },
    validation,
    directory: packDirectory,
  };
}

function loadPackSafely(packDirectory: string): AgentPack | null {
  try {
    return loadPack(packDirectory);
  } catch (error) {
    // A single malformed pack must never take down the whole registry.
    console.warn(
      `[bm-agents-world] pack ${basename(packDirectory)} could not be loaded and was skipped: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

export function loadAgentPacks(): AgentPack[] {
  const packsDirectory = resolve(resolveRepoRoot(), "packs");
  return readdirSync(packsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadPackSafely(resolve(packsDirectory, entry.name)))
    .filter((pack): pack is AgentPack => Boolean(pack))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export class PackRegistry {
  readonly packs: AgentPack[];
  private readonly byId: Map<string, AgentPack>;
  private readonly compiledById: Map<string, CompiledPack>;

  constructor(packs = loadAgentPacks()) {
    this.packs = packs;
    this.byId = new Map(packs.flatMap((pack) => [[pack.id, pack], [pack.packName, pack]]));
    this.compiledById = new Map(
      packs.flatMap((pack) => {
        const compiled = compilePack(pack);
        return [[pack.id, compiled], [pack.packName, compiled]] as const;
      }),
    );
  }

  get(id: string): AgentPack | undefined {
    return this.byId.get(id);
  }

  /** The deterministic, content-hashed compiled definition for a pack. */
  compiled(id: string): CompiledPack | undefined {
    return this.compiledById.get(id);
  }

  listPublic() {
    return this.packs.map(({ directory: _directory, taskGroups: _taskGroups, validation, ...pack }) => ({
      ...pack,
      valid: validation.ok,
      contentHash: this.compiledById.get(pack.id)?.contentHash,
    }));
  }

  /** Packs that loaded but carry schema validation issues (empty when clean). */
  invalidPacks(): Array<{ id: string; issues: string[] }> {
    return this.packs
      .filter((pack) => !pack.validation.ok)
      .map((pack) => ({ id: pack.id, issues: pack.validation.issues }));
  }
}
