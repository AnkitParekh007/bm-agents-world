# Frontend Angular Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Frontend Angular Engineer  
Organization context: PCC, SOP, and DataBridge; Bitbucket repositories; Java backends; Angular 12, Angular 15, and AngularJS frontends; playground, QA, and production environments; Jira, Figma, and Microsoft Teams.

## Purpose

This pack defines everything an enterprise Angular frontend agent needs to operate safely:

- Daily frontend engineering task catalog
- Project, repository, branch, design, API, environment, and documentation access
- Supervisor and specialist sub-agent design
- Version-aware Angular and AngularJS skills
- MCP servers, atomic tools, IDE/runtime plugins, and adapters
- Code, planning, evidence, review, and release artifacts
- Stateful orchestration workflows
- Workload identity, key-vault integration, and short-lived credentials
- Human approvals, repository controls, and production guardrails
- Observability, audit, evaluation, runtime isolation, and rollout controls

## Core design rule

The agent never receives a universal repository token, production credential, or raw vault secret. Every run is bound to:

`organization -> project -> repository -> branch -> environment -> requester -> Jira item -> approved action -> allowed tools -> patch/evidence -> audit record`

## Project-specific operating modes

| Project | Frontend | Agent mode |
|---|---|---|
| PCC | Angular 12 | Legacy-compatible; preserve NgModules and existing build/test conventions unless migration is approved |
| SOP | Angular 15 | Version-aware Angular development; no silent adoption of later APIs |
| DataBridge | AngularJS | Maintenance and risk-reduction mode; characterize behavior before changes and plan migration separately |

## Recommended first implementation

1. User selects a project, repository, branch, and Jira story.
2. Agent reads story context, design references, codebase rules, API contracts, and related code.
3. Agent produces an impact analysis and implementation plan.
4. Human approves the plan when the change is medium or high risk.
5. Agent creates a patch inside an isolated workspace.
6. Agent runs formatting, linting, type checking, unit tests, production build, and approved browser checks.
7. Agent creates a change manifest, evidence bundle, and pull-request draft.
8. Human approves commit, push, Jira write, pull-request creation, pipeline rerun, or deployment-related actions.

Production deployment, merge, package publication, secret changes, and database writes remain outside autonomous scope.

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable workflow definitions |
| `schemas/` | JSON contracts for agent outputs |
| `templates/` | Reusable frontend engineering outputs |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |

## Important assumptions to confirm during implementation

- Jira and Bitbucket Cloud versus Data Center deployment types.
- Exact repository URLs, default branches, branch protections, and code-owner rules.
- Package manager, Node.js version, lockfile policy, private npm registry, and proxy configuration per project.
- Angular CLI, Nx, custom builder, Karma/Jasmine, Jest, Vitest, Cypress, or Playwright usage per repository.
- Figma and design-system availability.
- CI/CD and artifact storage conventions.
- Identity provider and preferred secret manager.
- Whether agent-generated commits must be signed and whether a bot identity is permitted.
