# Artifacts and Knowledge Assets

## Artifact registry

| Artifact | Required content |
|---|---|
| `product-vision` | Target future, users, value, differentiation, principles, horizon, and measures. |
| `product-strategy` | Context, choices, target segments, value proposition, capabilities, tradeoffs, risks, and outcomes. |
| `opportunity-map` | Customer problems, jobs, evidence, impact, segments, assumptions, and opportunity relationships. |
| `customer-insight-digest` | Sanitized themes, evidence counts, segments, confidence, contradictions, and linked opportunities. |
| `market-competitive-analysis` | Market definition, competitors, substitutes, positioning, trends, evidence, and uncertainties. |
| `product-brief` | Problem, users, outcomes, scope, constraints, options, assumptions, risks, success measures, and decision request. |
| `product-requirements-document` | Functional, non-functional, data, integration, role, error, analytics, accessibility, and operational requirements. |
| `user-story-map` | Journey, activities, tasks, stories, slices, MVP boundary, dependencies, and release increments. |
| `prioritization-scorecard` | Candidates, scoring model, evidence, value, effort, risk, dependencies, confidence, and recommendation. |
| `roadmap-plan` | Objectives, themes, initiatives, sequencing, confidence, dependencies, capacity assumptions, and stakeholder views. |
| `portfolio-allocation-plan` | Investment themes, products, capacity, mandatory work, risk, scenarios, and tradeoffs. |
| `metric-dictionary` | Metric definition, formula, source, owner, grain, quality checks, interpretation, and guardrails. |
| `analytics-measurement-plan` | Questions, events, properties, funnels, cohorts, dashboards, owners, and validation plan. |
| `experiment-plan` | Hypothesis, population, variants, metrics, guardrails, exposure, stopping rules, risks, and approvals. |
| `experiment-readout` | Design, data quality, results, uncertainty, segments, guardrails, decision, and follow-up. |
| `dependency-risk-map` | Technical, design, data, vendor, legal, operational, and organizational dependencies and mitigations. |
| `release-plan` | Scope, target users, rollout, feature flags, readiness, communications, support, monitoring, and rollback. |
| `go-to-market-brief` | Audience, positioning, messaging, launch tier, channels, enablement, adoption, and feedback loop. |
| `pricing-packaging-analysis` | Options, evidence, value metric, entitlements, cost-to-serve, risks, assumptions, and approval needs. |
| `stakeholder-decision-memo` | Decision, context, evidence, options, recommendation, dissent, risks, owner, and deadline. |
| `product-decision-log` | Decision, alternatives, evidence, approvers, date, consequences, and review trigger. |
| `backlog-health-report` | Readiness, aging, duplicates, dependencies, blocked items, stale items, and cleanup actions. |
| `release-outcome-review` | Baseline, shipped scope, adoption, quality, customer impact, business outcomes, unintended effects, and learning. |
| `product-risk-register` | Risk, category, likelihood, impact, evidence, owner, mitigation, trigger, and status. |
| `product-daily-summary` | Completed work, decisions, evidence, blockers, risks, next actions, and approvals required. |

## Knowledge hierarchy

1. Approved strategy, policy, contracts, and commitments.
2. Current product and technical documentation.
3. Verified customer and market evidence.
4. Curated analytics and metric definitions.
5. Approved product decisions and roadmaps.
6. Delivery, quality, incident, and release evidence.
7. Draft assumptions and hypotheses, clearly labeled.

## Provenance requirements

Every evidence-bearing artifact records source, collection date, project, product area, owner, classification, consent or usage basis where relevant, transformations, confidence, version, decision linkage, and retention policy.

## Artifact lifecycle

`draft -> reviewed -> approved -> published -> superseded -> archived`

Approval of an artifact does not automatically authorize every downstream action. For example, an approved experiment plan still requires an approved launch action, and an approved roadmap does not authorize a production deployment.
