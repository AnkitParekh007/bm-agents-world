import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import { createCopilotExpressHandler } from "@copilotkit/runtime/v2/express";
import { buildCopilotRuntime } from "./copilot.js";
import { PackRegistry } from "./pack-registry.js";
import { CapabilityBroker } from "./platform/capability-broker.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa/qa-capabilities.js";

const PORT = Number(process.env.PORT ?? 4000);
const registry = new PackRegistry();
const qaBroker = new CapabilityBroker(QA_CAPABILITIES, [new QaMockAdapter()]);
const runtime = buildCopilotRuntime(registry, qaBroker);
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "bm-agents-world-agent-window",
    packCount: registry.packs.length,
    agents: ["default", ...registry.packs.map((pack) => pack.id)],
    model: process.env.AI_MODEL ?? "openai:gpt-5.4-mini",
    qaCapabilityCount: qaBroker.listCapabilities().length,
    qaAdapterMode: "mock",
  });
});

app.get("/api/packs", (_request, response) => {
  response.json({ packs: registry.listPublic() });
});

app.get("/api/packs/:packId", (request, response) => {
  const pack = registry.get(request.params.packId);
  if (!pack) {
    response.status(404).json({
      error: "pack_not_found",
      available: registry.packs.map((item) => item.id),
    });
    return;
  }

  const { directory: _directory, ...publicPack } = pack;
  response.json(publicPack);
});

app.get("/api/qa/capabilities", (_request, response) => {
  response.json({
    mode: "mock",
    capabilities: qaBroker.listCapabilities(),
  });
});

app.get("/api/qa/actions/:actionId", (request, response) => {
  const action = qaBroker.getAction(request.params.actionId);
  if (!action) {
    response.status(404).json({ error: "action_not_found" });
    return;
  }
  response.json(action);
});

app.post("/api/qa/actions/:actionId/decision", (request, response) => {
  const decision = request.body?.decision;
  if (decision !== "approved" && decision !== "rejected") {
    response.status(400).json({ error: "decision_must_be_approved_or_rejected" });
    return;
  }

  const decidedBy = String(request.header("x-user-id") || "local-dev-user");
  const reason = typeof request.body?.reason === "string" ? request.body.reason : undefined;

  try {
    response.json(qaBroker.decideAction(request.params.actionId, decision, decidedBy, reason));
  } catch (error) {
    response.status(409).json({
      error: "approval_decision_rejected",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/api/audit", (request, response) => {
  const rawLimit = Number(request.query.limit ?? 100);
  const limit = Number.isFinite(rawLimit) ? rawLimit : 100;
  response.json({ events: qaBroker.listAudit(limit) });
});

app.use(
  createCopilotExpressHandler({
    runtime,
    basePath: "/api/copilotkit",
    mode: "single-route",
    cors: process.env.NODE_ENV === "production"
      ? false
      : { origin: ["http://localhost:5173", "http://127.0.0.1:5173"] },
  }),
);

const clientDirectory = resolve(process.cwd(), "dist/client");
if (existsSync(clientDirectory)) {
  app.use(express.static(clientDirectory));
  app.get("*path", (_request, response) => {
    response.sendFile(resolve(clientDirectory, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[bm-agents-world] loaded ${registry.packs.length} agent packs`);
  console.log(`[bm-agents-world] runtime: http://localhost:${PORT}/api/copilotkit`);
  console.log(`[bm-agents-world] packs:   http://localhost:${PORT}/api/packs`);
  console.log(`[bm-agents-world] qa capabilities: ${qaBroker.listCapabilities().length} (mock adapters)`);
});
