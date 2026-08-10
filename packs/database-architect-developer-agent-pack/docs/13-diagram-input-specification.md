# Diagram Input Specification

This document is the source for the future Mermaid architecture and complete execution-flow diagrams.

## Architecture layers

1. **Users:** database architect, database developer, application developer, QA, DevOps/SRE, security, data steward, release manager, approver.
2. **Entry:** agent UI/API, Jira action, Bitbucket PR action, scheduled governance review.
3. **Control plane:** identity, gateway, supervisor, workflow engine, registries, policy, approvals, capability broker, audit/evaluation.
4. **Specialists:** context, estate discovery, domain/logical model, physical schema, SQL, migrations, data movement, performance, concurrency, security, quality, HA/DR, observability, testing, review, release, documentation.
5. **MCP/tool plane:** Atlassian, workspace/Git, database catalog, diagnostics, sandbox, migration, schema diff, quality, test data, backup metadata, platform, observability, artifact, collaboration, secret broker, policy.
6. **Project systems:** PCC, SOP, DataBridge repositories and application services.
7. **Database environments:** disposable sandbox, playground, QA, production metadata/read-only.
8. **Security:** vault/secret manager, workload identity, short-lived leases, TLS, redaction, SQL classification, dual approval.
9. **Artifacts:** models, ERDs, dictionaries, SQL previews, migration plans, test reports, PR drafts, release readiness, runbooks, audit.

## Required architecture edges

- User to gateway with authenticated request.
- Gateway to policy before workflow creation.
- Supervisor to registries and specialists.
- Specialists to MCP tools only through policy-aware runtime.
- Capability broker to secret manager and trusted adapters.
- Trusted adapters to database targets; no model-to-database edge.
- Every tool to audit/evidence.
- Approval service gates repository writes and shared-environment mutations.
- Production mutation edge must terminate at human/operator-controlled deployment, not the autonomous agent.

## Complete flow nodes

Request -> normalize -> authorize -> discover engine/topology/schema -> classify data/risk -> analyze consumers -> model/design -> migration/backfill/performance plan -> plan approval -> isolated repository patch -> disposable database -> migration/schema/query/security/concurrency tests -> review -> PR approval -> commit/push/PR -> release approval -> operator execution -> read-only verification -> post-change review -> close.

## Decision nodes

- Is target scope known?
- Is sensitive data involved?
- Is change destructive, blocking, or irreversible?
- Does it require a compatibility window or data backfill?
- Did disposable migration and rollback/roll-forward tests pass?
- Are estimated rows, lock duration, storage, and replication impact acceptable?
- Are backup/recovery prerequisites satisfied?
- Is target production? If yes, hand off to operator.
- Did post-change verification match expected state?

## Visual conventions

- Blue: control-plane services
- Purple: specialist agents
- Green: read-only resources and successful states
- Amber: approval and human-review gates
- Red: denied/prohibited production or destructive paths
- Gray: artifacts and audit records
- Dashed lines: context/evidence
- Solid lines: tool invocation or controlled state transition
