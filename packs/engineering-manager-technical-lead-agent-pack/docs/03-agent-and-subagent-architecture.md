# Agent and Sub-Agent Architecture

## Supervisor

`engineering-leadership-supervisor` selects the operating profile, validates authorization, creates the execution graph, delegates independent specialists, reconciles conflicts, and blocks actions that lack evidence or approvals.

## Specialist registry

| Agent | Specialization | Responsibility |
| --- | --- | --- |
| `engineering-leadership-supervisor` | orchestration, engineering leadership, governance | Coordinates bounded engineering-management and technical-leadership workflows, delegates specialist analysis, and enforces decision and approval boundaries. |
| `work-product-context` | product context, requirements, scope | Reads product goals, Jira work, roadmap context, stakeholder decisions, and delivery constraints. |
| `portfolio-priority` | portfolio, prioritization, investment | Analyzes priorities, engineering investment options, sequencing, and portfolio tradeoffs without making business commitments. |
| `team-capacity` | capacity, staffing scenarios, allocation | Builds capacity and allocation scenarios using approved aggregate availability and operational-load data. |
| `delivery-planning` | planning, estimation, forecasting | Creates milestones, delivery slices, estimates, dependencies, and confidence-aware forecasts. |
| `execution-flow` | agile flow, delivery health, blockers | Analyzes sprint flow, work-item aging, WIP, blockers, carryover, and process bottlenecks. |
| `dependency-coordination` | dependencies, coordination, escalation | Maps and coordinates cross-team, system, vendor, and environment dependencies. |
| `technical-direction` | technical leadership, options, standards | Provides repository-aware technical direction, implementation options, standards alignment, and technical decision drafts. |
| `architecture-alignment` | architecture conformance, ADRs, boundaries | Checks proposed work against approved solution architecture, ADRs, contracts, and modernization direction. |
| `code-quality-lead` | code quality, review, maintainability | Reviews pull-request evidence, maintainability, ownership, static analysis, and review readiness. |
| `quality-engineering-lead` | testing, defects, quality risk | Coordinates QA strategy, test coverage, defect trends, environments, and quality gates. |
| `reliability-operability-lead` | SRE, operability, reliability | Reviews SLOs, error budgets, observability, runbooks, capacity, operational readiness, and resilience. |
| `security-risk-lead` | security, privacy, compliance | Coordinates security, privacy, compliance, vulnerability remediation, and exception handling. |
| `developer-experience` | DevEx, platform, tooling | Analyzes engineering-system friction, onboarding, tooling, platform enablement, and AI-assisted development outcomes. |
| `technical-debt-modernization` | technical debt, modernization, lifecycle | Maintains debt evidence and creates incremental modernization, upgrade, and decommissioning plans. |
| `incident-escalation` | incidents, escalation, PIR | Coordinates bounded incident triage, timelines, stakeholder updates, corrective actions, and post-incident review. |
| `release-readiness` | release, change readiness, rollback | Aggregates code, test, security, database, infrastructure, and operational evidence for release recommendations. |
| `engineering-metrics` | metrics, analytics, decision support | Builds balanced DORA, SPACE, DevEx, flow, quality, and reliability analyses with interpretation limits. |
| `team-health` | team health, collaboration, culture | Produces privacy-preserving team-health and collaboration assessments using aggregate, consented evidence. |
| `coaching-growth` | coaching, growth, feedback | Prepares coaching questions, feedback drafts, growth plans, mentoring opportunities, and recognition evidence. |
| `one-on-one-preparation` | one-on-ones, actions, confidentiality | Prepares confidential one-on-one agendas and action tracking with strict data minimization. |
| `hiring-onboarding` | hiring process, onboarding, role design | Supports structured hiring and onboarding workflows without making hiring or compensation decisions. |
| `stakeholder-communication` | communication, alignment, reporting | Drafts evidence-backed status, risk, escalation, decision, release, and incident communications. |
| `process-improvement` | continuous improvement, experiments, governance | Designs and evaluates bounded improvements to engineering practices, governance, and team workflows. |
| `independent-engineering-review` | independent review, challenge, assurance | Performs independent review of high-risk delivery, technical, people-process, or production recommendations. |
| `evidence-management` | evidence, provenance, audit | Creates immutable evidence references, lineage, redaction, retention, and audit bundles. |
| `policy-enforcement` | OPA, approvals, safety | Evaluates authorization, data classification, approvals, environment restrictions, and prohibited actions. |

## Orchestration rules

- Product scope comes from Product Management; cross-system architecture comes from the Solution Architect.
- Specialist implementation evidence comes from Angular, Java, Python, Database, QA, UX, and DevOps packs.
- High-risk technical or release recommendations require independent review.
- People-sensitive specialists run in a separate purpose-bound context with minimized retention.
- The same agent cannot author and approve a protected technical, release, hiring, or people decision.
- Conflicting evidence is surfaced to the human decision owner; it is never silently averaged away.
