# Research and Standards Notes

Research snapshot: **7 August 2026**. Project-pinned and platform-supported versions always override these external snapshots.

## Apache Spark and PySpark

- Apache Spark documentation currently identifies Spark 4.2.0 as the latest documentation line.
- PySpark 4.2 documentation lists Python 3.10 and above, but repository and managed-platform compatibility must be resolved before code generation.
- Structured Streaming remains the primary Spark SQL-based streaming model, with explicit guidance for watermarks, state, joins, checkpoints, and performance.
- Spark performance guidance emphasizes measured evidence including scans, partitioning, caching, joins, and optimizer information.

## Orchestration

Apache Airflow stable documentation currently identifies version 3.3.0. The pack remains compatible with organization-pinned Airflow 2.x/3.x or alternate orchestrators by discovering actual DAG and provider conventions.

## Lakehouse table formats

Apache Iceberg latest documentation identifies 1.11.0 and defines a multi-engine table format and catalog integration. Delta Lake documentation describes ACID tables, scalable metadata, and unified batch/stream processing. The pack treats both as optional platform profiles, not universal defaults.

## Lineage and data quality

OpenLineage models jobs, runs, datasets, and extensible facets, supporting both runtime and design-time lineage. Data quality controls are represented as versioned, measurable rules with explicit warn, quarantine/drop, or fail behavior determined by policy.

## Source list

See `SOURCES.md` for official documentation links and access notes.
