# Project Access and Environment Model

## Scope tuple

Every run is authorized against an immutable tuple:

`tenant / project / repository / module / branch / base-commit / jira-item / environment / requester / action-set / expiration`

A tool call is denied when it cannot prove that it belongs to the tuple. The agent cannot switch repositories, branches, modules or environments mid-run without a new authorization decision.

## Required project access

### Bitbucket

Read access may include repository metadata, permitted branches, source, commit history, pull requests, CODEOWNERS, pipeline definitions and artifacts. Write operations are separated into commit, push, pull-request creation, comment and pipeline trigger capabilities. Each requires an approval bound to the exact payload hash.

### Jira and Confluence

The context adapter reads assigned work, acceptance criteria, links, comments, designs and architecture decisions. Jira create/edit/transition/comment operations are approval-controlled. The language model receives normalized content, not an unrestricted Atlassian token.

### Database

Default access is metadata plus bounded, parameterized SELECT and approved EXPLAIN on non-production or designated read replicas. Database writes, DDL and migration execution are separate capabilities. Production writes are prohibited for the autonomous agent.

### Messaging and integration systems

Kafka/JMS/RabbitMQ access defaults to metadata: topic/queue definitions, schemas, consumer groups, lag and dead-letter counts. Publishing, replaying, purging or changing offsets requires explicit environment-scoped approval and is prohibited in production autonomous runs.

### Artifact and package repositories

The agent may resolve metadata and download dependencies only from approved Maven repositories. Artifact publication, signing and promotion are outside autonomous scope unless delegated to a separate release process.

### CI/CD and runtime environments

The agent may read pipeline definitions, logs, test results, deployment metadata and health signals. Triggering pipelines or non-production deployments requires approval. Production deployment is not granted to the development agent.

## Environment classes

| Environment | Default posture | Typical allowed operations |
|---|---|---|
| Local sandbox | Isolated and disposable | Workspace writes, compilation, tests, local containers and synthetic data |
| Playground | Controlled non-production | Read, approved test data, approved service calls, bounded smoke/integration tests |
| QA | Controlled shared validation | Read, approved test execution, evidence collection and narrowly approved mutations |
| Production | Observe only | Metadata, logs, metrics, traces, health and approved read-only diagnostics |

## Repository workspace isolation

Each run receives an ephemeral workspace created from the approved base commit. It has CPU, memory, disk, process and network limits. The runtime blocks writes outside allowlisted paths, denies arbitrary shell commands, prevents access to host credentials and destroys the workspace after evidence is retained.

## Java-specific inventory captured at onboarding

- JDK vendor, distribution and supported versions
- `maven.compiler.release`, source/target values or Gradle toolchains
- Maven Wrapper or Gradle Wrapper versions
- Parent POM, BOM and convention-plugin ownership
- Spring Boot/Framework, Jakarta EE, Hibernate and application-server versions
- Packaging: executable JAR, library JAR, WAR or EAR
- Databases, migration tools and connection pools
- Messaging brokers, schema registries, caches and schedulers
- Test, static-analysis, coverage and mutation-test tools
- Artifact repositories, signing and provenance process
- Runtime topology, JVM flags, memory limits and observability stack

## Project templates

PCC, SOP and DataBridge are represented as templates, not assumptions. Discovery must fill exact repositories, backend modules, JDKs, framework versions, database schemas, branch models and environment endpoints before the agent can perform implementation work.
