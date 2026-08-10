import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import { createCopilotExpressHandler } from "@copilotkit/runtime/v2/express";
import { buildCopilotRuntime } from "./copilot.js";
import { PackRegistry } from "./pack-registry.js";
import { ArtifactStore } from "./platform/artifact-store.js";
import { CapabilityBroker } from "./platform/capability-broker.js";
import { SqliteCapabilityStore } from "./platform/capability-store.js";
import { buildDeploymentReadiness } from "./platform/deployment-readiness.js";
import { QaPilotObservabilityStore, type PilotRunEvaluationInput } from "./platform/qa-pilot-observability.js";
import {
  canAccessExecutionContext,
  canSelfApprove,
  currentRequestIdentity,
  identityMiddleware,
} from "./platform/request-identity.js";
import { BitbucketReadAdapter } from "./qa/bitbucket-read-adapter.js";
import { JiraDefectAdapter } from "./qa/jira-defect-adapter.js";
import { JiraReadAdapter } from "./qa/jira-read-adapter.js";
import { PlaywrightWorkerAdapter } from "./qa/playwright-worker-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa/qa-capabilities.js";
import { loadQaIntegrationStatus } from "./qa/qa-integration-config.js";
import { projectTestCatalogStatus } from "./qa/qa-project-tests.js";

const PORT = Number(process.env.PORT ?? 4000);
const DAY_MS = 24 * 60 * 60 * 1000;
const registry = new PackRegistry();
const artifacts = new ArtifactStore();
const stateStore = new SqliteCapabilityStore();
const observabilityStore = new QaPilotObservabilityStore(stateStore.path);
const qaMockAdapter = new QaMockAdapter();
const jiraDefectAdapter = new JiraDefectAdapter(qaMockAdapter, artifacts);
const qaBroker = new CapabilityBroker(QA_CAPABILITIES, [
  qaMockAdapter,
  new JiraReadAdapter(qaMockAdapter),
  new BitbucketReadAdapter(qaMockAdapter),
  new PlaywrightWorkerAdapter(qaMockAdapter, artifacts),
  jiraDefectAdapter,
], stateStore);
const runtime = buildCopilotRuntime(registry, qaBroker);
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

// Kubernetes/container probes intentionally live before identity middleware.
// They expose no user data, credentials, project details, or secret values.
app.get("/healthz", (_request, response) => {
  response.json({ status: "ok", service: "bm-agents-world-agent-window" });
});

app.get("/readyz", (_request, response) => {
  const readiness = buildDeploymentReadiness(loadQaIntegrationStatus(), {
    statePath: stateStore.path,
    artifactRoot: artifacts.root,
    packCount: registry.packs.length,
  });
  response.status(readiness.ready ? 200 : 503).json(readiness);
});

app.use(identityMiddleware());

function accessibleRun(runId: string) {
  const run = qaBroker.getRun(runId);
  if (!run) return undefined;
  return canAccessExecutionContext(currentRequestIdentity(), run.context) ? run : null;
}

function accessibleAction(actionId: string) {
  const action = qaBroker.getAction(actionId);
  if (!action) return undefined;
  return canAccessExecutionContext(currentRequestIdentity(), action.context) ? action : null;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : fallback;
}

function observabilityQuery(request: express.Request, response: express.Response) {
  const identity = currentRequestIdentity();
  const projectId = typeof request.query.projectId === "string" && request.query.projectId.trim()
    ? request.query.projectId.trim()
    : undefined;
  if (projectId && !identity.projectIds.includes(projectId)) {
    response.status(403).json({ error: "observability_project_access_denied" });
    return undefined;
  }
  const periodDays = boundedNumber(request.query.days, 7, 1, 90);
  const since = new Date(Date.now() - periodDays * DAY_MS).toISOString();
  return {
    identity,
    projectId,
    periodDays,
    scope: {
      tenantId: identity.tenantId,
      projectIds: identity.projectIds,
      projectId,
      since,
    },
  };
}

app.get("/api/session", (_request, response) => {
  const identity = currentRequestIdentity();
  response.json({
    userId: identity.userId,
    tenantId: identity.tenantId,
    projectIds: identity.projectIds,
    source: identity.source,
    selfApprovalAllowed: canSelfApprove(identity),
  });
});

