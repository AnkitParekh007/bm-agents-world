# Business Analyst Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Business Analyst / Requirements Analyst / Process Analyst / Business Systems Analyst / Product Owner Support  
Organization context: Jira, Confluence, Bitbucket, Figma, BPMN and diagram tooling, API and integration contracts, data catalogs and bounded read-only databases, analytics and feedback systems, Microsoft Teams, playground/QA/production environments, Angular frontends, Java/Python services, enterprise databases, and DevOps platforms.

## Purpose

This pack defines the access, skills, sub-agents, MCP servers, deterministic tools, plugins, artifacts, orchestration, key-vault integration, approvals, evaluation, and runtime controls required for an enterprise Business Analyst Agent.

It supports business-need framing, stakeholder analysis, elicitation, process discovery and redesign, requirements analysis, business rules, data and interface requirements, nonfunctional requirements, user stories and acceptance criteria, traceability, change impact, UAT, delivery readiness, and solution evaluation.

## Core design rule

The agent can gather evidence, structure ambiguity, draft requirements, model processes, maintain traceability, and recommend options. It cannot own business policy, scope, priority, legal interpretation, official acceptance, commercial commitments, or production changes.

Every run is bound to:

`organization → project → product/process area → request → requester → decision owner → purpose → evidence sources → environment → tools → artifacts → approvals → expiration`

## Pack facts

- **220 daily and periodic tasks**
- **27 supervisor and specialist agents**
- **247 reusable skills**
- **18 MCP server definitions**
- **22 runtime plugins/adapters**
- **27 artifact types**
- **5 machine-readable workflows**
- **7 JSON output contracts**
- **15 YAML configuration/workflow files**

## Recommended first implementation

1. Select project, request, product/process area, evidence sources, environment, decision owner, and workflow.
2. Resolve authorization, classification, scope, lifecycle state, allowed tools, and approvals.
3. Gather bounded Jira, Confluence, process, policy, design, contract, glossary, and implementation context.
4. Draft an analysis plan, process model, requirements package, impact assessment, or UAT package.
5. Run deterministic quality, ambiguity, testability, rule, traceability, and evidence checks.
6. Obtain independent review for material or cross-system work.
7. Return decisions to accountable humans and publish only the approved immutable payload.
8. Support delivery, UAT, and post-implementation evaluation without taking over product, engineering, or release authority.

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries, permissions, and deployable templates |
| `workflows/` | Machine-readable Business Analyst workflows |
| `schemas/` | JSON contracts for structured outputs |
| `templates/` | Reusable business-analysis artifacts |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |
