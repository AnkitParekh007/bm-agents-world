import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { QaIntegrationStatus } from "../qa/qa-integration-config.js";
import { buildDeploymentReadiness } from "./deployment-readiness.js";

const ENV_KEYS = [
  "BM_DEPLOYMENT_MODE",
  "BM_IDENTITY_MODE",
  "BM_STATE_DB_PATH",
  "BM_ARTIFACT_ROOT",
  "BM_PILOT_REQUIRE_JIRA_WRITE",
  "AI_MODEL",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
] as const;

function snapshotEnv() {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function liveIntegrations(writeMode: "live" | "mock" = "mock"): QaIntegrationStatus {
  return {
    jira: {
      mode: "live",
      baseUrl: "https://example.atlassian.net",
      authMode: "bearer",
      emailConfigured: false,
      tokenConfigured: true,
      writeEnabled: writeMode === "live",
      writeMode,
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
      targets: [{ projectId: "PCC", environment: "qa", url: "https://qa.example.internal" }],
    },
  };
}

test("pilot readiness requires trusted identity, persistent storage, live reads, browser, and model credential", () => {
  const before = snapshotEnv();
  const root = mkdtempSync(join(tmpdir(), "bm-pilot-ready-"));
  try {
    process.env.BM_DEPLOYMENT_MODE = "pilot";
    process.env.BM_IDENTITY_MODE = "trusted-headers";
    process.env.BM_STATE_DB_PATH = join(root, "state", "qa.sqlite");
    process.env.BM_ARTIFACT_ROOT = join(root, "artifacts");
    process.env.AI_MODEL = "openai:gpt-5.4-mini";
    process.env.OPENAI_API_KEY = "test-key-not-real";

    const readiness = buildDeploymentReadiness(liveIntegrations(), {
      statePath: process.env.BM_STATE_DB_PATH,
      artifactRoot: process.env.BM_ARTIFACT_ROOT,
      packCount: 5,
    });

    assert.equal(readiness.mode, "pilot");
    assert.equal(readiness.ready, true);
    assert.equal(readiness.checks.find((item) => item.id === "jira-write")?.required, false);
  } finally {
    restoreEnv(before);
    rmSync(root, { recursive: true, force: true });
  }
});

test("pilot readiness fails closed when trusted identity or live integrations are missing", () => {
  const before = snapshotEnv();
  const root = mkdtempSync(join(tmpdir(), "bm-pilot-unready-"));
  try {
    process.env.BM_DEPLOYMENT_MODE = "pilot";
    process.env.BM_IDENTITY_MODE = "local-dev";
    process.env.BM_STATE_DB_PATH = join(root, "state", "qa.sqlite");
    process.env.BM_ARTIFACT_ROOT = join(root, "artifacts");
    process.env.AI_MODEL = "openai:gpt-5.4-mini";
    delete process.env.OPENAI_API_KEY;

    const integrations = liveIntegrations();
    integrations.jira.mode = "mock";
    integrations.bitbucket.mode = "mock";
    integrations.playwright.mode = "mock";

    const readiness = buildDeploymentReadiness(integrations, {
      statePath: process.env.BM_STATE_DB_PATH,
      artifactRoot: process.env.BM_ARTIFACT_ROOT,
      packCount: 5,
    });

    assert.equal(readiness.ready, false);
    assert.equal(readiness.checks.find((item) => item.id === "trusted-identity")?.ok, false);
    assert.equal(readiness.checks.find((item) => item.id === "model-credential")?.ok, false);
    assert.equal(readiness.checks.find((item) => item.id === "jira-read-live")?.ok, false);
  } finally {
    restoreEnv(before);
    rmSync(root, { recursive: true, force: true });
  }
});

test("Jira write can be promoted to a required pilot dependency", () => {
  const before = snapshotEnv();
  const root = mkdtempSync(join(tmpdir(), "bm-pilot-write-"));
  try {
    process.env.BM_DEPLOYMENT_MODE = "pilot";
    process.env.BM_IDENTITY_MODE = "trusted-headers";
    process.env.BM_STATE_DB_PATH = join(root, "state", "qa.sqlite");
    process.env.BM_ARTIFACT_ROOT = join(root, "artifacts");
    process.env.BM_PILOT_REQUIRE_JIRA_WRITE = "true";
    process.env.AI_MODEL = "openai:gpt-5.4-mini";
    process.env.OPENAI_API_KEY = "test-key-not-real";

    const readiness = buildDeploymentReadiness(liveIntegrations("mock"), {
      statePath: process.env.BM_STATE_DB_PATH,
      artifactRoot: process.env.BM_ARTIFACT_ROOT,
      packCount: 5,
    });

    assert.equal(readiness.ready, false);
    assert.equal(readiness.checks.find((item) => item.id === "jira-write")?.required, true);
  } finally {
    restoreEnv(before);
    rmSync(root, { recursive: true, force: true });
  }
});
