import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type { EnvironmentName } from "../platform/capability-types.js";

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

export interface PlaywrightTargetRef {
  projectId: string;
  environment: "playground" | "qa";
  url: string;
}

export interface PlaywrightConfiguration {
  mode: "live" | "mock";
  enabled: boolean;
  browser: "chromium";
  timeoutMs: number;
  targets: PlaywrightTargetRef[];
}

export interface QaIntegrationStatus {
  jira: JiraReadConfiguration;
  bitbucket: BitbucketReadConfiguration;
  playwright: PlaywrightConfiguration;
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

function projectRegistry(): Array<Record<string, any>> {
  const path = resolve(repoRoot(), "packs", "qa-agent-pack", "config", "project-registry.yaml");
  if (!existsSync(path)) return [];
  const parsed = YAML.parse(readFileSync(path, "utf8")) as Record<string, unknown> | undefined;
  return Array.isArray(parsed?.projects) ? parsed.projects.filter((item): item is Record<string, any> => Boolean(item && typeof item === "object")) : [];
}

function projectRegistryRepositories(): Record<string, BitbucketRepositoryRef[]> {
  const result: Record<string, BitbucketRepositoryRef[]> = {};
  for (const project of projectRegistry()) {
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

function projectRegistryPlaywrightTargets(): PlaywrightTargetRef[] {
  const targets: PlaywrightTargetRef[] = [];
  for (const project of projectRegistry()) {
    const projectId = String(project.id ?? "").trim();
    if (!projectId) continue;
    for (const environment of ["playground", "qa"] as const) {
      const url = cleanBaseUrl(project.environments?.[environment]?.url);
      if (url) targets.push({ projectId, environment, url });
    }
  }
  return targets;
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

function playwrightTargets(): PlaywrightTargetRef[] {
  const byKey = new Map<string, PlaywrightTargetRef>();
  for (const target of projectRegistryPlaywrightTargets()) {
    byKey.set(`${target.projectId}:${target.environment}`, target);
  }

  for (const projectId of ["PCC", "SOP", "DataBridge"]) {
    const projectKey = projectId.toUpperCase().replace(/[^A-Z0-9]/g, "_");
    for (const environment of ["playground", "qa"] as const) {
      const envKey = `QA_${projectKey}_PLAYWRIGHT_${environment.toUpperCase()}_URL`;
      const url = cleanBaseUrl(process.env[envKey]);
      if (url) byKey.set(`${projectId}:${environment}`, { projectId, environment, url });
    }
  }

  return [...byKey.values()].sort((a, b) => `${a.projectId}:${a.environment}`.localeCompare(`${b.projectId}:${b.environment}`));
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
  const targets = playwrightTargets();
  const playwrightEnabled = process.env.QA_PLAYWRIGHT_ENABLED?.trim().toLowerCase() === "true";
  const timeoutRaw = Number(process.env.QA_PLAYWRIGHT_TIMEOUT_MS ?? 45_000);
  const timeoutMs = Number.isFinite(timeoutRaw) ? Math.max(5_000, Math.min(timeoutRaw, 120_000)) : 45_000;

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
    playwright: {
      mode: playwrightEnabled && targets.length > 0 ? "live" : "mock",
      enabled: playwrightEnabled,
      browser: "chromium",
      timeoutMs,
      targets,
    },
  };
}

export function resolvePlaywrightTarget(projectId: string, environment: EnvironmentName): string | undefined {
  if (environment === "prod") return undefined;
  return loadQaIntegrationStatus().playwright.targets.find(
    (target) => target.projectId.toLowerCase() === projectId.toLowerCase() && target.environment === environment,
  )?.url;
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
