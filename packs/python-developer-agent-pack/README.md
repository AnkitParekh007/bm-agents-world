# Python Developer Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Python Developer  
Organization context: Bitbucket repositories, Jira work management, relational databases, playground/QA/production environments, CI/CD, Microsoft Teams, and mixed Angular/Java/Python systems.

## Purpose

This pack defines everything an enterprise Python development agent needs to operate safely:

- Daily Python engineering task catalog
- Project, repository, database, API, queue, environment, and documentation access
- Supervisor and specialist sub-agent design
- Version-aware Python, framework, testing, data, and packaging skills
- MCP servers, atomic tools, runtime plugins, and adapters
- Code, schema, migration, evidence, review, and release artifacts
- Stateful orchestration workflows
- Workload identity, key-vault integration, and short-lived credentials
- Human approvals, repository controls, and production guardrails
- Observability, audit, evaluation, runtime isolation, and rollout controls

## Core design rule

The agent never receives a universal repository token, production credential, raw database password, or raw vault secret. Every run is bound to:

`organization -> project -> repository -> branch -> base commit -> Python profile -> environment -> requester -> Jira item -> approved action -> allowed tools -> patch/evidence -> audit record`

## Supported execution profiles

| Profile | Typical repositories | Detection and behavior |
|---|---|---|
| Python API service | FastAPI, Django REST, Flask, custom ASGI/WSGI | Resolve framework and pinned versions before changing endpoints, models, middleware, or server configuration |
| Python application | Django, Flask, internal business applications | Preserve settings layout, migration conventions, templates, authentication, and deployment model |
| Automation and CLI | Operational scripts, developer tooling, scheduled automation | Require idempotency, dry-run support, safe exit codes, bounded filesystem/network access, and approval for mutations |
| Worker and integration | Celery/RQ/custom workers, event consumers, scheduled jobs | Require retries, idempotency, deduplication, graceful shutdown, and queue observability |
| Data engineering | PySpark, ETL/ELT, batch and streaming jobs | Require data contracts, lineage, reconciliation, restart safety, privacy controls, and resource limits |
| Python library | Shared packages and SDKs | Preserve public APIs, build reproducibly, test supported Python versions, and require approval before publication |
| MCP server | Python MCP services and adapters | Separate resources, prompts, and tools; apply explicit tool schemas, capability scopes, consent, and audit controls |

## Recommended first implementation

1. User selects project, repository, branch, Jira item, and target environment.
2. Agent detects the Python version, framework, dependency manager, lockfile, database layer, test commands, and repository rules.
3. Agent reads story context, code, API/data contracts, architecture decisions, and related incidents.
4. Agent produces an impact analysis, implementation plan, risk score, and required approvals.
5. After any required plan approval, the agent creates a patch in an isolated workspace.
6. Deterministic gates run: formatting, linting, typing, tests, coverage policy, security scans, package/build checks, and approved integration tests.
7. Agent creates a change manifest, migration plan, evidence bundle, and pull-request draft.
8. Human approves commit, push, Jira update, pull-request creation, pipeline rerun, migration execution, package publication, or deployment-related actions.

Production deployment, merge, secret mutation, infrastructure mutation, package publication, and production database writes remain outside autonomous scope.

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable workflow definitions |
| `schemas/` | JSON contracts for agent outputs |
| `templates/` | Reusable Python engineering outputs |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |

## Important assumptions to confirm during onboarding

- Exact Python versions and end-of-life constraints per repository.
- Frameworks, dependency manager, lockfile policy, private package index, and network proxy.
- Database engines, schemas, migration tools, read replicas, and approved diagnostic access.
- Queue, cache, scheduler, object storage, and external service dependencies.
- CI/CD platform, container runtime, artifact registry, deployment model, and environment topology.
- Identity provider, preferred secret manager, workload identity, and credential-broker design.
- Branch protections, code owners, signed-commit rules, and bot identity policy.
- Whether data engineering workloads use PySpark, Databricks, notebooks, or separate orchestration platforms.
