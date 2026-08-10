# Database Skills Catalog

Skills are versioned, testable capabilities. A skill is not a credential or an MCP server. The registry maps skills to required tools, policy scopes, inputs, outputs, and evaluation cases.

## Work intake and governance

- **`db.work-context`** — Read and normalize Jira items, acceptance criteria, linked incidents, contracts, and policy constraints.
- **`db.requirement-decomposition`** — Convert requirements into data, schema, query, migration, security, and operational obligations.
- **`db.traceability-map`** — Map acceptance criteria to database objects, migrations, tests, evidence, and approvals.
- **`db.risk-classification`** — Classify destructive, locking, privacy, availability, compatibility, and performance risk.
- **`db.change-scope`** — Define authorized engines, instances, databases, schemas, objects, branches, and environments.
- **`db.data-classification`** — Identify public, internal, confidential, regulated, credential, and personal data.
- **`db.ownership-map`** — Resolve business owner, technical owner, steward, approver, and on-call responsibilities.

## Database discovery and inventory

- **`db.engine-detection`** — Detect database engine, version, edition, extensions, compatibility level, and managed-service constraints.
- **`db.schema-inventory`** — Inventory schemas, tables, views, routines, sequences, types, synonyms, and dependencies.
- **`db.workload-profile`** — Classify OLTP, reporting, analytics, batch, event, archival, and mixed workloads.
- **`db.topology-map`** — Map primary, replica, cluster, shard, tenant, region, and failover topology.
- **`db.migration-tool-detection`** — Detect Flyway, Liquibase, native migration tooling, and repository conventions.
- **`db.query-inventory`** — Identify high-frequency, high-latency, high-resource, and business-critical query families.
- **`db.data-volume-profile`** — Measure row counts, growth, skew, cardinality, retention, and storage distribution.
- **`db.dependency-graph`** — Map object, service, report, job, ORM, event, and downstream dependencies.

## Data modeling and architecture

- **`db.domain-model`** — Model business entities, aggregates, ownership, lifecycle, and invariants.
- **`db.logical-model`** — Design engine-neutral entities, attributes, keys, relationships, and cardinality.
- **`db.normalization`** — Apply normalization deliberately and document justified denormalization.
- **`db.key-design`** — Choose natural, surrogate, composite, UUID, sequence, and distributed key strategies.
- **`db.temporal-modeling`** — Design effective dating, history, audit, slowly changing, and bitemporal patterns.
- **`db.multitenancy`** — Design database-per-tenant, schema-per-tenant, shared-schema, and tenant-isolation patterns.
- **`db.reference-data`** — Design controlled vocabularies, reference tables, ownership, and lifecycle.
- **`db.data-contract`** — Define canonical types, nullability, units, precision, semantics, and compatibility.
- **`db.architecture-decision`** — Create ADRs for material database choices and rejected alternatives.

## Physical schema design

- **`db.table-design`** — Design tables, columns, data types, defaults, generated values, and ownership.
- **`db.constraint-design`** — Design primary, foreign, unique, check, exclusion, and domain constraints.
- **`db.index-design`** — Design selective, covering, filtered, functional, partial, composite, and specialized indexes.
- **`db.partitioning`** — Design range, list, hash, interval, and lifecycle-aware partitioning.
- **`db.storage-layout`** — Design tablespaces, filegroups, compression, fill factors, and storage placement where applicable.
- **`db.naming-standards`** — Apply repository and organization naming rules.
- **`db.view-design`** — Design views, materialized/indexed views, security views, and refresh behavior.
- **`db.procedure-function-design`** — Design stored procedures, functions, packages, and deterministic boundaries.
- **`db.trigger-review`** — Use triggers only with documented semantics, ordering, recursion, performance, and observability.
- **`db.engine-portability`** — Separate portable SQL from engine-specific optimizations and document lock-in.

## SQL development

