# QA Pilot Hardening

This milestone moves the first QA vertical slice from a single-user development prototype toward a team pilot.

## Goals

- use request identity instead of hard-coded `local-dev-user`
- preserve QA runs, actions, approvals, and audit records across process restarts
- group multi-step agent work under one durable run id
- authorize actions, reviews, audit, and artifacts by tenant/project scope
- prevent requester self-approval in shared/trusted identity mode
- keep the persistence/identity contracts replaceable when this project moves into BM Foundry

## Identity modes

### `local-dev`

This remains the standalone default. The server derives an identity from:

- `BM_LOCAL_USER_ID`
- `BM_LOCAL_TENANT_ID`
- `BM_LOCAL_PROJECT_IDS`

The defaults are intentionally obvious development values. Local self-approval remains available unless `BM_LOCAL_ALLOW_SELF_APPROVAL=false` is set.

### `trusted-headers`

A shared pilot should run behind an authenticated reverse proxy, ingress, or application gateway. The gateway must remove client-supplied identity headers and inject authoritative values:

- `x-user-id`
- `x-tenant-id`
- `x-project-ids` (comma separated) or `x-project-id`

Set:

```bash
BM_IDENTITY_MODE=trusted-headers
```

In this mode:

- missing `x-user-id` or `x-tenant-id` returns HTTP 401
- a lost async request context fails closed; it never falls back to the local identity
- run/action/artifact/audit reads require matching tenant and project membership
- a protected action requester cannot approve their own action

The current milestone intentionally does not implement a JWT/OIDC verifier. BM Agents World trusts only a deployment boundary that is configured to inject these headers. When merged into BM Foundry, the same `RequestIdentity` contract can be populated from its SSO/session layer instead.

## Durable runs

The QA agent now has a `startQaRun` tool. A multi-step workflow should call it once and reuse the returned run id for every action:

```text
startQaRun
   ↓
runId
   ├─ Jira story read
   ├─ Bitbucket impact read
   ├─ Playwright test run
   ├─ duplicate search
   └─ Jira bug create / approval
```

This replaces the previous prototype behavior where each tool request generated an unrelated run id.

## SQLite state store

The pilot uses Node's built-in SQLite module and requires Node >= 22.13.

Default database:

```text
.bm-agents-runtime/state/qa-pilot.sqlite
```

Override it with:

```bash
BM_STATE_DB_PATH=/secure/runtime/state/qa-pilot.sqlite
```

The database stores separate records for:

- runs
- actions
- approvals
- audit events

Action JSON remains the authoritative immutable/payload-bound execution record, while normalized run/approval columns support lookup and lifecycle management.

The `CapabilityStore` interface keeps the broker independent of SQLite. A later BM Foundry integration can implement the same interface using Supabase/Postgres without changing CopilotKit tools, capability IDs, adapters, or approval semantics.

## Restart behavior

A protected action can now survive a server restart:

```text
request L3 action
   ↓
pending approval persisted
   ↓
server restart
   ↓
action reloaded from SQLite
   ↓
human approval persisted
   ↓
server restart
   ↓
approved action can still be inspected/executed subject to normal policy
```

Expired approvals still fail when the action is reloaded.

## Artifact authorization

Artifacts continue to be stored by the runtime `ArtifactStore`, but artifact endpoints are no longer public-by-id.

Each artifact already contains a `runId`. The server now resolves:

```text
artifact
   ↓
runId
   ↓
persisted run context
   ↓
tenant + project authorization
   ↓
metadata / bytes
```

An artifact whose run is not persisted is not served by the hardened endpoint. A user from another tenant or project receives access denied even if they know the UUID.

The same rule protects Playwright screenshots/traces/network evidence, test result artifacts, evidence manifests, and bug drafts.

## Protected action approval

In trusted identity mode:

```text
requester A
   ↓
L3 action
   ↓
reviewer A attempts approve
   ↓
DENY self approval
```

A different authorized reviewer in the same tenant/project can approve the exact payload-bound action.

Local development can retain self-approval to keep the standalone demo usable.

## New API surface

```text
GET /api/session
GET /api/qa/runs
GET /api/qa/runs/:runId
```

Existing action, review, artifact, and audit endpoints are now identity-scoped.

`GET /api/session` returns only non-secret identity metadata and whether self-approval is permitted by the current mode.

## Deployment boundary

For a real team pilot:

1. run Node 22.13+
2. mount `.bm-agents-runtime` or `BM_STATE_DB_PATH` on persistent storage
3. keep `BM_ARTIFACT_ROOT` on persistent/private storage
4. put the service behind SSO/authenticated gateway
5. strip external `x-user-*`, `x-tenant-*`, and `x-project-*` headers at the edge
6. inject trusted identity headers after authentication/authorization
7. set `BM_IDENTITY_MODE=trusted-headers`
8. use a different authorized reviewer for L2/L3/L4 actions

## Still intentionally out of scope

- full OIDC/JWT validation inside this standalone app
- organization directory / group synchronization
- durable object storage for artifacts
- database encryption/key management
- multi-instance distributed locking
- Supabase/Postgres persistence
- Teams write adapter
- database read adapter

Those belong in later hardening or in BM Foundry itself. The current milestone establishes the interfaces and authorization semantics they must preserve.
