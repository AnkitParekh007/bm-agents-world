import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import { createCopilotExpressHandler } from "@copilotkit/runtime/v2/express";
import { buildCopilotRuntime } from "./copilot.js";
import { PackRegistry } from "./pack-registry.js";
import { AgentTelemetryService } from "./platform/agent-telemetry.js";
import { AsyncCapabilityBroker } from "./platform/async-capability-broker.js";
import type { CapabilityBrokerContract } from "./platform/capability-broker-contract.js";
import { CapabilityBroker } from "./platform/capability-broker.js";
import { ApprovedConnectorRegistry } from "./platform/connector-registry.js";
import { buildDeploymentReadiness } from "./platform/deployment-readiness.js";
import { buildPilotValidation, type PilotPolicyStatus } from "./platform/pilot-validation.js";
import { createPolicyEngine, type PolicyEvaluator } from "./platform/policy-engine.js";
import { enrichQaPilotRunsShared } from "./platform/pilot-telemetry-view-async.js";
import { enrichQaPilotRuns, enrichQaPilotSummary, type EnrichedQaPilotRunMetrics } from "./platform/pilot-telemetry-view.js";
import type { PilotRunEvaluationInput, QaPilotRunMetrics, QaPilotSummary } from "./platform/qa-pilot-observability.js";
import {
  canAccessExecutionContext,
  canSelfApprove,
  currentRequestIdentity,
  identityMiddleware,
} from "./platform/request-identity.js";
import { createRuntimePersistence } from "./platform/runtime-persistence.js";
import { initTelemetry, shutdownTelemetry, startActiveSpan, telemetryRuntimeStatus } from "./platform/telemetry.js";
import { BitbucketReadAdapter } from "./qa/bitbucket-read-adapter.js";
import { JiraDefectAdapter } from "./qa/jira-defect-adapter.js";
import { JiraReadAdapter } from "./qa/jira-read-adapter.js";
import { PlaywrightWorkerAdapter } from "./qa/playwright-worker-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa/qa-capabilities.js";
import { loadQaIntegrationStatus } from "./qa/qa-integration-config.js";
import { projectTestCatalogStatus } from "./qa/qa-project-tests.js";

const PORT = Number(process.env.PORT ?? 4000);
const DAY_MS = 24 * 60 * 60 * 1000;
const INSTANCE_ID = process.env.HOSTNAME?.trim() || `pid-${process.pid}`;

initTelemetry();

const registry = new PackRegistry();
const persistence = await createRuntimePersistence();
const artifacts = persistence.artifacts;
const agentTelemetry = new AgentTelemetryService(persistence.telemetryServiceStore);
const connectorRegistry = new ApprovedConnectorRegistry();
const centralPolicy: PolicyEvaluator | undefined = persistence.shared && process.env.BM_POLICY_MODE?.trim()
  ? createPolicyEngine(connectorRegistry)
  : undefined;
const qaMockAdapter = new QaMockAdapter();
const jiraDefectAdapter = new JiraDefectAdapter(qaMockAdapter, artifacts);
const adapters = [
  qaMockAdapter,
  new JiraReadAdapter(qaMockAdapter),
  new BitbucketReadAdapter(qaMockAdapter),
  new PlaywrightWorkerAdapter(qaMockAdapter, artifacts),
  jiraDefectAdapter,
];
const qaBroker: CapabilityBrokerContract = persistence.shared
  ? new AsyncCapabilityBroker(QA_CAPABILITIES, adapters, persistence.capabilityStore, centralPolicy)
  : new CapabilityBroker(QA_CAPABILITIES, adapters, persistence.capabilityStore);
const runtime = buildCopilotRuntime(registry, qaBroker, agentTelemetry);
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

async function currentPolicyStatus(): Promise<PilotPolicyStatus> {
  const status = centralPolicy?.status();
  return {
    configured: Boolean(centralPolicy),
    mode: status?.mode ?? "disabled",
    healthy: centralPolicy ? await centralPolicy.healthCheck() : false,
    connectorCount: connectorRegistry.listPublic().filter((connector) => connector.status !== "disabled").length,
    failClosed: status?.failClosed === true,
  };
}

