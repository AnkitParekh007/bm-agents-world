import assert from "node:assert/strict";
import test from "node:test";
import type { ExecutionContext } from "../platform/capability-types.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa-capabilities.js";
import { TeamsStatusAdapter, teamsAdapterMode } from "./qa-teams-adapter.js";

const context: ExecutionContext = {
  runId: "run-teams",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-test",
  requestedAt: "2026-08-14T00:00:00.000Z",
};

const definition = QA_CAPABILITIES.find((item) => item.id === "qa.teams.status.post");

function withEnv(value: string | undefined, run: () => Promise<void>) {
  const previous = process.env.QA_TEAMS_WEBHOOK_URL;
  if (value === undefined) delete process.env.QA_TEAMS_WEBHOOK_URL;
  else process.env.QA_TEAMS_WEBHOOK_URL = value;
  return run().finally(() => {
    if (previous === undefined) delete process.env.QA_TEAMS_WEBHOOK_URL;
    else process.env.QA_TEAMS_WEBHOOK_URL = previous;
  });
}

test("posts to a valid Teams webhook and reports a real external side effect", async () => {
  assert.ok(definition);
  await withEnv("https://acme.webhook.office.com/webhookb2/abc/IncomingWebhook/def", async () => {
    const calls: Array<{ url: string; body: any }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined });
      return new Response("1", { status: 200 });
    };
    const adapter = new TeamsStatusAdapter(new QaMockAdapter(), fetchImpl);
    const result = await adapter.execute(definition, context, { message: "QA smoke passed for PCC-123", title: "PCC QA" });
    assert.equal(result.ok, true);
    assert.equal(result.mode, "live");
    assert.equal(result.externalSideEffect, true);
    assert.equal(calls.length, 1);
    assert.match(calls[0].body.text, /PCC QA/);
    assert.match(calls[0].body.text, /QA smoke passed/);
  });
});

test("falls back to the honest mock when no webhook is configured", async () => {
  assert.ok(definition);
  await withEnv(undefined, async () => {
    let called = 0;
    const fetchImpl: typeof fetch = async () => { called += 1; return new Response("1", { status: 200 }); };
    const adapter = new TeamsStatusAdapter(new QaMockAdapter(), fetchImpl);
    const result = await adapter.execute(definition, context, { message: "hello" });
    assert.equal(result.mode, "mock");
    assert.equal(result.externalSideEffect, false);
    assert.equal(called, 0, "no network call may happen without a configured webhook");
  });
});

test("rejects a webhook on a non-Teams host and does not call it", async () => {
  assert.ok(definition);
  await withEnv("https://evil.example.com/hook", async () => {
    let called = 0;
    const fetchImpl: typeof fetch = async () => { called += 1; return new Response("1", { status: 200 }); };
    const adapter = new TeamsStatusAdapter(new QaMockAdapter(), fetchImpl);
    const result = await adapter.execute(definition, context, { message: "hello" });
    // Falls back to mock; the disallowed host is never contacted.
    assert.equal(result.mode, "mock");
    assert.equal(called, 0);
  });
});

test("teamsAdapterMode reflects configured status", async () => {
  await withEnv(undefined, async () => assert.equal(teamsAdapterMode(), "mock"));
  await withEnv("https://acme.webhook.office.com/webhookb2/x", async () => assert.equal(teamsAdapterMode(), "live"));
  await withEnv("https://evil.example.com/hook", async () => assert.equal(teamsAdapterMode(), "mock"));
});
