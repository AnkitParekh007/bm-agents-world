# MCP Servers, Tools, and Plugins

## Separation of concerns

- **MCP servers** expose governed resources, prompts, and tools through trusted adapters.
- **Atomic tools** perform deterministic reads, calculations, validations, or approved actions.
- **Plugins** package multi-step role capabilities and transform evidence into typed artifacts.
- **Skills** describe reusable reasoning and operating procedures.
- **Agents** orchestrate skills and tools; they do not receive raw credentials.

## MCP server registry

| Server | Purpose | Access |
| --- | --- | --- |
| `atlassian-work-management` | Jira and Confluence work, requirements, decisions, and approved publication. | read; approval-controlled write |
| `bitbucket-engineering` | Repositories, branches, commits, pull requests, code owners, and approved repository actions. | read; approval-controlled write |
| `repository-intelligence` | Scoped semantic and structural analysis of source, configuration, ownership, dependencies, and tests. | read-only |
| `ci-cd-evidence` | Pipeline definitions, runs, checks, artifacts, deployment evidence, and approved retries. | read; approval-controlled execute |
| `code-quality-security` | Static analysis, coverage, vulnerabilities, licenses, secrets, and quality-gate evidence. | read-only |
| `observability` | Redacted logs, metrics, traces, SLOs, alerts, and dashboards. | read-only |
| `incident-management` | Incidents, timelines, pages, status, corrective actions, and approved updates. | read; approval-controlled write |
| `service-catalog` | Services, owners, dependencies, tiers, runbooks, lifecycle, and support rotations. | read-only |
| `architecture-repository` | ADRs, system models, standards, contracts, and architecture-review evidence. | read; approval-controlled publish |
| `engineering-analytics` | Curated DORA, SPACE, DevEx, flow, quality, reliability, and cost datasets. | aggregate read-only |
| `release-change-management` | Release calendars, change records, approvals, rollbacks, and post-release verification. | read; approval-controlled write |
| `microsoft-teams` | Channels, approved team context, and approval-controlled communications. | read; approval-controlled post |
| `calendar-availability` | Work calendars, approved availability, leave summaries, and on-call schedules. | minimum necessary read-only |
| `people-safe-context` | Career framework, role expectations, employee-selected one-on-one topics, and approved aggregate team-health inputs. | restricted, purpose-bound read-only |
| `recruiting-onboarding` | Approved role plans, interview structures, candidate evidence references, onboarding tasks, and access status. | restricted; no autonomous decisions |
| `finance-vendor-summary` | Approved engineering budgets, license summaries, vendor dependencies, and renewal metadata. | aggregate/summary read-only |
| `artifact-store` | Versioned leadership plans, reviews, reports, evidence bundles, and templates. | read; scoped write |
| `key-vault-policy-broker` | Workload identity, short-lived capability leases, approvals, policy decisions, and secret injection inside trusted adapters. | broker only; no raw secret output |

## Runtime plugins

| Plugin | Purpose |
| --- | --- |
| `jira-context-plugin` | Collects bounded Jira and Confluence context for planning and status workflows. |
| `bitbucket-review-plugin` | Aggregates pull-request scope, reviewers, checks, and code-ownership evidence. |
| `repository-intelligence-plugin` | Builds repository, dependency, test, and ownership profiles. |
| `delivery-planning-plugin` | Creates milestones, slices, capacity scenarios, and confidence-aware forecasts. |
| `sprint-flow-plugin` | Analyzes WIP, age, blockers, queues, carryover, and scope changes. |
| `dependency-map-plugin` | Maintains cross-team and cross-system dependency maps. |
| `technical-direction-plugin` | Creates technical options, decision drafts, and standards-conformance evidence. |
| `architecture-alignment-plugin` | Compares implementation plans and changes with ADRs and approved architecture. |
| `code-quality-plugin` | Aggregates build, lint, static-analysis, maintainability, and review evidence. |
| `test-quality-plugin` | Aggregates test, defect, flaky-test, regression, and environment evidence. |
| `security-risk-plugin` | Aggregates security, privacy, compliance, vulnerability, and exception evidence. |
| `reliability-operations-plugin` | Aggregates SLO, error-budget, observability, runbook, capacity, and toil evidence. |
| `incident-coordination-plugin` | Creates incident timelines, role maps, updates, PIR drafts, and action tracking. |
| `release-readiness-plugin` | Builds cross-discipline release evidence and go/no-go recommendations. |
| `engineering-metrics-plugin` | Computes balanced delivery, flow, quality, reliability, SPACE, and DevEx views. |
| `technical-debt-plugin` | Maintains debt, lifecycle, modernization, and decommissioning evidence. |
| `team-health-plugin` | Processes consented aggregate team-health and collaboration signals. |
| `coaching-preparation-plugin` | Prepares one-on-one, feedback, recognition, growth, and mentoring drafts. |
| `hiring-onboarding-plugin` | Supports structured interview and onboarding artifacts with decision boundaries. |
| `stakeholder-publisher-plugin` | Publishes approved Jira, Confluence, Teams, and report updates. |
| `approval-policy-plugin` | Binds sensitive actions to immutable payload hashes, approvers, expiry, and audit. |
| `secret-injection-plugin` | Injects short-lived credentials inside trusted adapters without exposing them to the model. |

## High-risk tool rules

External publication, repository changes, pipeline execution, incident updates, candidate workflow actions, and non-production execution require payload-bound approval. Production mutation, employment decisions, raw-secret retrieval, and individual productivity ranking are prohibited.
