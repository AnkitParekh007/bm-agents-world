import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";

export interface JiraReadConfiguration {
  mode: "live" | "mock";
  baseUrl?: string;
  authMode?: "basic-token" | "bearer";
  emailConfigured: boolean;
  tokenConfigured: boolean;
}

export interface BitbucketRepositoryRef {
  label: string;
  workspace: string;
  repoSlug: string;
}

export interface BitbucketReadConfiguration {
  mode: "live" | "mock";
  baseUrl: string;
  tokenConfigured: boolean;
  projects: Record<string, BitbucketRepositoryRef[]>;
}

export interface QaIntegrationStatus {
  jira: JiraReadConfiguration;
  bitbucket: BitbucketReadConfiguration;
}

function repoRoot(): string {
  const candidates = [
    process.env.BM_AGENTS_REPO_ROOT,
    resolve(process.cwd(), "../.."),
    process.cwd(),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "packs", "qa-agent-pack"))) return candidate;
  }

  return process.cwd();
}

function cleanBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
}

function parseCloudRepositoryUrl(url: string, label: string): BitbucketRepositoryRef | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "bitbucket.org") return undefined;
    const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/, "").split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) return undefined;
    return { label, workspace: parts[0], repoSlug: parts[1] };
  } catch {
    return undefined;
  }
}

function projectRegistryRepositories(): Record<string, BitbucketRepositoryRef[]> {
  const path = resolve(repoRoot(), "packs", "qa-agent-pack", "config", "project-registry.yaml");
  if (!existsSync(path)) return {};

  const parsed = YAML.parse(readFileSync(path, "utf8")) as Record<string, unknown> | undefined;
  const projects = Array.isArray(parsed?.projects) ? parsed.projects : [];
  const result: Record<string, BitbucketRepositoryRef[]> = {};

  for (const item of projects) {
    if (!item || typeof item !== "object") continue;
    const project = item as Record<string, any>;
    const projectId = String(project.id ?? "").trim();
    if (!projectId) continue;
    const repositories = project.source?.repositories;
    if (!repositories || typeof repositories !== "object") continue;

    const refs = Object.entries(repositories)
      .map(([label, value]) => {
        const url = typeof value === "object" && value ? String((value as Record<string, unknown>).url ?? "") : "";
        return url ? parseCloudRepositoryUrl(url, label) : undefined;
      })
      .filter((value): value is BitbucketRepositoryRef => Boolean(value));

    if (refs.length) result[projectId] = refs;
  }

  return result;
}

function parseRepositoryOverride(projectId: string): BitbucketRepositoryRef[] | undefined {
  const envKey = `QA_${projectId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_BITBUCKET_REPOS`;
  const raw = process.env[envKey]?.trim();
  if (!raw) return undefined;

  const defaultWorkspace = process.env.QA_BITBUCKET_WORKSPACE?.trim();
  const refs = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [labelPart, repoPart] = entry.includes(":") ? entry.split(":", 2) : ["repository", entry];
      const label = labelPart.trim();
      const repo = repoPart.trim();
      const [workspace, repoSlug] = repo.includes("/") ? repo.split("/", 2) : [defaultWorkspace, repo];
      if (!workspace || !repoSlug) return undefined;
      return { label, workspace, repoSlug };
    })
    .filter((value): value is BitbucketRepositoryRef => Boolean(value));

  return refs.length ? refs : undefined;
}

export function loadQaIntegrationStatus(): QaIntegrationStatus {
  const jiraBaseUrl = cleanBaseUrl(process.env.QA_JIRA_BASE_URL);
  const jiraEmail = process.env.QA_JIRA_EMAIL?.trim();
  const jiraApiToken = process.env.QA_JIRA_API_TOKEN?.trim();
  const jiraBearerToken = process.env.QA_JIRA_BEARER_TOKEN?.trim();
  const jiraLive = Boolean(jiraBaseUrl && (jiraBearerToken || (jiraEmail && jiraApiToken)));

  const registryProjects = projectRegistryRepositories();
  const projectIds = new Set(["PCC", "SOP", "DataBridge", ...Object.keys(registryProjects)]);
  const projects: Record<string, BitbucketRepositoryRef[]> = {};
  for (const projectId of projectIds) {
    const override = parseRepositoryOverride(projectId);
    const refs = override ?? registryProjects[projectId] ?? [];
    if (refs.length) projects[projectId] = refs;
  }

  const bitbucketToken = process.env.QA_BITBUCKET_ACCESS_TOKEN?.trim();
  const bitbucketLive = Boolean(bitbucketToken && Object.values(projects).some((refs) => refs.length > 0));

  return {
    jira: {
      mode: jiraLive ? "live" : "mock",
      baseUrl: jiraBaseUrl,
      authMode: jiraBearerToken ? "bearer" : jiraEmail && jiraApiToken ? "basic-token" : undefined,
      emailConfigured: Boolean(jiraEmail),
      tokenConfigured: Boolean(jiraBearerToken || jiraApiToken),
    },
    bitbucket: {
      mode: bitbucketLive ? "live" : "mock",
      baseUrl: cleanBaseUrl(process.env.QA_BITBUCKET_BASE_URL) ?? "https://api.bitbucket.org/2.0",
      tokenConfigured: Boolean(bitbucketToken),
      projects,
    },
  };
}

export function jiraAuthorizationHeader(): string | undefined {
  const bearer = process.env.QA_JIRA_BEARER_TOKEN?.trim();
  if (bearer) return `Bearer ${bearer}`;

  const email = process.env.QA_JIRA_EMAIL?.trim();
  const token = process.env.QA_JIRA_API_TOKEN?.trim();
  if (email && token) return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
  return undefined;
}

export function bitbucketAuthorizationHeader(): string | undefined {
  const token = process.env.QA_BITBUCKET_ACCESS_TOKEN?.trim();
  return token ? `Bearer ${token}` : undefined;
}
