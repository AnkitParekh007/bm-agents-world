# Agent and Sub-Agent Architecture

## Operating model

A single supervisor owns the workflow state. Specialists receive a minimum context package and return schema-validated artifacts. They do not share unrestricted credentials, call each other directly, or mutate external systems outside the workflow.

| Agent | Responsibility | Core capabilities |
|---|---|---|
| `database-architect-developer-supervisor` | Coordinates bounded database architecture and development workflows, selects specialists, manages approvals, and preserves evidence. | orchestration, risk, evidence |
| `work-context` | Reads Jira, Confluence, service contracts, incidents, data policies, and acceptance criteria. | jira, requirements, traceability |
| `database-estate-discovery` | Profiles database engines, versions, schemas, ownership, workloads, topology, migration tooling, and repository conventions. | catalog, metadata, discovery |
| `data-domain-modeler` | Defines business entities, relationships, lifecycle, ownership, invariants, and canonical terms. | domain-modeling, glossary, governance |
| `logical-model-architect` | Creates normalized logical models, keys, cardinality, temporal rules, and data contracts independent of an engine. | logical-model, normalization, constraints |
| `physical-schema-architect` | Creates engine-aware tables, types, keys, indexes, partitions, storage, naming, and physical design. | physical-model, ddl, indexing |
| `sql-developer` | Implements safe SQL, views, procedures, functions, triggers, and reusable query patterns within repository conventions. | sql, stored-code, review |
| `migration-engineer` | Designs versioned migrations, expand-contract sequencing, compatibility windows, validation, and rollback or roll-forward strategies. | flyway, liquibase, zero-downtime |
| `data-movement-engineer` | Designs backfills, transformations, reconciliation, archival, imports, exports, and resumable data movement. | backfill, etl, reconciliation |
| `query-performance-engineer` | Analyzes plans, statistics, cardinality, indexing, waits, locking, and workload regressions. | explain, query-store, tuning |
| `transaction-concurrency-engineer` | Designs transaction boundaries, isolation, locking, idempotency, consistency, and deadlock prevention. | transactions, locking, concurrency |
| `database-security-governance` | Designs identities, roles, grants, row or column security, masking, encryption, auditing, and data-classification controls. | least-privilege, rls, audit |
| `data-quality-steward` | Defines profiling, validation, quality rules, anomaly checks, lineage, retention, and reconciliation evidence. | data-quality, profiling, lineage |
| `integration-contract-engineer` | Reviews ORM mappings, API/event contracts, CDC, replication consumers, and schema compatibility. | contracts, cdc, orm |
| `ha-dr-architect` | Designs backup, restore, replication, failover, RPO/RTO, maintenance, and disaster-recovery validation. | backup, replication, recovery |
| `observability-capacity-engineer` | Defines database metrics, logs, traces, capacity forecasts, SLOs, alerts, and operational dashboards. | observability, capacity, slo |
| `database-platform-compatibility` | Resolves engine/version/edition/cloud-service capabilities, SQL dialects, extensions, and upgrade constraints. | postgresql, oracle, sql-server, mysql |
| `database-test-engineer` | Builds schema, migration, query, constraint, concurrency, performance, and recovery tests in disposable environments. | testcontainers, migration-test, performance-test |
| `database-change-reviewer` | Reviews DDL, DML, stored code, migration ordering, data risk, compatibility, and evidence sufficiency. | review, quality, risk |
| `database-pipeline-release` | Runs deterministic validation and prepares controlled database release and deployment artifacts. | ci, release, gates |
| `database-documentation` | Maintains ERDs, dictionaries, ADRs, runbooks, migration notes, ownership, and operational documentation. | docs, erd, adr |
| `evidence-manager` | Hashes, stores, links, and retains plans, diffs, tests, approvals, and operational evidence. | artifacts, provenance, audit |
| `policy-enforcer` | Evaluates project scope, environment, SQL classification, permissions, approvals, secret leases, and production prohibitions. | opa, authorization, guardrails |

## Delegation contract

Every specialist request includes run ID, scope tuple, database profile, requirement summary, allowed resources, allowed tools, output schema, time/token budget, sensitivity labels, and approval state. Every response includes conclusions, assumptions, evidence references, uncertainties, risks, proposed actions, and a confidence level.

## Parallelism

The supervisor may parallelize data modeling, dependency discovery, security analysis, test design, and observability review after estate discovery. It must serialize steps that can invalidate one another: schema design before migration authoring, migration authoring before disposable execution, backfill design before performance validation, and release approval before any shared-environment action.

## Conflict resolution

- Policy-enforcer denial always wins.
- Database-platform compatibility overrides generic SQL advice.
- Security, data-loss, and availability concerns block implementation until resolved or formally accepted.
- Measured plan and workload evidence outranks stylistic tuning preferences.
- The supervisor records rejected alternatives and the final decision.

## Context minimization

Sensitive rows, bind values, query text, usernames, hostnames, and object names are redacted or tokenized where possible. Specialists receive only objects and metadata needed for their responsibility. Raw credentials are never included.
