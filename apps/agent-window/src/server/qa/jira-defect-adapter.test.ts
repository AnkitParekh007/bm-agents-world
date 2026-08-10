import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { ArtifactStore } from "../platform/artifact-store.js";
import { CapabilityBroker } from "../platform/capability-broker.js";
import type { ExecutionContext } from "../platform/capability-types.js";
import { JiraDefectAdapter } from "./jira-defect-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa-capabilities.js";

const context: ExecutionContext = {
  runId: "run-jira-defect-test",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa",
  tenantId: "tenant-test",
  requestedAt: "2026-08-10T00:00:00.000Z",
};

function withEnv(values: Record<string, string | undefined>, run: () => Promise<void>) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return run().finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function draft(store: ArtifactStore) {
  return store.writeJson(context.runId, "bug-draft", "bug-draft.json", {
    title: "Supplier search returns incorrect results",
    parentIssue: "PCC-123",
    environment: "qa",
    build: "qa-2026.08.10",
    preconditions: ["QA user is authenticated"],
    stepsToReproduce: ["Open supplier search", "Search for an authorized supplier"],
    expectedResult: "Only authorized suppliers are returned.",
    actualResult: "An unauthorized supplier is returned.",
    businessImpact: "Users can see an incorrect supplier result.",
    severityRecommendation: "Major",
    evidenceIds: [],
    duplicateCandidates: [],
  });
}

const jiraEnv = {
  QA_JIRA_BASE_URL: "https://example.atlassian.net",
  QA_JIRA_EMAIL: "qa@example.com",
  QA_JIRA_API_TOKEN: "write-token",
  QA_JIRA_BEARER_TOKEN: undefined,
  QA_JIRA_WRITE_ENABLED: "true",
  QA_PCC_JIRA_PROJECT_KEY: "PCC",
  QA_JIRA_BUG_ISSUE_TYPE: "Bug",
};

test("Jira defect action is L3 payload-bound and creates only after approval", async () => withEnv(jiraEnv, async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-jira-defect-test-"));
  try {
    const store = new ArtifactStore(directory);
    const artifact = draft(store);
    const calls: Array<{ path: string; method: string; body?: any; authorization?: string | null }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ path: url.pathname, method: init?.method ?? "GET", body, authorization: new Headers(init?.headers).get("authorization") });
      if (url.pathname.endsWith("/search/jql")) {
        return new Response(JSON.stringify({ issues: [] }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.pathname.endsWith("/issue") && init?.method === "POST") {
        return new Response(JSON.stringify({ id: "20001", key: "PCC-900", self: "https://example.atlassian.net/rest/api/3/issue/20001" }), { status: 201, headers: { "content-type": "application/json" } });
      }
      return new Response("not found", { status: 404 });
    };

    const mock = new QaMockAdapter();
    const adapter = new JiraDefectAdapter(mock, store, fetchImpl);
    const broker = new CapabilityBroker(QA_CAPABILITIES, [mock, adapter]);
    const action = broker.requestAction("qa.jira.bug.create", context, {
      bugDraftArtifactId: artifact.id,
      bugDraftSha256: artifact.sha256,
    });

    assert.equal(action.status, "pending_approval");
    await assert.rejects(() => broker.executeAction(action.id), /cannot execute/);
    broker.decideAction(action.id, "approved", "qa-human", "Reviewed exact bug draft");
    const executed = await broker.executeAction(action.id);

    assert.equal(executed.status, "executed");
    assert.equal(executed.result?.mode, "live");
    assert.equal(executed.result?.externalSideEffect, true);
    assert.equal((executed.result?.data as any).key, "PCC-900");
    assert.equal(calls.filter((call) => call.path.endsWith("/issue")).length, 1);
    assert.match(calls[0]?.authorization ?? "", /^Basic /);
    const create = calls.find((call) => call.path.endsWith("/issue"));
    assert.equal(create?.body.fields.summary, "Supplier search returns incorrect results");
    assert.equal(create?.body.fields.project.key, "PCC");
    assert.equal(create?.body.fields.issuetype.name, "Bug");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));

test("Jira duplicate scan is read-only and ranks similar recent bugs", async () => withEnv(jiraEnv, async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-jira-defect-test-"));
  try {
    const store = new ArtifactStore(directory);
    const artifact = draft(store);
    const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({
      issues: [
        { key: "PCC-800", fields: { summary: "Supplier search returns incorrect results", status: { name: "Open" }, priority: { name: "High" }, created: "2026-08-09T00:00:00Z" } },
        { key: "PCC-700", fields: { summary: "Invoice export formatting", status: { name: "Open" }, created: "2026-08-08T00:00:00Z" } },
      ],
    }), { status: 200, headers: { "content-type": "application/json" } });
    const adapter = new JiraDefectAdapter(new QaMockAdapter(), store, fetchImpl);
    const definition = QA_CAPABILITIES.find((item) => item.id === "qa.jira.duplicate.search");
    assert.ok(definition);
    const result = await adapter.execute(definition, context, { bugDraftArtifactId: artifact.id, bugDraftSha256: artifact.sha256 });
    assert.equal(result.ok, true);
    assert.equal(result.externalSideEffect, false);
    const candidates = (result.data as any).candidates;
    assert.equal(candidates[0].key, "PCC-800");
    assert.equal(candidates[0].similarity, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));

test("high-confidence duplicate blocks Jira create before external side effect", async () => withEnv(jiraEnv, async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-jira-defect-test-"));
  try {
    const store = new ArtifactStore(directory);
    const artifact = draft(store);
    let createCalls = 0;
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/search/jql")) {
        return new Response(JSON.stringify({ issues: [{ key: "PCC-800", fields: { summary: "Supplier search returns incorrect results", status: { name: "Open" } } }] }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.pathname.endsWith("/issue") && init?.method === "POST") createCalls += 1;
      return new Response(JSON.stringify({}), { status: 201, headers: { "content-type": "application/json" } });
    };
    const adapter = new JiraDefectAdapter(new QaMockAdapter(), store, fetchImpl);
    const definition = QA_CAPABILITIES.find((item) => item.id === "qa.jira.bug.create");
    assert.ok(definition);
    const result = await adapter.execute(definition, context, { bugDraftArtifactId: artifact.id, bugDraftSha256: artifact.sha256 });
    assert.equal(result.ok, false);
    assert.equal(result.externalSideEffect, false);
    assert.match(result.error ?? "", /duplicate/i);
    assert.equal(createCalls, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));

test("bug draft SHA mismatch is rejected before Jira access", async () => withEnv(jiraEnv, async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-jira-defect-test-"));
  try {
    const store = new ArtifactStore(directory);
    const artifact = draft(store);
    let calls = 0;
    const adapter = new JiraDefectAdapter(new QaMockAdapter(), store, async () => {
      calls += 1;
      return new Response(JSON.stringify({ issues: [] }), { status: 200 });
    });
    const definition = QA_CAPABILITIES.find((item) => item.id === "qa.jira.bug.create");
    assert.ok(definition);
    const result = await adapter.execute(definition, context, { bugDraftArtifactId: artifact.id, bugDraftSha256: "0".repeat(64) });
    assert.equal(result.ok, false);
    assert.match(result.error ?? "", /SHA-256/);
    assert.equal(calls, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}));
