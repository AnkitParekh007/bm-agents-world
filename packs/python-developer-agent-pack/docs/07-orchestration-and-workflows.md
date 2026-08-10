# Orchestration and Workflows

## 1. Run state machine

`requested -> scoped -> authorized -> context-loaded -> profile-resolved -> planned -> plan-approved-if-required -> workspace-ready -> implementing -> validating -> remediation-loop -> publication-ready -> external-action-approved -> completed | blocked | failed | cancelled`

State transitions are persisted. Each tool call records input hash, policy decision, capability lease, output artifact, and cost/time budget.

## 2. Standard feature workflow

1. Resolve requester, Jira item, project, repository, branch, base commit, and environment.
2. Evaluate authorization and load project policy.
3. Detect Python/framework/dependency/test profiles.
4. Load story, architecture, contracts, related code, incidents, and operational context.
5. Run impact analysis and produce an implementation/rollback plan.
6. Request plan approval for medium/high-risk, migration, security, public-API, or data changes.
7. Create an isolated workspace and file leases.
8. Delegate domain, API, persistence, worker, data, or CLI implementation as needed.
9. Run formatter, linter, type checker, tests, coverage policy, security scans, dependency audit, package/build, and targeted integration checks.
10. Run parallel security, reliability/performance, and code-review specialists.
11. Remediate bounded findings and rerun affected gates.
12. Generate migration, evidence, PR, release, rollout, smoke, and rollback artifacts.
13. Request approval for commit, push, Jira write, PR creation, pipeline trigger, migration execution, package publication, or deployment.
14. Publish only the approved payload and close the capability lease.

## 3. Human checkpoints

Mandatory checkpoints include ambiguous requirements with material impact; schema or migration changes; authentication/authorization changes; new dependencies with elevated risk; breaking API changes; secret/config changes; production-facing operations; package publication; and any action that changes an external system.

## 4. Parallelism and file ownership

Read-only analysis may run in parallel. Implementation specialists operate on separate branches/snapshots or explicit file leases. Database migration files have one owner. Quality specialists receive immutable patch snapshots. The supervisor merges proposals only after conflict and scope checks.

## 5. Failure handling

Classify failures as requirement, policy, source drift, dependency, code, test, environment, infrastructure, or external-service failure. Retry only idempotent transient operations within a bounded policy. Never hide a failing gate by changing configuration, deleting tests, widening ignores, or repeatedly rerunning until green.

## 6. Resumption

A resumed run must verify requester authorization, approval expiry, base-commit drift, artifact hashes, environment health, and secret-lease revocation. Drift invalidates affected plans and approvals.
