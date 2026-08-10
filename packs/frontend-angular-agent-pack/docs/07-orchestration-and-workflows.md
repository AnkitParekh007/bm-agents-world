# Orchestration and Workflows

## 1. Run state machine

`CREATED -> AUTHORIZED -> CONTEXT_READY -> PLANNED -> PLAN_APPROVED -> WORKSPACE_READY -> IMPLEMENTING -> VALIDATING -> REVIEW_READY -> PUBLICATION_APPROVED -> PUBLISHED -> COMPLETED`

Failure states:

- `BLOCKED_REQUIREMENTS`
- `BLOCKED_ACCESS`
- `BLOCKED_ENVIRONMENT`
- `QUALITY_FAILED`
- `POLICY_DENIED`
- `APPROVAL_REJECTED`
- `TOOL_FAILED`
- `CANCELLED`

Every transition records actor, timestamp, input artifact hashes, policy decision, and output artifact IDs.

## 2. Standard story workflow

1. Validate requester, project, repository, branch, Jira issue, and environment.
2. Resolve the exact Angular execution profile.
3. Read Jira, design, repository, API, and project instructions.
4. Produce story context, codebase map, and change-impact artifacts.
5. Produce an implementation plan with path-level scope and quality gates.
6. Request approval for medium/high-risk plans.
7. Create an ephemeral workspace pinned to the authorized base commit.
8. Implement the patch in small checkpoints.
9. Run formatter, lint, typecheck, unit tests, and production build.
10. Run browser, accessibility, security, and performance checks as applicable.
11. Iterate on deterministic failures within the authorized budget.
12. Produce change manifest, quality report, and pull-request draft.
13. Request approval for commit, push, Jira update, and PR creation.
14. Verify the external write results and close the run.

## 3. Parallelism rules

Safe parallel reads:

- Jira and documentation retrieval
- repository map and dependency analysis
- Figma and design-system retrieval
- API contract analysis

Safe parallel validation after patch freeze:

- unit/build validation
- accessibility review
- security review
- performance review
- code review

Unsafe parallel writes:

- two agents editing the same file
- simultaneous lockfile modifications
- concurrent framework migrations
- push/rebase operations without a repository lock

## 4. Iteration limits

- maximum automatic repair loops per quality gate: 3
- maximum dependency-resolution attempts: 2
- maximum browser self-healing loops: 2
- no automatic force install, force push, merge, or production deployment
- repeated failure escalates with logs and a partial patch rather than hiding the failure

## 5. Risk classification

### Low

Documentation, tests, styles, or isolated component changes with no API, authentication, routing, dependency, or global-state impact.

### Medium

Shared components, forms, route changes, API integration, state flow, feature flags, or broad styling changes.

### High

Authentication, authorization presentation, sanitization, dependencies, framework upgrades, build configuration, global state, deployment configuration, or production hotfixes.

High-risk work requires plan approval before implementation and privileged review before publication.

## 6. Idempotency and recovery

- pin base commit and tool versions
- hash all inputs and outputs
- use idempotency keys for external writes
- checkpoint patch state after each coherent step
- never repeat a write when the result is uncertain; query the target system first
- resume only when workspace, base commit, approval, and secret leases remain valid

## 7. Human control points

Mandatory control points:

- ambiguous or contradictory requirements
- medium/high-risk implementation plan
- external repository writes
- Jira or Teams publication
- pipeline trigger or rerun
- dependency update beyond approved range
- framework migration
- production read or release action
