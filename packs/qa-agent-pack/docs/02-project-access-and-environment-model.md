# Project Access and Environment Model

## 1. Access domains required by the QA agent

| Domain | Required access | Default mode | Write gate |
|---|---|---|---|
| Jira | Projects, issues, comments, links, attachments, history, sprint/release metadata | Read | Create/edit/transition requires approval |
| Bitbucket | Repositories, branches, commits, diffs, pull requests, build status, pipeline logs | Read | Branch, commit, PR, merge, retry requires approval |
| Product documentation | Confluence, specifications, runbooks, release notes, test standards | Read | Publishing requires approval |
| Frontend applications | Browser access to playground and QA | Execute | Destructive flows follow test-data policy |
| Backend APIs | OpenAPI contracts and environment endpoints | Read/execute | Mutating calls limited to approved test tenants/data |
| Databases | Schema metadata and allowlisted read-only queries | Read | No direct DDL/DML; controlled test-data service only |
| CI/CD | Build, test, artifact, and deployment status | Read | Retry/deploy/rollback requires approval |
| Observability | Logs, traces, metrics, alerts, correlation data | Read | No alert or dashboard mutation by default |
| Teams | Channel and thread context where approved | Read | Posting requires delegated identity/bot and approval |
| Artifact store | Test plans, evidence, reports, traces, screenshots | Read/write scoped to run | Deletion follows retention policy |
| Secret manager | Secret references only | Runtime fetch | Agent never displays or persists secret values |

## 2. Organization project inventory

| Project | Frontend | Backend | Source | Environments |
|---|---|---|---|---|
| PCC | Angular 12 | Java | Bitbucket | playground, qa, prod |
| SOP | Angular 15 | Java | Bitbucket | playground, qa, prod |
| DataBridge | AngularJS | Java | Bitbucket | playground, qa, prod |

The configuration files intentionally leave repository URLs, Jira keys, API base URLs, database endpoints, tenant IDs, and secret paths blank.

## 3. Required service identities

Create separate identities instead of one shared QA-agent account:

- `qa-orchestrator-<environment>`: workflow coordination; no product-data access by itself.
- `qa-jira-reader`: Jira read and search.
- `qa-jira-writer`: narrowly scoped Jira writes, invoked only after approval.
- `qa-bitbucket-reader`: repository, PR, diff, and pipeline read.
- `qa-bitbucket-writer`: branch/PR/test-code actions after approval.
- `qa-browser-<project>-<environment>`: browser test identity for one project/environment.
- `qa-api-<project>-<environment>`: API test identity with test-tenant scopes.
- `qa-db-reader-<project>-<environment>`: read-only database role with allowlisted views.
- `qa-testdata-<project>-<environment>`: controlled test-data API, not raw database write credentials.
- `qa-observability-reader`: logs, traces, and metrics read.
- `qa-teams-publisher`: delegated or bot identity for approved notifications.

## 4. Environment rules

### Playground

- Broadest permitted QA experimentation.
- Synthetic data only.
- Automated mutation allowed within approved namespaces.
- No shared or production credentials.

### QA

- Release-candidate validation and controlled regression.
- Mutations limited to approved test tenants, accounts, and datasets.
- High-volume or destructive suites require approval and scheduling.

### Production

- Read-only by default.
- No synthetic account creation, form submission, database writes, pipeline changes, or destructive browser actions.
- Each production run requires a ticket, approver, expiry, declared tools, and full evidence.

## 5. Access request contract

Every tool invocation must be evaluated against:

- Actor and delegated human identity
- Project
- Environment
- Work item or incident reference
- Requested capability and resource
- Data classification
- Intended action
- Approval status and expiry
- Run ID and trace ID

## 6. Network access

- Place MCP servers and adapters behind an agent gateway.
- Use private connectivity to databases and internal APIs.
- Apply outbound domain allowlists to browser and HTTP tools.
- Deny direct access from the language model to secret-manager APIs.
- Proxy all external actions through audited adapters.
- Use separate network policies for playground, QA, and production.
