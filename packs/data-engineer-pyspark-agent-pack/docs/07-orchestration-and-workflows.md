# Orchestration and Workflows

## Common state machine

`Intake → Authorization → Context → Design → Implementation → Deterministic Validation → Independent Review → Approval → Execution by trusted system → Read-only Verification → Evidence and Learning`

## story-to-data-pipeline-design

**Trigger:** New data product, story, integration, report, or pipeline change

### Steps

1. **authorize — policy-enforcer-agent:** verify project, data, source, environment, privacy, and evidence scope
2. **context — data-context-agent:** retrieve business, domain, source, consumer, repository, platform, and ownership context
3. **sources — source-discovery-agent:** profile approved sources and document constraints and evidence gaps
4. **contracts — data-contract-agent:** draft schema, semantics, quality, service level, and compatibility contract
5. **architecture — data-architecture-agent:** design batch, streaming, storage, compute, orchestration, quality, lineage, and security architecture
6. **model — data-modeling-agent:** define grain, keys, history, logical model, and physical dataset design
7. **quality — data-quality-agent:** define quality and reconciliation requirements
8. **review — data-engineering-independent-reviewer-agent:** challenge correctness, operability, performance, security, and consumer impact
9. **publish — data-engineer-pyspark-supervisor:** prepare approval-controlled data-product and pipeline design package

**Outputs:** data-product-brief, source-system-inventory, data-contract, source-to-target-mapping, pipeline-architecture-design, data-quality-specification

**Failure behavior:** record evidence gaps and block implementation when ownership, semantics, contract, or source behavior is unresolved

## batch-pipeline-implementation

**Trigger:** Approved batch pipeline design or batch defect

### Steps

1. **authorize — policy-enforcer-agent:** verify repository, source, sink, package, and environment scope
2. **compatibility — data-platform-compatibility-agent:** resolve Python, Spark, JVM, connectors, table formats, and repository conventions
3. **implement — pyspark-batch-agent:** create isolated PySpark and Spark SQL changes
4. **rules — transformation-rules-agent:** validate business rules and source-to-target mapping
5. **tests — data-testing-agent:** run unit, contract, integration, quality, regression, and scale tests
6. **quality — reconciliation-agent:** validate controls, totals, keys, and expected outputs
7. **performance — spark-performance-agent:** review plans, shuffles, joins, skew, partitions, runtime, and cost
8. **governance — data-security-governance-agent:** review classification, access, masking, retention, and supply-chain evidence
9. **review — data-engineering-independent-reviewer-agent:** independently review correctness and release readiness
10. **release — pipeline-release-agent:** prepare approval-controlled commit, pull request, and release evidence bundle

**Outputs:** batch-job-specification, data-test-plan, data-quality-report, spark-performance-report, release-evidence-bundle

**Failure behavior:** preserve evidence, avoid partial publication, and return to implementation with bounded findings

## streaming-cdc-implementation

**Trigger:** Approved streaming, event, or CDC change

### Steps

1. **authorize — policy-enforcer-agent:** verify streaming scope, data classification, topic, checkpoint, sink, and execution boundary
2. **contract — data-contract-agent:** validate event and schema compatibility and consumer ownership
3. **cdc — ingestion-cdc-agent:** design keys, ordering, operations, deduplication, replay, and reconciliation
4. **streaming — structured-streaming-agent:** implement watermarks, state, triggers, checkpoints, sources, and sinks
5. **table — lakehouse-table-agent:** validate sink table, concurrency, evolution, retention, and recovery behavior
6. **tests — data-testing-agent:** run late, duplicate, restart, replay, schema, state, and sink-failure tests
7. **reliability — pipeline-reliability-agent:** review restartability, checkpoint safety, monitoring, and stop conditions
8. **review — data-engineering-independent-reviewer-agent:** challenge correctness, state growth, replay safety, and operational readiness
9. **release — pipeline-release-agent:** prepare approval-controlled streaming candidate and runbook

**Outputs:** streaming-job-specification, cdc-ingestion-specification, data-contract, pipeline-runbook, release-evidence-bundle

**Failure behavior:** block release on incompatible schemas, unsafe checkpoints, unbounded state, or unverified replay behavior

## data-quality-backfill-remediation

**Trigger:** Data quality incident, reconciliation failure, missing partition, or approved historical correction

### Steps

1. **authorize — policy-enforcer-agent:** verify incident, data, partition, time, consumer, and mutation scope
2. **diagnose — data-incident-backfill-agent:** identify affected data, cause hypotheses, consumer impact, and repair options
3. **quality — data-quality-agent:** quantify failed rules, exceptions, and source versus pipeline responsibility
4. **reconcile — reconciliation-agent:** establish source-of-truth controls and expected corrected results
5. **plan — data-incident-backfill-agent:** create bounded backfill or repair plan with stop, rollback, and verification controls
6. **capacity — spark-performance-agent:** estimate source load, compute, storage, duration, concurrency, and cost
7. **security — data-security-governance-agent:** review privacy, access, retention, and evidence handling
8. **review — data-engineering-independent-reviewer-agent:** independently challenge scope, source of truth, mutation safety, and recovery
9. **request — data-engineer-pyspark-supervisor:** prepare immutable approval-bound production action request
10. **verify — data-incident-backfill-agent:** perform bounded read-only post-execution validation and closeout evidence

**Outputs:** data-incident-report, backfill-plan, reconciliation-report, production-action-request, data-quality-report

**Failure behavior:** stop on control mismatch, unexpected scope, source overload, consumer harm, privacy risk, or triggered stop condition

## release-and-production-operations

**Trigger:** Approved data pipeline release candidate

### Steps

1. **authorize — policy-enforcer-agent:** verify candidate, targets, approvals, separation of duties, and release window
2. **candidate — pipeline-release-agent:** verify immutable artifacts, hashes, dependencies, configuration, and provenance
3. **contracts — data-contract-agent:** verify approved contract and schema compatibility
4. **quality — data-quality-agent:** verify candidate-bound test, quality, and reconciliation evidence
5. **performance — spark-performance-agent:** verify performance, capacity, and cost evidence
6. **operations — pipeline-reliability-agent:** verify schedule, monitoring, runbook, recovery, rollback, and support readiness
7. **review — data-engineering-independent-reviewer-agent:** prepare independent go, conditional-go, or no-go recommendation
8. **request — data-engineer-pyspark-supervisor:** prepare production action bundle for human decision and deterministic execution
9. **verify — data-observability-agent:** read-only verification of deployment, first runs, freshness, quality, and consumers
10. **close — evidence-management-agent:** archive immutable release, approval, run, and validation evidence

**Outputs:** deployment-plan, rollback-and-recovery-plan, release-evidence-bundle, production-action-request, pipeline-runbook

**Failure behavior:** block execution or trigger approved rollback path when identity, evidence, quality, compatibility, capacity, or recovery gates fail

## Concurrency and convergence

Independent source, contract, quality, performance, security, and consumer-impact checks may run in parallel. The supervisor converges only after evidence identity and scope are verified.

## Approval behavior

An approval binds to the exact payload hash and expires. Any material change to data scope, partitions, code, configuration, contract, target, or action invalidates the approval.
