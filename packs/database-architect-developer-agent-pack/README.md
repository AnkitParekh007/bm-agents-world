# Database Architect / Developer Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Database Architect / Database Developer  
Organization context: Bitbucket repositories, Jira work management, relational databases, playground/QA/production environments, CI/CD, Microsoft Teams, Angular frontends, Java/Python services, data pipelines, and enterprise security controls.

## Purpose

This pack defines the access, skills, agents, MCP servers, tools, plugins, artifacts, orchestration, vault integration, approvals, and operational controls required for an enterprise database architecture and development agent.

It supports architecture and implementation work across PostgreSQL, Oracle Database, Microsoft SQL Server, MySQL/MariaDB, managed cloud variants, and other approved relational engines discovered during project onboarding.

## Core design rule

The agent never receives a universal database credential, production DBA account, raw password, encryption key, backup key, or unrestricted SQL console. Every run is bound to:

`organization -> project -> repository -> database-platform -> instance -> database -> schema -> object-set -> branch -> base-commit -> Jira item -> environment -> requester -> approved SQL class -> allowed tools -> evidence -> expiration`

## Supported execution profiles

| Profile | Typical work | Required behavior |
|---|---|---|
| Data architecture | Domain models, logical models, ownership, canonical terms, ADRs | Separate business semantics from engine-specific design and preserve traceability |
| Schema development | Tables, constraints, indexes, views, routines, permissions | Resolve engine/version/edition and repository migration conventions before producing SQL |
| Migration engineering | Flyway, Liquibase, native scripts, expand-contract changes | Preview SQL, test disposable baselines, evaluate locks, duration, compatibility, and recovery |
| Query and performance engineering | Plans, statistics, indexes, waits, blocking, capacity | Use bounded diagnostic reads and representative baselines; never tune from plan appearance alone |
| Data movement | Backfills, imports, exports, archival, reconciliation | Require checkpoints, idempotency, throttling, privacy controls, and measurable reconciliation |
| Security and governance | Roles, grants, RLS, masking, encryption, audit, retention | Apply least privilege and separation of duties; raw secrets never enter model context |
| Reliability and recovery | Backup, restore, replication, failover, RPO/RTO | Read metadata autonomously; execution of restore/failover remains explicitly approved and operator-controlled |
| Database release | Repository change, validation, PR, rollout, evidence | External writes and every target-environment mutation require policy and human approval |

## Organization project templates

- **PCC:** Angular 12 and Java application. Database engine and migration tool must be discovered from repositories and environment inventory.
- **SOP:** Angular 15 and Java application. Database profile selected from actual schema, migration, ORM, and platform evidence.
- **DataBridge:** AngularJS and Java application. Conservative maintenance, compatibility, and modernization-planning mode.
- **Environments:** playground, QA, and production. Production is metadata/read-only for autonomous operations; no autonomous DDL, DML, restore, failover, grant, or configuration mutation.

## Recommended first implementation

1. User selects project, repository, Jira item, target database, schema scope, and environment.
2. Supervisor resolves database engine, version, edition, topology, workload, object ownership, migration framework, consumers, data classification, and repository rules.
3. Specialists read requirements, models, schema history, SQL, ORM mappings, jobs, reports, incidents, telemetry, and relevant pull requests.
4. Agent produces impact analysis, model or SQL design, migration plan, data-risk assessment, lock/duration estimate, test plan, recovery strategy, and required approvals.
5. Changes are generated only in an isolated repository workspace and disposable database matching the target engine/version as closely as practical.
6. Deterministic gates run: SQL lint, schema diff, migration validation, baseline upgrades, constraint tests, query tests, permission tests, security review, performance checks, drift checks, and evidence hashing.
7. Agent creates a change manifest, SQL previews, PR draft, release-readiness report, runbook, and monitoring plan.
8. Human approval is required for commit, push, PR creation, Jira/Teams publication, pipeline triggers, shared-environment mutations, migration execution, backup/restore operations, and release actions.

Production mutations, superuser access, secret disclosure, arbitrary SQL consoles, destructive repair commands, schema-history alteration, backup deletion, failover, and privilege escalation are outside autonomous scope.

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable database workflows |
| `schemas/` | JSON contracts for structured outputs |
| `templates/` | Reusable database engineering artifacts |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |
