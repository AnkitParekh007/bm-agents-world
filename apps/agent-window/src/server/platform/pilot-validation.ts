import type { QaIntegrationStatus } from "../qa/qa-integration-config.js";
import type { DeploymentReadiness } from "./deployment-readiness.js";
import type { RequestIdentity } from "./request-identity.js";
import type { PersistenceStatus } from "./runtime-persistence.js";

export interface PilotProjectTestStatus {
  projectId: string;
  authenticatedIdentity: { configured: boolean };
  suites: Array<{ id: string; cases: Array<{ id: string }> }>;
}

export interface PilotPolicyStatus {
  configured: boolean;
  mode: string;
  healthy: boolean;
  connectorCount: number;
  failClosed: boolean;
}

export interface PilotValidationCheck {
  id: string;
  ok: boolean;
  required: boolean;
  message: string;
  projectId?: string;
}

export interface PilotValidationResult {
  phase: 7;
  ready: boolean;
  instanceId: string;
  targetProjects: string[];
  requiredEnvironments: Array<"playground" | "qa">;
  expectedReplicas: number;
  identity: {
    source: RequestIdentity["source"];
    tenantId: string;
    projectIds: string[];
  };
  persistence: PersistenceStatus;
  policy: PilotPolicyStatus;
  deployment: DeploymentReadiness;
  checks: PilotValidationCheck[];
}

