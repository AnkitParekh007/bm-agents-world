# Product Owner Agent — Artifacts and Knowledge Assets

## Artifact principles

Artifacts are immutable by version, attributable to sources, linked to decisions, schema-valid when structured, classified, retained by policy, and published only through an approved destination.

| Artifact | Name | Formats | Purpose |
|---|---|---|---|
| `product-owner-context` | Product Owner context snapshot | markdown/json | approved project, product, team, and decision context |
| `product-goal-brief` | Product Goal brief | markdown | goal, value, evidence, measures, constraints, review condition |
| `product-backlog` | Product Backlog export | json/csv | ordered, transparent backlog with traceability and decisions |
| `backlog-item-specification` | Backlog item specification | markdown/json | purpose, outcome, requirements, acceptance, dependencies, evidence |
| `backlog-health-report` | Backlog health report | markdown/json | readiness, aging, duplication, dependencies, stale assumptions |
| `refinement-pack` | Backlog refinement pack | markdown | candidate items, questions, examples, risks, decisions |
| `user-story-map` | User story map | markdown/diagram | journey, activities, tasks, slices, releases, MVP boundary |
| `acceptance-criteria-pack` | Acceptance criteria pack | markdown/json | scenario-based acceptance examples and unresolved decisions |
| `prioritization-decision` | Prioritization decision record | markdown/json | criteria, scores, evidence, assumptions, human decision |
| `sprint-planning-brief` | Sprint Planning brief | markdown | goal options, ordered candidates, value, risks, dependencies |
| `sprint-goal` | Sprint Goal record | markdown/json | agreed goal, value narrative, evidence links, review notes |
| `sprint-decision-log` | Sprint product decision log | markdown/json | scope and behavior decisions made during the Sprint |
| `dependency-map` | Dependency and sequencing map | markdown/diagram | cross-team, system, API, data, design, and release dependencies |
| `design-readiness-report` | Design readiness report | markdown/json | journeys, states, accessibility, content, handoff gaps |
| `technical-readiness-report` | Technical readiness report | markdown/json | architecture, contracts, data, security, operability, feasibility |
| `qa-readiness-report` | QA readiness report | markdown/json | testability, coverage, evidence, environments, regression scope |
| `uat-plan` | UAT plan and scenarios | markdown/json | scope, users, data, scenarios, schedule, evidence, decision owner |
| `business-acceptance-report` | Business acceptance report | markdown/json | UAT results, unresolved issues, recommendation, human decision |
| `release-acceptance-pack` | Release acceptance pack | markdown/json | scope, readiness, risks, rollout, support, rollback, approvals |
| `release-notes-draft` | Release notes draft | markdown | user-facing and internal release summary |
| `analytics-measurement-plan` | Analytics and measurement plan | markdown/json | events, metrics, baselines, success, guardrails, ownership |
| `outcome-review` | Product outcome review | markdown/json | hypothesis, results, uncertainty, unintended effects, options |
| `stakeholder-decision-record` | Stakeholder decision record | markdown/json | options, evidence, decision, owner, conditions |
| `product-owner-daily-summary` | Product Owner daily summary | markdown | priorities, decisions, questions, risks, next actions |
| `traceability-matrix` | Product traceability matrix | csv/json | goal-to-backlog-to-design-to-code-to-test-to-release-to-outcome |
| `approval-record` | Payload-bound approval record | json | actor, action, object hash, scope, expiry, decision |
| `evidence-bundle` | Immutable evidence bundle | zip/manifest | source references, hashes, outputs, approvals, evaluation |

## Knowledge hierarchy

1. Approved product strategy, policies, contracts, and current decisions
2. Product Goal and official Product Backlog
3. Approved customer research, analytics definitions, and outcome evidence
4. Current design, architecture, API, data, security, quality, and operational context
5. Release and support evidence
6. Historical decisions and superseded material, clearly marked

Conflicting sources are surfaced rather than silently reconciled.
