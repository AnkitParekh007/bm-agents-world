# Agent and Sub-Agent Architecture

## Design principles

- One supervisor owns workflow state; specialists do not directly call each other.
- Specialists receive the minimum context and capabilities required for their step.
- Deterministic tools compile, test, scan and package; the model interprets results but cannot replace them.
- All outputs follow schemas and include evidence references.
- High-risk findings can stop the workflow or require an approval checkpoint.

## Agent registry

### java-developer-supervisor

**Purpose:** Coordinates bounded Java engineering workflows, selects specialists, enforces state and approval rules.  
**Primary concerns:** orchestration, risk, evidence.

### story-context

**Purpose:** Reads Jira, Confluence, linked designs, incidents, API contracts and acceptance criteria.  
**Primary concerns:** jira, requirements, traceability.

### repository-context

**Purpose:** Profiles modules, build files, ownership, architecture, conventions and change history.  
**Primary concerns:** bitbucket, git, code-search.

### architecture-impact

**Purpose:** Maps domain boundaries, dependencies, data flows, compatibility and blast radius.  
**Primary concerns:** architecture, dependency-analysis, risk.

### java-runtime-compatibility

**Purpose:** Resolves JDK, language level, bytecode target, JVM vendor, framework and library compatibility.  
**Primary concerns:** jdk, compatibility, toolchains.

### domain-implementation

**Purpose:** Implements domain rules, services, value objects and application-layer behavior.  
**Primary concerns:** java, ddd, clean-code.

### api-service

**Purpose:** Implements REST, GraphQL or RPC endpoints, validation, errors and backward-compatible contracts.  
**Primary concerns:** spring-web, jakarta-rest, openapi.

### persistence-data

**Purpose:** Implements JDBC/JPA/Hibernate/Spring Data access, transactions, queries and migration drafts.  
**Primary concerns:** sql, jpa, hibernate, transactions.

### messaging-integration

**Purpose:** Implements Kafka/JMS/RabbitMQ/event integrations, retries, idempotency and schemas.  
**Primary concerns:** messaging, events, resilience.

### batch-scheduler

**Purpose:** Implements Spring Batch, Quartz, scheduled jobs and restart-safe processing.  
**Primary concerns:** batch, scheduler, restartability.

### concurrency-runtime

**Purpose:** Reviews threads, executors, virtual threads, reactive flows, locks, timeouts and cancellation.  
**Primary concerns:** concurrency, reactive, loom.

### test-engineer

**Purpose:** Creates and maintains JUnit, Mockito, integration, contract, mutation and Testcontainers tests.  
**Primary concerns:** junit, mockito, testcontainers.

### security-reviewer

**Purpose:** Reviews authentication, authorization, input handling, deserialization, secrets and dependency risk.  
**Primary concerns:** owasp, sast, threat-model.

### performance-reliability

**Purpose:** Reviews latency, allocation, GC, connection pools, caching, resilience and load behavior.  
**Primary concerns:** jfr, jmc, profiling, resilience.

### dependency-build

**Purpose:** Maintains Maven/Gradle builds, BOMs, plugins, reproducibility, SBOM and dependency policy.  
**Primary concerns:** maven, gradle, supply-chain.

### migration-modernization

**Purpose:** Plans JDK, Spring Boot, Jakarta namespace, framework and application-server upgrades.  
**Primary concerns:** upgrade, migration, compatibility.

### code-review

**Purpose:** Performs semantic review for correctness, maintainability, architecture and test sufficiency.  
**Primary concerns:** review, quality, maintainability.

### build-pipeline

**Purpose:** Runs deterministic compile, format, static-analysis, test, package, scan and container gates.  
**Primary concerns:** ci, quality-gates, artifacts.

### observability-operations

**Purpose:** Implements and reviews logs, metrics, traces, health checks, runbooks and incident diagnostics.  
**Primary concerns:** opentelemetry, micrometer, operations.

### documentation

**Purpose:** Maintains ADRs, API docs, Javadocs, service guides, runbooks and change notes.  
**Primary concerns:** docs, adr, javadoc.

### pr-release

**Purpose:** Prepares change manifests, pull-request drafts, release notes and deployment-readiness evidence.  
**Primary concerns:** bitbucket, release, traceability.

### evidence-manager

**Purpose:** Hashes, stores, links and retains build, test, scan and review evidence.  
**Primary concerns:** artifacts, provenance, audit.

### policy-enforcer

**Purpose:** Evaluates project scope, permissions, approvals, secret leases and production prohibitions.  
**Primary concerns:** opa, authorization, guardrails.

## Supervisor state

The supervisor stores run ID, scope tuple, base commit, repository profile, selected workflow, step status, artifacts, evidence hashes, policy decisions, approvals and expiry. It never stores raw credentials.

## Delegation envelope

Each specialist receives:

- run and step identifiers
- approved project/repository/module/environment
- exact input artifact references
- allowlisted skills and tools
- output schema
- token, time and tool-call budget
- forbidden actions
- evidence and citation requirements

## Conflict handling

When specialists disagree, the supervisor requests deterministic evidence, narrows the question, and records competing conclusions. Security, data-loss, compatibility and production-risk objections block publication until resolved or explicitly accepted by an authorized human.
