# Agent and Sub-Agent Architecture

## 1. Supervisor pattern

`python-developer-supervisor` owns workflow state. It does not directly perform high-impact writes. It validates scope, loads the repository profile, delegates bounded tasks, requests approvals, verifies artifacts, enforces budgets, and produces the final run summary.

## 2. Specialist agents

| Agent | Responsibility | Typical outputs |
|---|---|---|
| Story Context | Read Jira, Confluence, decisions, incidents, and contracts | Story context brief |
| Repository Context | Detect Python/tooling/framework conventions and protected paths | Repository map |
| Architecture Analyzer | Determine boundaries, dependencies, options, and risk | Change-impact report |
| Python Compatibility | Enforce Python, framework, platform, and dependency compatibility | Compatibility assessment |
| Domain Implementation | Implement domain logic, models, and services | Domain patch |
| API Service | Implement endpoints, schemas, middleware, authentication hooks, and OpenAPI | API patch and contract |
| Data Access | Implement queries, repositories, transactions, and migration drafts | Persistence patch and migration plan |
| Async and Workers | Implement asyncio, task queues, schedulers, retries, and shutdown | Concurrency/worker patch |
| Data Pipeline | Implement PySpark/ETL/streaming transformations and data quality | Pipeline patch and reconciliation plan |
| CLI and Automation | Implement safe scripts and command-line tooling | CLI patch and runbook |
| Test Engineer | Generate and run unit, integration, contract, property, and async tests | Quality-gate report |
| Security Reviewer | Review trust boundaries, dependencies, secrets, and dangerous Python features | Security report |
| Performance and Reliability | Profile and review latency, memory, I/O, concurrency, and resilience | Performance report |
| Dependency and Packaging | Manage dependencies, lockfiles, builds, and compatibility matrix | Dependency/package report |
| Code Review | Review correctness, maintainability, typing, tests, and scope | Review report |
| Build and Pipeline | Execute deterministic gates and interpret CI | Build result |
| Documentation | Update setup, architecture, API, operations, and ADRs | Documentation patch |
| PR and Release | Draft PR, release, migration, rollout, and rollback artifacts | Pull-request draft |
| Evidence Curator | Redact, hash, index, and retain evidence | Evidence manifest |
| Policy Guard | Evaluate every capability request | Policy decision record |

## 3. Delegation contract

Every delegation includes run ID, project, repository, branch, base commit, Python profile, allowed paths, permitted skills and tools, environment, network allowlist, input artifacts, output schema, command/time/token budgets, and approval references. A sub-agent cannot grant itself new tools, access another project, or modify the approval payload.

## 4. Recommended topology

Story Context, Repository Context, Architecture Analyzer, and Python Compatibility run in parallel after authorization. The supervisor then chooses only the implementation specialists required by the plan. One patch owner controls each file lease. Quality specialists run against immutable snapshots after the patch is coherent. Publication consumes only validated artifacts.

## 5. Conflict resolution

- Repository conventions and pinned versions override generic modern preferences.
- One writer owns a file at a time; other specialists submit proposed hunks or findings.
- Conflicting recommendations are surfaced with evidence and tradeoffs.
- Security, secret, production, and data policies cannot be overridden by model judgment.
- Failed deterministic gates return precise findings to the patch owner.
- Database migrations are drafted by the agent but executed by external deployment identities.

## 6. Model and tool routing

Use a reasoning model for architecture, migrations, concurrency, and review; a code-focused model for bounded patches; a lower-cost model for indexing and reports; and deterministic tools for formatting, linting, typing, tests, builds, dependency checks, policy, and schemas. Model confidence never substitutes for executable evidence.
