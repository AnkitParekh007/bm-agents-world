# Product Owner Agent — MCP Servers, Tools, and Plugins

## Separation of concerns

- **Skills** describe what an agent knows how to do.
- **MCP servers** expose governed resources, prompts, and tools.
- **Tools** are atomic operations such as reading a Jira item or validating a schema.
- **Plugins/adapters** provide deterministic integration, validation, redaction, rendering, policy, and audit behavior.
- **Artifacts** are versioned outputs.

## MCP server registry

| Server | Purpose | Access |
|---|---|---|
| `atlassian-rovo-mcp` | Jira and Confluence context plus approval-controlled issue/page actions | read plus approved write |
| `bitbucket-context-mcp` | Repository, pull request, branch, commit, and code-history context | read-only by default |
| `product-discovery-mcp` | Approved product strategy, insights, opportunities, and roadmap context | read plus approved write |
| `figma-mcp` | Design, FigJam, variables, components, prototypes, and Dev Mode context | read-only by default |
| `analytics-mcp` | Curated privacy-thresholded product metrics and event definitions | read-only |
| `feedback-research-mcp` | Approved research findings, support themes, surveys, and feedback summaries | redacted read-only |
| `support-mcp` | Support cases, known issues, customer-impact summaries, and escalation status | redacted read-only |
| `crm-insights-mcp` | Approved account themes and commercial context without raw exports | aggregated read-only |
| `openapi-contract-mcp` | Approved API contracts, schemas, examples, owners, and version history | read-only |
| `database-metadata-mcp` | Approved schema metadata and bounded read-only product validation queries | metadata-first read-only |
| `ci-cd-status-mcp` | Build, test, deployment, and environment-readiness status | read-only |
| `observability-mcp` | Redacted service health, incidents, logs, metrics, traces, and SLO context | read-only |
| `feature-management-mcp` | Feature flag and experiment metadata | read-only; changes prohibited |
| `release-calendar-mcp` | Release windows, dependencies, change freezes, and approved release records | read-only |
| `teams-mcp` | Approved collaboration context and approval-controlled messages | read plus approved post |
| `artifact-store-mcp` | Versioned product artifacts, evidence, hashes, and retention | scoped read/write |
| `vault-capability-mcp` | Short-lived capability leases and opaque secret references | no raw secret exposure |
| `policy-approval-mcp` | OPA decisions, approval requests, signatures, expiry, and audit records | policy authority |

## Plugin registry

| Plugin | Purpose | Mode |
|---|---|---|
| `jira-read-adapter` | Reads work items, links, comments, status, history, and backlog order | read-only |
| `jira-write-adapter` | Creates or updates approved backlog items and ordering | approval-controlled |
| `confluence-read-adapter` | Reads product, requirement, decision, and release pages | read-only |
| `confluence-publish-adapter` | Publishes approved product artifacts | approval-controlled |
| `backlog-analysis-engine` | Detects duplicates, aging, readiness, dependencies, and taxonomy gaps | deterministic |
| `story-quality-engine` | Evaluates story purpose, scope, examples, acceptance, and traceability | deterministic |
| `prioritization-engine` | Computes configured scoring and scenario comparisons | deterministic |
| `dependency-graph-engine` | Builds cross-team and cross-system dependency graphs | deterministic |
| `acceptance-criteria-validator` | Checks scenario coverage and ambiguity | deterministic |
| `analytics-query-adapter` | Executes approved semantic-metric queries | read-only |
| `research-redaction-adapter` | Redacts identifiers and returns approved evidence summaries | read-only |
| `figma-context-adapter` | Retrieves approved design and prototype context | read-only |
| `openapi-validator` | Validates approved API contracts and examples | deterministic |
| `release-readiness-engine` | Aggregates quality, risk, support, rollout, and approval evidence | deterministic |
| `uat-evidence-adapter` | Collects approved UAT execution evidence and findings | scoped write |
| `teams-publication-adapter` | Posts approved summaries and decisions | approval-controlled |
| `document-renderer` | Renders markdown, JSON, CSV, and diagrams into evidence artifacts | deterministic |
| `schema-validator` | Validates structured outputs against JSON Schema | deterministic |
| `evidence-hasher` | Hashes inputs, outputs, decisions, and approval payloads | deterministic |
| `policy-client` | Requests OPA decisions for every privileged action | deterministic |
| `capability-broker-client` | Obtains scoped short-lived capabilities | deterministic |
| `audit-emitter` | Emits immutable structured audit and provenance events | deterministic |

## Tool-execution rules

All tools declare input/output schemas, risk, data class, side effects, timeout, retry policy, idempotency, approval requirement, and audit fields. Tool discovery does not grant tool execution.
