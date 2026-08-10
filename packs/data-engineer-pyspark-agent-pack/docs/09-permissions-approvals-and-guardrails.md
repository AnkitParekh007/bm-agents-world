# Permissions, Approvals, and Guardrails

## Safe autonomous actions

- Read approved repository, contract, catalog, lineage, and documentation context.
- Analyze bounded redacted schemas, profiles, plans, run metadata, and telemetry.
- Draft code and artifacts in isolated workspaces.
- Run local or isolated tests using synthetic or approved fixtures.
- Calculate quality, reconciliation, performance, lineage, hashes, and impact.

## Approval-controlled actions

- Create commits or pull requests.
- Publish Jira, Confluence, Teams, catalog, contract, schema, or lineage changes.
- Run shared playground or QA pipelines and write non-production data.
- Change schedules, orchestration configuration, topics, or table properties.
- Request production deployment, backfill, replay, repair, migration, or table maintenance.

## Prohibited free-form actions

- Production data writes, DDL, pipeline execution, backfills, replays, or repairs.
- Destructive overwrite, truncate, delete, snapshot expiration, vacuum, or checkpoint deletion.
- Unbounded source extraction or production record export.
- Cross-project, cross-tenant, or cross-customer evidence mixing.
- Raw secret access, universal administrator identities, or bypassing quality/security gates.
- Self-approval, residual-risk acceptance, or unsupported source-of-truth decisions.

## Approval payload

Approvals include project, environment, pipeline, datasets, partitions/time range, source revision, artifact hashes, action, configuration, expected rows/volume, stop conditions, rollback, verification, approver, and expiry.
