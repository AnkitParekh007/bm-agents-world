# Orchestration and Workflows

## State machine

`REQUESTED -> AUTHORIZED -> DISCOVERED -> ANALYZED -> DESIGNED -> PLAN_APPROVED -> IMPLEMENTED_IN_WORKSPACE -> VALIDATED_IN_SANDBOX -> REVIEWED -> RELEASE_APPROVED -> PUBLISHED -> OPERATOR_EXECUTED -> VERIFIED -> CLOSED`

A workflow may also enter `BLOCKED`, `DENIED`, `FAILED_VALIDATION`, `ROLLED_FORWARD`, or `ABORTED`.

## Standard database change flow

1. Normalize the Jira request and classify the change.
2. Authorize the exact database, schema, object, branch, environment, and SQL classes.
3. Discover engine/version, topology, migration tooling, current objects, consumers, data size, sensitivity, and operational constraints.
4. Create a logical/physical design and impact analysis.
5. Design migration, compatibility window, backfill, testing, monitoring, and recovery.
6. Obtain plan approval for medium/high-risk changes.
7. Create repository changes in an isolated workspace.
8. Build a disposable database from a supported baseline.
9. Apply migrations and run deterministic schema, query, data, permission, concurrency, and performance tests.
10. Review SQL previews, object diffs, plans, lock behavior, duration, storage, and evidence.
11. Prepare PR and release artifacts.
12. Obtain approval for repository writes and later for shared-environment execution.
13. Approved operators or pipelines execute against playground/QA/production according to policy.
14. Agent performs approved read-only verification, compares actual impact to plan, and prepares closure evidence.

## Mandatory checkpoints

- **Authorization:** before reading sensitive metadata or invoking diagnostics.
- **Design approval:** before high-risk migration implementation.
- **Publication approval:** before commit, push, PR, Jira, or Teams write.
- **Execution approval:** before every shared-environment DDL/DML/grant/backfill action.
- **Production operator handoff:** production mutation is never performed by the autonomous agent.

## Failure handling

- Stop on unexpected database, schema, version, checksum, row-count, lock, replication-lag, backup, or data-quality state.
- Do not automatically run repair, clean, truncate, drop, restore, failover, or privilege escalation.
- Preserve evidence and generate a recovery recommendation.
- Expire approvals when SQL, target, checksum, estimated rows, duration, or risk changes materially.
