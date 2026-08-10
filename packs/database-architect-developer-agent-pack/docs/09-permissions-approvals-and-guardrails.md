# Permissions, Approvals, and Guardrails

## Action classes

| Class | Examples | Default |
|---|---|---|
| R0 public context | Engine documentation, repository standards | Allow |
| R1 scoped metadata | Catalog, dependencies, grants, migration history | Allow with scope and audit |
| R2 diagnostics | Explain, query history, locks, waits, capacity | Allow only through bounded redacting tools |
| W1 local workspace | SQL files, migration files, tests, docs | Allow in isolated workspace |
| W2 repository writes | Commit, push, PR, Jira/Teams update | Human approval |
| M1 sandbox mutation | Disposable database DDL/DML | Allow within quotas and policy |
| M2 shared non-production mutation | Playground/QA DDL, DML, grants, backfill | Payload-bound human approval |
| M3 production mutation | Production DDL/DML/grants/config/restore/failover | Deny autonomous agent |
| D destructive | Drop, truncate, mass delete, migration clean/repair, backup delete | Deny by default; specialized human change process |

## Approval object

An approval binds approver, role, run ID, action, engine, target, environment, exact artifact hash, normalized SQL hash, expected objects, expected rows, maximum duration, lock expectation, backup prerequisite, recovery plan, expiry, and separation-of-duties evidence.

Any material change invalidates the approval.

## Mandatory guardrails

- Deny unqualified or unbounded update/delete operations.
- Deny opaque scripts that cannot be parsed and classified.
- Deny transaction-control surprises inside migration steps unless declared.
- Deny production business-row sampling unless separately authorized and redacted.
- Deny superuser/SYSDBA/sa/root credentials to autonomous tools.
- Deny `DROP DATABASE`, `TRUNCATE`, migration `clean`, backup deletion, history repair, forced failover, and unrestricted dynamic SQL.
- Require expected-row limits and post-condition checks for DML.
- Require lock/duration analysis for DDL on non-empty objects.
- Require compatible backup/recovery evidence for medium/high-risk shared-environment changes.
- Require two-person approval for high-risk security, destructive, recovery, and production operator actions.

## Human accountability

The agent recommends severity, risk, and release readiness. Named humans remain accountable for business semantics, data loss acceptance, production execution, security exceptions, compliance decisions, and final release approval.
