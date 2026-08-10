import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityAdapter } from "../platform/capability-types.js";
import { BitbucketReadAdapter } from "./bitbucket-read-adapter.js";
import { JiraReadAdapter } from "./jira-read-adapter.js";
import { QA_CAPABILITIES, QaMockAdapter } from "./qa-capabilities.js";

const context = {
  runId: "run-read-test",
  userId: "qa-user",
  agentId: "qa",
  packId: "qa-agent-pack",
  projectId: "PCC",
  environment: "qa" as const,
  tenantId: "tenant-a",
  requestedAt: "2026-08-10T00:00:00.000Z",
};

function definition(id: string) {
  const found = QA_CAPABILITIES.find((item) => item.id === id);
  assert.ok(found, `Missing definition ${id}`);
  return found;
}

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

test("Jira adapter performs a live read and normalizes issue fields", async () => {
  await withEnv({
    QA_JIRA_BASE_URL: "https://example.atlassian.net",
    QA_JIRA_EMAIL: "qa@example.com",
    QA_JIRA_API_TOKEN: "test-token",
    QA_JIRA_BEARER_TOKEN: undefined,
    QA_JIRA_ACCEPTANCE_CRITERIA_FIELD: "customfield_12345",
  }, async () => {
    let authorization = "";
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      assert.equal(url.pathname, "/rest/api/3/issue/PCC-123");
      assert.match(url.searchParams.get("fields") ?? "", /customfield_12345/);
      authorization = new Headers(init?.headers).get("authorization") ?? "";
      return new Response(JSON.stringify({
        id: "10001",
        key: "PCC-123",
        fields: {
          summary: "Supplier search validation",
          status: { id: "3", name: "Ready for QA" },
          issuetype: { id: "10001", name: "Story" },
          priority: { id: "2", name: "High" },
          assignee: { accountId: "abc", displayName: "QA Owner" },
          description: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Validate supplier search" }] }] },
          customfield_12345: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Search returns authorized suppliers" }] }] },
          labels: ["qa"],
          components: [{ id: "10", name: "Supplier" }],
          fixVersions: [],
          versions: [],
          subtasks: [],
          issuelinks: [],
        },
      }), { status: 200, headers: { "content-type": "application/json" } });
    };

    const adapter = new JiraReadAdapter(new QaMockAdapter(), fetchImpl);
    const result = await adapter.execute(definition("qa.jira.story.read"), context, { storyId: "PCC-123" });
    assert.equal(result.ok, true);
    assert.equal(result.mode, "live");
    assert.equal(result.externalSideEffect, false);
    assert.match(authorization, /^Basic /);
    const data = result.data as Record<string, any>;
    assert.equal(data.key, "PCC-123");
    assert.equal(data.summary, "Supplier search validation");
    assert.equal(data.description, "Validate supplier search");
    assert.equal(data.acceptanceCriteria, "Search returns authorized suppliers");
    assert.equal(data.readOnly, true);
  });
});

test("Jira adapter falls back to mock when no live credential is configured", async () => {
  await withEnv({
    QA_JIRA_BASE_URL: undefined,
    QA_JIRA_EMAIL: undefined,
    QA_JIRA_API_TOKEN: undefined,
    QA_JIRA_BEARER_TOKEN: undefined,
  }, async () => {
    const fallback: CapabilityAdapter = new QaMockAdapter();
    const adapter = new JiraReadAdapter(fallback, async () => {
      throw new Error("fetch should not be called");
    });
    const result = await adapter.execute(definition("qa.jira.story.read"), context, { storyId: "PCC-123" });
    assert.equal(result.mode, "mock");
    assert.equal(result.externalSideEffect, false);
  });
});

test("Bitbucket adapter discovers story pull requests and bounded diffstat", async () => {
  await withEnv({
    QA_BITBUCKET_ACCESS_TOKEN: "read-token",
    QA_BITBUCKET_WORKSPACE: "bm",
    QA_PCC_BITBUCKET_REPOS: "frontend:pcc-ui",
  }, async () => {
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      calls.push(url.pathname);
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer read-token");

      if (url.pathname.endsWith("/pullrequests")) {
        assert.match(url.searchParams.get("q") ?? "", /PCC-123/);
        return new Response(JSON.stringify({
          values: [{
            id: 42,
            title: "PCC-123 supplier search",
            state: "OPEN",
            source: { branch: { name: "feature/PCC-123" }, commit: { hash: "abc123" } },
            destination: { branch: { name: "qa" }, commit: { hash: "def456" } },
            links: { html: { href: "https://bitbucket.org/bm/pcc-ui/pull-requests/42" } },
            updated_on: "2026-08-10T00:00:00Z",
          }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }

      if (url.pathname.endsWith("/pullrequests/42/diffstat")) {
        return new Response(JSON.stringify({
          values: [
            { status: "modified", lines_added: 12, lines_removed: 3, new: { path: "src/app/supplier.ts" } },
            { status: "added", lines_added: 20, lines_removed: 0, new: { path: "src/app/supplier.spec.ts" } },
          ],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }

      return new Response("not found", { status: 404 });
    };

    const adapter = new BitbucketReadAdapter(new QaMockAdapter(), fetchImpl);
    const result = await adapter.execute(definition("qa.bitbucket.change-impact.read"), context, { storyId: "PCC-123" });
    assert.equal(result.ok, true);
    assert.equal(result.mode, "live");
    assert.equal(result.externalSideEffect, false);
    const data = result.data as Record<string, any>;
    assert.equal(data.pullRequestsMatched, 1);
    assert.equal(data.matches[0].totals.files, 2);
    assert.equal(data.matches[0].totals.linesAdded, 32);
    assert.equal(data.matches[0].matches, undefined);
    assert.equal(data.bounded, true);
    assert.equal(calls.length, 2);
  });
});
