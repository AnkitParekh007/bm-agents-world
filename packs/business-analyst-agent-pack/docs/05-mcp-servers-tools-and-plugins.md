# MCP Servers, Tools, and Plugins

MCP servers expose governed resources and tools. Plugins are deterministic adapters or validators. Skills describe how agents use those capabilities. These concepts remain separate so authorization can be applied precisely.

## MCP server registry

| Server | Purpose | Access |
|---|---|---|
| `atlassian-rovo` | Jira and Confluence context, search, issue and page operations | read; writes through approval |
| `bitbucket-context` | Repository, pull-request, diff, ownership, and change evidence | read-only by default |
| `document-repository` | Policies, procedures, specifications, decisions, and templates | purpose-scoped read |
| `bpmn-modeling` | BPMN process-model validation, rendering, and controlled storage | draft write only |
| `diagram-modeling` | Mermaid, C4, UML, flow, context, and data-flow rendering | sandboxed |
| `figma-design-context` | Approved design frames, components, annotations, and prototypes | read-only by default |
| `product-analytics` | Curated metrics, funnels, adoption, and outcome evidence | aggregate read-only |
| `research-feedback` | Redacted research, support themes, feedback, and survey evidence | redacted read-only |
| `data-catalog` | Business glossary, schemas, ownership, classification, and lineage | metadata read-only |
| `database-query` | Approved bounded read-only SQL for validation and analysis | read-only, row-limited |
| `api-contracts` | OpenAPI, AsyncAPI, schema, endpoint, and contract context | read-only; publication approved |
| `integration-catalog` | Systems, interfaces, events, files, owners, and dependencies | read-only |
| `requirements-traceability` | Requirement graph, baselines, links, coverage, and change impact | controlled writes |
| `microsoft-teams` | Meeting context and approved communications | draft by default |
| `artifact-service` | Structured artifacts, evidence bundles, versions, and retention | scoped write |
| `identity-vault` | Workload identity, capability leases, and secret references | no raw secrets |
| `approval-service` | Payload-bound human approvals and decision records | deterministic |
| `policy-engine` | OPA-compatible authorization and prohibited-action checks | deterministic |

## Runtime plugins

| Plugin | Responsibility |
|---|---|
| `jira-context-adapter` | Retrieves bounded Jira items and relationships |
| `confluence-context-adapter` | Retrieves pages, decisions, and templates |
| `bitbucket-change-adapter` | Reads diffs and implementation evidence |
| `bpmn-validator` | Validates BPMN syntax and modeling rules |
| `diagram-renderer` | Renders Mermaid and supported diagrams |
| `requirements-linter` | Checks requirement quality and structure |
| `ambiguity-detector` | Flags vague, subjective, and unverifiable wording |
| `traceability-engine` | Maintains source-to-release relationship graph |
| `business-rule-engine` | Builds decision tables and detects rule conflicts |
| `acceptance-validator` | Checks acceptance criteria testability and examples |
| `change-diff-engine` | Compares baselines and calculates impacted links |
| `data-dictionary-adapter` | Retrieves business terms and data ownership |
| `api-contract-adapter` | Reads OpenAPI and AsyncAPI contracts |
| `readonly-sql-adapter` | Runs parameterized bounded read-only SQL |
| `analytics-adapter` | Retrieves approved aggregate metrics |
| `figma-context-adapter` | Reads approved Figma design context |
| `teams-draft-adapter` | Drafts but does not auto-send communications |
| `document-renderer` | Produces Markdown, PDF-ready, and controlled templates |
| `redaction-plugin` | Removes sensitive or unnecessary content |
| `evidence-bundler` | Creates immutable evidence and lineage bundles |
| `vault-capability-adapter` | Uses short-lived capability leases |
| `opa-policy-adapter` | Evaluates scope, approval, and denial rules |

## Tool rules

Read tools must enforce project, purpose, classification, field, row, and time-window limits. Write tools accept only approved structured payloads. Free-form shell, unrestricted SQL, raw browser sessions, and universal tokens are not exposed. Every response carries source identity, retrieval time, classification, and evidence reference.

## Recommended first integrations

Start with Jira/Confluence read, requirements traceability, document repository, diagram rendering, artifact storage, approval service, and policy engine. Add Bitbucket, Figma, contracts, catalog, analytics, and bounded database reads after project onboarding and data-owner approval.
