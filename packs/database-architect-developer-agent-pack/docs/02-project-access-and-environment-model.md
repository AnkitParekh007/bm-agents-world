# Project Access and Environment Model

## Immutable scope tuple

Every run is authorized against:

`tenant / project / repository / branch / base-commit / database-platform / instance / database / schema / object-patterns / Jira item / environment / requester / SQL classes / expiration`

The agent cannot move to another database, schema, environment, branch, or object set without a new authorization decision.

## Required project access

| System | Autonomous access | Approval-controlled access | Prohibited autonomous access |
|---|---|---|---|
| Jira and Confluence | Read stories, designs, comments, policies, incidents | Create comments, transition items, create tasks | Global administration |
| Bitbucket | Read repository, history, PRs, pipelines; create local patches | Commit, push, create/update PR, rerun pipeline | Force push, bypass protection, merge |
| Database catalog | Read scoped metadata, dependencies, grants, statistics | Additional diagnostic views when approved | Unbounded instance discovery |
| Query diagnostics | Bounded explain, query history, locks, waits, plans | Actual-plan execution in approved non-production scopes | Arbitrary production query execution |
| Disposable database | Create, migrate, mutate, reset, and destroy | Large representative datasets may require resource approval | External network or unmanaged credentials |
| Playground/QA | Read metadata; approved validation | DDL/DML/migrations/backfills with payload-bound approval | Superuser, unrestricted console, destructive commands without controls |
| Production | Approved metadata, redacted telemetry, replica-safe diagnostics | No autonomous mutation; operator-controlled execution may consume generated runbook | DDL, DML, grants, config, restore, failover, backup deletion |
| Secret manager | Request a named capability lease | Security-approved new mapping | Read/list raw secret values |

## Environment classes

### Disposable sandbox

- Created per run from an approved engine image or managed ephemeral service.
- No production secrets or unmasked production data.
- Full mutation allowed inside strict CPU, memory, storage, network, and lifetime quotas.
- Destroyed after evidence collection.

### Playground

- Integration environment with synthetic or masked data.
- Scoped migrations and DML require approval and expected-row limits.
- Destructive operations require enhanced review and recovery evidence.

### QA

- Release-candidate environment with controlled datasets.
- Every mutation requires payload-bound approval, backup/snapshot confirmation where applicable, and post-action validation.
- No broad exploratory write access.

### Production

- Metadata and redacted observability are read-only.
- Generated migration bundles, SQL previews, runbooks, and validation steps are handed to approved human operators or deployment systems.
- Direct autonomous DDL, DML, grants, restore, failover, configuration changes, or backup lifecycle actions are denied.

## Project registry requirements

Each project entry must define engine/version, edition, topology, migration framework, repositories, schema ownership, data classification, workload, HA/DR model, environments, approved diagnostic views, test-data source, deployment owner, and approvers. Unknown fields block mutation but do not block safe discovery.

## Access flow

1. Resolve user identity and project membership.
2. Read project and environment inventory.
3. Evaluate OPA policy for requested action.
4. Obtain a short-lived capability lease bound to engine, instance, database, schema, SQL class, row/time limits, and purpose.
5. Execute through an audited adapter that redacts secrets and sensitive data.
6. Store query hash, normalized action, affected-object list, row counts, timing, evidence hash, and approval identifier.
7. Revoke the lease when the step or run ends.
