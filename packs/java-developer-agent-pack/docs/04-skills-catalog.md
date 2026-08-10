# Skills Catalog

Total skills: 120. Skills are reusable capability descriptions. A skill is not a credential, MCP server, plugin or autonomous agent. Each execution must still pass scope and policy checks.

## Work intake and context

### `java.jira-context`

Read and normalize Jira story, bug, subtasks, comments, links and acceptance criteria.

### `java.requirement-decomposition`

Convert requirements into testable implementation obligations.

### `java.traceability-map`

Map acceptance criteria to code changes, tests and evidence.

### `java.risk-classification`

Score data, security, compatibility, migration and operational risk.

### `java.change-scope`

Define allowed modules, packages, files and environments.

## Repository and architecture

### `java.repo-profile`

Detect Maven/Gradle modules, source sets, framework, conventions and commands.

### `java.module-graph`

Build module and dependency graph.

### `java.symbol-search`

Find classes, interfaces, records, annotations, beans and usages.

### `java.call-flow`

Trace controller-to-service-to-repository and asynchronous flows.

### `java.configuration-map`

Map profiles, properties, YAML, environment variables and secret references.

### `java.architecture-impact`

Assess bounded contexts, layering, coupling and blast radius.

### `java.git-history`

Inspect relevant commits, blame, pull requests and regressions.

## Java language and JVM

### `java.version-detection`

Resolve JDK, source, target, release and runtime constraints.

### `java.language-compatibility`

Use only language features supported by the repository.

### `java.records-sealed-patterns`

Apply records, sealed types and pattern matching only when compatible.

### `java.generics`

Design type-safe generics and variance boundaries.

### `java.nullability`

Model nullability, Optional usage and validation boundaries.

### `java.exceptions`

Design checked/unchecked exceptions and stable error translation.

### `java.collections-streams`

Use collections and streams without hidden complexity or side effects.

### `java.immutability`

Prefer immutable value objects and safe publication.

### `java.serialization`

Control JSON/binary serialization, compatibility and unsafe polymorphism.

### `java.jvm-toolchains`

Select pinned JDK toolchains for build and test matrices.

## Spring, Jakarta and application frameworks

### `java.spring-bean-design`

Design component boundaries, injection and lifecycle.

### `java.spring-configuration`

Implement typed configuration and profile-safe defaults.

### `java.spring-web`

Implement Spring MVC/WebFlux endpoints and filters.

### `java.spring-security`

Implement authentication and authorization within repository conventions.

### `java.spring-validation`

Apply Bean Validation and consistent error responses.

### `java.spring-actuator`

Configure health, readiness, metrics and safe management endpoints.

### `java.jakarta-rest`

Implement Jakarta REST resources and providers.

### `java.jakarta-cdi`

Implement CDI scopes, qualifiers and interceptors.

### `java.application-server`

Respect application-server packaging, descriptors and classloading constraints.

### `java.framework-versioning`

Load version-matched Spring/Jakarta/vendor documentation.

## Domain and API implementation

### `java.domain-modeling`

Implement entities, aggregates, value objects and invariants.

### `java.service-layer`

Implement application services and transaction boundaries.

### `java.endpoint-design`

Design REST/RPC operations, status codes and pagination.

### `java.openapi-contract`

Validate and update OpenAPI contracts.

### `java.request-validation`

Validate request shape, semantics and authorization context.

### `java.error-contracts`

Produce stable machine-readable errors and correlation identifiers.

### `java.backward-compatibility`

Preserve consumer compatibility and deprecation paths.

### `java.idempotency`

Implement idempotency keys and duplicate suppression.

### `java.client-integration`

Implement resilient HTTP/RPC clients with timeouts and observability.

## Persistence and database

### `java.jdbc`

Implement safe parameterized JDBC and resource management.

### `java.jpa-mapping`

Design entities, relationships, fetching and cascades.

### `java.hibernate-query`

Implement JPQL, Criteria or native queries with bounded loading.

### `java.spring-data`

Implement repository queries, projections and specifications.

### `java.transaction-design`

Define atomicity, isolation, retries and propagation.

### `java.n-plus-one`

Detect N+1 queries and fetch-plan issues.

### `java.migration-draft`

Draft Flyway/Liquibase migrations and rollback/forward plans.

### `java.schema-compatibility`

Assess zero-downtime and mixed-version schema compatibility.

### `java.query-plan`

Review EXPLAIN plans through read-only database access.

### `java.data-privacy`

Protect sensitive fields, retention and audit requirements.

## Messaging, batch and scheduling

### `java.kafka`

Implement Kafka producers, consumers, schemas and offset behavior.

### `java.jms-rabbitmq`

Implement JMS/RabbitMQ messaging and acknowledgement behavior.

### `java.event-contract`

Version event schemas and compatibility rules.

### `java.retry-dead-letter`

Implement bounded retries, backoff and dead-letter handling.

### `java.outbox-inbox`

Apply transactional outbox/inbox patterns where justified.

### `java.spring-batch`