- **`db.sql-authoring`** — Write readable, set-oriented, parameterized, engine-compatible SQL.
- **`db.query-correctness`** — Validate joins, predicates, null semantics, aggregation, ordering, and duplicate behavior.
- **`db.dml-safety`** — Design bounded inserts, updates, deletes, merges, and upserts with measurable affected-row expectations.
- **`db.bulk-operations`** — Design chunked, resumable, throttled, and observable bulk operations.
- **`db.window-functions`** — Use analytic functions with explicit partitions, ordering, and frames.
- **`db.cte-subquery`** — Choose CTEs, derived tables, temp objects, and subqueries based on engine behavior.
- **`db.dynamic-sql`** — Constrain dynamic SQL, identifiers, parameters, execution context, and auditability.
- **`db.stored-code`** — Implement routines with explicit transactions, permissions, errors, logging, and testability.
- **`db.sql-review`** — Review correctness, readability, plan stability, security, and operational impact.

## Migrations and schema evolution

- **`db.migration-authoring`** — Create immutable versioned migrations following repository conventions.
- **`db.expand-contract`** — Sequence additive changes, dual-read/write, backfill, cutover, and cleanup.
- **`db.online-ddl`** — Select online or low-lock DDL strategies supported by the engine and edition.
- **`db.compatibility-window`** — Support mixed application versions during rolling deployment.
- **`db.migration-validation`** — Validate checksums, ordering, drift, prerequisites, and target compatibility.
- **`db.rollback-rollforward`** — Design rollback where safe and roll-forward recovery where rollback is unsafe.
- **`db.schema-drift`** — Detect and reconcile repository-to-environment schema drift.
- **`db.migration-idempotency`** — Make reruns, retries, and partial failures safe where the tool permits.
- **`db.deprecation-cleanup`** — Remove legacy objects only after verified consumer and retention windows.
- **`db.release-sequencing`** — Order schema, data, application, job, report, and feature-flag changes.

## Data migration and quality

- **`db.data-profile`** — Profile completeness, uniqueness, distribution, format, referential integrity, and anomalies.
- **`db.backfill-design`** — Design resumable, checkpointed, throttled, idempotent backfills.
- **`db.transformation-mapping`** — Define source-to-target mapping, cleansing, defaulting, and exception handling.
- **`db.reconciliation`** — Compare counts, checksums, aggregates, samples, and business invariants.
- **`db.synthetic-data`** — Generate representative non-sensitive test data with preserved relationships.
- **`db.masking-tokenization`** — Mask, tokenize, pseudonymize, or synthesize sensitive values.
- **`db.archival-retention`** — Implement retention, legal hold, archival, purge, and verification policies.
- **`db.cdc-validation`** — Validate change-data-capture ordering, deletes, schema evolution, and consumer lag.
- **`db.lineage`** — Record source, transformation, destination, owner, and evidence lineage.

## Query performance and capacity

- **`db.explain-plan`** — Capture and interpret engine-specific estimated and actual execution plans safely.
- **`db.cardinality-statistics`** — Analyze statistics freshness, histograms, estimates, skew, and parameter sensitivity.
- **`db.index-usage`** — Analyze index seeks/scans, unused or duplicate indexes, write overhead, and maintenance cost.
- **`db.query-rewrite`** — Rewrite queries while preserving semantics and testing plan stability.
- **`db.lock-wait-analysis`** — Analyze locks, waits, latches, blocking chains, deadlocks, and contention.
- **`db.query-history`** — Use approved workload statistics such as pg_stat_statements or Query Store.
- **`db.capacity-forecast`** — Forecast storage, IOPS, memory, connections, CPU, temp space, and growth.
- **`db.connection-pooling`** — Design pool sizes, timeouts, leak detection, and admission control.
- **`db.performance-baseline`** — Create before/after baselines with representative data and concurrency.
- **`db.plan-regression`** — Detect and mitigate execution-plan regressions without unsafe hints.

## Transactions and consistency