async function currentReadiness() {
  const integrations = loadQaIntegrationStatus();
  const [health, policy] = await Promise.all([
    persistence.healthCheck(),
    currentPolicyStatus(),
  ]);
  if (persistence.shared) {
    return buildDeploymentReadiness(integrations, {
      packCount: registry.packs.length,
      persistence: {
        mode: persistence.mode,
        shared: true,
        stateReady: health.state,
        artifactsReady: health.artifacts,
      },
      policy: {
        configured: policy.configured,
        mode: policy.mode,
        healthy: policy.healthy,
        connectorRegistryReady: policy.connectorCount > 0,
        failClosed: policy.failClosed,
      },
    });
  }
  return buildDeploymentReadiness(integrations, {
    statePath: persistence.capabilityStore.path,
    artifactRoot: persistence.artifacts.root,
    packCount: registry.packs.length,
    persistence: {
      mode: persistence.mode,
      shared: false,
      stateReady: health.state,
      artifactsReady: health.artifacts,
    },
  });
}

// Kubernetes/container probes intentionally live before identity middleware.
// They expose no user data, credentials, project details, or secret values.
app.get("/healthz", (_request, response) => {
  response.json({ status: "ok", service: "bm-agents-world-agent-window", instanceId: INSTANCE_ID });
});

app.get("/readyz", async (_request, response) => {
  const readiness = await currentReadiness();
  response.status(readiness.ready ? 200 : 503).json({ ...readiness, instanceId: INSTANCE_ID });
});

app.use(identityMiddleware());

async function accessibleRun(runId: string) {
  const run = await qaBroker.getRun(runId);
  if (!run) return undefined;
  return canAccessExecutionContext(currentRequestIdentity(), run.context) ? run : null;
}

