# QA Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: QA Engineer  
Organization context: PCC, SOP, and DataBridge; Bitbucket repositories; Java backends; Angular/AngularJS frontends; PostgreSQL-compatible database access; playground, QA, and production environments; Jira and Microsoft Teams.

## Purpose

This pack defines everything an enterprise QA agent needs to operate safely:

- Daily QA task catalog
- Project, repository, environment, API, database, and documentation access
- Supervisor and specialist sub-agent design
- Reusable QA skills
- MCP servers and atomic tools
- Runtime plugins and adapters
- Input, output, evidence, and governance artifacts
- Orchestration workflows and state model
- Secret management, identity, and key-vault integration
- Human approvals, permissions, and production guardrails
- Observability, audit, evaluation, deployment, and rollout controls

## Core design rule

The QA agent never receives universal credentials. Every run is bound to:

`organization -> project -> environment -> user/request -> approved task -> allowed tools -> evidence -> audit record`

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable workflow definitions |
| `schemas/` | JSON contracts for agent outputs |
| `templates/` | Reusable QA output templates |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Implementation and onboarding checklists |

## Recommended first implementation

Build one read-heavy workflow first:

1. User selects project and Jira story.
2. Agent reads the story, linked context, repository diff, and environment metadata.
3. Agent generates a test plan and test cases.
4. Human approves execution.
5. Browser, API, and read-only database sub-agents execute in playground or QA.
6. Evidence is stored in an immutable run folder.
7. Agent drafts a Jira bug or QA completion report.
8. Human approves any external write action.

Production remains read-only and separately approved.

## Important assumptions to confirm during implementation

- Whether Jira and Bitbucket are Cloud or Data Center editions.
- Exact PostgreSQL or other database engines per project.
- Identity provider and hosting cloud used by the agent runtime.
- Whether Teams posting will use a delegated user, Teams bot, workflow, or another approved organization integration.
- Existing API specifications, test management system, logging platform, and CI/CD conventions.
