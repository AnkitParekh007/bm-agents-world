import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const requireFromDocs = createRequire(join(repositoryRoot, "docs", "package.json"));
const { parse, parseAllDocuments } = requireFromDocs("yaml");
const generatedRoot = join(repositoryRoot, "docs", "generated");
const generatedHeader = "<!-- GENERATED FILE: DO NOT EDIT DIRECTLY. Run `npm run docs:generate`. -->";

function table(headers, rows) {
  const escape = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
  ].join("\n");
}

async function emit(name, title, sources, body) {
  const sourceLines = sources.map((source) => `- \`${source}\``).join("\n");
  const output = `${generatedHeader}\n\n# ${title}\n\nAuthoritative sources:\n\n${sourceLines}\n\n${body.trim()}\n`;
  await mkdir(generatedRoot, { recursive: true });
  await writeFile(join(generatedRoot, name), output, "utf8");
}

async function generateRoutes() {
  const sourcePath = "apps/agent-window/src/server/index.ts";
  const source = await readFile(join(repositoryRoot, sourcePath), "utf8");
  const routes = [];
  for (const match of source.matchAll(/app\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g)) {
    if (!match[2].startsWith("/")) continue;
    routes.push([match[1].toUpperCase(), match[2], sourcePath]);
  }
  const copilotBase = source.match(/basePath:\s*"([^"]+)"/);
  if (copilotBase) routes.push(["ALL", `${copilotBase[1]}/*`, sourcePath]);
  routes.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  await emit("api-routes.md", "Generated API route inventory", [sourcePath], `${table(["Method", "Path", "Declared in"], routes)}\n\nThis inventory records route declarations. Authorization, payload, response, and operational semantics remain in the curated [API reference](../development/api-reference.md).`);
}

function safeDefault(name, value, commented) {
  if (/(?:API_KEY|ACCESS_TOKEN|BEARER_TOKEN|SECRET_KEY|PASSWORD|POSTGRES_URL|DATABASE_URL|WEBHOOK_URL|OTEL_EXPORTER_OTLP_HEADERS)$/.test(name)) return "server-side secret";
  if (!value) return commented ? "unset example" : "empty";
  return `\`${value.replaceAll("`", "\\`")}\``;
}

async function generateEnvironment() {
  const sourcePath = "apps/agent-window/.env.example";
  const lines = (await readFile(join(repositoryRoot, sourcePath), "utf8")).split(/\r?\n/);
  let section = "Runtime and model";
  const variables = new Map();
  for (const line of lines) {
    const heading = line.match(/^#\s+(Central policy \+ approved connector registry|Runtime persistence|Shared team pilot \/ horizontal scaling:|Request identity|Model usage \+ OpenTelemetry|QA Jira Cloud read \+ governed defect adapter|QA Bitbucket Cloud read adapter|QA Playwright worker|QA Teams status adapter|QA database validation adapter|QA API contract adapter)$/);
    if (heading) { section = heading[1].replace(/:$/, ""); continue; }
    const assignment = line.match(/^\s*(#\s*)?([A-Z][A-Z0-9_]*)=(.*)$/);
    if (assignment) {
      const [, comment, name, value] = assignment;
      if (!variables.has(name)) variables.set(name, [name, section, safeDefault(name, value.trim(), Boolean(comment))]);
      continue;
    }
  }
  await emit("environment-variables.md", "Generated environment-variable inventory", [sourcePath], `${table(["Variable", "Section", "Example/default"], [...variables.values()].map(([name, ...rest]) => [`\`${name}\``, ...rest]))}\n\nSecret values are intentionally replaced with classifications. See [Environment variables](../development/environment-variables.md) for behavior and security guidance.`);
}

function field(block, name) {
  const stringValue = block.match(new RegExp(`\\b${name}:\\s*"([^"]*)"`));
  if (stringValue) return stringValue[1];
  const booleanValue = block.match(new RegExp(`\\b${name}:\\s*(true|false)`));
  if (booleanValue) return booleanValue[1];
  const arrayValue = block.match(new RegExp(`\\b${name}:\\s*\\[([^\\]]*)\\]`));
  return arrayValue ? arrayValue[1].replaceAll('"', "").replaceAll(",", ", ").replace(/\s+/g, " ").trim() : "";
}

