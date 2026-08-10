# Agent and Sub-Agent Architecture

## Topology

The `product-manager-supervisor` owns run state, scope, routing, approvals, evidence, and final synthesis. Specialist agents receive bounded tasks and return structured artifacts; they do not independently expand project scope or publish externally.

| Agent | Responsibility | Core capabilities |
|---|---|---|
| `product-manager-supervisor` | Coordinates bounded product discovery, strategy, prioritization, delivery readiness, release planning, outcome review, approvals, and evidence. | orchestration, decision-quality, risk, evidence |
| `work-context-agent` | Reads Jira, Confluence, product strategy, customer feedback, analytics summaries, design and code history, and delivery status. | jira, context, traceability |
| `customer-insight-agent` | Synthesizes approved customer interviews, support themes, sales feedback, surveys, and usage evidence without exposing unnecessary identifiers. | customer-insights, feedback, evidence |
| `market-intelligence-agent` | Researches market structure, competitors, substitutes, trends, regulations, and positioning using approved public and internal sources. | market-research, competitive-analysis, positioning |
| `product-strategy-agent` | Develops product vision, strategic choices, target segments, value proposition, differentiators, and measurable outcomes. | vision, strategy, outcomes |
| `opportunity-discovery-agent` | Frames opportunities from customer problems, jobs, pain points, unmet needs, and business goals. | discovery, opportunity-mapping, jtbd |
| `problem-framing-agent` | Separates problems, assumptions, constraints, symptoms, requests, and solution hypotheses. | problem-framing, assumptions, scope |
| `product-analytics-agent` | Analyzes privacy-thresholded funnels, retention, adoption, cohorts, paths, quality signals, and outcome metrics. | analytics, funnels, retention, measurement |
| `experiment-design-agent` | Defines hypotheses, variants, success metrics, guardrails, sample and exposure assumptions, stopping rules, and readouts. | experimentation, metrics, causal-reasoning |
| `prioritization-agent` | Applies transparent scoring, dependency, risk, evidence, value, effort, urgency, and strategic-fit analysis. | prioritization, scoring, tradeoffs |
| `roadmap-agent` | Creates outcome-oriented roadmaps, sequencing options, confidence ranges, dependencies, and stakeholder views. | roadmapping, sequencing, dependencies |
| `portfolio-agent` | Balances investments across products, initiatives, maintenance, compliance, platform work, and strategic themes. | portfolio, capacity, investment-balance |
| `product-requirements-agent` | Creates product briefs, PRDs, functional requirements, non-functional expectations, acceptance criteria, and open questions. | requirements, prd, acceptance-criteria |
| `story-mapping-agent` | Builds user journeys, story maps, slices, MVP boundaries, release increments, and dependency-aware delivery options. | story-mapping, mvp, slicing |
| `backlog-governance-agent` | Maintains backlog quality, readiness, ordering, aging, duplication, dependencies, and decision traceability. | backlog, refinement, governance |
| `stakeholder-alignment-agent` | Maps stakeholders, prepares decision materials, captures concerns, resolves conflicts, and maintains communication plans. | stakeholders, alignment, communication |
| `delivery-coordination-agent` | Tracks scope, dependencies, risks, decisions, progress, readiness, and cross-functional actions without replacing Scrum or engineering ownership. | delivery, dependency-management, risk |
| `release-planning-agent` | Coordinates release scope, customer impact, rollout, support readiness, release notes, enablement, and rollback communication. | release-planning, readiness, rollout |
| `go-to-market-agent` | Drafts positioning, audience, launch tiers, sales/support enablement, adoption plan, and market communication inputs. | gtm, positioning, enablement |
| `pricing-packaging-agent` | Analyzes packaging, entitlement, willingness-to-pay evidence, cost-to-serve, and commercial options without making commitments. | pricing, packaging, commercial-analysis |
| `product-operations-agent` | Maintains intake, templates, taxonomies, rituals, repositories, decision logs, metrics, and portfolio reporting. | product-ops, governance, workflow |
| `risk-compliance-agent` | Identifies privacy, security, legal, accessibility, operational, financial, and regulatory product risks and routes approvals. | risk, compliance, privacy |
| `outcome-review-agent` | Compares shipped outcomes with hypotheses, success metrics, customer evidence, quality, adoption, and unintended effects. | outcomes, post-launch, learning |
| `product-reviewer-agent` | Independently reviews evidence quality, strategy fit, assumptions, feasibility, measurement, risks, and decision readiness. | review, quality, challenge |
| `evidence-manager-agent` | Hashes, stores, links, redacts, versions, and retains product evidence, decisions, approvals, and artifacts. | artifacts, provenance, audit |
| `policy-enforcer-agent` | Evaluates project scope, data use, permissions, approvals, publication, customer contact, experiments, and production prohibitions. | opa, authorization, guardrails |

## Orchestration rules

1. Policy enforcement runs before data access and before every sensitive action.
2. Context collection precedes recommendation.
3. Facts, observations, assumptions, interpretations, and recommendations are labeled separately.
4. Customer, market, analytics, strategy, feasibility, and risk evidence may be evaluated in parallel.
5. Prioritization and roadmap agents must expose inputs, weights, uncertainty, and displaced work.
6. Requirements are not considered ready until outcome, scope, acceptance, analytics, accessibility, risk, and dependency questions are addressed.
7. A reviewer agent challenges unsupported certainty and missing alternatives.
8. Human approvals are payload-bound and expire.
9. The supervisor cannot treat an AI score as the final product decision.
10. Every material decision produces traceable evidence and a review trigger.

## Recommended deployment

- Stateless model workers.
- Durable orchestration state outside model context.
- Read-only adapters by default.
- Short-lived capability leases.
- Redaction before context injection.
- Immutable artifact and approval records.
- Separate identities for reading analytics, feedback, roadmap systems, and publishing.
