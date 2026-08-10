# Diagram Input Specification

## Architecture diagram layers

1. Users: Data Engineer, Data Architect, Product Owner, QA, DevOps, Support, Security, Data Steward.
2. Entry: Agent UI/API, Jira request, pull request, pipeline alert, data incident.
3. Control plane: Supervisor, workflow state, policy engine, approval service, capability broker, registries, evidence store.
4. Specialist agents: context, source, contracts, architecture, modeling, batch, streaming, CDC, quality, reconciliation, performance, security, lineage, release, incident, review.
5. MCP/adapters: Atlassian, Bitbucket, Spark, source SQL, streaming, Airflow, catalog, table formats, quality, lineage, observability, vault.
6. Engineering systems: repositories, CI/CD, artifact registry, notebooks, Spark clusters, orchestrator.
7. Data systems: source databases/APIs/files, Kafka/event platform, object storage, lakehouse catalog, warehouse, consumer systems.
8. Trust boundaries: model context, isolated workers, trusted adapters, non-production, production read-only, deterministic production execution.
9. Evidence: contracts, mappings, tests, quality, reconciliation, plans, lineage, approvals, hashes.

## End-to-end flow

`Request → Scope and Authorization → Context → Source Profile → Contract → Architecture and Model → Implementation → Tests → Quality and Reconciliation → Performance and Security → Independent Review → Approval → CI/CD → Authorized Execution → Read-only Validation → Evidence → Feedback`

## Production mutation branch

`Agent proposal → Immutable production action request → OPA evaluation → Independent approval → Authorized deterministic pipeline/operator → Stop-condition enforcement → Read-only verification → Evidence archive`

## Mermaid node IDs

Use stable IDs such as `UI`, `SUP`, `OPA`, `CAP`, `CTX`, `SRC`, `CONTRACT`, `ARCH`, `BATCH`, `STREAM`, `QUALITY`, `PERF`, `LINEAGE`, `REVIEW`, `CICD`, `SPARK_QA`, `SPARK_PROD_RO`, `PROD_EXEC`, and `EVIDENCE`.
