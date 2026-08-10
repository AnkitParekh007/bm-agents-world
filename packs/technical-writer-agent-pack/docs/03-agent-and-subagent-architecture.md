# Agent and Sub-Agent Architecture

## Supervisor pattern

The `technical-writer-supervisor` owns orchestration, scope binding, delegation, convergence, review, approval requests, and final evidence. Specialist agents do not publish independently.

## Specialist registry

| Agent | Responsibility |
|---|---|
| `technical-writer-supervisor` | Coordinates documentation intake, planning, authoring, review, validation, publication requests, maintenance, and evidence. |
| `documentation-context-agent` | Retrieves approved product, repository, Jira, architecture, API, UX, support, release, and existing-documentation context. |
| `documentation-intake-agent` | Classifies documentation requests, urgency, audience, content type, owner, publication target, and missing information. |
| `audience-and-task-analysis-agent` | Models audiences, roles, goals, prerequisites, environments, jobs, pain points, and reading contexts. |
| `content-strategy-agent` | Defines documentation goals, coverage, channels, ownership, lifecycle, success measures, and governance. |
| `information-architecture-agent` | Designs navigation, hierarchy, taxonomy, labels, content models, cross-links, and findability. |
| `developer-documentation-agent` | Creates onboarding, architecture, SDK, CLI, integration, contribution, and troubleshooting content for developers. |
| `api-documentation-agent` | Creates and validates REST, event, webhook, SDK, authentication, error, pagination, and versioning documentation. |
| `product-help-agent` | Creates task-based product help, administrator guides, in-product assistance, FAQs, and troubleshooting content. |
| `procedure-authoring-agent` | Designs tested, goal-oriented procedures with prerequisites, steps, verification, recovery, and next actions. |
| `concept-and-reference-agent` | Creates conceptual explanations, architecture overviews, glossaries, configuration references, and factual reference content. |
| `release-documentation-agent` | Produces candidate-bound release notes, upgrade guidance, deprecations, known issues, and migration notices. |
| `runbook-and-operations-agent` | Creates operational runbooks, incident procedures, support playbooks, maintenance guides, and recovery instructions. |
| `code-sample-agent` | Extracts, writes, tests, secures, versions, and explains minimal code samples and command-line examples. |
| `diagram-and-visual-agent` | Creates architecture, sequence, workflow, data-flow, annotated screenshot, and conceptual diagrams. |
| `style-and-terminology-agent` | Enforces project style, voice, grammar, terminology, naming, inclusive language, and consistency. |
| `accessibility-and-inclusive-content-agent` | Reviews headings, links, tables, images, alternatives, cognitive load, inclusive language, and accessible formats. |
| `localization-readiness-agent` | Prepares global-ready content, locale-neutral examples, terminology, variables, segmentation, and translation handoff. |
| `docs-as-code-agent` | Manages documentation branches, Markdown or DITA sources, builds, previews, linting, link checks, and approved pull-request drafts. |
| `content-quality-agent` | Checks accuracy, completeness, clarity, consistency, usability, freshness, links, samples, metadata, and policy compliance. |
| `search-and-discoverability-agent` | Improves titles, summaries, keywords, metadata, cross-linking, navigation, search results, and zero-result coverage. |
| `documentation-analytics-agent` | Analyzes approved feedback, searches, page usage, support deflection, task success, freshness, and content gaps. |
| `sme-and-review-coordination-agent` | Coordinates subject-matter experts, reviewers, comments, decisions, due dates, and unresolved factual disputes. |
| `cross-pack-coordination-agent` | Delegates evidence and review to Product, BA, UX, Architecture, Development, QA, DevOps, Release, and Support packs. |
| `documentation-reviewer-agent` | Independently reviews factuality, audience fit, testability, safety, accessibility, style, and unsupported claims. |
| `evidence-management-agent` | Creates attributable, redacted, immutable evidence bundles with sources, versions, approvals, and retention metadata. |
| `policy-enforcer-agent` | Evaluates scope, permissions, data minimization, publication approvals, customer exposure, and prohibited actions. |

## Independence rules

- The authoring agent cannot be the only factual reviewer.
- Customer-facing content requires an accountable product or service owner.
- Security-sensitive content requires Security review.
- Operational procedures require the owning operator or service team.
- API documentation requires contract or implementation evidence.
- Release notes must bind to an immutable candidate or release manifest.
- Localization, legal, compliance, and brand review are invoked only when project policy requires them.

## Cross-pack delegation

The pack coordinates Product Manager, Product Owner, Business Analyst, UX, Solution Architect, Angular, Java, Python, Database, QA, DevOps, Scrum Master, Support/L2, Release Manager, and Engineering Leadership agents. It requests evidence or review; it does not duplicate their accountabilities.
