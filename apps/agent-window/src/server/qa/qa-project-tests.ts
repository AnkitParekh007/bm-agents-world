import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type { SecretReference } from "../platform/capability-types.js";

export type ProjectTestStep =
  | { type: "goto"; path: string }
  | { type: "expectVisible"; selector: string }
  | { type: "expectText"; selector: string; text: string }
  | { type: "expectUrlContains"; value: string };

export interface ProjectTestCase {
  id: string;
  title: string;
  baseline: boolean;
  pathPrefixes: string[];
  steps: ProjectTestStep[];
}

export interface ProjectTestSuite {
  id: string;
  cases: ProjectTestCase[];
}

export interface ProjectTestProfile {
  projectId: string;
  identity: {
    storageStateEnv?: string;
    secretReference?: SecretReference;
    configured: boolean;
  };
  suites: Record<string, ProjectTestSuite>;
}

export interface ProjectTestSelection {
  projectId: string;
  suiteId: string;
  changedFiles: string[];
  cases: ProjectTestCase[];
  identity: ProjectTestProfile["identity"];
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

function catalogPath(): string {
  return process.env.QA_PROJECT_TEST_CATALOG?.trim()
    ? resolve(process.env.QA_PROJECT_TEST_CATALOG.trim())
    : resolve(repoRoot(), "apps", "agent-window", "config", "qa-project-tests.yaml");
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => text(item)).filter((item): item is string => Boolean(item))
    : [];
}

function parseStep(value: unknown): ProjectTestStep | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const type = text(record.type);
  if (type === "goto") {
    const path = text(record.path);
    return path ? { type, path } : undefined;
  }
  if (type === "expectVisible") {
    const selector = text(record.selector);
    return selector ? { type, selector } : undefined;
  }
  if (type === "expectText") {
    const selector = text(record.selector);
    const expectedText = text(record.text);
    return selector && expectedText ? { type, selector, text: expectedText } : undefined;
  }
  if (type === "expectUrlContains") {
    const expected = text(record.value);
    return expected ? { type, value: expected } : undefined;
  }
  return undefined;
}

function parseCase(value: unknown): ProjectTestCase | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const id = text(record.id);
  const title = text(record.title);
  if (!id || !title) return undefined;
  const steps = Array.isArray(record.steps)
    ? record.steps.map(parseStep).filter((step): step is ProjectTestStep => Boolean(step))
    : [];
  if (!steps.length) return undefined;
  return {
    id,
    title,
    baseline: record.baseline === true,
    pathPrefixes: list(record.pathPrefixes),
    steps,
  };
}

function parseProject(projectId: string, value: unknown): ProjectTestProfile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const identityRecord = record.identity && typeof record.identity === "object"
    ? record.identity as Record<string, unknown>
    : {};
  const storageStateEnv = text(identityRecord.storageStateEnv);
  const secretReference: SecretReference | undefined = storageStateEnv
    ? {
        provider: "environment",
        name: storageStateEnv,
        purpose: `Authenticated Playwright storage state for ${projectId} QA execution`,
      }
    : undefined;

  const suitesRecord = record.suites && typeof record.suites === "object"
    ? record.suites as Record<string, unknown>
    : {};
  const suites: Record<string, ProjectTestSuite> = {};
  for (const [suiteId, suiteValue] of Object.entries(suitesRecord)) {
    if (!suiteValue || typeof suiteValue !== "object") continue;
    const rawCases = (suiteValue as Record<string, unknown>).cases;
    const cases = Array.isArray(rawCases)
      ? rawCases.map(parseCase).filter((item): item is ProjectTestCase => Boolean(item))
      : [];
    if (cases.length) suites[suiteId] = { id: suiteId, cases };
  }

  return {
    projectId,
    identity: {
      storageStateEnv,
      secretReference,
      configured: Boolean(storageStateEnv && process.env[storageStateEnv]?.trim()),
    },
    suites,
  };
}

export function loadProjectTestProfiles(): Record<string, ProjectTestProfile> {
  const path = catalogPath();
  if (!existsSync(path)) return {};
  const parsed = YAML.parse(readFileSync(path, "utf8")) as Record<string, unknown> | undefined;
  const projects = parsed?.projects && typeof parsed.projects === "object"
    ? parsed.projects as Record<string, unknown>
    : {};
  const result: Record<string, ProjectTestProfile> = {};
  for (const [projectId, value] of Object.entries(projects)) {
    const profile = parseProject(projectId, value);
    if (profile) result[projectId] = profile;
  }
  return result;
}

export function projectTestCatalogStatus() {
  const profiles = loadProjectTestProfiles();
  return Object.values(profiles).map((profile) => ({
    projectId: profile.projectId,
    authenticatedIdentity: {
      configured: profile.identity.configured,
      secretReference: profile.identity.secretReference,
    },
    suites: Object.values(profile.suites).map((suite) => ({
      id: suite.id,
      cases: suite.cases.map((item) => ({
        id: item.id,
        title: item.title,
        baseline: item.baseline,
        pathPrefixes: item.pathPrefixes,
      })),
    })),
  }));
}

export function resolveProjectTestSelection(
  projectId: string,
  suiteId: string,
  changedFiles: string[] = [],
): ProjectTestSelection | undefined {
  const profile = Object.values(loadProjectTestProfiles()).find(
    (item) => item.projectId.toLowerCase() === projectId.toLowerCase(),
  );
  const suite = profile?.suites[suiteId];
  if (!profile || !suite) return undefined;

  const normalizedFiles = changedFiles
    .map((item) => item.trim().replace(/^\/+/, ""))
    .filter(Boolean)
    .slice(0, 200);
  const selected = suite.cases.filter((testCase) => {
    if (testCase.baseline) return true;
    if (!normalizedFiles.length || !testCase.pathPrefixes.length) return false;
    return testCase.pathPrefixes.some((prefix) => {
      const normalizedPrefix = prefix.replace(/^\/+/, "");
      return normalizedFiles.some((file) => file.startsWith(normalizedPrefix));
    });
  });

  return {
    projectId: profile.projectId,
    suiteId,
    changedFiles: normalizedFiles,
    cases: selected,
    identity: profile.identity,
  };
}

export function resolveProjectStorageState(projectId: string): string | undefined {
  const profile = Object.values(loadProjectTestProfiles()).find(
    (item) => item.projectId.toLowerCase() === projectId.toLowerCase(),
  );
  const envName = profile?.identity.storageStateEnv;
  const value = envName ? process.env[envName]?.trim() : undefined;
  return value ? resolve(value) : undefined;
}
