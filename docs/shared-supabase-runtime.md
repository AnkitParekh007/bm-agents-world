# Shared Postgres + Supabase Storage Runtime

BM Agents World supports two persistence modes:

| Mode | Runtime state | Evidence | Intended use |
|---|---|---|---|
| `sqlite-filesystem` | local SQLite | local filesystem | developer workstation / single-process validation |
| `postgres-supabase` | shared Postgres | private Supabase Storage | shared QA pilot / multiple runtime pods |

The shared mode removes the runtime-data dependency on a Kubernetes `ReadWriteOnce` PVC. Multiple Agent Window pods can participate in the same durable QA workflow, approval, telemetry, and artifact lifecycle.

## Architecture

```text
Trusted gateway
      |
      v
+------------------+      +------------------+
| Agent Window A   |      | Agent Window B   |
| CopilotKit/AG-UI |      | CopilotKit/AG-UI |
+--------+---------+      +---------+--------+
         |                          |
         +------------+-------------+
                      |
          +-----------+-----------+
          |                       |
          v                       v
  private Postgres         private Storage bucket
  bm_agents_world          bm-agents-world-evidence
          |                       |
          |                       +-- screenshots
          |                       +-- Playwright traces
          |                       +-- network evidence
          |                       +-- test results
          |                       +-- evidence manifests
          |                       +-- immutable bug drafts
          |
          +-- runs
          +-- actions
          +-- approvals
          +-- audit events
          +-- QA evaluations
          +-- AG-UI/model telemetry
```

BM Agents World continues to authorize employees at the application layer using the trusted gateway identity and persisted run tenant/project scope. Object-storage URLs are not handed directly to the browser; `/api/qa/artifacts/:artifactId` remains the authorization gate.

## 1. Provision Postgres schema

Apply:

```text
deploy/supabase/shared-runtime-schema.sql
```

Use the Supabase SQL editor, `psql`, or your approved migration pipeline.

The bootstrap creates a private `bm_agents_world` schema and schema version marker. It explicitly revokes access from `public`, `anon`, and `authenticated`. The runtime connects directly to Postgres and does not require this schema to be exposed through the Supabase Data API.

Startup in shared mode checks:

```text
bm_agents_world.schema_meta
  key     = runtime_schema
  version = 1
```

A missing or incompatible schema fails startup rather than silently falling back to SQLite.

## 2. Create private evidence bucket

Create this Storage bucket in Supabase:

```text
bm-agents-world-evidence
```

Keep it **private**.

Do not add a public-read policy. BM Agents World uploads and downloads with a server-only Supabase secret key and still performs its own tenant/project/run authorization before returning bytes.

An alternate private bucket can be selected with:

```bash
BM_SUPABASE_ARTIFACT_BUCKET=another-private-bucket
```

## 3. Configure server secrets

Shared mode requires:

```bash
BM_PERSISTENCE_MODE=postgres-supabase
BM_POSTGRES_URL=postgresql://...
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
BM_SUPABASE_ARTIFACT_BUCKET=bm-agents-world-evidence
```

Optional Postgres tuning:

```bash
BM_POSTGRES_POOL_MAX=10
BM_POSTGRES_STATEMENT_TIMEOUT_MS=15000
```

These values are server-only. They must not be placed in Vite/client environment variables, agent prompts, tool payloads, CopilotKit state, logs, or artifacts.

For a persistent Kubernetes backend, use the Postgres connection type appropriate for the cluster network. A direct connection is suitable where IPv6/direct connectivity is available; a session-pooler connection can be used for a persistent IPv4 backend. Do not use a transaction-pooler URL as a drop-in choice without validating session/connection behavior for the runtime.

## 4. Kubernetes pilot configuration

`deploy/k8s/qa-pilot/` now selects:

```text
BM_DEPLOYMENT_MODE=pilot
BM_IDENTITY_MODE=trusted-headers
BM_PERSISTENCE_MODE=postgres-supabase
replicas=2
strategy=RollingUpdate
```

The pilot no longer mounts a runtime data PVC. `/tmp` and `/dev/shm` remain pod-local ephemeral volumes, and Playwright authentication state remains a read-only Secret mount.

The existing `ClusterIP` service and trusted-gateway `NetworkPolicy` remain in place.

## 5. Readiness behavior

`GET /healthz` remains process liveness.

`GET /readyz` in shared pilot mode requires:

```text
agent packs loaded
model credential configured
trusted-header identity enabled
shared Postgres reachable
runtime schema version compatible
private artifact bucket reachable
Jira read live
Bitbucket read live
Playwright live
Jira write live only when explicitly required
```

A collector outage is still not an application readiness dependency; OpenTelemetry is monitored separately.

## 6. Cross-pod workflow behavior

A representative flow is now valid:

```text
Pod A
  start QA run
  run Playwright
  upload bug draft to private Storage
  persist action/run state to Postgres

Pod B
  load same durable run/action
  load immutable bug draft by artifact id
  render human approval
  record approval in Postgres
  create Jira defect after approval
```

The Jira write adapter still verifies the bug-draft SHA-256 and reruns duplicate detection immediately before creation.

## 7. AG-UI telemetry ordering

AG-UI lifecycle telemetry is intentionally fail-soft so a telemetry write cannot block model streaming. `qa_run_agent_links` therefore does not use foreign keys: a correlation write may arrive a few milliseconds before its agent usage row. Reads join only to telemetry rows that actually exist.

This table is correlation metadata, not an authorization source. Tenant/project authorization comes from the durable QA run.

## 8. Cutover sequence

Recommended sequence:

1. Apply `deploy/supabase/shared-runtime-schema.sql`.
2. Create the private evidence bucket.
3. Put `BM_POSTGRES_URL`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` in the deployment secret manager.
4. Deploy one shared-mode pod first.
5. Verify `/readyz` is `200`.
6. Execute one non-production QA run through Jira read, Bitbucket read, and Playwright.
7. Verify evidence can be downloaded only by an authorized project identity.
8. Verify an L3 Jira action survives a pod restart and can be reviewed by an independent user.
9. Scale to two replicas.
10. Verify a run created on one pod can be read/approved from another pod.
11. Enable real Jira write only after the above checks pass.

## 9. Rollback

Application rollback is configuration-driven:

```bash
BM_PERSISTENCE_MODE=sqlite-filesystem
```

That is appropriate for local troubleshooting only. Do not run multiple Kubernetes replicas against independent SQLite/filesystem state.

Do not automatically copy shared production/pilot state back into SQLite. Treat the shared Postgres + Storage pair as authoritative once a team pilot has begun.

## 10. Security invariants

The shared persistence change does **not** alter these rules:

- trusted gateway identity is required for the shared pilot;
- tenant/project authorization gates runs, actions, audit, evaluations, and artifacts;
- requesters cannot self-approve protected actions in trusted mode;
- Jira creation remains payload/SHA-bound L3 human approval;
- raw model/Jira/Bitbucket/Supabase/Postgres/Playwright credentials never enter model context;
- production browser execution and free-form production mutation remain unavailable;
- Storage remains private and is not converted into a public artifact CDN.
