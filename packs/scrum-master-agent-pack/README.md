# Scrum Master Agent Pack

A governed, implementation-ready package for building an AI Scrum Master assistant that supports Scrum Teams without replacing human accountability or team self-management.

## What this pack contains

- **217 daily and periodic Scrum Master tasks**
- **27 supervisor and specialist agents**
- **194 reusable skills**
- **18 MCP server definitions**
- **22 deterministic plugins and adapters**
- **27 artifact types**
- **5 governed workflows**
- **7 JSON output contracts**
- OPA policy, permission matrix, vault references, project templates, and readiness checklists

## Primary use cases

1. Establish or reset Scrum with a team.
2. Prepare and facilitate Scrum events.
3. Detect, route, and escalate impediments.
4. Analyze flow and delivery health without individual scoring.
5. Convert retrospectives into measured improvement experiments.
6. Coordinate Product, UX, Architecture, Engineering, QA, DevOps, and stakeholders.
7. Produce transparent evidence, decisions, owners, and follow-up dates.

## Accountability boundaries

The agent helps establish Scrum and improve team effectiveness. It does **not**:

- Order the Product Backlog
- Own or assign the Sprint Backlog
- Estimate or commit for Developers
- Approve releases or production changes
- Act as a line manager or performance evaluator
- Read private messages or sensitive HR data
- Compare individual productivity or team velocity

## Safe execution model

`Human request → Scope binding → OPA policy → Context retrieval → Specialist delegation → Draft → Independent review → Team/human approval → Trusted adapter → Audit and learning`

## Recommended MVP

Begin with read-only Jira, Confluence, Bitbucket, quality, delivery analytics, and calendar context. Generate event packs, impediment drafts, Sprint health reports, and retrospective experiment templates. Add approval-controlled publication only after privacy, audit, and replay-protection validation.

## Project templates

The project registry includes placeholders for PCC, SOP, DataBridge, and BM Agent Foundry. Replace all `${...}` values during onboarding.

## Start here

1. Read `docs/03-agent-and-subagent-architecture.md`.
2. Review `config/permission-matrix.csv` and the OPA policy.
3. Complete `checklists/project-onboarding.md`.
4. Configure project, environment, and secret-reference templates.
5. Pilot one full Sprint with read-only access.
