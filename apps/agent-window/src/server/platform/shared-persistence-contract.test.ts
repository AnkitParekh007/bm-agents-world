import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const workspace = process.cwd();
const repoRoot = resolve(workspace, "..", "..");

function text(path: string) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("shared runtime schema stays private and contains the authoritative pilot tables", () => {
  const sql = text("deploy/supabase/shared-runtime-schema.sql");
  assert.match(sql, /create schema if not exists bm_agents_world/i);
  assert.match(sql, /revoke all on schema bm_agents_world from public/i);
  assert.match(sql, /revoke all on schema bm_agents_world from anon, authenticated/i);
  for (const table of [
    "schema_meta",
    "runs",
    "actions",
    "approvals",
    "audit_events",
    "qa_run_evaluations",
    "agent_run_usage",
    "qa_run_agent_links",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists bm_agents_world\\.${table}`, "i"));
  }
  assert.match(sql, /values \('runtime_schema', 1\)/i);
});

test("telemetry correlation does not depend on cross-callback foreign-key ordering", () => {
  const sql = text("deploy/supabase/shared-runtime-schema.sql");
  const linkTable = sql.match(/create table if not exists bm_agents_world\.qa_run_agent_links \(([\s\S]*?)\);/i)?.[1] ?? "";
  assert.ok(linkTable);
  assert.doesNotMatch(linkTable, /references/i);
  assert.match(linkTable, /primary key\(qa_run_id, agent_run_id\)/i);
});

test("shared agent usage rejects stale lifecycle updates", () => {
  const sql = text("deploy/supabase/shared-runtime-schema.sql");
  assert.match(sql, /create or replace function bm_agents_world\.keep_agent_usage_monotonic\(\)/i);
  assert.match(sql, /if new\.finished_at < old\.finished_at then\s+return old;/i);
  assert.match(sql, /create trigger trg_bm_agent_usage_monotonic/i);
});

test("shared evidence implementation keeps the bucket private behind application authorization", () => {
  const source = text("apps/agent-window/src/server/platform/supabase-artifact-store.ts");
  assert.match(source, /SUPABASE_SECRET_KEY/);
  assert.match(source, /upsert: false/);
  assert.match(source, /uri: `\/api\/qa\/artifacts\/\$\{id\}`/);
  assert.doesNotMatch(source, /getPublicUrl/);
  assert.doesNotMatch(source, /createSignedUrl/);
});

test("shared runtime dependencies are pinned", () => {
  const manifest = JSON.parse(text("apps/agent-window/package.json")) as Record<string, any>;
  assert.equal(manifest.dependencies["@supabase/supabase-js"], "2.110.9");
  assert.equal(manifest.dependencies.pg, "8.22.0");
  assert.equal(manifest.devDependencies["@types/pg"], "8.20.0");
});
