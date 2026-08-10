-- BM Agents World shared runtime schema v1.
--
-- Apply with the Supabase SQL editor, psql, or your normal migration pipeline.
-- This deliberately uses a private schema rather than `public`; the runtime
-- connects directly to Postgres and does not require Data API exposure.

begin;

create schema if not exists bm_agents_world;
revoke all on schema bm_agents_world from public;
revoke all on schema bm_agents_world from anon, authenticated;

create table if not exists bm_agents_world.schema_meta (
  key text primary key,
  version integer not null,
  updated_at timestamptz not null default now()
);

insert into bm_agents_world.schema_meta(key, version)
values ('runtime_schema', 1)
on conflict(key) do update set version = excluded.version, updated_at = now();

create table if not exists bm_agents_world.runs (
  run_id uuid primary key,
  tenant_id text not null,
  project_id text not null,
  user_id text not null,
  environment text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  context_json jsonb not null
);
create index if not exists idx_bm_runs_tenant_project_updated
  on bm_agents_world.runs(tenant_id, project_id, updated_at desc);

create table if not exists bm_agents_world.actions (
  action_id uuid primary key,
  run_id uuid not null references bm_agents_world.runs(run_id) on delete cascade,
  tenant_id text not null,
  project_id text not null,
  status text not null,
  updated_at timestamptz not null,
  action_json jsonb not null
);
create index if not exists idx_bm_actions_run_updated
  on bm_agents_world.actions(run_id, updated_at asc);

-- Every shared action write uses INSERT ... ON CONFLICT DO UPDATE. PostgreSQL
-- serializes conflicting updates to one action row; this trigger then validates
-- the state transition against the committed OLD row. That makes execution
-- claims and approval decisions compare-and-swap operations across pods without
-- allowing a stale writer to regress or duplicate an action.
create or replace function bm_agents_world.enforce_action_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    -- Repeating `executing` is a stale second execution claim and must fail.
    if new.status = 'executing' then
      raise exception 'action % is already executing', old.action_id using errcode = '40001';
    end if;
    return new;
  end if;

  if old.status = 'pending_approval' and new.status in ('approved', 'rejected') then
    return new;
  end if;

  if old.status in ('ready', 'approved') and new.status = 'executing' then
    return new;
  end if;

  if old.status = 'executing' and new.status in ('executed', 'failed') then
    return new;
  end if;

  raise exception 'invalid action transition for %: % -> %', old.action_id, old.status, new.status
    using errcode = '40001';
end;
$$;

drop trigger if exists trg_bm_action_transition on bm_agents_world.actions;
create trigger trg_bm_action_transition
before update on bm_agents_world.actions
for each row execute function bm_agents_world.enforce_action_transition();

create table if not exists bm_agents_world.approvals (
  approval_id uuid primary key,
  action_id uuid not null unique references bm_agents_world.actions(action_id) on delete cascade,
  status text not null,
  payload_hash text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null,
  approval_json jsonb not null
);

create table if not exists bm_agents_world.audit_events (
  id uuid primary key,
  run_id uuid not null references bm_agents_world.runs(run_id) on delete cascade,
  tenant_id text not null,
  project_id text not null,
  timestamp timestamptz not null,
  event_json jsonb not null
);
create index if not exists idx_bm_audit_run_timestamp
  on bm_agents_world.audit_events(run_id, timestamp desc);
create index if not exists idx_bm_audit_tenant_project_timestamp
  on bm_agents_world.audit_events(tenant_id, project_id, timestamp desc);

create table if not exists bm_agents_world.qa_run_evaluations (
  evaluation_id uuid primary key,
  run_id uuid not null unique references bm_agents_world.runs(run_id) on delete cascade,
  tenant_id text not null,
  project_id text not null,
  reviewer_user_id text not null,
  outcome text not null check (outcome in ('successful','partially_successful','failed','abandoned')),
  usefulness_score integer not null check (usefulness_score between 1 and 5),
  would_use_again boolean not null,
  false_positive_defect boolean not null,
  manual_override_minutes integer not null check (manual_override_minutes between 0 and 480),
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_bm_eval_tenant_project_updated
  on bm_agents_world.qa_run_evaluations(tenant_id, project_id, updated_at desc);

create table if not exists bm_agents_world.agent_run_usage (
  agent_run_id text primary key,
  thread_id text not null,
  tenant_id text not null,
  user_id text not null,
  agent_id text not null,
  model text not null,
  provider text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  duration_ms integer not null,
  event_count integer not null,
  tool_call_count integer not null,
  model_call_count integer not null,
  input_tokens bigint,
  output_tokens bigint,
  total_tokens bigint,
  usage_status text not null,
  estimated_cost_usd numeric(20,8),
  cost_status text not null,
  trace_id text,
  span_id text,
  error text
);
create index if not exists idx_bm_agent_usage_tenant_started
  on bm_agents_world.agent_run_usage(tenant_id, started_at desc);

-- AgentTelemetryService deliberately performs non-blocking lifecycle writes.
-- Protect the authoritative row from an older "run started" callback arriving
-- after the completed usage callback on another pool connection.
create or replace function bm_agents_world.keep_agent_usage_monotonic()
returns trigger
language plpgsql
as $$
begin
  if new.finished_at < old.finished_at then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bm_agent_usage_monotonic on bm_agents_world.agent_run_usage;
create trigger trg_bm_agent_usage_monotonic
before update on bm_agents_world.agent_run_usage
for each row execute function bm_agents_world.keep_agent_usage_monotonic();

-- AG-UI lifecycle telemetry is intentionally fire-and-forget so it cannot
-- block model streaming. A QA-run link can therefore arrive milliseconds
-- before either side's persistence callback. Keep this correlation table free
-- of foreign keys; the application only reads links that successfully join to
-- an existing agent_run_usage row, so incomplete links are harmless and do not
-- create a cross-pod ordering race.
create table if not exists bm_agents_world.qa_run_agent_links (
  qa_run_id uuid not null,
  agent_run_id text not null,
  linked_at timestamptz not null,
  primary key(qa_run_id, agent_run_id)
);
create index if not exists idx_bm_qa_agent_links_agent
  on bm_agents_world.qa_run_agent_links(agent_run_id);

-- Defense in depth: these tables are server-runtime data, not browser Data API
-- resources. Keep low-privilege API roles out even if a project exposes more
-- schemas in the future.
revoke all on all tables in schema bm_agents_world from public, anon, authenticated;
alter default privileges in schema bm_agents_world revoke all on tables from public, anon, authenticated;

commit;
