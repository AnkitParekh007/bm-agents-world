# MCP Servers, Atomic Tools, and Runtime Plugins

## Distinctions

- **MCP server:** exposes resources, prompts, and tools through a protocol boundary.
- **Atomic tool:** a narrowly scoped deterministic operation such as `catalog.list_tables`, `plan.explain`, `flyway.validate`, or `artifact.put`.
- **Plugin/adapter:** trusted runtime code that authenticates to a vendor or executes a local database tool.
- **Skill:** orchestrated reasoning and tool usage producing a typed artifact.

## MCP server registry

| Server | Purpose | Mode |
|---|---|---|
| `atlassian-context` | Jira, Confluence, Bitbucket resources and approval-controlled writes | `read-mostly` |
| `workspace-git` | Ephemeral filesystem, SQL repository search, diff, patch, Git status, and allowlisted commands | `sandbox-write` |
| `database-catalog` | Engine metadata, schemas, objects, dependencies, grants, statistics, and migration history | `read-only` |
| `database-query-analysis` | Bounded EXPLAIN, plan retrieval, workload statistics, waits, locks, and query history | `diagnostic-read` |
| `database-sandbox` | Disposable engine instances, fixtures, migration execution, and validation | `sandbox-mutate` |
| `migration-management` | Flyway, Liquibase, and repository-native migration validation and SQL preview | `read-generate` |
| `schema-diff` | Repository, model, and environment schema comparison with drift classification | `read-generate` |
| `data-quality` | Profiling, validation rules, reconciliation, lineage, and masked samples | `read-generate` |
| `test-data` | Synthetic and masked test-data generation with relationship preservation | `sandbox-generate` |
| `backup-recovery-metadata` | Backup catalogs, restore history, replication status, RPO/RTO evidence, and runbooks | `read-only` |
| `cloud-database-platform` | Managed database configuration, topology, maintenance windows, and non-secret metadata | `read-only` |
| `observability` | Database logs, metrics, traces, dashboards, alerts, incidents, and capacity evidence | `read-only` |
| `artifact-evidence` | Immutable models, SQL previews, plans, reports, approvals, hashes, and retention | `append-read` |
| `collaboration` | Teams and Jira drafts plus approved publication | `approval-write` |
| `secret-broker` | Short-lived database and platform capability leases without exposing raw secrets | `broker-only` |
| `policy` | OPA decisions, SQL classification, scope checks, approval verification, and environment rules | `mandatory` |

## Runtime plugins

| Plugin | Purpose |
|---|---|
| `bitbucket-adapter` | Bitbucket Cloud/Data Center repositories, pull requests, diffs, and pipeline operations |
| `jira-confluence-adapter` | Atlassian context and controlled writes |
| `postgresql-adapter` | PostgreSQL catalog, EXPLAIN, statistics, roles, RLS, and sandbox operations |
| `oracle-database-adapter` | Oracle catalog, SQL/PLSQL, plans, privileges, AWR-compatible evidence, and sandbox operations |
| `sql-server-adapter` | SQL Server catalog, Query Store, plans, permissions, RLS, and sandbox operations |
| `mysql-mariadb-adapter` | MySQL/MariaDB catalog, EXPLAIN, Performance Schema, roles, and sandbox operations |
| `generic-jdbc-odbc-adapter` | Allowlisted metadata and query operations for other supported relational engines |
| `flyway-adapter` | Flyway info, validate, SQL preview, migrate-in-sandbox, and history evidence |
| `liquibase-adapter` | Liquibase status, checks, update-sql, rollback-sql, sandbox update, and changelog evidence |
| `schema-diff-adapter` | Engine-aware object diff, dependency ordering, and drift classification |
| `query-plan-adapter` | Normalizes estimated/actual plans, operators, estimates, waits, and regressions |
| `data-profiler-adapter` | Bounded profiling, quality rules, reconciliation, and redaction |
| `synthetic-data-adapter` | Relationship-aware synthetic test-data generation |
| `backup-recovery-adapter` | Backup, restore, replication, and recovery metadata without destructive controls |
| `observability-adapter` | Metrics, logs, traces, query statistics, capacity, and alert retrieval |
| `ci-database-adapter` | Migration checks, disposable database tests, SQL linting, and release evidence |
| `secret-manager-adapter` | Vault, cloud key manager, or enterprise secret-manager integration |
| `approval-adapter` | Payload-bound, expiring human approvals with separation of duties |
| `artifact-adapter` | Immutable evidence storage and retrieval |
| `teams-adapter` | Approved collaboration publication |

## Required atomic tool families

### Catalog and dependency tools

`db.profile`, `catalog.list_schemas`, `catalog.list_objects`, `catalog.describe_object`, `catalog.dependencies`, `catalog.grants`, `catalog.statistics`, `catalog.migration_history`, `catalog.replication_status`.

### Diagnostic tools

`query.explain_estimated`, `query.explain_actual_bounded`, `query.history`, `query.waits`, `query.locks`, `query.deadlocks`, `query.index_usage`, `query.stats_health`, `capacity.snapshot`.

### Migration and schema tools

`migration.info`, `migration.validate`, `migration.preview_forward`, `migration.preview_recovery`, `migration.apply_sandbox`, `schema.diff`, `schema.drift`, `schema.lint`, `schema.test`.

### Data tools

`data.profile_bounded`, `data.reconcile`, `data.generate_synthetic`, `data.mask_sandbox`, `data.backfill_sandbox`, `data.sample_redacted`.

### Repository and delivery tools

`repo.search`, `repo.diff`, `repo.patch`, `git.status`, `git.commit_approved`, `bitbucket.pr_draft`, `pipeline.run_approved`, `jira.publish_approved`, `teams.publish_approved`.

## Tool design rules

Each mutating tool declares target, environment, SQL classification, transaction behavior, maximum rows, maximum duration, lock expectation, dry-run support, reversibility, required approval, and evidence outputs. Adapters must reject multi-statement or opaque SQL when policy cannot classify it safely.

Community MCP servers are not trusted by default. They must be pinned, reviewed, sandboxed, wrapped with organizational authorization, and prevented from receiving universal credentials.
