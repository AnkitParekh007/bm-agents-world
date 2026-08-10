# Agent and Sub-Agent Architecture

## Supervisor

`data-engineer-pyspark-supervisor` owns orchestration, scope, workflow state, evidence convergence, approvals, and final draft artifacts. It does not bypass independent review or production controls.

## Specialist agents

### data-context-agent
Retrieves approved product, domain, source, consumer, repository, platform, environment, ownership, and policy context.

Capabilities: context, data-products, ownership

### source-discovery-agent
Profiles approved source systems, schemas, volumes, change behavior, quality, latency, and extraction constraints.

Capabilities: source-discovery, profiling, contracts

### data-contract-agent
Defines and validates producer-consumer data contracts, schemas, semantics, service levels, compatibility, and ownership.

Capabilities: data-contracts, schemas, compatibility

### data-architecture-agent
Designs data products, layers, domains, storage, compute, orchestration, and batch/streaming boundaries.

Capabilities: data-architecture, lakehouse, data-products

### data-modeling-agent
Creates logical and physical models, keys, grain, dimensions, facts, aggregates, and history strategies.

Capabilities: data-modeling, dimensional-modeling, semantics

### pyspark-batch-agent
Implements maintainable DataFrame and Spark SQL batch pipelines using repository-compatible PySpark APIs.

Capabilities: pyspark, batch, spark-sql

### structured-streaming-agent
Designs and implements Structured Streaming sources, sinks, watermarks, state, triggers, checkpoints, and recovery.

Capabilities: structured-streaming, stateful-processing, watermarks

### ingestion-cdc-agent
Designs ingestion, incremental extraction, CDC, deduplication, ordering, replay, and source reconciliation.

Capabilities: ingestion, cdc, incremental-processing

### transformation-rules-agent
Implements testable business transformations, enrichment, normalization, joins, aggregations, and reusable functions.

Capabilities: transformations, business-rules, dataframes

### lakehouse-table-agent
Manages governed Delta Lake, Apache Iceberg, or platform-native table design, evolution, partitioning, and maintenance.

Capabilities: lakehouse, delta-lake, iceberg

### data-quality-agent
Defines, executes, trends, and enforces data quality checks, quarantine, thresholds, and issue ownership.

Capabilities: data-quality, expectations, validation

### reconciliation-agent
Performs source-to-target, control-total, count, amount, key, freshness, and completeness reconciliation.

Capabilities: reconciliation, control-totals, assurance

### schema-evolution-agent
Analyzes schema drift, compatibility, defaults, nullability, type changes, consumer impact, and migration strategies.

Capabilities: schema-evolution, compatibility, migration

### orchestration-agent
Designs DAGs, dependencies, datasets, schedules, retries, backfills, SLAs, concurrency, and idempotent task boundaries.

Capabilities: orchestration, airflow, scheduling

### data-testing-agent
Creates unit, transformation, contract, integration, end-to-end, quality, and regression tests with deterministic fixtures.

Capabilities: testing, pytest, spark-testing

### spark-performance-agent
Analyzes logical and physical plans, shuffles, joins, skew, partitions, caching, serialization, and resource use.

Capabilities: performance, query-plans, spark-tuning

### pipeline-reliability-agent
Designs idempotency, retries, checkpoints, restartability, replay, recovery, observability, and failure handling.

Capabilities: reliability, recovery, idempotency

### data-observability-agent
Monitors pipeline runs, freshness, volume, schema, quality, lineage, cost, and anomaly signals.

Capabilities: data-observability, freshness, monitoring

### data-security-governance-agent
Enforces classification, minimization, masking, access, privacy, retention, deletion, and tenant boundaries.

Capabilities: data-security, privacy, governance

### metadata-lineage-agent
Publishes approved metadata, ownership, documentation, schemas, quality, and runtime/design lineage.

Capabilities: metadata, openlineage, catalog

### data-platform-compatibility-agent
Resolves Spark, Python, JVM, connector, table-format, orchestrator, and managed-platform compatibility.

Capabilities: compatibility, versions, platform

### pipeline-release-agent
Prepares immutable candidates, CI/CD evidence, migration plans, runbooks, rollback, and release requests.

Capabilities: release, cicd, deployment

### data-incident-backfill-agent
Diagnoses data incidents and prepares safe repair, replay, reprocessing, and bounded backfill plans.

Capabilities: incident, backfill, remediation

### data-engineering-independent-reviewer-agent
Independently challenges design, correctness, quality, performance, security, recovery, and release readiness.

Capabilities: independent-review, assurance, quality

### evidence-management-agent
Versions, redacts, hashes, stores, and links contracts, plans, test results, lineage, approvals, and run evidence.

Capabilities: evidence, provenance, retention

### policy-enforcer-agent
Enforces project, data, environment, credential, execution, approval, production, and mutation boundaries.

Capabilities: policy, authorization, guardrails

## Orchestration principles

- One agent proposes; a different reviewer challenges high-risk work.
- Deterministic tools calculate schemas, plans, quality, reconciliation, lineage, and hashes.
- Parallel analysis is used for quality, performance, security, reliability, and consumer impact.
- Shared writes are approval-controlled; production writes are never free-form model actions.
- All conclusions link to source revisions, contracts, datasets, runs, and evidence.
