# Project Access and Environment Model

## Access principles

1. Start with a user-selected project, team, operating profile, work item, and environment.
2. Use least privilege, minimum necessary data, explicit purpose, and short-lived capability leases.
3. Separate work-management, source, delivery, observability, people, recruiting, and financial domains.
4. Never place raw credentials, unrestricted production logs, employee records, candidate records, compensation data, or medical information in model context.
5. Treat playground and QA writes as approval-controlled; production actions are request-only.

## Required project context

- Product goals, roadmap, Jira project, and authoritative requirements
- Team and service ownership
- Repositories, protected branches, code owners, build tools, and quality gates
- Applications, APIs, events, databases, environments, and deployment systems
- Architecture decisions, standards, data classification, and security requirements
- SLOs, alerts, runbooks, support rotations, and release calendars
- Approved aggregate engineering metrics and their definitions

## People-data boundary

The default agent has no employee-record access. Purpose-bound people workflows may receive only the smallest approved subset: role expectations, employee-selected topics, prior agreed actions, aggregate team-health inputs, or structured interview evidence. Consequential employment decisions remain human-only.

## Project profiles

- **PCC:** legacy-compatible Angular 12/Java delivery and modernization coordination.
- **SOP:** Angular 15/Java feature delivery and shared-platform alignment.
- **DataBridge:** AngularJS/Java/data integration maintenance with conservative change control.
- **BM Agent Foundry:** AI-agent platform delivery, runtime isolation, MCP trust, approval, and security coordination.

## Environment behavior

| Environment | Read | Write/execute | Rule |
| --- | --- | --- | --- |
| Sandbox | Scoped | Isolated workspace | No production data or credentials |
| Playground | Scoped | Payload-bound approval | Reversible, logged, project-specific |
| QA | Scoped | Payload-bound approval | Test evidence and environment ownership required |
| Production | Redacted/scoped | Request only | Authorized human or deterministic deployment system executes |