app.get("/api/health", (_request, response) => {
  const integrations = loadQaIntegrationStatus();
  const readiness = buildDeploymentReadiness(integrations, {
    statePath: stateStore.path,
    artifactRoot: artifacts.root,
    packCount: registry.packs.length,
  });
  response.json({
    status: "ok",
    service: "bm-agents-world-agent-window",
    packCount: registry.packs.length,
    agents: ["default", ...registry.packs.map((pack) => pack.id)],
    model: process.env.AI_MODEL ?? "openai:gpt-5.4-mini",
    qaCapabilityCount: qaBroker.listCapabilities().length,
    deploymentMode: readiness.mode,
    ready: readiness.ready,
    identityMode: process.env.BM_IDENTITY_MODE?.trim() || "local-dev",
    stateStore: { type: "sqlite", path: stateStore.path },
    artifactRoot: artifacts.root,
    qaObservability: {
      evaluationPersistence: "sqlite",
      operationalMetrics: "derived-from-run-action-audit",
      modelUsage: "not-instrumented",
    },
    qaAdapters: {
      jira: integrations.jira.mode,
      bitbucket: integrations.bitbucket.mode,
      database: "mock",
      playwright: integrations.playwright.mode,
      jiraWrite: integrations.jira.writeMode,
      teams: "mock",
    },
    qaProjectTests: projectTestCatalogStatus().map((item) => ({
      projectId: item.projectId,
      authenticated: item.authenticatedIdentity.configured,
      suites: item.suites.map((suite) => ({ id: suite.id, cases: suite.cases.length })),
    })),
  });
});

app.get("/api/packs", (_request, response) => response.json({ packs: registry.listPublic() }));

app.get("/api/packs/:packId", (request, response) => {
  const pack = registry.get(request.params.packId);
  if (!pack) {
    response.status(404).json({ error: "pack_not_found", available: registry.packs.map((item) => item.id) });
    return;
  }
  const { directory: _directory, ...publicPack } = pack;
  response.json(publicPack);
});

app.get("/api/qa/capabilities", (_request, response) => {
  response.json({ integrations: loadQaIntegrationStatus(), projectTests: projectTestCatalogStatus(), capabilities: qaBroker.listCapabilities() });
});

app.get("/api/qa/integrations", (_request, response) => response.json(loadQaIntegrationStatus()));
app.get("/api/qa/project-tests", (_request, response) => response.json({ projects: projectTestCatalogStatus() }));

app.get("/api/qa/runs", (request, response) => {
  const rawLimit = Number(request.query.limit ?? 50);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 50;
  const identity = currentRequestIdentity();
  const runs = qaBroker.listRuns(500)
    .filter((run) => canAccessExecutionContext(identity, run.context))
    .slice(0, limit)
    .map((run) => ({ ...run, actionCount: qaBroker.listActionsForRun(run.id).length }));
  response.json({ runs });
});

app.get("/api/qa/runs/:runId", (request, response) => {
  const run = accessibleRun(request.params.runId);
  if (run === undefined) return void response.status(404).json({ error: "run_not_found" });
  if (run === null) return void response.status(403).json({ error: "run_access_denied" });
  response.json({
    run,
    actions: qaBroker.listActionsForRun(run.id),
    evaluation: observabilityStore.getEvaluation(run.id),
  });
});

