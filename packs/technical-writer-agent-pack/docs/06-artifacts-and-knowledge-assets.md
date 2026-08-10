# Artifacts and Knowledge Assets

Artifacts are immutable or versioned outputs with owner, audience, product, version, source revision, status, and evidence references.

| Artifact | Purpose |
|---|---|
| `documentation-request` | Authorized request, scope, owner, deadline, audience, target, and constraints. |
| `documentation-context-package` | Version-bound product, code, API, UX, support, release, and existing-content evidence. |
| `audience-and-task-model` | Audience roles, goals, prerequisites, contexts, pain points, and success criteria. |
| `content-strategy` | Documentation goals, channels, coverage, ownership, lifecycle, and measurements. |
| `documentation-plan` | Scope, content types, owners, dependencies, milestones, reviews, and publication targets. |
| `information-architecture-map` | Navigation, hierarchy, taxonomy, labels, cross-links, and redirects. |
| `content-brief` | Purpose, audience, user need, source evidence, outline, terminology, and acceptance criteria. |
| `documentation-change` | Version-bound source changes, claims, diffs, validation, and publication metadata. |
| `tutorial` | Learning-oriented guided experience with safe prerequisites and verifiable outcomes. |
| `how-to-guide` | Goal-oriented procedure for a specific real-world task. |
| `concept-topic` | Explanation of a system, feature, architecture, decision, or mental model. |
| `reference-topic` | Accurate, scannable facts about APIs, commands, configuration, fields, limits, or behavior. |
| `api-documentation-package` | REST, event, webhook, SDK, authentication, errors, examples, and versioning content. |
| `developer-onboarding-guide` | Environment, repository, architecture, build, test, contribution, and troubleshooting guidance. |
| `administrator-guide` | Configuration, permissions, operations, maintenance, security, and troubleshooting guidance. |
| `runbook` | Operational prerequisites, steps, validation, stop conditions, escalation, recovery, and evidence. |
| `troubleshooting-guide` | Symptoms, diagnostics, causes, safe resolutions, escalation, and verification. |
| `release-notes` | Candidate-bound changes, fixes, known issues, upgrade impacts, deprecations, and references. |
| `upgrade-and-migration-guide` | Prerequisites, compatibility, steps, validation, rollback, and breaking-change guidance. |
| `terminology-and-style-guide` | Approved voice, terms, naming, grammar, formatting, examples, and exceptions. |
| `glossary` | Approved domain, product, architecture, data, and operational terms with ownership. |
| `diagram-source-and-render` | Editable diagram source, accessible description, render, version, and evidence references. |
| `documentation-review-report` | Findings, evidence, severity, owners, dispositions, and publication recommendation. |
| `documentation-preview-bundle` | Built preview, screenshots, link report, lint report, sample results, and metadata checks. |
| `content-audit-report` | Inventory, ownership, freshness, accuracy, duplication, usage, gaps, and remediation plan. |
| `documentation-status-update` | Progress, completed work, blockers, decisions, risks, and next actions. |
| `localization-handoff-package` | Source version, terminology, variables, screenshots, context, status, and approvals. |
| `publication-and-evidence-bundle` | Immutable sources, diffs, validation, reviews, approvals, target, and payload hash. |

## Knowledge-source precedence

1. Approved product and architecture decisions.
2. Repository source, tests, and configuration for the bound revision.
3. Approved API and data contracts.
4. Approved designs and component specifications.
5. QA evidence and release manifests.
6. Existing documentation that has a current owner and verification date.
7. Redacted support and analytics evidence.
8. SME statements recorded with attribution and date.

Conflicts are surfaced; the model does not silently choose a preferred answer.
