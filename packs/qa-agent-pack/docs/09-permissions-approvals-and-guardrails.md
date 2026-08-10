# Permissions, Approvals, and Guardrails

## Permission model

Use RBAC for organizational roles, ABAC for project/environment/data context, and policy-as-code for each tool action.

A decision should consider:

- Human user and organization role
- Agent and sub-agent identity
- Project and environment
- Jira issue or incident scope
- Tool and action
- Resource and data classification
- Requested mutation and blast radius
- Time window and approval
- Runtime risk signals

## Default action policy

| Action | Playground | QA | Production |
|---|---|---|---|
| Read Jira/repository/docs | Allow | Allow | Allow when project-scoped |
| Read logs/traces/health | Allow | Allow | Approval or incident scope |
| Browser navigation/read | Allow | Allow | Approval; read-only flow |
| Browser form submission | Standing policy/test tenant | Approval or standing policy | Deny |
| API GET/read | Allow | Allow | Approval and allowlist |
| API mutation | Test tenant only | Approval and test tenant | Deny |
| Database read | Read-only role; bounded | Read-only role; bounded | Approval; approved views only |
| Database write/DDL | Deny direct; use test-data service | Deny direct; use test-data service | Deny |
| Create/edit Jira | Human approval | Human approval | Human approval |
| Create branch/commit/PR | Human approval | Human approval | Not environment-specific; approval required |
| Retry pipeline | Approval | Approval | Privileged release process |
| Deploy/rollback/merge | Deny for QA agent | Deny for QA agent | Deny for QA agent |
| Post Teams message | Approval | Approval | Approval |

## Approval UX requirements

An approval request must show:

- What will happen
- Target system, project, environment, and resource
- Exact fields or payload diff
- Why the action is needed
- Evidence supporting it
- Risk and potential side effects
- Credential identity to be used
- Expiry and one-time action ID

Approval must be explicit. A general chat response such as “looks good” should not approve a high-impact action unless it is bound to the displayed action ID.

## Runtime guardrails

- Tool allowlists per agent and workflow state.
- Domain, endpoint, repository, project, and database allowlists.
- Browser sandbox, isolated profile, download quarantine, and session cleanup.
- SQL parsing, statement count limit, SELECT-only validation, query timeout, and row limit.
- HTTP method and OpenAPI operation allowlists.
- File type, size, malware, and sensitive-data checks.
- Prompt-injection screening for stories, comments, pages, source files, logs, and websites.
- Confirmation before external writes and read-after-write verification.
- Rate limits, concurrency limits, cost budgets, and circuit breakers.
- Immutable audit record for policy decisions and approvals.

## Incident response

When suspicious behavior, leaked credentials, prompt injection, unexpected external writes, or cross-project access is detected:

1. Stop the run and revoke all active credential leases.
2. Close browser sessions and disable pending approvals.
3. Preserve audit and evidence artifacts.
4. Rotate affected credentials.
5. Notify the security and QA platform owners.
6. Identify affected projects, environments, and resources.
7. Patch policy, skill, plugin, or MCP configuration.
8. Add the event to the evaluation and regression set.
