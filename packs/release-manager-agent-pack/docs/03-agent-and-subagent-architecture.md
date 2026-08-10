# Agent and Sub-Agent Architecture

## Supervisor

**release-manager-supervisor** owns orchestration, state, evidence completeness, approval routing, and cross-pack coordination. It does not replace accountable human decision-makers.

## Specialists

### `release-context-agent`
Retrieves approved product, Jira, repository, artifact, environment, service, calendar, change, test, and operational context.
Capabilities: context, traceability, service-catalog.

### `release-intake-agent`
Qualifies release requests, release type, accountable owners, environments, windows, and missing information.
Capabilities: intake, classification, routing.

### `scope-and-version-agent`
Builds exact release scope, version maps, fix-version alignment, artifact identity, and release bill of materials.
Capabilities: scope, versioning, manifest.

### `release-calendar-agent`
Coordinates release windows, freezes, blackout periods, sequencing, milestones, and timezone-safe calendars.
Capabilities: calendar, scheduling, coordination.

### `dependency-coordination-agent`
Maps service, team, data, infrastructure, vendor, consumer, and sequencing dependencies.
Capabilities: dependencies, compatibility, coordination.

### `quality-evidence-agent`
Aggregates QA, UAT, regression, nonfunctional, defect, and acceptance evidence for the exact candidate.
Capabilities: quality, testing, evidence.

### `security-and-supply-chain-agent`
Reviews security scans, exceptions, signatures, provenance, SBOMs, licenses, and trusted-build evidence.
Capabilities: security, supply-chain, compliance.

### `architecture-compatibility-agent`
Checks cross-system contracts, supported version combinations, architecture constraints, and backward compatibility.
Capabilities: architecture, compatibility, contracts.

### `database-migration-readiness-agent`
Reviews schema, data, backfill, locking, duration, validation, rollback, restore, and operator readiness.
Capabilities: database, migration, data.

### `infrastructure-readiness-agent`
Reviews infrastructure plans, cloud and Kubernetes changes, network, capacity, backups, and platform readiness.
Capabilities: infrastructure, cloud, kubernetes.

### `environment-and-config-agent`
Validates environment health, inventory, configuration drift, feature state, and target readiness.
Capabilities: environment, configuration, feature-flags.

### `change-governance-agent`
Builds change records, risk classification, approval bindings, separation of duties, and audit history.
Capabilities: change-management, approvals, audit.

### `deployment-planning-agent`
Creates deterministic deployment sequence, prechecks, validation, decision points, owners, and stop conditions.
Capabilities: deployment, runbook, orchestration.

### `rollback-and-recovery-agent`
Creates tested rollback, fix-forward, restore, and recovery decision trees with measurable triggers.
Capabilities: rollback, recovery, resilience.

### `release-communications-agent`
Drafts release notices, command updates, customer-safe notes, maintenance notices, and closure communications.
Capabilities: communication, status, stakeholders.

### `business-and-support-readiness-agent`
Checks documentation, training, support, operations, customer, business, and go-to-market readiness.
Capabilities: business-readiness, support, handoff.

### `go-no-go-readiness-agent`
Assembles readiness evidence, blockers, conditions, risk, dissent, and decision options without making the final decision.
Capabilities: readiness, decision-support, risk.

### `production-coordination-agent`
Maintains release command timeline, stage gates, checkpoints, escalations, and approved operator handoffs.
Capabilities: release-command, coordination, timeline.

### `hotfix-and-emergency-agent`
Coordinates minimal-scope emergency releases, expedited evidence, approval, restoration, reconciliation, and retrospective controls.
Capabilities: hotfix, emergency-change, restoration.

### `artifact-integrity-agent`
Validates artifact manifests, image digests, package coordinates, signatures, checksums, and candidate immutability.
Capabilities: artifacts, integrity, provenance.

### `post-release-validation-agent`
Coordinates post-deployment smoke checks, telemetry, customer signals, rollout verification, and closure evidence.
Capabilities: validation, observability, closure.

### `release-metrics-agent`
Calculates governed release, flow, stability, rework, predictability, and continual-improvement metrics.
Capabilities: metrics, dora, improvement.

### `cross-pack-coordination-agent`
Delegates evidence and actions to Product, Architecture, Engineering, QA, Database, DevOps, Support, and Security packs.
Capabilities: cross-pack, delegation, coordination.

### `release-reviewer-agent`
Independently reviews readiness, factuality, risk, approvals, rollback, communications, and unsupported claims.
Capabilities: independent-review, quality, governance.

### `evidence-management-agent`
Creates immutable, attributable, redacted evidence bundles with provenance, retention, and audit references.
Capabilities: evidence, provenance, retention.

### `policy-enforcer-agent`
Evaluates scope, environment, approval, separation-of-duties, secrets, production, and publication policy before tool use.
Capabilities: policy, opa, authorization.

## Cross-pack delegation

- Product Manager and Product Owner: value, scope, customer impact, and business acceptance.
- Business Analyst: requirements, business rules, traceability, and UAT.
- Solution Architect: cross-system compatibility and architecture risk.
- Engineering Manager / Technical Lead: implementation ownership, technical readiness, and delivery risk.
- Developer agents: exact code, package, and service evidence.
- Database Architect: migrations, data integrity, performance, and recovery.
- QA Engineer: candidate-bound test and defect evidence.
- DevOps: infrastructure, pipelines, deployments, observability, and rollback execution.
- Support / L2: operational handoff, known issues, incident and ticket signals.
- Security and compliance specialists: independent risk decisions and exceptions.

## Independence rules

The author of a high-risk release artifact cannot be its sole reviewer or approver. The agent never approves its own candidate or accepts residual business, security, privacy, or operational risk.
