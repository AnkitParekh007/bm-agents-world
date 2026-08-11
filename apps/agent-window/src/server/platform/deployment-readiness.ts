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

export interface PersistenceReadiness {
  mode?: "sqlite-filesystem" | "postgres-supabase";
  shared?: boolean;
  stateReady?: boolean;
  artifactsReady?: boolean;
}

export interface PolicyReadiness {
  configured?: boolean;
  mode?: string;
  healthy?: boolean;
  connectorRegistryReady?: boolean;
  failClosed?: boolean;
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
  options: {
    statePath?: string;
    artifactRoot?: string;
    packCount: number;
    persistence?: PersistenceReadiness;
    policy?: PolicyReadiness;
  },
): DeploymentReadiness {
  const mode = process.env.BM_DEPLOYMENT_MODE?.trim().toLowerCase() === "pilot" ? "pilot" : "development";
  const strict = mode === "pilot";
  const requireJiraWrite = booleanEnv("BM_PILOT_REQUIRE_JIRA_WRITE", false);
  const shared = options.persistence?.shared === true || options.persistence?.mode === "postgres-supabase";
  const centralPolicyRequired = strict && shared;

  const configuredStatePath = process.env.BM_STATE_DB_PATH?.trim();
  const configuredArtifactRoot = process.env.BM_ARTIFACT_ROOT?.trim();
  const stateDirectory = options.statePath ? dirname(resolve(options.statePath)) : undefined;
  const artifactRoot = options.artifactRoot ? resolve(options.artifactRoot) : undefined;
  const modelReady = modelCredentialConfigured();
  const localStateReady = Boolean(
    configuredStatePath
    && isAbsolute(configuredStatePath)
    && stateDirectory
    && checkWritableDirectory(stateDirectory),
  );
  const localArtifactReady = Boolean(
    configuredArtifactRoot
    && isAbsolute(configuredArtifactRoot)
    && artifactRoot
    && checkWritableDirectory(artifactRoot),
  );
  const stateReady = shared ? options.persistence?.stateReady === true : localStateReady;
  const artifactsReady = shared ? options.persistence?.artifactsReady === true : localArtifactReady;
  const trustedIdentityReady = process.env.BM_IDENTITY_MODE?.trim().toLowerCase() === "trusted-headers";
  const centralPolicyConfigured = Boolean(
    options.policy?.configured
    && options.policy.mode === "opa"
    && options.policy.failClosed,
  );
  const centralPolicyHealthy = options.policy?.healthy === true;
  const connectorRegistryReady = options.policy?.connectorRegistryReady === true;

  const checks: ReadinessCheck[] = [
    {
      id: "packs-loaded",
      ok: options.packCount > 0,
      required: true,
      message: options.packCount > 0 ? `${options.packCount} agent packs loaded.` : "No agent packs were loaded.",
    },
    {
      id: "model-credential",
      ok: modelReady,
      required: strict,
      message: modelReady ? "Model provider credential is configured." : "Model provider credential is not configured.",
    },
    {
      id: "trusted-identity",
      ok: trustedIdentityReady,
      required: strict,
      message: trustedIdentityReady
        ? "Trusted gateway identity mode is enabled."
        : "Pilot mode requires BM_IDENTITY_MODE=trusted-headers.",
    },
    {
      id: "central-policy-mode",
      ok: centralPolicyConfigured,
      required: centralPolicyRequired,
      message: centralPolicyConfigured
        ? "Shared pilot is configured for fail-closed OPA policy evaluation."
        : "Shared pilot requires BM_POLICY_MODE=opa with fail-closed centralized policy.",
    },
    {
      id: "central-policy-health",
      ok: centralPolicyHealthy,
      required: centralPolicyRequired,
      message: centralPolicyHealthy
        ? "OPA centralized policy service is healthy."
        : "Shared pilot requires a healthy OPA policy service.",
    },
    {
      id: "approved-connector-registry",
      ok: connectorRegistryReady,
      required: centralPolicyRequired,
      message: connectorRegistryReady
        ? "Approved MCP/connector registry is loaded."
        : "Shared pilot requires a readable non-empty approved connector registry.",
    },
    {
      id: shared ? "shared-postgres-state" : "persistent-state-path",
      ok: stateReady,
      required: strict,
      message: shared
        ? stateReady
          ? "Shared Postgres runtime state is reachable and schema-compatible."
          : "Pilot shared mode requires reachable schema-compatible Postgres runtime state."
        : stateReady
          ? "Persistent state directory is configured and writable."
          : "Pilot local mode requires an absolute writable BM_STATE_DB_PATH.",
    },
    {
      id: shared ? "shared-artifact-storage" : "persistent-artifact-root",
      ok: artifactsReady,
      required: strict,
      message: shared
        ? artifactsReady
          ? "Private shared artifact storage is reachable."
          : "Pilot shared mode requires reachable private artifact storage."
        : artifactsReady
          ? "Persistent artifact root is configured and writable."
          : "Pilot local mode requires an absolute writable BM_ARTIFACT_ROOT.",
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
