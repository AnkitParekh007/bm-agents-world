# Engineering Manager / Technical Lead Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profiles: Engineering Manager, Technical Lead, or hybrid EM/TL  
Organization context: Jira and Confluence, Bitbucket repositories, Angular/Java/Python applications, relational databases, CI/CD, cloud or on-prem platforms, Microsoft Teams, and playground/QA/production environments.

## Purpose

This pack defines everything an Engineering Manager / Technical Lead Agent needs to coordinate engineering execution safely:

- Daily engineering-management and technical-leadership task catalog
- Project, repository, delivery, architecture, quality, operations, and people-data access model
- Supervisor and specialist sub-agent design
- Planning, delivery, technical direction, code quality, reliability, security, metrics, coaching, hiring, and communication skills
- MCP servers, deterministic tools, plugins, and trusted adapters
- Leadership artifacts, workflows, schemas, approvals, and audit evidence
- Workload identity, vault integration, and short-lived capability leases
- Human decision boundaries for employment, commercial, production, and high-risk technical decisions

## Pack contents

- **223 daily tasks**
- **27 supervisor and specialist agents**
- **263 reusable skills**
- **18 MCP server definitions**
- **22 runtime plugins and adapters**
- **27 artifact types**
- **5 governed workflows**
- **7 JSON output contracts**
- **15 YAML registry and workflow files**

## Operating profiles

| Profile | Primary responsibilities | Restricted areas |
| --- | --- | --- |
| Engineering Manager | Team health, capacity, delivery, coaching, hiring process, stakeholder alignment, operational accountability | No autonomous performance, promotion, compensation, discipline, termination, medical, or hiring decisions |
| Technical Lead | Technical direction, implementation planning, standards, code quality, architecture alignment, reliability, technical mentoring | No self-approval of protected changes, architecture exceptions, releases, or production actions |
| Hybrid EM/TL | Bounded combination of both profiles for smaller teams | Must retain separate approvals and independent review for conflicts of interest |

## Core design rule

Every run is bound to:

`organization -> operating profile -> project/team -> authorized work -> repositories/systems -> environments -> data classification -> approved capabilities -> evidence -> analysis -> recommendation -> accountable human decision -> approved action -> audit`

The agent can analyze, prepare, coordinate, draft, and recommend. It cannot become the legal employer, hiring manager, release authority, security exception owner, budget owner, or production operator.

## Coordination role

| Pack | Engineering leadership responsibility |
| --- | --- |
| Product Manager | Translate priorities and outcomes into feasible engineering options, capacity implications, and delivery risks. |
| Solution Architect | Align implementation with cross-system architecture and escalate material deviations. |
| UX Designer | Coordinate design readiness, accessibility, design-system constraints, and engineering handoff. |
| Angular, Java, Python | Coordinate implementation plans, reviews, standards, dependencies, and sustainable ownership. |
| Database Architect/Developer | Coordinate schema, migration, performance, data-governance, and rollout dependencies. |
| QA Engineer | Align quality strategy, test evidence, defect risk, and release readiness. |
| DevOps | Align pipelines, infrastructure, observability, operational readiness, release, and rollback. |
| Security/SRE/Support | Delegate independent security, reliability, incident, and support analysis when those packs exist. |

## Recommended first implementation

1. Select the operating profile, project, team, work items, systems, repositories, and environments.
2. Resolve decision rights, data classification, and permitted people-data scope.
3. Build a current delivery, technical, quality, reliability, and dependency picture.
4. Generate a delivery and capacity plan with assumptions and confidence.
5. Delegate specialist analysis to the existing role packs.
6. Aggregate evidence into risks, decisions, and leadership actions.
7. Obtain independent review for high-risk recommendations.
8. Obtain payload-bound human approvals before external writes or execution.
9. Track outcomes without ranking individuals by simplistic activity metrics.
10. Retain immutable evidence and evaluate the agent for accuracy, safety, and organizational benefit.

## Pack structure

| Path | Purpose |
| --- | --- |
| docs/ | Human-readable role architecture and operating model |
| config/ | Registries and deployable configuration templates |
| workflows/ | Machine-readable leadership workflows |
| schemas/ | JSON contracts for agent outputs |
| templates/ | Reusable management and technical-leadership artifacts |
| security/opa/ | Policy-as-code baseline |
| checklists/ | Project onboarding and MVP readiness |
