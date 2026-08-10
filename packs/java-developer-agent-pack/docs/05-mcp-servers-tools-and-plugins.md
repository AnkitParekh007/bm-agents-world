# MCP Servers, Tools and Plugins

## Terminology

- **Skill:** reusable reasoning and operating procedure, such as reviewing a JPA fetch plan.
- **Atomic tool:** narrow executable function with a typed input/output contract, such as `maven.test(module, selectors)`.
- **MCP server:** protocol boundary exposing resources, prompts or tools.
- **Plugin/adapter:** organization-owned implementation that translates a generic capability to Bitbucket, Jira, Maven, Gradle, a vault or another vendor system.
- **Artifact:** immutable or versioned output used for workflow state, review and audit.

These concepts must remain separate so permissions can be applied to executable actions rather than to broad natural-language labels.

## Recommended MCP servers

### `atlassian-context`

**Purpose:** Jira, Confluence and Bitbucket resources plus approval-controlled writes.  
**Default mode:** `read-mostly`.

### `workspace-git`

**Purpose:** Ephemeral filesystem, semantic search, diff, patch, Git status and allowlisted commands.  
**Default mode:** `sandbox-write`.

### `java-docs`

**Purpose:** Version-matched Java SE, JDK tool and JVM resources.  
**Default mode:** `read-only`.

### `framework-docs`

**Purpose:** Version-matched Spring, Jakarta, Hibernate and vendor documentation.  
**Default mode:** `read-only`.

### `openapi-contracts`

**Purpose:** OpenAPI resources, validation, compatibility and workspace generation.  
**Default mode:** `read-generate`.

### `database-metadata`

**Purpose:** Schema, migration history, EXPLAIN and bounded SELECT.  
**Default mode:** `read-only`.

### `messaging-metadata`

**Purpose:** Kafka/JMS/RabbitMQ topics, schemas, consumer groups and dead-letter metadata.  
**Default mode:** `observe`.

### `package-registry`

**Purpose:** Approved Maven repositories, metadata, provenance and version resolution.  
**Default mode:** `read-only`.

### `ci-cd`

**Purpose:** Pipeline definitions, logs, test reports, artifacts and approved triggers.  
**Default mode:** `read-mostly`.

### `container-build`

**Purpose:** Isolated image build, SBOM, provenance and image scanning.  
**Default mode:** `sandbox`.

### `observability`

**Purpose:** Logs, metrics, traces, JFR artifacts, dashboards and incidents.  
**Default mode:** `read-only`.

### `artifact-evidence`

**Purpose:** Immutable artifact storage, hashes, retention and retrieval.  
**Default mode:** `append-read`.

### `collaboration`

**Purpose:** Teams and Jira update drafts and approved publication.  
**Default mode:** `approval-write`.

### `secret-broker`

**Purpose:** Capability lease requests without exposing raw secret values.  
**Default mode:** `broker-only`.

### `policy`

**Purpose:** OPA decisions, scope checks and approval verification.  
**Default mode:** `mandatory`.

## Representative atomic tools

### Workspace and Git

- `workspace.read_file`, `workspace.search`, `workspace.apply_patch`, `workspace.list_changes`
- `git.status`, `git.diff`, `git.log`, `git.blame`
- Approval-controlled: `git.commit`, `git.push`, `bitbucket.pull_request.create`

### Java and build

- `java.profile.detect`, `java.compile`, `java.javadoc`, `java.jdeps`, `java.jlink.plan`
- `maven.effective_pom`, `maven.dependency_tree`, `maven.test`, `maven.verify`
- `gradle.tasks`, `gradle.dependencies`, `gradle.test`, `gradle.build`
- Commands are selected from repository configuration, not generated as unrestricted shell text.

### Quality and test

- `junit.run`, `testcontainers.run`, `coverage.read`, `mutation_test.run`
- `static_analysis.run`, `dependency_scan.run`, `secret_scan.run`
- `openapi.validate`, `openapi.diff`, `migration.validate`

### Runtime evidence

- `logs.search`, `metrics.query`, `traces.search`, `jfr.inspect`
- `database.schema`, `database.select_bounded`, `database.explain`
- `messaging.describe`, `schema_registry.read`, `consumer_group.inspect`

## Plugin selection rules

1. Prefer official or organization-owned adapters.
2. Pin versions and verify provenance.
3. Review community server source before deployment.
4. Run connectors out of process with least privilege and egress restrictions.
5. Keep write tools disabled until policy grants a capability lease.
6. Return sanitized structured data; do not expose raw tokens, passwords or signing keys.
7. Log tool identity, input hash, authorization decision, result hash and latency.

## Plugins in this pack

- **`bitbucket-adapter`** — Bitbucket Cloud/Data Center repository, pull request and pipeline operations.
- **`jira-confluence-adapter`** — Atlassian context and controlled writes.
- **`java-profile-detector`** — JDK/framework/build/test/application-server detection.
- **`jdk-toolchain-runner`** — Isolated JDK selection, compilation and Java tool execution.
- **`maven-adapter`** — Maven wrapper, lifecycle, dependency and plugin operations.
- **`gradle-adapter`** — Gradle wrapper, tasks, dependency and build-scan operations.
- **`junit-adapter`** — JUnit test selection, execution and structured evidence.
- **`testcontainers-adapter`** — Disposable integration infrastructure with policy limits.
- **`static-analysis-adapter`** — Checkstyle/SpotBugs/PMD/Error Prone/Sonar mapping.
- **`security-scanner-adapter`** — SAST, dependency, secret and container scanning.
- **`database-adapter`** — Dialect-aware schema and read-only diagnostic access.
- **`migration-adapter`** — Flyway/Liquibase migration inspection and sandbox execution.
- **`openapi-adapter`** — OpenAPI validation, diff and contract generation.
- **`messaging-adapter`** — Kafka/JMS/RabbitMQ metadata and sandbox test harness.
- **`jfr-observability-adapter`** — JFR, logs, metrics, traces and profile retrieval.
- **`container-adapter`** — Rootless image build, SBOM and provenance generation.
- **`secret-manager-adapter`** — Vault, cloud key manager or enterprise secret manager.
- **`approval-adapter`** — Payload-bound, expiring human approvals.
- **`artifact-adapter`** — Immutable evidence storage and retrieval.
- **`teams-adapter`** — Approved collaboration publication.

## Capability lifecycle

`discover -> authorize -> lease -> invoke -> validate -> store evidence -> revoke`

Leases are short-lived and bound to run, tool, target, action, environment and payload. The model can request a lease but cannot mint or expand one.
