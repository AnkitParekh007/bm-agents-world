# Product Owner Agent — Agent and Sub-Agent Architecture

## Architecture objective

The supervisor converts strategy and evidence into a transparent, ordered, decision-ready Product Backlog while coordinating specialists and preserving human accountability.

## Orchestration rules

1. Bind every run to product, team, workflow purpose, requester, and data scope.
2. Retrieve evidence through trusted adapters; never inject raw credentials.
3. Separate facts, assumptions, recommendations, and human decisions.
4. Run UX, technical, QA, analytics, dependency, and risk analysis in parallel when possible.
5. Require independent review before material priority, release, or acceptance recommendations.
6. Bind approval to exact payload hashes and expiration.
7. Delegate implementation and production work to owning packs or deterministic systems.

## Agents

### `product-owner-supervisor`

Coordinates Product Goal, Product Backlog, refinement, Sprint readiness, release acceptance, outcome review, approvals, and evidence.

**Capabilities:** orchestration, value-maximization, backlog, decision-quality.
### `work-context-agent`

Retrieves approved Jira, Confluence, product, design, architecture, support, analytics, and delivery context.

**Capabilities:** jira, context, traceability.
### `product-goal-agent`

Maintains evidence-backed Product Goal proposals, value hypotheses, and alignment checks.

**Capabilities:** product-goal, value, outcomes.
### `stakeholder-alignment-agent`

Maps stakeholders, prepares decisions, captures conflicts, and maintains communication plans.

**Capabilities:** stakeholders, alignment, decisions.
### `customer-value-agent`

Synthesizes approved customer, user, support, research, and usage evidence.

**Capabilities:** customer-value, insights, evidence.
### `backlog-ownership-agent`

Maintains transparent, ordered, traceable Product Backlog proposals and governance.

**Capabilities:** backlog, ordering, transparency.
### `backlog-refinement-agent`

Prepares and facilitates backlog refinement, slicing, examples, questions, and readiness checks.

**Capabilities:** refinement, slicing, readiness.
### `story-requirements-agent`

Drafts user stories, functional requirements, business rules, data and integration expectations.

**Capabilities:** stories, requirements, business-rules.
### `acceptance-criteria-agent`

Creates testable scenario-based acceptance criteria and detects ambiguity.

**Capabilities:** acceptance-criteria, examples, testability.
### `prioritization-agent`

Evaluates value, risk, urgency, learning, dependencies, effort, and strategic fit.

**Capabilities:** prioritization, tradeoffs, cost-of-delay.
### `sprint-goal-agent`

Prepares coherent Sprint Goal options and value narratives without owning the Sprint Backlog.

**Capabilities:** sprint-goal, planning, value.
### `sprint-collaboration-agent`

Provides timely product decisions and manages in-Sprint scope questions.

**Capabilities:** sprint-collaboration, decisions, scope.
### `dependency-coordination-agent`

Maps and coordinates cross-team, API, data, design, and release dependencies.

**Capabilities:** dependencies, cross-team, sequencing.
### `ux-readiness-agent`

Checks journey, design, content, accessibility, state, and handoff readiness.

**Capabilities:** ux, design-readiness, accessibility.
### `technical-readiness-agent`

Checks architecture, API, data, security, observability, migration, and feasibility readiness.

**Capabilities:** technical-readiness, architecture, feasibility.
### `qa-readiness-agent`

Checks testability, QA scope, defect impact, evidence, and regression implications.

**Capabilities:** quality, testability, defects.
### `uat-business-acceptance-agent`

Coordinates UAT plans, evidence, findings, and human-owned business acceptance.

**Capabilities:** uat, business-acceptance, traceability.
### `release-acceptance-agent`

Prepares release scope, readiness, risk, communication, and acceptance recommendations.

**Capabilities:** release, readiness, acceptance.
### `analytics-outcome-agent`

Defines outcome measures, validates instrumentation, and reviews post-release evidence.

**Capabilities:** analytics, outcomes, measurement.
### `feedback-learning-agent`

Converts approved feedback and product learning into backlog options.

**Capabilities:** feedback, learning, continuous-discovery.
### `risk-compliance-agent`

Routes privacy, security, legal, accessibility, operational, and regulatory reviews.

**Capabilities:** risk, compliance, governance.
### `decision-log-agent`

Maintains immutable decision, assumption, dependency, and approval records.

**Capabilities:** decisions, provenance, audit.
### `agile-collaboration-agent`

Prepares Product Owner inputs for Scrum or team ceremonies without directing Developers.

**Capabilities:** scrum, ceremonies, collaboration.
### `cross-pack-coordination-agent`

Coordinates Product Manager, Business Analyst, UX, Architecture, Engineering, QA, and DevOps packs.

**Capabilities:** multi-agent, handoff, coordination.
### `product-owner-reviewer-agent`

Independently challenges backlog quality, value evidence, readiness, assumptions, and risks.

**Capabilities:** review, challenge, quality.
### `evidence-manager-agent`

Hashes, versions, redacts, stores, and links context, decisions, approvals, and artifacts.

**Capabilities:** artifacts, provenance, retention.
### `policy-enforcer-agent`

Enforces scope, permissions, approval, customer contact, publication, and production prohibitions.

**Capabilities:** opa, authorization, guardrails.

## Human accountability

The named Product Owner remains accountable for Product Goal communication and Product Backlog management. Business acceptance, release approval, commercial commitments, legal interpretations, and production mutations remain with explicitly authorized humans and systems.
