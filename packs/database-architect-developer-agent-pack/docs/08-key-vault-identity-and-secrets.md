# Key Vault, Identity, and Secrets

## Principle

The model sees capability names and redacted results, never secret values. Database connections are opened inside trusted adapters using short-lived identities or brokered credentials.

## Identity classes

| Identity | Purpose | Typical privileges |
|---|---|---|
| Catalog reader | Metadata and dependency discovery | Catalog views only |
| Diagnostic reader | Plans, waits, statistics, redacted query history | Approved diagnostic views, no business-row reads unless separately approved |
| Sandbox owner | Disposable databases | Full control only inside ephemeral scope |
| Migration executor | Approved playground/QA migration | Exact database/schema and migration operation, short expiry |
| Data backfill executor | Approved bounded data movement | Specific procedure/script, row/time limits, no ad hoc console |
| Monitoring identity | Metrics, replication, backup, capacity | Read-only operational metadata |
| Production verifier | Post-change metadata and safe validation | Read-only, allowlisted statements |
| Break-glass | Emergency human operation | Dual approval, short expiry, session recording, mandatory review |

## Credential flow

`User -> Agent Gateway -> OPA -> Capability Broker -> Workload Identity / Vault -> Database Adapter -> Target`

The broker binds leases to project, engine, host/service identifier, database, schema, tool, SQL class, row/time limits, environment, approval ID, and expiry.

## Secret reference examples

- `vault://database/pcc/playground/catalog-reader`
- `gcp-sm://projects/example/secrets/sop-qa-migration-executor`
- `azure-kv://org-vault/databridge-prod-verifier`
- `aws-sm://database/platform/monitoring-role`

These are references only. No value is stored in this pack.

## Rotation and revocation

- Prefer workload identity, IAM database authentication, managed identities, or dynamic database credentials.
- Rotate static legacy credentials while migrating them to dynamic access.
- Revoke leases on workflow completion, approval expiry, anomaly, user removal, or policy change.
- Prevent the model, logs, traces, prompts, and artifacts from containing connection strings, tokens, passwords, private keys, or encryption material.