Implement chunk/tasklet jobs, checkpoints and restartability.

### `java.scheduler`

Implement Quartz or scheduled jobs with locking and observability.

### `java.reconciliation`

Create reconciliation and replay-safe workflows.

## Concurrency and resilience

### `java.executor-design`

Configure executors, queue bounds and rejection policies.

### `java.virtual-threads`

Use virtual threads only on compatible JDK/framework stacks.

### `java.completable-future`

Compose asynchronous stages with explicit failure and cancellation.

### `java.reactive-streams`

Implement backpressure-aware Reactor or reactive flows.

### `java.thread-safety`

Review shared state, locking, atomicity and safe publication.

### `java.timeouts-retries`

Apply end-to-end time budgets and bounded retries.

### `java.circuit-breaker`

Configure resilience patterns with measurable thresholds.

### `java.graceful-shutdown`

Drain traffic and stop workers safely.

## Testing and quality

### `java.junit-unit`

Create focused JUnit unit tests.

### `java.junit-parameterized`

Create parameterized and dynamic tests.

### `java.mockito`

Use mocks and spies at stable boundaries without overspecification.

### `java.spring-test`

Create Spring slice and context tests.

### `java.testcontainers`

Create disposable integration dependencies with Testcontainers.

### `java.contract-test`

Create consumer/provider or OpenAPI contract tests.

### `java.database-test`

Test transactions, constraints and migrations against real engines.

### `java.messaging-test`

Test producer/consumer behavior and failure paths.

### `java.mutation-test`

Use mutation testing where configured to assess test strength.

### `java.coverage`

Evaluate coverage as evidence, not a correctness substitute.

### `java.flaky-test`

Diagnose order, time, concurrency and environment-dependent tests.

### `java.test-data`

Create deterministic fixtures, builders and cleanup.

## Build, packaging and dependencies

### `java.maven`

Run and modify Maven builds while preserving parent/BOM conventions.

### `java.gradle`

Run and modify Gradle builds while preserving wrapper and convention plugins.

### `java.dependency-analysis`

Resolve dependency trees, convergence and classpath conflicts.

### `java.bom-management`

Use approved BOMs and dependency-management boundaries.

### `java.plugin-management`

Pin and configure build plugins reproducibly.

### `java.package-jar-war`

Build executable JAR, library JAR or WAR according to deployment model.

### `java.reproducible-build`

Produce reproducible builds and verify checksums.

### `java.sbom`

Generate and attach SBOM and provenance metadata.

### `java.license-policy`

Check dependency licenses and organizational policy.

### `java.container-image`

Build rootless minimal JVM images and scan them.

## Security

### `java.authn-authz`

Verify authentication and authorization at every trust boundary.

### `java.input-security`

Prevent injection, path traversal and unsafe expression evaluation.

### `java.deserialization-security`

Restrict polymorphic and native deserialization.

### `java.crypto`

Use approved cryptographic APIs and key handling.

### `java.secret-handling`

Use references and brokered credentials; never log secrets.

### `java.dependency-vulnerability`

Scan dependencies and assess reachable risk.

### `java.sast`

Run repository-approved static analysis.

### `java.sensitive-logging`

Prevent tokens, personal data and secrets in logs.

### `java.ssrf-egress`

Validate outbound destinations and enforce egress policy.

### `java.threat-model`

Produce lightweight threat analysis for risky changes.

## Performance, reliability and observability

### `java.jfr-profile`

Capture and analyze approved Java Flight Recorder profiles.

### `java.gc-analysis`

Review allocation, heap and garbage-collection behavior.

### `java.connection-pools`

Configure JDBC/HTTP pools with bounded timeouts.

### `java.cache-design`

Implement cache keys, expiry, invalidation and consistency.

### `java.load-test`

Run bounded load tests in approved environments.

### `java.micrometer`

Implement metrics using repository conventions.

### `java.opentelemetry`

Implement traces and context propagation.

### `java.structured-logging`

Create searchable structured logs with correlation IDs.

### `java.health-readiness`

Implement accurate liveness/readiness/dependency health.

### `java.slo-evidence`

Map changes to latency, error and availability objectives.

## Upgrade, review and release

### `java.jdk-upgrade`

Plan source/target/runtime upgrade with compatibility matrix.

### `java.spring-upgrade`

Plan Spring Framework/Boot upgrade and migration steps.

### `java.jakarta-migration`

Plan javax-to-jakarta namespace and application-server migration.

### `java.dependency-upgrade`

Upgrade dependencies with release-note and behavior review.

### `java.code-review`

Review correctness, design, tests, security and maintainability.

### `java.change-manifest`

Produce file, symbol, contract, dependency and migration manifest.

### `java.pr-draft`

Create traceable pull-request description.

### `java.release-notes`

Create user-facing and operational release notes.

### `java.rollback-plan`

Create rollback, roll-forward and feature-flag plan.

### `java.jira-update`

Draft Jira comments and status changes for approval.

### `java.teams-update`

Draft Microsoft Teams engineering updates for approval.
