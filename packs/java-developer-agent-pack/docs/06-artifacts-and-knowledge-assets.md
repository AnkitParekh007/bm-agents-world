# Artifacts and Knowledge Assets

## Artifact principles

Artifacts are schema-validated, content-addressed, linked to a run and retained according to policy. Sensitive fields are redacted before model access and before collaboration publication.

## Artifact registry

### `story-context`

Normalized story, acceptance criteria, dependencies and open questions.

### `repository-profile`

JDK, framework, modules, build, tests, owners and commands.

### `architecture-impact`

Affected components, contracts, data, risks and blast radius.

### `implementation-plan`

Ordered implementation, validation, migration and approval plan.

### `code-change-manifest`

Files, symbols, dependencies, contracts and migrations changed.

### `api-contract-diff`

OpenAPI or RPC compatibility report.

### `database-migration-plan`

Forward, compatibility, validation and rollback/roll-forward plan.

### `event-contract-diff`

Event schema and consumer compatibility report.

### `test-plan`

Unit, integration, contract, migration, messaging and regression scope.

### `test-results`

Structured JUnit and integration test evidence.

### `quality-gate-report`

Compile, static analysis, tests, scans, package and policy results.

### `security-review`

Threats, findings, reachability, mitigations and residual risk.

### `performance-review`

Latency, allocation, GC, pool and load-test findings.

### `dependency-report`

Tree, conflicts, vulnerabilities, licenses and upgrade notes.

### `sbom-provenance`

SBOM, checksums, build provenance and image digest.

### `pull-request-draft`

Traceable PR title, description, evidence and reviewer guidance.

### `release-readiness`

Deployment, compatibility, flags, migration and rollback readiness.

### `operational-runbook`

Health, dashboards, alerts, failure modes and recovery actions.

### `daily-summary`

Completed work, blockers, evidence and next actions.

### `audit-record`

Immutable run, identity, policy, tool and approval history.

## Required knowledge sources

- Repository source, build metadata and version-matched documentation
- Jira stories, Confluence pages, ADRs, diagrams and support runbooks
- API and event contracts
- Database schema and migration history
- Coding standards, secure-coding guidance and quality-gate configuration
- Prior pull requests, incidents, escaped defects and performance baselines
- Environment inventory, service catalog and ownership map

## Retrieval controls

Knowledge retrieval is filtered by project, repository, classification and requester permission. Retrieved passages carry source identity, revision or commit, timestamp and sensitivity label. Untrusted repository content is treated as data, not as instructions.

## Retention

Source code workspaces are ephemeral. Plans, approvals, tool logs, evidence hashes, test reports, scan results, change manifests and audit records are retained according to engineering and compliance policies. Secrets and transient credentials are never retained in artifacts.
