# Sources and Standards Baseline

The pack is engine- and version-aware. During each run, adapters must resolve documentation matching the actual database version, edition, compatibility level, extensions, migration framework, and managed-service limitations.

## Primary references

- PostgreSQL current documentation: https://www.postgresql.org/docs/current/
- PostgreSQL row security policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- PostgreSQL `pg_stat_statements`: https://www.postgresql.org/docs/current/pgstatstatements.html
- Oracle AI Database documentation: https://docs.oracle.com/en/database/oracle/oracle-database/
- Oracle Database Security Guide: https://docs.oracle.com/en/database/oracle/oracle-database/26/dbseg/
- Oracle SQL Language Reference: https://docs.oracle.com/en/database/oracle/oracle-database/26/sqlrf/
- Microsoft SQL documentation: https://learn.microsoft.com/sql/
- SQL Server security documentation: https://learn.microsoft.com/sql/relational-databases/security/
- SQL Server Query Store: https://learn.microsoft.com/sql/relational-databases/performance/tune-performance-with-the-query-store
- MySQL 8.4 Reference Manual: https://dev.mysql.com/doc/refman/8.4/en/
- MySQL optimization and EXPLAIN: https://dev.mysql.com/doc/refman/8.4/en/optimization.html
- Flyway documentation: https://documentation.red-gate.com/flyway
- Liquibase documentation: https://docs.liquibase.com/
- Model Context Protocol specification: https://modelcontextprotocol.io/specification/
- OpenTelemetry database semantic conventions: https://opentelemetry.io/docs/specs/semconv/db/
- Open Policy Agent documentation: https://www.openpolicyagent.org/docs/
- NIST Secure Software Development Framework: https://csrc.nist.gov/Projects/ssdf
- OWASP SQL Injection Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- SLSA specification: https://slsa.dev/spec/
- SPDX specifications: https://spdx.dev/specifications/

## Current-version context as of August 2026

- PostgreSQL current documentation is for the PostgreSQL 18 line.
- SQL Server 2025 is version 17.x.
- Oracle documentation identifies Oracle AI Database 26ai as the current generation.
- MySQL 8.4 is an LTS line; repository and platform-pinned versions still control generated SQL.

These versions are planning context only. Existing project versions, editions, licensed features, cloud-service limitations, and compatibility modes always take precedence.

## Governance notes

- A query plan is evidence, not proof of production behavior; recommendations require representative data and measured results.
- Migration history files are immutable after application unless an approved repair process and incident record exist.
- SQL preview commands, schema diffs, and disposable migration tests precede target-environment mutation.
- Sensitive query text, bind values, samples, and plans must be redacted before entering model context or artifacts.
- Community database MCP servers require source review, provenance verification, sandboxing, and least-privilege wrappers before organizational use.
