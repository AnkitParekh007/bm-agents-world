# Agent and Sub-Agent Architecture

The Business Analyst Agent is a governed multi-agent system. The supervisor decomposes work, delegates bounded analysis, requires evidence, requests independent review for material changes, and returns decisions to accountable humans.

## Architecture principles

1. Evidence before assertion. 2. Business need before solution. 3. Requirements remain traceable and versioned. 4. Specialist agents cannot approve their own output. 5. Business policy, scope, acceptance, and commitments remain human-owned. 6. External writes use deterministic adapters and payload-bound approval.

## Agent registry

| Agent | Specialization | Responsibility |
|---|---|---|
| `business-analysis-supervisor` | orchestration, business analysis, governance | Coordinates bounded business-analysis workflows, delegates specialist analysis, preserves traceability, and enforces decision and publication boundaries. |
| `work-context` | work intake, context, scope | Reads product goals, Jira work, Confluence decisions, policies, prior requirements, and delivery constraints. |
| `stakeholder-analysis` | stakeholders, RACI, engagement | Identifies stakeholder groups, influence, decision rights, needs, conflicts, and engagement strategies. |
| `business-needs` | problem framing, outcomes, business needs | Frames business problems, opportunities, outcomes, constraints, assumptions, and measurable success criteria. |
| `strategy-context` | strategy, capability, alignment | Connects requested change to capabilities, objectives, operating model, policies, and portfolio direction. |
| `process-discovery` | current state, discovery, operations | Discovers current workflows through evidence, interviews, system behavior, handoffs, exceptions, and controls. |
| `process-modeling` | BPMN, process design, optimization | Creates BPMN-compatible current-state and future-state process models, SIPOCs, journeys, and exception paths. |
| `requirements-elicitation` | elicitation, facilitation, collaboration | Plans and conducts structured elicitation using interviews, workshops, observation, document analysis, surveys, and prototypes. |
| `requirements-analysis` | requirements, analysis, specification | Classifies, decomposes, models, validates, prioritizes, and quality-checks business and solution requirements. |
| `business-rules` | business rules, decision tables, policy | Discovers, formalizes, validates, and traces policies, decisions, calculations, eligibility, and operational rules. |
| `data-requirements` | data requirements, glossary, governance | Defines data concepts, ownership, quality, lifecycle, privacy, lineage, reporting, and migration requirements. |
| `interface-integration` | interfaces, APIs, integrations | Defines system, API, event, file, user-interface, and external-party interaction requirements. |
| `nonfunctional-requirements` | quality attributes, NFRs, controls | Elicits and quantifies security, privacy, accessibility, performance, resilience, audit, support, and compliance needs. |
| `user-story-acceptance` | stories, use cases, acceptance criteria | Creates implementation-ready stories, use cases, scenarios, acceptance criteria, examples, and edge cases. |
| `traceability-lifecycle` | traceability, lifecycle, change control | Maintains requirement identifiers, baselines, relationships, versions, approvals, changes, and end-to-end traceability. |
| `solution-options` | options, business case, tradeoffs | Compares solution and process options, benefits, costs, risks, assumptions, and transition implications without selecting autonomously. |
| `impact-analysis` | change impact, dependencies, risk | Analyzes people, process, system, data, policy, controls, vendors, operations, support, and release impacts. |
| `change-readiness` | change readiness, adoption, training | Assesses organizational readiness, communication, training, procedure, support, adoption, and resistance considerations. |
| `uat-planning` | UAT, business validation, sign-off | Defines UAT scope, participants, scenarios, data, environments, evidence, defect handling, and sign-off criteria. |
| `solution-evaluation` | solution evaluation, benefits, outcomes | Evaluates delivered or operational solutions against outcomes, requirements, adoption, quality, and residual limitations. |
| `product-owner-collaboration` | backlog, refinement, product ownership | Supports backlog refinement, priority clarification, story readiness, scope decisions, and product-owner handoffs. |
| `delivery-readiness` | readiness, dependencies, handoff | Checks requirement, design, data, integration, test, operations, training, and decision readiness before implementation or release. |
| `documentation-governance` | documentation, governance, standards | Maintains controlled requirements documents, glossaries, templates, naming, versions, baselines, and archival rules. |
| `stakeholder-communication` | communication, facilitation, alignment | Drafts evidence-backed workshop outputs, decision requests, status, risk, scope, UAT, and change communications. |
| `independent-ba-review` | independent review, assurance, challenge | Performs independent quality, ambiguity, testability, traceability, stakeholder, and decision-boundary review. |
| `evidence-management` | evidence, provenance, audit | Creates immutable evidence references, lineage, citations, redaction, retention, and audit bundles. |
| `policy-enforcement` | OPA, approvals, safety | Evaluates authorization, data classification, approvals, purpose, environment restrictions, and prohibited actions. |

## Delegation pattern

The supervisor runs context and policy checks first. Independent specialists can execute in parallel for process, rules, data, integration, nonfunctional, change, and UAT concerns. Traceability and evidence management operate across all branches. Independent review challenges ambiguity, omissions, hidden solution bias, and unsupported decisions before publication.

## Coordination with other packs

Product Manager provides outcomes and priority; Solution Architect provides cross-system constraints; UX provides journeys and interaction evidence; developer and database packs provide feasibility and implementation context; QA provides testability and defect evidence; DevOps provides environment, release, and operational constraints; Engineering Leadership resolves execution ownership and escalations.

## Memory boundaries

Working memory is scoped to the active request. Long-term knowledge stores only approved, redacted, attributable artifacts and structured relationships. Interview notes, raw customer or employee data, and restricted evidence are not retained by default.