- **`db.transaction-boundary`** — Define atomic business operations and ownership of commits and retries.
- **`db.isolation-level`** — Choose isolation based on anomalies, throughput, and engine behavior.
- **`db.deadlock-prevention`** — Define consistent access ordering, index support, retry policy, and diagnostics.
- **`db.optimistic-concurrency`** — Design versions, compare-and-set, and conflict handling.
- **`db.pessimistic-locking`** — Use explicit locking with bounded scope and timeout.
- **`db.idempotency`** — Design keys, uniqueness, deduplication, and replay-safe operations.
- **`db.distributed-consistency`** — Design outbox, saga, reconciliation, and eventual consistency boundaries.
- **`db.replica-consistency`** — Account for lag, read-your-writes, stale reads, and failover behavior.

## Security, privacy and compliance

- **`db.identity-model`** — Separate human, application, migration, monitoring, and break-glass identities.
- **`db.role-design`** — Design least-privilege roles and grants at appropriate scopes.
- **`db.row-column-security`** — Design row-level, column-level, view-based, label, or virtual private database controls.
- **`db.encryption`** — Design transport, at-rest, tablespace, column, and key-management controls.
- **`db.audit-policy`** — Define authentication, privilege, DDL, sensitive access, and administrative audit events.
- **`db.sql-injection-defense`** — Require parameterization and constrain dynamic identifiers.
- **`db.privilege-analysis`** — Identify used and unused privileges and reduce attack surface.
- **`db.secrets-handling`** — Use brokered short-lived credentials and never expose raw secrets to the model.
- **`db.data-residency`** — Map region, sovereignty, transfer, retention, and deletion constraints.
- **`db.break-glass`** — Define time-bound emergency access with dual control and mandatory review.

## Availability, backup and recovery

- **`db.backup-policy`** — Define full, incremental, differential, log, snapshot, and retention strategies.
- **`db.restore-testing`** — Perform isolated restore tests and verify usable data, permissions, and applications.
- **`db.rpo-rto`** — Map business requirements to backup, replication, failover, and recovery design.
- **`db.replication`** — Design physical, logical, transactional, streaming, and read-replica behavior.
- **`db.failover`** — Define automated or manual failover, fencing, DNS, connections, and validation.
- **`db.disaster-recovery`** — Create region/site loss procedures and evidence.
- **`db.point-in-time-recovery`** — Validate log/WAL/binlog availability and recovery procedures.
- **`db.maintenance`** — Plan vacuum, statistics, index maintenance, integrity checks, patching, and storage cleanup.

## Testing and validation

- **`db.schema-test`** — Test object existence, types, constraints, defaults, permissions, and dependencies.
- **`db.migration-test`** — Apply migrations from supported baselines to disposable databases.
- **`db.rollback-test`** — Test rollback or roll-forward recovery in isolated environments.
- **`db.query-test`** — Test SQL outputs, edge cases, nulls, duplicates, ordering, and precision.
- **`db.constraint-test`** — Verify invalid states are rejected and valid states are accepted.
- **`db.concurrency-test`** — Test locking, isolation, retries, deadlocks, and race conditions.
- **`db.performance-test`** — Test latency, throughput, resource use, plans, and growth scenarios.
- **`db.recovery-test`** — Test restore, failover, reconnect, and application recovery.
- **`db.security-test`** — Verify grants, role inheritance, RLS, masking, audit, and denied operations.
- **`db.drift-test`** — Compare expected schema and migration history to target environments.

## Observability, review and release

- **`db.telemetry`** — Define safe database metrics, logs, traces, query identifiers, and redaction.
- **`db.alert-design`** — Define actionable thresholds for saturation, lag, errors, blocking, storage, and backup failures.
- **`db.change-manifest`** — Produce object, SQL, data, permission, compatibility, and operational change manifest.
- **`db.pull-request-draft`** — Create traceable pull-request description with SQL previews and evidence.
- **`db.release-readiness`** — Assess compatibility, lock risk, duration, resources, backup, rollback, and monitoring.
- **`db.runbook`** — Create deployment, validation, incident, failover, and recovery procedures.
- **`db.jira-update`** — Draft Jira status and technical summaries for approval.
- **`db.teams-update`** — Draft Microsoft Teams change and risk updates for approval.
- **`db.post-change-review`** — Compare actual duration, impact, errors, and performance to the plan.

Total skills: 117.
