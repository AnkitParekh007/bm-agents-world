# Product Manager Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Product Manager / Product Owner / Product Operations  
Organization context: Jira, Jira Product Discovery, Confluence, Bitbucket, Figma, product analytics, experiments and feature flags, support and CRM insights, Microsoft Teams, playground/QA/production environments, Angular frontends, Java/Python services, enterprise databases, and DevOps platforms.

## Purpose

This pack defines the access, skills, agents, MCP servers, deterministic tools, plugins, artifacts, orchestration, key-vault integration, approvals, evaluation, and runtime controls required for an enterprise Product Manager Agent.

It supports product discovery, customer and market insight synthesis, strategy, opportunity framing, prioritization, roadmaps, requirements, story mapping, backlog governance, analytics, experimentation, stakeholder alignment, delivery readiness, release planning, go-to-market preparation, pricing/packaging analysis, product operations, and outcome review.

## Core design rule

The agent does not own product accountability and cannot create commercial commitments or production changes. Every run is bound to:

`organization -> project -> product area -> Jira/discovery item -> evidence sources -> environment -> requester -> decision owner -> purpose -> allowed tools -> artifacts -> approvals -> expiration`

## Supported execution profiles

| Profile | Typical work | Required behavior |
|---|---|---|
| Discovery | Customer problems, evidence, opportunities, assumptions | Separate evidence from interpretation and do not fabricate research |
| Strategy | Vision, target segments, outcomes, strategic choices | Make tradeoffs explicit and define review triggers |
| Prioritization | Scoring, portfolio scenarios, displaced work | Expose inputs, weights, confidence, and sensitivity |
| Roadmapping | Outcomes, themes, sequencing, dependencies | Avoid converting estimates into commitments |
| Requirements | Briefs, PRDs, acceptance, measurement | Preserve traceability and testability |
| Delivery and release | Scope, readiness, GTM, rollout, risks | Read operational status; human retains release authority |
| Outcomes | Adoption, quality, customer and business impact | Compare against baseline and document uncertainty |

## Organization project templates

- **PCC:** Angular 12 and Java; legacy-compatible product planning.
- **SOP:** Angular 15 and Java; version-aware delivery and shared-platform dependencies.
- **DataBridge:** AngularJS and Java; conservative maintenance, continuity, and migration learning.
- **Environments:** product sandbox, planning, playground, QA, and production read-only.

## Recommended first implementation

1. User selects project, product area, Jira/JPD item, evidence sources, environment, and workflow.
2. Supervisor resolves identity, decision authority, data classification, product lifecycle, scope, and approvals.
3. Context, customer, market, analytics, delivery, and risk specialists gather bounded evidence.
4. Agent drafts a product brief, prioritization scorecard, requirements package, roadmap scenario, or outcome review.
5. Reviewer challenges evidence, uncertainty, tradeoffs, and risks.
6. Human approves product decisions and any publication.
7. Approved updates are executed through deterministic adapters and recorded immutably.

## Pack facts

- **222 daily tasks**
- **26 supervisor and specialist agents**
- **233 reusable skills**
- **18 MCP server definitions**
- **22 runtime plugins/adapters**
- **25 artifact types**
- **5 machine-readable workflows**
- **7 JSON output contracts**
- **15 YAML configuration/workflow files**

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable templates |
| `workflows/` | Machine-readable Product Manager workflows |
| `schemas/` | JSON contracts for structured outputs |
| `templates/` | Reusable product artifacts |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |
