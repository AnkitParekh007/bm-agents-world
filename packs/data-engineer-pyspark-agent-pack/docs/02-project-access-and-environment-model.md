# Project Access and Environment Model

## Scope hierarchy

Every request is bound to `organization → project → data product → repository → pipeline/job → source and target datasets → environment → action`.

Cross-project, cross-tenant, and cross-customer access is denied unless a separately approved portfolio scope exists.

## Project profiles

| Project | Data engineering emphasis |
|---|---|
| PCC | Legacy-compatible batch integration, relational sources, explicit reconciliation, conservative backfills |
| SOP | Service-oriented ingestion, curated reporting datasets, quality and release governance |
| DataBridge | Primary PySpark/ETL/CDC profile with batch reliability and legacy-source compatibility |
| BM Agent Foundry | Agent telemetry, audit, evaluation, cost, policy, and privacy-aware pipelines |

## Environment model

### Local or isolated workspace

Code generation, unit tests, synthetic fixtures, local Spark, schema validation, and package builds are allowed without external writes.

### Playground

Approved bounded sources and sinks may be used. Shared table, topic, orchestration, or catalog writes require an approval-bound action.

### QA

Candidate-bound integration, scale, quality, reconciliation, streaming-restart, and release validation may run after approval.

### Production

The model receives only bounded, redacted, read-only metadata and telemetry. It can prepare a production action request but cannot run pipelines, change schedules, mutate data, alter schemas, delete checkpoints, or perform table maintenance.

## Required onboarding inventory

- Repository, branch model, build and packaging
- Python, Spark, JVM, connector, table-format, and orchestrator versions
- Source and target ownership
- Dataset and field classification
- Network and regional boundaries
- Runtime identities and vault references
- Schedules, dependencies, SLAs, freshness, quality, and consumers
- Backfill, replay, snapshot, retention, and recovery procedures
- Monitoring, lineage, support, release, and incident ownership

## Credential model

The model receives capability metadata, never raw credentials. Trusted adapters exchange workload identity for short-lived source, Spark, streaming, catalog, artifact, and orchestration capabilities.
