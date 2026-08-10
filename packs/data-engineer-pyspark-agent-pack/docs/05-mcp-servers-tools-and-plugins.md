# MCP Servers, Tools, and Plugins

## Separation of concerns

- **MCP resources** expose approved context such as schemas, contracts, job metadata, and docs.
- **MCP prompts** provide reusable analysis and workflow instructions.
- **MCP tools** perform bounded reads or approval-controlled actions.
- **Plugins/adapters** execute deterministic validation in isolated workers.
- **Skills** define how agents combine context and tools.

## MCP registry

### atlassian-data-context-mcp
**Mode:** mixed
Read Jira and Confluence context; approved writes create data work items, decisions, and status updates.

### bitbucket-data-engineering-mcp
**Mode:** mixed
Read repositories, commits, pull requests, pipelines, and code owners; protected writes require approval.

### source-data-catalog-mcp
**Mode:** read-only
Read approved source schemas, ownership, classification, statistics, contracts, and sample profiles.

### spark-platform-mcp
**Mode:** mixed
Read Spark configuration, cluster metadata, job history, event logs, and bounded plans; execution is isolated or approval-controlled.

### notebook-workspace-mcp
**Mode:** isolated-execution
Read approved notebooks and run isolated notebook tests without exposing personal workspace credentials.

### sql-source-adapter-mcp
**Mode:** read-only
Run parameterized, bounded, read-only source and warehouse queries through trusted adapters.

### object-storage-metadata-mcp
**Mode:** read-only
Read approved object metadata, partitions, manifests, file sizes, formats, and retention state.

### streaming-platform-mcp
**Mode:** mixed
Read Kafka or approved event-platform topics, schemas, offsets, lag, and bounded samples; writes require approval.

### orchestration-mcp
**Mode:** mixed
Read Airflow or approved scheduler DAGs, runs, dependencies, logs, datasets, and task state; protected actions require approval.

### lakehouse-catalog-mcp
**Mode:** read-only
Read and validate Delta, Iceberg, Hive, Unity Catalog, or approved metastore metadata and table properties.

### data-quality-mcp
**Mode:** isolated-execution
Execute approved quality, profiling, validation, and reconciliation rules in isolated workers.

### schema-registry-contract-mcp
**Mode:** read-only
Read and validate schema registry entries, data contracts, compatibility modes, and consumer mappings.

### lineage-metadata-mcp
**Mode:** mixed
Read and publish approval-controlled OpenLineage-compatible job, run, and dataset metadata.

### data-observability-mcp
**Mode:** read-only
Read bounded pipeline, freshness, quality, cost, lineage, and anomaly telemetry.

### artifact-registry-mcp
**Mode:** mixed
Store versioned pipeline packages, wheels, containers, reports, contracts, and evidence bundles.

### vault-capability-mcp
**Mode:** broker-only
Issues short-lived connector and platform capabilities to trusted adapters without revealing raw secrets.

### policy-approval-mcp
**Mode:** control-plane
Evaluates OPA policy and obtains immutable payload-bound approvals for protected actions.

### documentation-standards-mcp
**Mode:** read-only
Provides version-pinned Spark, platform, data standard, runbook, and organization documentation.

## Deterministic plugins

- **data-repository-profiler:** Detects Python, Spark, build, orchestration, table-format, connector, testing, packaging, and deployment conventions.
- **source-schema-profiler:** Computes bounded schema, null, cardinality, distribution, freshness, and volume profiles with redaction.
- **data-contract-validator:** Validates schema, semantic, ownership, SLA, compatibility, and consumer contract rules.
- **schema-diff-analyzer:** Compares source, target, registry, table, and contract schemas and classifies compatibility risk.
- **spark-plan-analyzer:** Parses logical and physical plans, exchanges, joins, scans, predicates, code generation, and adaptive execution evidence.
- **partition-skew-analyzer:** Detects skew, tiny files, oversized partitions, hotspots, and partition imbalance.
- **join-strategy-advisor:** Evaluates join cardinality, broadcast suitability, shuffle risk, ordering, and correctness constraints.
- **streaming-state-analyzer:** Analyzes watermarks, state stores, late data, output modes, triggers, and state-growth risk.
- **checkpoint-safety-validator:** Validates checkpoint ownership, compatibility, retention, recovery, and prohibited deletion risks.
- **data-quality-rule-engine:** Runs row, aggregate, relational, freshness, volume, uniqueness, and business-rule validations.
- **reconciliation-engine:** Computes source-to-target counts, totals, hashes, keys, balances, and exception sets.
- **synthetic-data-generator:** Creates deterministic, privacy-safe fixtures for edge, boundary, skew, late, duplicate, and invalid cases.
- **pyspark-test-runner:** Runs unit and integration tests with local Spark or isolated approved clusters and captures deterministic evidence.
- **orchestration-dag-validator:** Validates DAG parse, dependency cycles, retries, concurrency, schedules, datasets, backfills, and idempotency.
- **lineage-emitter:** Emits approved OpenLineage-style run, job, dataset, schema, ownership, and quality facets.
- **pii-classification-redactor:** Detects sensitive fields and redacts or tokenizes evidence before model use.
- **backfill-planner:** Calculates bounded partitions, ordering, concurrency, checkpoints, controls, duration, and stop conditions.
- **cost-capacity-estimator:** Estimates compute, storage, shuffle, file, streaming-state, and backfill resource demand.
- **pipeline-package-builder:** Builds wheels, archives, containers, dependency locks, manifests, and reproducible release candidates.
- **sbom-provenance-generator:** Creates dependency inventory, SBOM, source revision, build provenance, and artifact hashes.
- **data-documentation-generator:** Produces source-to-target mappings, contracts, runbooks, lineage summaries, and operational guides from evidence.
- **evidence-bundle-builder:** Packages redacted inputs, plans, tests, metrics, approvals, hashes, and outputs into immutable evidence bundles.
