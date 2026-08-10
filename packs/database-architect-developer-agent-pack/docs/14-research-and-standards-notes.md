# Research and Standards Notes

## Version-aware database behavior

The pack does not treat “SQL” as one interchangeable language. PostgreSQL, Oracle, SQL Server, MySQL/MariaDB, managed variants, editions, and compatibility levels differ in DDL locking, transactional DDL, online operations, optimizer behavior, permissions, replication, stored code, indexing, and recovery. The platform profile must be resolved before SQL generation.

## Migration validation

Flyway validation compares applied and available migrations, including migration identity and checksums. Liquibase provides SQL preview commands for update and rollback workflows. The agent therefore previews SQL, validates migration history, and tests supported baselines before requesting target execution. Repair or history changes are never an automatic response to validation failure.

## Least privilege

Database vendors document role and privilege systems, row-level controls, and least-privilege approaches. The pack separates catalog readers, diagnostics, migration executors, backfill executors, monitoring identities, production verifiers, and human break-glass access. It does not use a universal DBA identity.

## Performance evidence

PostgreSQL `pg_stat_statements`, SQL Server Query Store, MySQL Performance Schema/sys schema, and Oracle workload/plan facilities provide engine-specific evidence. Access may reveal sensitive query text or workload information, so adapters apply privileges, redaction, normalization, and result limits.

## Observability

OpenTelemetry defines database client spans, metrics, logs, and SQL semantic conventions. Database-server telemetry still depends on vendor facilities. Correlation identifiers and normalized query IDs are preferred over unredacted SQL or bind values.

## MCP safety

MCP resources, prompts, and tools are distinct capabilities. Sensitive tools require user-visible inputs, policy evaluation, confirmation, isolation, and audit. Server descriptions and third-party tool metadata are not trusted as authorization.

## Production philosophy

The pack generates production-ready artifacts but does not autonomously mutate production. This preserves human accountability, separation of duties, operational timing, and emergency judgment while still automating discovery, design, validation, review, and verification.
