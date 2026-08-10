# Solution Architect Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Solution Architect  
Organization context: Bitbucket repositories, Jira and Confluence, relational databases, Angular frontends, Java and Python backends, CI/CD, cloud or on-prem platforms, Microsoft Teams, and playground/QA/production environments.

## Purpose

This pack defines everything an enterprise Solution Architect Agent needs to operate safely and coordinate the existing engineering agent packs:

- Daily solution-architecture task catalog
- Business, product, repository, integration, database, infrastructure, security, observability, and cost access model
- Supervisor and specialist sub-agent design
- Domain, application, integration, data, cloud, security, reliability, performance, migration, cost, and governance skills
- MCP servers, atomic tools, runtime plugins, and enterprise adapters
- C4, sequence, data-flow, deployment, ADR, threat-model, review, and handoff artifacts
- Stateful architecture workflows with evidence and decision gates
- Workload identity, key-vault integration, and short-lived capability leases
- Human approvals, decision rights, publication controls, and production guardrails
- Observability, audit, evaluation, runtime isolation, and implementation-conformance checks


## Pack contents

- **233 Solution Architect daily tasks**
- **27 supervisor and specialist agents**
- **227 reusable architecture skills**
- **18 MCP server definitions**
- **22 runtime plugins and adapters**
- **27 architecture artifact types**
- **5 governed workflows**
- **7 JSON output contracts**
- **15 YAML registry and workflow files**
- Permission matrix, approval policies, vault-reference template, project profiles, OPA policy, onboarding checklist, and MVP-readiness checklist

## Core design rule

The agent does not act as an unaccountable technical authority. Every run is bound to:

`organization -> portfolio/project -> Jira item -> stakeholders -> systems -> repositories -> environments -> data classification -> constraints -> quality attributes -> approved tools -> evidence -> architecture options -> decision owner -> approved action -> artifacts -> audit record`

The agent may analyze, model, compare, draft, and recommend. Architecture approval, business-risk acceptance, security exceptions, production changes, vendor commitments, and irreversible decisions remain human responsibilities.

## Coordination role

| Existing pack | Architect coordination responsibility |
| --- | --- |
| Product Manager | Convert outcomes, constraints, roadmap, and priorities into architecture drivers. |
| UX Designer | Integrate journeys, accessibility, design-system, and interaction constraints. |
| Frontend Angular | Define frontend boundaries, contracts, state, performance, security, and migration constraints. |
| Java Developer | Define service boundaries, APIs, messaging, persistence, runtime, and operational requirements. |
| Python Developer | Define Python service, automation, data, worker, or MCP responsibilities and contracts. |
| Database Architect/Developer | Define ownership, models, storage, consistency, lifecycle, migrations, and governance. |
| QA Engineer | Convert architecture risks and quality attributes into validation and regression strategies. |
| DevOps | Translate topology, identity, network, reliability, observability, deployment, and rollback designs. |

## Supported solution profiles

| Profile | Typical use | Required behavior |
| --- | --- | --- |
| Enterprise application change | Cross-layer features in PCC, SOP, or DataBridge | Discover current state, identify affected teams, define contracts and quality attributes, and create implementation handoff. |
| New service or platform capability | Java/Python service, shared API, internal platform, or MCP service | Define ownership, boundaries, contracts, data, security, operability, cost, and lifecycle before implementation. |
| Integration architecture | APIs, events, queues, files, batch, vendors, or system-to-system flows | Require versioning, idempotency, retries, observability, reconciliation, security, and exit strategy. |
| Modernization | AngularJS/legacy Angular, Java/JDK, database, cloud, or platform modernization | Produce transition architecture, coexistence, sequencing, migration, rollback, and decommissioning. |
| Cloud or infrastructure solution | Kubernetes, managed services, serverless, hybrid, or on-prem topology | Compare options using quality attributes, security, reliability, operability, cost, and organizational constraints. |
| Architecture review | Existing design, pull request, production issue, or major change | Perform evidence-based tradeoff and risk review; do not self-approve high-risk designs. |
| AI agent platform | BM Agent Foundry and organization automation | Define agent boundaries, MCP trust, identity, policy, data handling, observability, approvals, and failure containment. |

## Organization project templates

- **PCC:** Angular 12 and Java; legacy-compatible, version-aware architecture.
- **SOP:** Angular 15 and Java; service or monolith topology resolved from evidence.
- **DataBridge:** AngularJS and Java; conservative maintenance and incremental modernization.
- **BM Agent Foundry:** Supabase, Kubernetes/GKE, containerized runtimes, LLM providers, MCP adapters, policy, approvals, secrets, and artifacts.
- **Environments:** sandbox, playground, QA, and production. Autonomous production mutation is prohibited.

## Recommended first implementation

1. Select project, Jira item, systems, repositories, stakeholders, and environment scope.
2. Validate access, data classification, allowed tools, and decision rights.
3. Build current-state application, integration, data, infrastructure, identity, and operations models.
4. Produce measurable quality-attribute scenarios.
5. Generate multiple domain, application, integration, data, cloud, security, reliability, cost, and migration options.
6. Create option comparison, recommendation, risks, ADR drafts, diagrams, and approval requirements.
7. Run independent architecture review.
8. Obtain human decision.
9. Produce role-specific implementation handoffs.
10. Compare delivery evidence with the approved architecture and govern exceptions.

## Pack structure

| Path | Purpose |
| --- | --- |
| docs/ | Human-readable architecture and operating model |
| config/ | Registries and deployable configuration templates |
| workflows/ | Machine-readable architecture workflows |
| schemas/ | JSON contracts for agent outputs |
| templates/ | Reusable architecture documents and handoffs |
| security/opa/ | Policy-as-code baseline |
| checklists/ | Project onboarding and MVP readiness |
