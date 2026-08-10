import assert from "node:assert/strict";
import test from "node:test";
import type { QaIntegrationStatus } from "../qa/qa-integration-config.js";
import type { DeploymentReadiness } from "./deployment-readiness.js";
import { buildPilotValidation } from "./pilot-validation.js";
import type { PersistenceStatus } from "./runtime-persistence.js";

const ENV_KEYS = [
  "BM_PILOT_PROJECT_IDS",
  "BM_PILOT_REQUIRED_ENVIRONMENTS",
  "BM_PILOT_EXPECTED_REPLICAS",
  "BM_PILOT_REQUIRE_JIRA_WRITE",
] as const;

function withEnv(run: () => void) {
  const before = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  try {
    process.env.BM_PILOT_PROJECT_IDS = "PCC";
    process.env.BM_PILOT_REQUIRED_ENVIRONMENTS = "playground,qa";
    process.env.BM_PILOT_EXPECTED_REPLICAS = "2";
    delete process.env.BM_PILOT_REQUIRE_JIRA_WRITE;
    run();
  } finally {
    for (const key of ENV_KEYS) {
      const value = before[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function deployment(ready = true): DeploymentReadiness {
  return { ready, mode: "pilot", checks: [] };
}

function integrations(): QaIntegrationStatus {
  return {
    jira: {
      mode: "live",
      baseUrl: "https://example.atlassian.net",
      authMode: "bearer",
      emailConfigured: false,
      tokenConfigured: true,
      writeEnabled: false,
      writeMode: "mock",
    },
    bitbucket: {
      mode: "live",
      baseUrl: "https://api.bitbucket.org/2.0",
      tokenConfigured: true,
      projects: { PCC: [{ label: "frontend", workspace: "example", repoSlug: "pcc-ui" }] },
    },
    playwright: {
      mode: "live",
      enabled: true,
      browser: "chromium",
      timeoutMs: 45_000,
      targets: [
        { projectId: "PCC", environment: "playground", url: "https://playground.example.internal" },
        { projectId: "PCC", environment: "qa", url: "https://qa.example.internal" },
      ],
    },
  };
}

const persistence: PersistenceStatus = {
  mode: "postgres-supabase",
  shared: true,
  state: { kind: "postgres", location: "postgres://private" },
  artifacts: { kind: "supabase-storage", location: "private-bucket" },
};

test("Phase 7 gate becomes ready for a real shared PCC pilot", () => withEnv(() => {
  const result = buildPilotValidation({
    instanceId: "pod-a",
    identity: { userId: "qa@example.com", tenantId: "tenant", projectIds: ["PCC"], source: "trusted-headers" },
    deployment: deployment(),
    integrations: integrations(),
    projectTests: [{ projectId: "PCC", authenticatedIdentity: { configured: true }, suites: [{ id: "smoke", cases: [{ id: "login" }] }] }],
    persistence,
    policy: { configured: true, mode: "opa", healthy: true, connectorCount: 5, failClosed: true },
  });

  assert.equal(result.ready, true);
  assert.equal(result.phase, 7);
  assert.equal(result.expectedReplicas, 2);
  assert.deepEqual(result.targetProjects, ["PCC"]);
}));

test("Phase 7 gate fails when OPA is unavailable", () => withEnv(() => {
  const result = buildPilotValidation({
    instanceId: "pod-a",
    identity: { userId: "qa@example.com", tenantId: "tenant", projectIds: ["PCC"], source: "trusted-headers" },
    deployment: deployment(false),
    integrations: integrations(),
    projectTests: [{ projectId: "PCC", authenticatedIdentity: { configured: true }, suites: [{ id: "smoke", cases: [{ id: "login" }] }] }],
    persistence,
    policy: { configured: true, mode: "opa", healthy: false, connectorCount: 5, failClosed: true },
  });

  assert.equal(result.ready, false);
  assert.equal(result.checks.find((item) => item.id === "opa-central-policy")?.ok, false);
}));

test("Phase 7 gate requires both non-production browser targets and authenticated tests", () => withEnv(() => {
  const status = integrations();
  status.playwright.targets = status.playwright.targets.filter((target) => target.environment === "qa");
  const result = buildPilotValidation({
    instanceId: "pod-a",
    identity: { userId: "qa@example.com", tenantId: "tenant", projectIds: ["PCC"], source: "trusted-headers" },
    deployment: deployment(),
    integrations: status,
    projectTests: [{ projectId: "PCC", authenticatedIdentity: { configured: false }, suites: [{ id: "smoke", cases: [{ id: "login" }] }] }],
    persistence,
    policy: { configured: true, mode: "opa", healthy: true, connectorCount: 5, failClosed: true },
  });

  assert.equal(result.ready, false);
  assert.match(result.checks.find((item) => item.id === "playwright-project-targets")?.message ?? "", /playground/);
  assert.equal(result.checks.find((item) => item.id === "authenticated-project-tests")?.ok, false);
}));

test("Jira writes become a Phase 7 requirement only when explicitly enabled", () => withEnv(() => {
  process.env.BM_PILOT_REQUIRE_JIRA_WRITE = "true";
  const result = buildPilotValidation({
    instanceId: "pod-a",
    identity: { userId: "qa@example.com", tenantId: "tenant", projectIds: ["PCC"], source: "trusted-headers" },
    deployment: deployment(),
    integrations: integrations(),
    projectTests: [{ projectId: "PCC", authenticatedIdentity: { configured: true }, suites: [{ id: "smoke", cases: [{ id: "login" }] }] }],
    persistence,
    policy: { configured: true, mode: "opa", healthy: true, connectorCount: 5, failClosed: true },
  });

  assert.equal(result.ready, false);
  assert.equal(result.checks.find((item) => item.id === "jira-write-live")?.required, true);
}));
