import assert from "node:assert/strict";
import test from "node:test";
import type { AgentTransport, AgentTransportOptions } from "./agent-transport.js";
import { toCopilotExpressOptions } from "./copilotkit-transport-options.js";

/**
 * These tests pin the byte-for-byte equivalence Phase 6.5 must preserve: the
 * neutral transport options must map onto exactly the CopilotKit express-handler
 * options the server passed inline before the seam existed (base path,
 * single-route mode, and the two CORS branches). The mapping is tested directly
 * because the CopilotKit value import is not resolvable without a full install;
 * the mapping module is deliberately CopilotKit-free so it runs anywhere.
 */

const runtime = { marker: "runtime" } as const;

test("maps the base path and pins single-route mode", () => {
  const mapped = toCopilotExpressOptions(runtime, { basePath: "/api/copilotkit", cors: false });
  assert.equal(mapped.basePath, "/api/copilotkit");
  assert.equal(mapped.mode, "single-route");
});

test("passes the runtime through by reference", () => {
  const mapped = toCopilotExpressOptions(runtime, { basePath: "/x", cors: false });
  assert.equal(mapped.runtime, runtime);
});

test("cors:false disables CORS (production / same-origin build)", () => {
  const mapped = toCopilotExpressOptions(runtime, { basePath: "/x", cors: false });
  assert.equal(mapped.cors, false);
});

test("an origin allowlist becomes CopilotKit's { origin: [...] } shape", () => {
  const origins = ["http://localhost:5173", "http://127.0.0.1:5173"];
  const mapped = toCopilotExpressOptions(runtime, { basePath: "/x", cors: { allowedOrigins: origins } });
  assert.deepEqual(mapped.cors, { origin: origins });
});

test("copies the origin allowlist so later input mutation cannot leak in", () => {
  const origins = ["http://localhost:5173"];
  const mapped = toCopilotExpressOptions(runtime, { basePath: "/x", cors: { allowedOrigins: origins } });
  origins.push("http://evil.example");
  assert.deepEqual(mapped.cors, { origin: ["http://localhost:5173"] });
});

test("satisfies the neutral AgentTransport contract via a fake transport", () => {
  // A second implementation of the seam proves index.ts depends only on the
  // neutral interface, not on any CopilotKit-specific transport.
  let seen: AgentTransportOptions | undefined;
  const sentinel = (() => {}) as ReturnType<AgentTransport<typeof runtime>["handler"]>;
  const fake: AgentTransport<typeof runtime> = {
    name: "fake",
    handler: (_runtime, options) => {
      seen = options;
      return sentinel;
    },
  };
  const options: AgentTransportOptions = { basePath: "/api/copilotkit", cors: { allowedOrigins: ["http://localhost:5173"] } };
  const handler = fake.handler(runtime, options);
  assert.equal(handler, sentinel);
  assert.deepEqual(seen, options);
});
