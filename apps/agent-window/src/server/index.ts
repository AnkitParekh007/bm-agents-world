import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import { createCopilotExpressHandler } from "@copilotkit/runtime/v2/express";
import { buildCopilotRuntime } from "./copilot.js";
import { PackRegistry } from "./pack-registry.js";

const PORT = Number(process.env.PORT ?? 4000);
const registry = new PackRegistry();
const runtime = buildCopilotRuntime(registry);
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
});