app.post("/api/qa/runs/:runId/evaluation", (request, response) => {
  const run = accessibleRun(request.params.runId);
  if (run === undefined) return void response.status(404).json({ error: "run_not_found" });
  if (run === null) return void response.status(403).json({ error: "run_access_denied" });
  const identity = currentRequestIdentity();
  const body = request.body ?? {};
  const input: PilotRunEvaluationInput = {
    outcome: body.outcome,
    usefulnessScore: body.usefulnessScore,
    wouldUseAgain: body.wouldUseAgain === true,
    falsePositiveDefect: body.falsePositiveDefect === true,
    manualOverrideMinutes: body.manualOverrideMinutes,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  };
  try {
    response.json(observabilityStore.saveEvaluation(run, identity.userId, input));
  } catch (error) {
    response.status(400).json({ error: "invalid_pilot_evaluation", message: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/qa/observability/summary", (request, response) => {
  const query = observabilityQuery(request, response);
  if (!query) return;
  response.setHeader("Cache-Control", "private, no-store");
  response.json(observabilityStore.summary({ ...query.scope, limit: 500 }, query.periodDays));
});

app.get("/api/qa/observability/runs", (request, response) => {
  const query = observabilityQuery(request, response);
  if (!query) return;
  const limit = boundedNumber(request.query.limit, 50, 1, 200);
  response.setHeader("Cache-Control", "private, no-store");
  response.json({
    periodDays: query.periodDays,
    projectId: query.projectId,
    runs: observabilityStore.listRunMetrics({ ...query.scope, limit }),
  });
});

app.get("/api/qa/artifacts/:artifactId/metadata", (request, response) => {
  const artifact = artifacts.find(request.params.artifactId);
  if (!artifact) return void response.status(404).json({ error: "artifact_not_found" });
  const run = accessibleRun(artifact.record.runId);
  if (run === undefined) return void response.status(409).json({ error: "artifact_run_not_persisted" });
  if (run === null) return void response.status(403).json({ error: "artifact_access_denied" });
  response.setHeader("Cache-Control", "private, no-store");
  response.json(artifact.record);
});

app.get("/api/qa/artifacts/:artifactId", (request, response) => {
  const artifact = artifacts.find(request.params.artifactId);
  if (!artifact) return void response.status(404).json({ error: "artifact_not_found" });
  const run = accessibleRun(artifact.record.runId);
  if (run === undefined) return void response.status(409).json({ error: "artifact_run_not_persisted" });
  if (run === null) return void response.status(403).json({ error: "artifact_access_denied" });
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Content-Type", artifact.record.mediaType);
  response.setHeader("Content-Disposition", `${artifact.record.mediaType === "application/zip" ? "attachment" : "inline"}; filename="${artifact.record.filename}"`);
  response.sendFile(artifact.diskPath);
});

app.get("/api/qa/actions/:actionId", (request, response) => {
  const action = accessibleAction(request.params.actionId);
  if (action === undefined) return void response.status(404).json({ error: "action_not_found" });
  if (action === null) return void response.status(403).json({ error: "action_access_denied" });
  response.json(action);
});

app.get("/api/qa/actions/:actionId/review", async (request, response) => {
  const action = accessibleAction(request.params.actionId);
  if (action === undefined) return void response.status(404).json({ error: "action_not_found" });
  if (action === null) return void response.status(403).json({ error: "action_access_denied" });
  if (action.capabilityId !== "qa.jira.bug.create") return void response.status(400).json({ error: "review_not_supported_for_capability" });
  try {
    response.json(await jiraDefectAdapter.previewCreateAction(action));
  } catch (error) {
    response.status(409).json({ error: "review_unavailable", message: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/qa/actions/:actionId/decision", (request, response) => {
  const action = accessibleAction(request.params.actionId);
  if (action === undefined) return void response.status(404).json({ error: "action_not_found" });
  if (action === null) return void response.status(403).json({ error: "action_access_denied" });
  const decision = request.body?.decision;
  if (decision !== "approved" && decision !== "rejected") return void response.status(400).json({ error: "decision_must_be_approved_or_rejected" });
  const identity = currentRequestIdentity();
  if (decision === "approved" && identity.userId === action.context.userId && !canSelfApprove(identity)) {
    return void response.status(409).json({
      error: "self_approval_denied",
      message: "The requester cannot approve their own protected action in trusted identity mode.",
    });
  }
  const reason = typeof request.body?.reason === "string" ? request.body.reason : undefined;
  try {
    response.json(qaBroker.decideAction(request.params.actionId, decision, identity.userId, reason));
  } catch (error) {
    response.status(409).json({ error: "approval_decision_rejected", message: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/audit", (request, response) => {
  const rawLimit = Number(request.query.limit ?? 100);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 100;
  const identity = currentRequestIdentity();
  const events = qaBroker.listAudit(500)
    .filter((event) => {
      const run = qaBroker.getRun(event.runId);
      return Boolean(run && canAccessExecutionContext(identity, run.context));
    })
    .slice(0, limit);
  response.json({ events });
});

app.use(createCopilotExpressHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
  cors: process.env.NODE_ENV === "production" ? false : { origin: ["http://localhost:5173", "http://127.0.0.1:5173"] },
}));

const clientDirectory = resolve(process.cwd(), "dist/client");
if (existsSync(clientDirectory)) {
  app.use(express.static(clientDirectory));
  app.get("*path", (_request, response) => response.sendFile(resolve(clientDirectory, "index.html")));
}

const server = app.listen(PORT, "0.0.0.0", () => {
  const integrations = loadQaIntegrationStatus();
  const readiness = buildDeploymentReadiness(integrations, {
    statePath: stateStore.path,
    artifactRoot: artifacts.root,
    packCount: registry.packs.length,
  });
  console.log(`[bm-agents-world] loaded ${registry.packs.length} agent packs`);
  console.log(`[bm-agents-world] runtime: http://localhost:${PORT}/api/copilotkit`);
  console.log(`[bm-agents-world] probes: /healthz and /readyz (${readiness.mode}, ready=${readiness.ready})`);
  console.log(`[bm-agents-world] qa capabilities: ${qaBroker.listCapabilities().length}`);
  console.log(`[bm-agents-world] qa state: sqlite ${stateStore.path}`);
  console.log("[bm-agents-world] qa observability: operational metrics + persistent run evaluations; model usage not instrumented");
  console.log(`[bm-agents-world] identity mode: ${process.env.BM_IDENTITY_MODE?.trim() || "local-dev"}`);
  console.log(`[bm-agents-world] qa jira read: ${integrations.jira.mode}; jira write: ${integrations.jira.writeMode}; bitbucket: ${integrations.bitbucket.mode}; playwright: ${integrations.playwright.mode}`);
});

function shutdown() {
  server.close(() => {
    observabilityStore.close();
    stateStore.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