async function accessibleAction(actionId: string) {
  const action = await qaBroker.getAction(actionId);
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

async function listRunMetrics(scope: {
  tenantId: string;
  projectIds: string[];
  projectId?: string;
  since?: string;
  limit?: number;
}): Promise<QaPilotRunMetrics[]> {
  return persistence.shared
    ? persistence.observabilityStore.listRunMetrics(scope)
    : persistence.observabilityStore.listRunMetrics(scope);
}

async function pilotSummary(scope: {
  tenantId: string;
  projectIds: string[];
  projectId?: string;
  since?: string;
  limit?: number;
}, periodDays: number): Promise<QaPilotSummary> {
  return persistence.shared
    ? persistence.observabilityStore.summary(scope, periodDays)
    : persistence.observabilityStore.summary(scope, periodDays);
}

async function getEvaluation(runId: string) {
  return persistence.shared
    ? persistence.observabilityStore.getEvaluation(runId)
    : persistence.observabilityStore.getEvaluation(runId);
}

async function saveEvaluation(run: Awaited<ReturnType<typeof accessibleRun>> & object, reviewerUserId: string, input: PilotRunEvaluationInput) {
  if (!("id" in run) || !("context" in run)) throw new Error("Invalid run");
  return persistence.shared
    ? persistence.observabilityStore.saveEvaluation(run as any, reviewerUserId, input)
    : persistence.observabilityStore.saveEvaluation(run as any, reviewerUserId, input);
}

async function enrichRuns(baseRuns: QaPilotRunMetrics[]): Promise<EnrichedQaPilotRunMetrics[]> {
  if (persistence.shared) {
    return enrichQaPilotRunsShared(baseRuns, persistence.telemetryReadStore, qaBroker);
  }
  return enrichQaPilotRuns(baseRuns, persistence.telemetryReadStore, qaBroker as CapabilityBroker);
}

async function enrichedMetricsForRun(runId: string) {
  const run = await qaBroker.getRun(runId);
  if (!run) return undefined;
  const metrics = (await listRunMetrics({
    tenantId: run.context.tenantId,
    projectIds: [run.context.projectId],
    projectId: run.context.projectId,
    limit: 500,
  })).find((item) => item.runId === runId);
  if (!metrics) return undefined;
  return (await enrichRuns([metrics]))[0];
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

app.get("/api/health", async (_request, response) => {
  const integrations = loadQaIntegrationStatus();
  const [readiness, policy] = await Promise.all([currentReadiness(), currentPolicyStatus()]);
  const tokenRatesConfigured = Boolean(
    process.env.BM_MODEL_INPUT_USD_PER_1M_TOKENS?.trim()
    && process.env.BM_MODEL_OUTPUT_USD_PER_1M_TOKENS?.trim(),
  );
  response.json({
    status: "ok",
    service: "bm-agents-world-agent-window",
    instanceId: INSTANCE_ID,
    packCount: registry.packs.length,
    agents: ["default", ...registry.packs.map((pack) => pack.id)],
    model: process.env.AI_MODEL ?? "openai:gpt-5.4-mini",
    qaCapabilityCount: qaBroker.listCapabilities().length,
    deploymentMode: readiness.mode,
    ready: readiness.ready,
    identityMode: process.env.BM_IDENTITY_MODE?.trim() || "local-dev",
    persistence: persistence.status,
    centralPolicy: policy,
    qaObservability: {
      evaluationPersistence: persistence.status.state.kind,
      operationalMetrics: "derived-from-run-action-audit",
      modelUsage: "measured-when-provider-metadata-is-present",
      costEstimation: tokenRatesConfigured ? "configured-token-rates" : "not-configured",
      openTelemetry: telemetryRuntimeStatus(),
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

app.get("/api/qa/pilot/validation", async (_request, response) => {
  const identity = currentRequestIdentity();
  const integrations = loadQaIntegrationStatus();
  const [deployment, policy] = await Promise.all([currentReadiness(), currentPolicyStatus()]);
  const validation = buildPilotValidation({
    instanceId: INSTANCE_ID,
    identity,
    deployment,
    integrations,
    projectTests: projectTestCatalogStatus(),
    persistence: persistence.status,
    policy,
  });
  response.setHeader("Cache-Control", "private, no-store");
  response.status(validation.ready ? 200 : 503).json(validation);
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

app.get("/api/qa/runs", async (request, response) => {
  const rawLimit = Number(request.query.limit ?? 50);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 50;
  const identity = currentRequestIdentity();
  const visibleRuns = (await qaBroker.listRuns(500))
    .filter((run) => canAccessExecutionContext(identity, run.context))
    .slice(0, limit);
  const runs = await Promise.all(visibleRuns.map(async (run) => ({
    ...run,
    actionCount: (await qaBroker.listActionsForRun(run.id)).length,
  })));
  response.json({ runs });
});

app.get("/api/qa/runs/:runId", async (request, response) => {
  const run = await accessibleRun(request.params.runId);
  if (run === undefined) return void response.status(404).json({ error: "run_not_found" });
  if (run === null) return void response.status(403).json({ error: "run_access_denied" });
  const [actions, evaluation, telemetry] = await Promise.all([
    qaBroker.listActionsForRun(run.id),
    getEvaluation(run.id),
    enrichedMetricsForRun(run.id),
  ]);
  response.json({ run, actions, evaluation, telemetry });
});

app.post("/api/qa/runs/:runId/evaluation", async (request, response) => {
  const run = await accessibleRun(request.params.runId);
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
    response.json(await saveEvaluation(run, identity.userId, input));
  } catch (error) {
    response.status(400).json({ error: "invalid_pilot_evaluation", message: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/qa/observability/summary", async (request, response) => {
  const query = observabilityQuery(request, response);
  if (!query) return;
  response.setHeader("Cache-Control", "private, no-store");
  const baseRuns = await listRunMetrics({ ...query.scope, limit: 500 });
  const runs = await enrichRuns(baseRuns);
  const baseSummary = await pilotSummary({ ...query.scope, limit: 500 }, query.periodDays);
  response.json(enrichQaPilotSummary(baseSummary, runs));
});

app.get("/api/qa/observability/runs", async (request, response) => {
  const query = observabilityQuery(request, response);
  if (!query) return;
  const limit = boundedNumber(request.query.limit, 50, 1, 200);
  response.setHeader("Cache-Control", "private, no-store");
  const baseRuns = await listRunMetrics({ ...query.scope, limit });
  response.json({
    periodDays: query.periodDays,
    projectId: query.projectId,
    runs: await enrichRuns(baseRuns),
  });
});

app.get("/api/qa/artifacts/:artifactId/metadata", async (request, response) => {
  const artifact = await artifacts.find(request.params.artifactId);
  if (!artifact) return void response.status(404).json({ error: "artifact_not_found" });
  const run = await accessibleRun(artifact.record.runId);
  if (run === undefined) return void response.status(409).json({ error: "artifact_run_not_persisted" });
  if (run === null) return void response.status(403).json({ error: "artifact_access_denied" });
  response.setHeader("Cache-Control", "private, no-store");
  response.json(artifact.record);
});

app.get("/api/qa/artifacts/:artifactId", async (request, response) => {
  const artifact = await artifacts.readBuffer(request.params.artifactId);
  if (!artifact) return void response.status(404).json({ error: "artifact_not_found" });
  const run = await accessibleRun(artifact.record.runId);
  if (run === undefined) return void response.status(409).json({ error: "artifact_run_not_persisted" });
  if (run === null) return void response.status(403).json({ error: "artifact_access_denied" });
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Content-Type", artifact.record.mediaType);
  response.setHeader("Content-Disposition", `${artifact.record.mediaType === "application/zip" ? "attachment" : "inline"}; filename="${artifact.record.filename}"`);
  response.send(artifact.data);
});

app.get("/api/qa/actions/:actionId", async (request, response) => {
  const action = await accessibleAction(request.params.actionId);
  if (action === undefined) return void response.status(404).json({ error: "action_not_found" });
  if (action === null) return void response.status(403).json({ error: "action_access_denied" });
  response.json(action);
});

app.get("/api/qa/actions/:actionId/review", async (request, response) => {
  const action = await accessibleAction(request.params.actionId);
  if (action === undefined) return void response.status(404).json({ error: "action_not_found" });
  if (action === null) return void response.status(403).json({ error: "action_access_denied" });
  if (action.capabilityId !== "qa.jira.bug.create") return void response.status(400).json({ error: "review_not_supported_for_capability" });
  try {
    response.json(await jiraDefectAdapter.previewCreateAction(action));
  } catch (error) {
    response.status(409).json({ error: "review_unavailable", message: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/qa/actions/:actionId/decision", async (request, response) => {
  const action = await accessibleAction(request.params.actionId);
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
    const result = await startActiveSpan(
      "bm.approval.decision",
      {
        "bm.action.id": action.id,
        "bm.run.id": action.context.runId,
        "bm.capability.id": action.capabilityId,
        "bm.tenant.id": action.context.tenantId,
        "bm.project.id": action.context.projectId,
        "bm.approval.decision": decision,
      },
      () => qaBroker.decideAction(request.params.actionId, decision, identity.userId, reason),
    );
    response.json(result);
  } catch (error) {
    response.status(409).json({ error: "approval_decision_rejected", message: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/audit", async (request, response) => {
  const rawLimit = Number(request.query.limit ?? 100);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 100;
  const identity = currentRequestIdentity();
  const events = await qaBroker.listAudit(500);
  const visible = [];
  for (const event of events) {
    const run = await qaBroker.getRun(event.runId);
    if (run && canAccessExecutionContext(identity, run.context)) visible.push(event);
    if (visible.length >= limit) break;
  }
  response.json({ events: visible });
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

const server = app.listen(PORT, "0.0.0.0", async () => {
  const readiness = await currentReadiness();
  const integrations = loadQaIntegrationStatus();
  const policy = await currentPolicyStatus();
  const otel = telemetryRuntimeStatus();
  console.log(`[bm-agents-world] loaded ${registry.packs.length} agent packs`);
  console.log(`[bm-agents-world] runtime: http://localhost:${PORT}/api/copilotkit`);
  console.log(`[bm-agents-world] probes: /healthz and /readyz (${readiness.mode}, ready=${readiness.ready})`);
  console.log(`[bm-agents-world] instance: ${INSTANCE_ID}`);
  console.log(`[bm-agents-world] qa capabilities: ${qaBroker.listCapabilities().length}`);
  console.log(`[bm-agents-world] persistence: ${persistence.status.mode}; shared=${persistence.status.shared}`);
  console.log(`[bm-agents-world] state: ${persistence.status.state.kind}; artifacts: ${persistence.status.artifacts.kind}`);
  console.log(`[bm-agents-world] central policy: ${policy.mode}; healthy=${policy.healthy}; connectors=${policy.connectorCount}`);
  console.log(`[bm-agents-world] telemetry: model usage persists when provider metadata is present; otel=${otel.enabled ? "enabled" : "disabled"}`);
  console.log(`[bm-agents-world] identity mode: ${process.env.BM_IDENTITY_MODE?.trim() || "local-dev"}`);
  console.log(`[bm-agents-world] qa jira read: ${integrations.jira.mode}; jira write: ${integrations.jira.writeMode}; bitbucket: ${integrations.bitbucket.mode}; playwright: ${integrations.playwright.mode}`);
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(async () => {
    try {
      await persistence.close();
      await shutdownTelemetry();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
