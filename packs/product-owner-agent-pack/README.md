# Product Owner Agent Pack

A deployable governance and orchestration pack for a Product Owner AI agent operating across product strategy, business analysis, UX, architecture, engineering, QA, database, DevOps, delivery, release, and outcome workflows.

## Pack summary

- **252 daily and periodic Product Owner tasks**
- **27 supervisor and specialist agents**
- **252 reusable skills**
- **18 MCP server definitions**
- **22 deterministic plugins and adapters**
- **27 artifact types**
- **5 governed workflows**
- **7 JSON output contracts**
- **15 YAML registry/workflow files**
- OPA policy, permission matrix, vault references, project templates, and readiness checklists

## Core responsibility

The Product Owner Agent helps the accountable Product Owner maximize product value through Product Goal clarity, transparent Product Backlog management, refinement, prioritization, Sprint collaboration, release evidence, and outcome learning.

It does not replace the Product Manager, Business Analyst, UX Designer, Solution Architect, Engineering Manager/Technical Lead, Developers, QA, DevOps, Scrum Master, release authority, or Business Owner. It coordinates them using typed artifacts and governed decisions.

## Critical Scrum boundary

The Product Owner is accountable for effective Product Backlog management. Developers own the Sprint Backlog and the plan for delivering the Increment. This pack therefore prepares ordered candidates, clarity, and Sprint Goal options but does not assign work, impose estimates, or commit Sprint scope on behalf of Developers.

## Start here

1. Read `docs/02-project-access-and-environment-model.md`.
2. Review `docs/09-permissions-approvals-and-guardrails.md`.
3. Configure `config/project-registry.yaml` and `config/environment-inventory.template.yaml`.
4. Replace vault placeholders in `config/secret-references.template.yaml` with organization-owned references.
5. Test read-only workflow `workflows/backlog-refinement-and-readiness.yaml`.
6. Complete both checklists before enabling external writes.

## Default safety posture

- Production: redacted read-only observation
- Official Jira/Confluence/Teams changes: payload-bound human approval
- Customer contact, research, and experiments: separate approval and execution systems
- Business acceptance and release decisions: accountable humans
- Code, database, infrastructure, IAM, network, secret, feature flag, and deployment mutations: prohibited
- Raw secrets and restricted personal data: never exposed to the model
