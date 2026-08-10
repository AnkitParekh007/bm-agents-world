# Key Vault, Workload Identity, and Secrets

## Core rule

The language model never receives raw source passwords, database credentials, cloud keys, streaming credentials, metastore tokens, kubeconfig, personal access tokens, or signing keys.

## Access path

`User identity → Agent Gateway → OPA Policy → Capability Broker → Workload Identity / Vault → Trusted Adapter → Source, Spark platform, orchestrator, catalog, registry, or artifact service`

## Identity separation

Use distinct identities for repository reads, source metadata reads, bounded source queries, playground execution, QA execution, catalog publication, artifact publication, and production read-only verification.

Production backfill, repair, replay, migration, table maintenance, and schedule operations use a separate deterministic execution identity unavailable to the model.

## Secret handling

- Prefer workload identity, managed identity, or short-lived dynamic credentials.
- Bind capabilities to project, environment, source, dataset, query/action, time, and purpose.
- Resolve secrets only inside trusted adapters.
- Redact credentials, connection strings, signed URLs, cookies, and tokens from logs and evidence.
- Rotate and revoke capabilities after use or suspected exposure.
- Audit issuance, use, target, outcome, and expiry without logging the secret value.

## Data minimization

Source and production reads must be parameterized, row-bounded, column-minimized, redacted, and purpose-bound. Prefer metadata, aggregates, profiles, and hashes over raw records.
