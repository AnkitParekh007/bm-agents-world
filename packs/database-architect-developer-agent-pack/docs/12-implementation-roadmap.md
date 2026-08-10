# Implementation Roadmap

## Phase 0 — Governance

Define ownership, database inventory, data classes, prohibited operations, approvers, evidence retention, and incident response. Approve the production-read-only principle.

## Phase 1 — Read-only discovery MVP

Connect Jira/Confluence/Bitbucket, catalog metadata, migration history, and approved observability. Deliver work-context, estate-profile, dependency, data-dictionary, and design artifacts. No database mutation.

## Phase 2 — Disposable database development

Add repository patching, engine-matched disposable databases, migration validation, schema diffs, SQL tests, quality gates, and artifact storage. Allow mutations only in disposable sandboxes.

## Phase 3 — Performance and security specialists

Add bounded plan/statistics adapters, role/grant analysis, data profiling, redaction, representative benchmarks, and regression evaluation.

## Phase 4 — Approval-controlled non-production

Enable payload-bound playground/QA migrations and backfills through deployment identities, expected-row limits, timeouts, backup prerequisites, and post-action verification.

## Phase 5 — Production operator handoff

Generate signed migration bundles, SQL previews, runbooks, monitoring, and recovery artifacts for human/operator execution. Keep agent production access read-only.

## Phase 6 — Multi-profile expansion

Add managed cloud databases, warehouses, CDC, lakehouse SQL, and NoSQL profiles only with separate adapters, policies, skills, and evaluations. Do not assume relational rules transfer unchanged.

## Success metrics

- Design and implementation lead time
- Migration failure and rollback/roll-forward rate
- Escaped schema and data defects
- Query-performance regression rate
- Privilege reduction and access-review findings
- Data-quality incident rate
- Restore-test success and measured RPO/RTO
- Approval turnaround and policy-denial quality
- Agent recommendations accepted after human review
