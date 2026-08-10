# Java Developer Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Java Developer  
Organization context: Bitbucket repositories, Jira work management, relational databases, playground/QA/production environments, CI/CD, Microsoft Teams, Angular frontends, and Java/Python backend systems.

## Purpose

This pack defines everything an enterprise Java development agent needs to operate safely:

- Daily Java engineering task catalog
- Project, repository, database, API, messaging, environment, and documentation access
- Supervisor and specialist sub-agent design
- Version-aware Java, Spring, Jakarta, testing, persistence, build, and JVM skills
- MCP servers, atomic tools, runtime plugins, and vendor adapters
- Code, contract, migration, test, evidence, review, and release artifacts
- Stateful orchestration workflows
- Workload identity, key-vault integration, and short-lived credentials
- Human approvals, repository controls, and production guardrails
- Observability, audit, evaluation, runtime isolation, and rollout controls

## Core design rule

The agent never receives a universal repository token, production credential, raw database password, signing key, or raw vault secret. Every run is bound to:

`organization -> project -> repository -> module -> branch -> base commit -> JDK/framework profile -> environment -> requester -> Jira item -> approved action -> allowed tools -> patch/evidence -> audit record`

## Supported execution profiles

| Profile | Typical repositories | Detection and behavior |
|---|---|---|
| Spring Boot service | REST APIs, microservices, internal platform services | Resolve JDK, Spring Boot, Spring Framework, dependency BOM, servlet/reactive stack, database and build conventions before editing |
| Spring MVC monolith | Multi-module enterprise applications | Preserve module boundaries, packaging, security filters, transaction conventions and application topology |
| Jakarta EE application | WAR/EAR applications on enterprise application servers | Resolve Jakarta/Java EE namespace, specification level, server version, descriptors and classloading constraints |
| Messaging and integration service | Kafka, JMS, RabbitMQ, event-driven services | Require schema compatibility, idempotency, retries, dead-letter handling, observability and replay safety |
| Batch and scheduler | Spring Batch, Quartz, scheduled jobs | Require restartability, checkpoints, locking, reconciliation and bounded resource use |
| Shared Java library or SDK | Internal starters, clients, domain libraries | Preserve public APIs and binary/source compatibility; require approval before artifact publication |
| Java CLI or operations tool | Migration tools, diagnostics, support utilities | Require dry-run, idempotency, safe exit codes, bounded filesystem/network access and approval for mutations |
| Java MCP server | MCP services and enterprise adapters | Separate resources, prompts and tools; enforce explicit schemas, scopes, consent, isolation and auditability |

## Organization project templates

- **PCC:** Angular 12 frontend with Java backend; legacy-compatible profile until repository discovery confirms exact JDK/framework versions.
- **SOP:** Angular 15 frontend with Java backend; service or monolith profile selected from repository evidence.
- **DataBridge:** AngularJS frontend with Java backend; conservative maintenance and modernization-planning mode.
- **Environments:** playground, QA and production. Production is read-only for the autonomous agent.

## Recommended first implementation

1. User selects project, repository, branch, Jira item, and target environment.
2. Agent detects JDK version, source/target/release level, JVM vendor, framework, build system, modules, application server, persistence stack, messaging dependencies, tests, and repository rules.
3. Agent reads story context, code, contracts, schema history, architecture decisions, incidents, and related pull requests.
4. Agent produces an impact analysis, implementation plan, compatibility matrix, risk score, and required approvals.
5. After required plan approval, the agent creates a patch in an isolated workspace pinned to the base commit.
6. Deterministic gates run: compile, format, static analysis, unit/integration/contract tests, migration checks, security scans, packaging, SBOM/provenance, and approved environment validation.
7. Agent creates a change manifest, evidence bundle, pull-request draft, release-readiness report, and operational notes.
8. Human approval is required for commit, push, Jira changes, PR creation, pipeline reruns, non-production mutations, migration execution, artifact publication, and deployment requests.

Production deployment, merge, signing-key access, infrastructure mutation, artifact publication, and production database or messaging mutations remain outside autonomous scope.

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable workflow definitions |
| `schemas/` | JSON contracts for agent outputs |
| `templates/` | Reusable Java engineering outputs |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |

## Important assumptions to confirm during onboarding

- Exact JDK versions, vendors, support policies, JVM flags and application-server constraints.
- Spring Boot/Spring Framework/Jakarta EE versions and whether code still uses `javax.*` or `jakarta.*` APIs.
- Maven or Gradle wrapper policy, parent POMs, BOMs, convention plugins, private repositories and proxy settings.
- Database engines, JPA provider, migration tools, read replicas and approved diagnostic access.
- Kafka/JMS/RabbitMQ, schema registry, cache, scheduler and external service dependencies.
- CI/CD platform, container runtime, artifact registry, deployment model, runtime topology and signing process.
- Identity provider, preferred secret manager, workload identity and credential-broker design.
- Branch protections, code owners, signed-commit rules, bot identity policy and quality gates.
