# MCP Servers, Tools, and Plugins

## Design rule

MCP servers expose governed resources and tools. Deterministic plugins perform repeatable calculations and validation. The model never receives raw secrets or unrestricted production shells.

## MCP servers

### `atlassian-context-mcp`
- Purpose: Jira, Confluence, Jira Service Management, versions, change records, work items, and approved comments.
- Implementation: vendor-or-approved-adapter
- Access: read-mostly; writes approval-controlled

### `bitbucket-source-mcp`
- Purpose: Repositories, branches, commits, pull requests, tags, build status, and release diffs.
- Implementation: organization-owned-or-approved
- Access: read-only by default

### `ci-cd-pipeline-mcp`
- Purpose: Pipeline runs, artifacts, quality gates, deployment stages, approvals, and logs.
- Implementation: organization-owned
- Access: read and approval-controlled triggers

### `artifact-registry-mcp`
- Purpose: Container images, packages, checksums, digests, signatures, retention, and promotion state.
- Implementation: organization-owned
- Access: read-only; promotion approval-controlled

### `deployment-orchestrator-mcp`
- Purpose: Approved deployment plans, stage status, environment gates, operator handoffs, and rollback requests.
- Implementation: organization-owned
- Access: no free-form production execution

### `environment-inventory-mcp`
- Purpose: Projects, services, environments, regions, clusters, namespaces, owners, and version state.
- Implementation: organization-owned
- Access: read-only

### `kubernetes-platform-mcp`
- Purpose: Read-only workload, rollout, event, capacity, and configuration status for approved clusters.
- Implementation: organization-owned
- Access: read-only for model; writes prohibited

### `cloud-platform-mcp`
- Purpose: Read-only cloud inventory, deployment state, capacity, alarms, backups, and managed-service status.
- Implementation: organization-owned
- Access: read-only for model

### `observability-mcp`
- Purpose: Bounded redacted logs, metrics, traces, dashboards, alerts, SLOs, and deployment markers.
- Implementation: organization-owned
- Access: read-only

### `feature-management-mcp`
- Purpose: Feature flags, environments, prerequisites, segments, rollout state, and audit history.
- Implementation: approved-vendor-adapter
- Access: read-only; changes approval-controlled outside model

### `database-release-mcp`
- Purpose: Migration manifests, checksums, previews, test evidence, operator plans, and read-only migration status.
- Implementation: organization-owned
- Access: production DDL/DML prohibited

### `security-evidence-mcp`
- Purpose: Vulnerability, dependency, container, IaC, secret, policy, and exception evidence.
- Implementation: organization-owned
- Access: read-only

### `sbom-and-provenance-mcp`
- Purpose: SBOMs, attestations, signatures, provenance, and software supply-chain evidence.
- Implementation: organization-owned
- Access: read-only

### `change-management-mcp`
- Purpose: Change calendar, risk, approvals, CAB or peer-review decisions, implementation and closure records.
- Implementation: organization-owned-or-ITSM-adapter
- Access: writes approval-controlled

### `service-catalog-mcp`
- Purpose: Service ownership, criticality, dependencies, support tiers, SLOs, and operational contacts.
- Implementation: organization-owned
- Access: read-only

### `microsoft-teams-mcp`
- Purpose: Approved release announcements, command updates, stakeholder messages, and handoff posts.
- Implementation: organization-owned
- Access: all sends approval-controlled

### `artifact-store-mcp`
- Purpose: Immutable release plans, evidence bundles, logs, reports, notes, and decision records.
- Implementation: organization-owned
- Access: write to isolated workspace; publication controlled

### `vault-policy-approval-mcp`
- Purpose: Workload identity, capability leases, secret references, policy decisions, and approval validation.
- Implementation: organization-owned
- Access: raw secret values never exposed

## Deterministic plugins

- **`release-request-normalizer`:** Normalizes release requests into the governed context schema.
- **`semantic-version-calculator`:** Calculates candidate versions from approved versioning rules.
- **`release-diff-builder`:** Builds commit, artifact, migration, configuration, and infrastructure diffs.
- **`dependency-graph-builder`:** Builds service, team, contract, data, and deployment dependency graphs.
- **`release-calendar-checker`:** Checks windows, freezes, blackouts, maintenance, conflicts, and timezones.
- **`artifact-integrity-verifier`:** Validates checksums, digests, signatures, coordinates, and immutability.
- **`sbom-and-provenance-validator`:** Validates SBOM presence, attestations, provenance, and policy results.
- **`test-evidence-aggregator`:** Aggregates candidate-bound quality evidence and defect state.
- **`readiness-scorecard-engine`:** Calculates transparent readiness status without making the final decision.
- **`change-risk-calculator`:** Calculates configured change risk using evidence and declared rules.
- **`approval-binding-validator`:** Validates actor, action, payload hash, environment, window, expiry, and replay protection.
- **`migration-plan-validator`:** Validates migration ordering, previews, hashes, duration, locking, recovery, and evidence.
- **`rollback-plan-validator`:** Validates rollback triggers, artifacts, compatibility, data safety, and operator ownership.
- **`deployment-sequence-builder`:** Builds deterministic staged deployment sequences and checkpoints.
- **`environment-drift-comparator`:** Compares approved environment and configuration baselines.
- **`feature-rollout-validator`:** Validates feature prerequisites, rollout rings, segments, and observation gates.
- **`release-notes-renderer`:** Renders approved release notes from delivered scope and known limitations.
- **`status-communication-renderer`:** Renders audience-specific release status messages from approved facts.
- **`release-timeline-recorder`:** Creates immutable release-command timestamps and evidence links.
- **`post-release-signal-correlator`:** Correlates telemetry, tickets, incidents, deployments, and customer signals.
- **`release-metrics-calculator`:** Calculates governed release and DORA-aligned delivery metrics.
- **`evidence-redaction-and-bundling-plugin`:** Redacts sensitive material and creates immutable evidence packages.

## Tool-risk tiers

- Tier 0: local parsing, comparison, rendering, schema validation.
- Tier 1: approved read-only repository, Jira, artifact, environment, and telemetry access.
- Tier 2: non-production validation or rehearsal with scoped approval.
- Tier 3: publication, promotion, or production-action request with payload-bound approval.
- Tier 4: direct production mutation—prohibited for the free-form agent.