function csv(value: string | undefined, fallback: string): string[] {
  return (value?.trim() || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function booleanEnv(name: string, fallback = false): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : fallback;
}

export function pilotTargetProjects(): string[] {
  return [...new Set(csv(process.env.BM_PILOT_PROJECT_IDS, "PCC"))];
}

export function pilotRequiredEnvironments(): Array<"playground" | "qa"> {
  const environments = csv(process.env.BM_PILOT_REQUIRED_ENVIRONMENTS, "playground,qa")
    .filter((item): item is "playground" | "qa" => item === "playground" || item === "qa");
  return environments.length ? [...new Set(environments)] : ["qa"];
}

export function pilotExpectedReplicas(): number {
  return boundedInteger(process.env.BM_PILOT_EXPECTED_REPLICAS, 2, 1, 20);
}

function identityHasProject(identity: RequestIdentity, projectId: string): boolean {
  return identity.projectIds.includes("*") || identity.projectIds.some((item) => item.toLowerCase() === projectId.toLowerCase());
}

export function buildPilotValidation(input: {
  instanceId: string;
  identity: RequestIdentity;
  deployment: DeploymentReadiness;
  integrations: QaIntegrationStatus;
  projectTests: PilotProjectTestStatus[];
  persistence: PersistenceStatus;
  policy: PilotPolicyStatus;
}): PilotValidationResult {
  const targetProjects = pilotTargetProjects();
  const requiredEnvironments = pilotRequiredEnvironments();
  const expectedReplicas = pilotExpectedReplicas();
  const requireJiraWrite = booleanEnv("BM_PILOT_REQUIRE_JIRA_WRITE", false);
  const checks: PilotValidationCheck[] = [
    {
      id: "deployment-ready",
      ok: input.deployment.ready,
      required: true,
      message: input.deployment.ready ? "Deployment readiness gate is green." : "Deployment readiness gate is not green.",
    },
    {
      id: "trusted-gateway-identity",
      ok: input.identity.source === "trusted-headers",
      required: true,
      message: input.identity.source === "trusted-headers"
        ? "Request identity was injected by the trusted gateway."
        : "Phase 7 validation must run through trusted gateway identity.",
    },
    {
      id: "shared-persistence",
      ok: input.persistence.shared && input.persistence.mode === "postgres-supabase",
      required: true,
      message: input.persistence.shared && input.persistence.mode === "postgres-supabase"
        ? "Shared Postgres + private Supabase persistence is active."
        : "Phase 7 requires shared Postgres + private Supabase persistence.",
    },
    {
      id: "opa-central-policy",
      ok: input.policy.configured && input.policy.mode === "opa" && input.policy.healthy && input.policy.failClosed,
      required: true,
      message: input.policy.configured && input.policy.mode === "opa" && input.policy.healthy && input.policy.failClosed
        ? "OPA centralized policy is healthy and fail-closed."
        : "Phase 7 requires healthy fail-closed OPA centralized policy.",
    },
    {
      id: "approved-connector-registry",
      ok: input.policy.connectorCount > 0,
      required: true,
      message: input.policy.connectorCount > 0
        ? `${input.policy.connectorCount} approved/pilot connector definition(s) loaded.`
        : "Approved connector registry is empty or unavailable.",
    },
    {
      id: "jira-read-live",
      ok: input.integrations.jira.mode === "live",
      required: true,
      message: input.integrations.jira.mode === "live" ? "Jira read integration is live." : "Phase 7 requires live Jira reads.",
    },
    {
      id: "jira-write-live",
      ok: input.integrations.jira.writeMode === "live",
      required: requireJiraWrite,
      message: input.integrations.jira.writeMode === "live"
        ? "Governed Jira write integration is live."
        : requireJiraWrite
          ? "Phase 7 is configured to require governed Jira writes."
          : "Governed Jira writes are optional for this pilot rollout.",
    },
  ];

  for (const projectId of targetProjects) {
    const bitbucketReady = (input.integrations.bitbucket.projects[projectId] ?? []).length > 0 && input.integrations.bitbucket.mode === "live";
    const configuredEnvironments = new Set(
      input.integrations.playwright.targets
        .filter((target) => target.projectId.toLowerCase() === projectId.toLowerCase())
        .map((target) => target.environment),
    );
    const missingEnvironments = requiredEnvironments.filter((environment) => !configuredEnvironments.has(environment));
    const profile = input.projectTests.find((item) => item.projectId.toLowerCase() === projectId.toLowerCase());
    const testCases = profile?.suites.reduce((sum, suite) => sum + suite.cases.length, 0) ?? 0;

    checks.push(
      {
        id: "project-authorized",
        projectId,
        ok: identityHasProject(input.identity, projectId),
        required: true,
        message: identityHasProject(input.identity, projectId)
          ? `Pilot identity is authorized for ${projectId}.`
          : `Pilot identity is not authorized for ${projectId}.`,
      },
      {
        id: "bitbucket-project-live",
        projectId,
        ok: bitbucketReady,
        required: true,
        message: bitbucketReady
          ? `Bitbucket repository mapping is live for ${projectId}.`
          : `Phase 7 requires a live Bitbucket repository mapping for ${projectId}.`,
      },
      {
        id: "playwright-project-targets",
        projectId,
        ok: input.integrations.playwright.mode === "live" && missingEnvironments.length === 0,
        required: true,
        message: input.integrations.playwright.mode === "live" && missingEnvironments.length === 0
          ? `Playwright targets are configured for ${projectId}: ${requiredEnvironments.join(", ")}.`
          : `Missing ${projectId} Playwright target(s): ${missingEnvironments.join(", ") || "live worker"}.`,
      },
      {
        id: "authenticated-project-tests",
        projectId,
        ok: Boolean(profile?.authenticatedIdentity.configured && testCases > 0),
        required: true,
        message: profile?.authenticatedIdentity.configured && testCases > 0
          ? `${testCases} authenticated project test case(s) are available for ${projectId}.`
          : `Phase 7 requires authenticated project tests for ${projectId}.`,
      },
    );
  }

  return {
    phase: 7,
    ready: checks.every((check) => !check.required || check.ok),
    instanceId: input.instanceId,
    targetProjects,
    requiredEnvironments,
    expectedReplicas,
    identity: {
      source: input.identity.source,
      tenantId: input.identity.tenantId,
      projectIds: input.identity.projectIds,
    },
    persistence: input.persistence,
    policy: input.policy,
    deployment: input.deployment,
    checks,
  };
}
