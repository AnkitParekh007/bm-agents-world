# Project Access and Environment Model

## Access principles

1. No universal access: each run receives project-, system-, repository-, data-, and environment-scoped capabilities.
2. Read before design: current-state evidence must come from approved sources.
3. Separate context from mutation: analysis is read-mostly; publication and external changes require approval.
4. Production is observational: approved, redacted metadata only; no production mutation.
5. Decision authority is explicit: the agent records the human decision owner and never fabricates approval.
6. Data classification controls which fields may enter model context and artifacts.

## Required access

| Resource | Required access | Purpose | Mutation policy |
| --- | --- | --- | --- |
| Jira | Epics, stories, dependencies, acceptance criteria, risks and decisions | Business and delivery context | Exact-payload approval |
| Confluence / architecture repository | Requirements, standards, ADRs, diagrams, runbooks and postmortems | Knowledge and decision history | Approved publication only |
| Bitbucket | Repository tree, code search, history, PRs, owners and pipelines | Current state and implementation evidence | No autonomous commit, push or merge |
| Databases | Catalog, schema history, lineage and bounded diagnostics | Data architecture evidence | No direct writes; production redacted |
| API and event catalogs | OpenAPI, AsyncAPI, schema registry, ownership and usage | Contract architecture | Approved publication only |
| Cloud and infrastructure | Accounts, services, topology, IaC, quotas and regions | Deployment and platform architecture | No apply or production mutation |
| Identity and security | Domains, roles, controls, posture summaries and threat models | Security architecture | No secret values or privilege changes |
| Observability | Logs, metrics, traces, dashboards, SLOs and incidents | Runtime evidence | Read-only and redacted |
| Cost and vendor systems | Budgets, usage, forecasts, products, licenses and lifecycle | Option analysis | No purchase or commitment |
| Microsoft Teams | Architecture channels and review notifications | Collaboration | Approved sanitized publication |
| Artifact store | Immutable models, decisions, evidence and approvals | Provenance and audit | Append-only adapter |

## Environment model

| Environment | Default mode | Permitted examples | Prohibited examples |
| --- | --- | --- | --- |
| sandbox | Isolated generate and simulate | Models, contracts, diagrams, cost models and synthetic tests | External commitments, secret exposure |
| playground | Read plus approved bounded experiments | Topology reads, POCs and contract experiments | Unapproved or destructive writes |
| qa | Read plus approved validation | Conformance, integration, performance and resilience evidence | Bypassing quality gates |
| prod | Read-only and redacted | Topology, SLO, incident, cost and approved diagnostics | Deployment, DDL/DML, flags, IAM, network, DNS, TLS, rollback or failover |

## Run authorization envelope

```yaml
organization: REPLACE
portfolio: REPLACE
project: REPLACE
jira_item: REPLACE
requester: REPLACE
architecture_engagement: design|review|modernization|incident|governance
systems: []
repositories: []
environments: [sandbox]
data_classifications: [internal]
allowed_mcp_servers: []
allowed_tools: []
decision_owner: REPLACE
required_reviewers: []
expires_at: REPLACE
```

Missing or conflicting scope results in denial or read-only discovery, not guessing.
