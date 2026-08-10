# Orchestration and Workflows

## Workflow engine requirements

The workflow engine must support durable state, retries, timeouts, parallel fan-out, approval pauses, cancellation, compensating actions and immutable event history. The supervisor uses explicit workflow definitions; it does not invent a new process during a run.

## Standard lifecycle

1. **Request:** capture Jira item, repository, branch, environment and desired outcome.
2. **Authorize:** evaluate identity, scope, data classification and allowed actions.
3. **Discover:** resolve JDK, framework, modules, build, tests, database and runtime profile.
4. **Understand:** retrieve requirements, contracts, architecture, history and incidents.
5. **Analyze:** produce impact, compatibility, risk and test scope.
6. **Plan:** create ordered implementation, validation, migration and rollback steps.
7. **Approve:** pause when policy requires a human decision.
8. **Implement:** create a bounded patch in an isolated workspace.
9. **Verify:** compile, test, scan, package and run specialist reviews.
10. **Aggregate:** produce quality gate, manifest, evidence and residual risks.
11. **Publish:** after approval, perform bounded repository/Jira/collaboration actions.
12. **Evaluate:** score correctness, safety, efficiency and human override outcomes.

## Parallelism

After repository profiling, architecture, security, persistence, API and test specialists can analyze in parallel. Implementation patches that touch the same files are serialized or merged by a deterministic patch coordinator. Quality gates must run against the integrated patch.

## Retry policy

Read-only transient failures may be retried with exponential backoff and jitter. Mutation requests are never blindly retried; idempotency keys and target-state verification are mandatory. Compile or test failures are routed back to the responsible implementation step with a bounded repair budget.

## Approval checkpoints

Typical checkpoints include high-risk plan approval, dependency addition, schema migration, event contract change, non-production mutation, commit, push, PR creation, Jira write, Teams post and pipeline trigger. Approval is bound to payload hash and expires.

## Stop conditions

The workflow stops for scope mismatch, secret exposure, production mutation request, untrusted build execution, unresolved critical vulnerability, incompatible rolling deployment, destructive migration without approved recovery, or repeated nondeterministic failure.

## Included workflows

- `story-to-implementation-plan.yaml`
- `java-feature-implementation.yaml`
- `bug-fix-and-refactor.yaml`
- `dependency-and-java-upgrade.yaml`
- `pull-request-and-release.yaml`
