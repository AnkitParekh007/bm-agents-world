import { accessSync, constants, mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import type { QaIntegrationStatus } from "../qa/qa-integration-config.js";

export interface ReadinessCheck {
  id: string;
  ok: boolean;
  required: boolean;
  message: string;
}

export interface DeploymentReadiness {
  ready: boolean;
  mode: "development" | "pilot";
  checks: ReadinessCheck[];
}

function booleanEnv(name: string, fallback = false): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}

function checkWritableDirectory(path: string): boolean {
  try {
    mkdirSync(path, { recursive: true });
    accessSync(path, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function modelCredentialConfigured(): boolean {
  const model = (process.env.AI_MODEL || "openai:gpt-5.4-mini").trim().toLowerCase();
  if (model.startsWith("anthropic:")) return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  if (model.startsWith("google:")) return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
  if (model.startsWith("openai:")) return Boolean(process.env.OPENAI_API_KEY?.trim());
  return true;
}

export function buildDeploymentReadiness(
  integrations: QaIntegrationStatus,
  options: { statePath: string; artifactRoot: string; packCount: number },
): DeploymentReadiness {
  const mode = process.env.BM_DEPLOYMENT_MODE?.trim().toLowerCase() === "pilot" ? "pilot" : "development";
  const strict = mode === "pilot";
  const requireJiraWrite = booleanEnv("BM_PILOT_REQUIRE_JIRA_WRITE", false);

  const stateDirectory = dirname(resolve(options.statePath));
  const artifactRoot = resolve(options.artifactRoot);
  const checks: ReadinessCheck[] = [
    {
      id: "packs-loaded",
      ok: options.packCount > 0,
      required: true,
      message: options.packCount > 0 ? `${options.packCount} agent packs loaded.` : "No agent packs were loaded.",
    },
    {
      id: "model-credential",
      ok: modelCredentialConfigured(),
      required: strict,
      message: modelCredentialConfigured() ? "Model provider credential is configured." : "Model provider credential is not configured.",
    },
    {
      id: "trusted-identity",
      ok: process.env.BM_IDENTITY_MODE?.trim().toLowerCase() === "trusted-headers",
      required: strict,
      message: process.env.BM_IDENTITY_MODE?.trim().toLowerCase() === "trusted-headers"
        ? "Trusted gateway identity mode is enabled."
        : "Pilot mode requires BM_IDENTITY_MODE=trusted-headers.",
    },
    {
      id: "persistent-state-path",
      ok: Boolean(process.env.BM_STATE_DB_PATH?.trim()) && isAbsolute(options.statePath) && checkWritableDirectory(stateDirectory),
      required: strict,
      message: Boolean(process.env.BM_STATE_DB_PATH?.trim()) && isAbsolute(options.statePath) && checkWritableDirectory(stateDirectory)
        ? "Persistent state directory is configured and writable."
        : "Pilot mode requires an absolute writable BM_STATE_DB_PATH.",
    },
    {
      id: "persistent-artifact-root",
      ok: Boolean(process.env.BM_ARTIFACT_ROOT?.trim()) && isAbsolute(options.artifactRoot) && checkWritableDirectory(artifactRoot),
      required: strict,
      message: Boolean(process.env.BM_ARTIFACT_ROOT?.trim()) && isAbsolute(options.artifactRoot) && checkWritableDirectory(artifactRoot)
        ? "Persistent artifact root is configured and writable."
        : "Pilot mode requires an absolute writable BM_ARTIFACT_ROOT.",
    },
    {
      id: "jira-read-live",
      ok: integrations.jira.mode === "live",
      required: strict,
      message: integrations.jira.mode === "live" ? "Jira read adapter is live." : "Pilot mode requires live Jira read configuration.",
    },
    {
      id: "bitbucket-read-live",
      ok: integrations.bitbucket.mode === "live",
      required: strict,
      message: integrations.bitbucket.mode === "live" ? "Bitbucket read adapter is live." : "Pilot mode requires live Bitbucket read configuration.",
    },
    {
      id: "playwright-live",
      ok: integrations.playwright.mode === "live" && integrations.playwright.targets.length > 0,
      required: strict,
      message: integrations.playwright.mode === "live" && integrations.playwright.targets.length > 0
        ? `${integrations.playwright.targets.length} Playwright target(s) configured.`
        : "Pilot mode requires at least one live Playwright target.",
    },
    {
      id: "jira-write",
      ok: integrations.jira.writeMode === "live",
      required: strict && requireJiraWrite,
      message: integrations.jira.writeMode === "live"
        ? "Governed Jira write adapter is live."
        : requireJiraWrite
          ? "BM_PILOT_REQUIRE_JIRA_WRITE=true requires live governed Jira write configuration."
          : "Jira write remains optional for the pilot.",
    },
  ];

  return {
    ready: checks.every((check) => !check.required || check.ok),
    mode,
    checks,
  };
}
