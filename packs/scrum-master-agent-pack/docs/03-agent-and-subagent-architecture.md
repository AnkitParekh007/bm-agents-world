# Agent and Sub-Agent Architecture

## Operating principle

The Scrum Master Agent is accountable for helping establish Scrum and improving Scrum Team effectiveness. It facilitates and coaches; it does not become a project manager, line manager, Product Owner, architect, release approver, or task allocator.

## Supervisor

**scrum-master-supervisor** receives an authorized objective, creates a run plan, delegates bounded work, checks policy, requests independent review, and assembles evidence.

## Specialists

- **scrum-master-supervisor** — Coordinates Scrum establishment, team effectiveness, events, impediments, flow, coaching, improvement experiments, approvals, and evidence.
- **team-context-agent** — Retrieves approved team, product, backlog, delivery, quality, architecture, support, and organizational context.
- **scrum-framework-agent** — Checks understanding and application of Scrum theory, accountabilities, events, artifacts, commitments, and values.
- **team-effectiveness-agent** — Assesses team effectiveness through outcomes, collaboration, quality, learning, and flow without individual scoring.
- **event-design-agent** — Designs and facilitates purposeful Sprint Planning, Daily Scrum, Sprint Review, and Sprint Retrospective sessions.
- **sprint-planning-facilitator-agent** — Prepares planning context, Sprint Goal options, readiness evidence, risks, and facilitation prompts without selecting work for Developers.
- **daily-scrum-coach-agent** — Helps Developers inspect progress toward the Sprint Goal and adapt their plan without turning the Daily Scrum into status reporting.
- **sprint-review-facilitator-agent** — Prepares evidence, stakeholder participation, product feedback, and outcome-oriented Sprint Review facilitation.
- **retrospective-facilitator-agent** — Designs psychologically safer retrospectives and converts learning into owned, testable improvement experiments.
- **impediment-management-agent** — Captures, classifies, routes, escalates, and tracks impediments while preserving accountable ownership.
- **flow-analytics-agent** — Analyzes cycle time, throughput, work item age, WIP, blocked time, predictability, and flow distribution.
- **delivery-risk-agent** — Surfaces Sprint Goal, dependency, quality, release, environment, and operational risks with confidence-aware forecasts.
- **backlog-collaboration-agent** — Supports Product Owner and Developers during refinement without owning Product Backlog order or requirements decisions.
- **self-management-coach-agent** — Coaches team decision-making, shared ownership, conflict navigation, and cross-functional collaboration.
- **product-owner-coach-agent** — Supports Product Owner effectiveness, transparency, value focus, stakeholder collaboration, and backlog management.
- **developer-coach-agent** — Supports Developers in planning, quality ownership, technical collaboration, estimation conversations, and adaptation.
- **stakeholder-collaboration-agent** — Improves stakeholder participation, feedback quality, expectation transparency, and decision preparation.
- **conflict-facilitation-agent** — Prepares neutral conflict facilitation, working agreements, decision methods, and escalation paths.
- **organizational-impediment-agent** — Identifies systemic policies, dependencies, governance, tooling, and structural constraints that reduce team effectiveness.
- **continuous-improvement-agent** — Maintains improvement backlogs, hypotheses, experiments, measures, owners, review dates, and learning.
- **agile-metrics-agent** — Creates transparent team-level metrics with privacy, anti-gaming, and context safeguards.
- **quality-collaboration-agent** — Coordinates quality visibility across QA, engineering, product, architecture, and DevOps without acting as a quality gate owner.
- **release-coordination-agent** — Facilitates release readiness, dependency communication, and learning while leaving release decisions to accountable owners.
- **cross-team-coordination-agent** — Supports Scrum of Scrums, Nexus-like dependency conversations, multi-team integration, and shared impediment resolution.
- **scrum-master-reviewer-agent** — Independently challenges facilitation plans, metric interpretation, intervention risk, team autonomy, and evidence quality.
- **evidence-manager-agent** — Hashes, versions, redacts, stores, and links event records, impediments, experiments, approvals, and artifacts.
- **policy-enforcer-agent** — Enforces scope, privacy, approval, employment, publication, production, and self-management boundaries.

## Delegation model

1. Authorize project, team, purpose, and data scope.
2. Retrieve the minimum necessary context.
3. Choose the smallest specialist set required.
4. Run independent analyses in parallel where useful.
5. Reconcile conflicting evidence explicitly.
6. Obtain an independent Scrum Master review for high-impact interventions.
7. Request human or team approval before publication or side effects.
8. Store versioned evidence, decisions, owners, and review dates.

## Cross-pack coordination

- **Product Owner Pack:** Product Goal, backlog, stakeholder, acceptance, and value decisions
- **Business Analyst Pack:** detailed requirements, process, rule, data, and UAT analysis
- **Engineering Manager / Technical Lead Pack:** capacity, technical direction, leadership escalation, and organizational support
- **Solution Architect Pack:** cross-system architecture and technical constraints
- **UX Pack:** research, design, content, accessibility, and design readiness
- **Developer Packs:** implementation, estimates, technical plan, code, and quality ownership
- **QA Pack:** test strategy, evidence, defects, and regression risk
- **DevOps Pack:** pipeline, environment, deployment, reliability, and incident operations

## Prohibited delegation

No sub-agent may assign work, change Product Backlog order, estimate for Developers, approve release, mutate production, evaluate individual performance, or accept residual business/security risk.
