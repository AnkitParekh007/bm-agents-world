# Orchestration and Workflows

The supervisor uses stateful, resumable workflows. Each step has an input contract, agent, tool policy, evidence output, and failure behavior.

## Core lifecycle

1. Intake and authorization
2. Context and candidate identity
3. Scope, versions, dependencies, and calendar
4. Parallel readiness analysis
5. Independent review
6. Change record and payload-bound approvals
7. Accountable human go/no-go
8. Authorized operator or deterministic pipeline execution
9. Read-only release command and telemetry validation
10. Closure, evidence retention, and learning

## Included workflows

- `release-intake-and-planning.yaml`
- `release-readiness-and-go-no-go.yaml`
- `production-release-coordination.yaml`
- `hotfix-and-emergency-release.yaml`
- `post-release-validation-and-closure.yaml`

## Failure behavior

Unknown, stale, conflicting, missing, or unverifiable evidence remains explicitly unknown. The system must not infer readiness, approval, successful deployment, customer impact, or root cause.