async function generateCapabilities() {
  const capabilitySource = "apps/agent-window/src/server/qa/qa-capabilities.ts";
  const connectorSource = "config/approved-connectors.yaml";
  const source = await readFile(join(repositoryRoot, capabilitySource), "utf8");
  const capabilities = [...source.matchAll(/\{\s*id:\s*"qa\.[\s\S]*?\n\s*\},/g)].map((match) => match[0]);
  const capabilityRows = capabilities.map((block) => [
    `\`${field(block, "id")}\``, field(block, "description"), field(block, "riskLevel"),
    field(block, "approvalMode"), field(block, "allowedEnvironments"), `\`${field(block, "adapterId")}\``,
  ]);
  const connectors = parse(await readFile(join(repositoryRoot, connectorSource), "utf8")).connectors ?? [];
  const connectorRows = connectors.map((connector) => [connector.id, connector.displayName, connector.kind, connector.status, (connector.transports ?? []).join(", ")]);
  const body = `## Capabilities\n\n${table(["ID", "Description", "Risk", "Approval", "Environments", "Adapter"], capabilityRows)}\n\n## Approved connectors\n\n${table(["ID", "Display name", "Kind", "Status", "Transports"], connectorRows)}\n\nSee [Capability broker and data flow](../architecture/capability-broker.md) for policy semantics.`;
  await emit("capability-catalog.md", "Generated capability and connector catalog", [capabilitySource, connectorSource], body);
}

async function generatePacks() {
  const packsRoot = join(repositoryRoot, "packs");
  const directories = (await readdir(packsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const rows = [];
  const sources = [];
  for (const directory of directories) {
    const source = `packs/${directory.name}/config/pack-manifest.yaml`;
    try {
      const manifest = parse(await readFile(join(repositoryRoot, source), "utf8"));
      sources.push(source);
      rows.push([
        manifest.metadata?.name ?? manifest.pack_id ?? directory.name,
        manifest.metadata?.version ?? manifest.version ?? "not declared",
        manifest.metadata?.owner ?? manifest.metadata?.maintainer ?? manifest.high_impact_decision_owner ?? "not declared",
        manifest.spec?.supervisor ?? manifest.spec?.operatingProfiles?.[0] ?? "not declared",
        (manifest.spec?.environments ?? []).join(", ") || "not declared",
      ]);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  await emit("agent-pack-catalog.md", "Generated agent-pack catalog", sources, `${table(["Pack", "Version", "Owner", "Supervisor", "Environments"], rows)}\n\nPack manifests remain authoritative. See [Agent packs and CopilotKit](../architecture/agents-and-packs.md) for discovery and runtime behavior.`);
}

async function loadYamlDocuments(source) {
  const contents = await readFile(join(repositoryRoot, source), "utf8");
  return parseAllDocuments(contents).map((document) => document.toJSON()).filter(Boolean);
}

async function generateDeployment() {
  const sources = ["deploy/k8s/qa-pilot/deployment.yaml", "deploy/k8s/qa-pilot/service.yaml", "deploy/k8s/qa-pilot/configmap.yaml", "deploy/k8s/qa-pilot/networkpolicy.yaml"];
  const documents = (await Promise.all(sources.map(loadYamlDocuments))).flat();
  const deployment = documents.find((document) => document.kind === "Deployment");
  const service = documents.find((document) => document.kind === "Service");
  const configMap = documents.find((document) => document.kind === "ConfigMap" && document.metadata?.name === "bm-agents-world-config");
  const networkPolicy = documents.find((document) => document.kind === "NetworkPolicy");
  const containers = deployment?.spec?.template?.spec?.containers ?? [];
  const rows = [
    ["Replicas", deployment?.spec?.replicas],
    ["Update strategy", deployment?.spec?.strategy?.type],
    ["Service type", service?.spec?.type],
    ["Service port", service?.spec?.ports?.[0]?.port],
    ["Application container port", containers.find((container) => container.name === "agent-window")?.ports?.[0]?.containerPort],
    ["Containers", containers.map((container) => container.name).join(", ")],
    ["Ingress policy", networkPolicy?.metadata?.name],
    ["Runtime configuration keys", Object.keys(configMap?.data ?? {}).sort().join(", ")],
  ];
  await emit("deployment-reference.md", "Generated deployment reference", sources, `${table(["Fact", "Configured value"], rows)}\n\nSee [Deployment](../deployment/deployment.md) and [Security](../deployment/security.md) for operational requirements and trust-boundary guidance.`);
}

await generateRoutes();
await generateEnvironment();
await generateCapabilities();
await generatePacks();
await generateDeployment();
console.log(`Generated documentation in ${relative(repositoryRoot, generatedRoot).replaceAll("\\", "/")}.`);
