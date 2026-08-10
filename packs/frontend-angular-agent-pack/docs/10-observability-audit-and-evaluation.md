# Observability, Audit, and Evaluation

## 1. Telemetry

Instrument supervisor, agents, MCP calls, command execution, approvals, artifact operations, and external writes using OpenTelemetry-compatible traces, metrics, and structured logs.

Core trace attributes:

- run ID and parent run ID
- requester and agent identity
- project, repository, branch, and environment
- Jira issue
- Angular execution profile
- skill and tool version
- policy decision and approval ID
- base and resulting commit hashes
- artifact IDs

Never record raw prompts, source files, tokens, cookies, or sensitive payloads by default.

## 2. Operational metrics

- run success, block, denial, and cancellation rates
- time from intake to review-ready patch
- tool and model latency
- retry and repair-loop counts
- approval wait and rejection rates
- workspace and browser failure rates
- build and test duration
- external-write error rates

## 3. Engineering outcome metrics

- compiler and typecheck success
- lint findings introduced or fixed
- unit/component/browser test pass rate
- changed-code coverage where available
- bundle-size delta
- accessibility violations
- performance budget delta
- SonarQube issues and quality-gate status
- dependency vulnerabilities and license findings
- review comments and rework rate
- escaped frontend defects

## 4. Audit events

Capture:

- run authorization and scope
- resource reads by system and object ID
- path-level workspace writes
- command IDs and sanitized result summaries
- model and skill versions
- policy decisions
- approval requests and responses
- secret-reference lease events without values
- artifact hashes
- branch, commit, push, PR, Jira, Teams, and pipeline actions

## 5. Evaluation suites

### Static scenario evaluation

Curated stories for:

- Angular 12 component change
- Angular 15 form/API change
- AngularJS defect fix
- responsive and accessibility change
- dependency upgrade
- route and authentication presentation change

Score requirement coverage, version correctness, path scope, code quality, tests, security, accessibility, and artifact validity.

### Repository fixture evaluation

Run against sanitized repositories with known tasks and expected patches. Compare compile/test results, semantic behavior, diff size, and prohibited-path changes.

### Adversarial evaluation

Test:

- prompt injection in Jira, comments, source files, package metadata, and web content
- requests for secret disclosure
- cross-project URL manipulation
- unsafe package install instructions
- attempts to disable tests or protections
- force-push, merge, package-publish, or production-deploy requests

### Shadow evaluation

Before write capabilities are enabled, run the agent in recommendation-only mode and compare outputs with human implementation and review decisions.

## 6. Release gates for the agent platform

Do not increase autonomy unless:

- policy-denial tests pass
- no secret leakage is observed
- version-compatibility evaluation meets threshold
- generated patches compile and test reliably
- reviewers accept the quality and scope
- audit reconstruction is complete
- rollback and kill-switch procedures are tested
