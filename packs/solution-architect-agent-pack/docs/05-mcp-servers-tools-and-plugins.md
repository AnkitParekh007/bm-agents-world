# MCP Servers, Tools, and Plugins

## Separation

- MCP servers expose governed resources, prompts, and tools.
- Tools are atomic deterministic operations.
- Plugins/adapters connect workflows to organization systems.
- Skills are reasoning capabilities.
- Artifacts are immutable outputs or evidence references.

## MCP server registry

| Server | Purpose | Default mode |
| --- | --- | --- |
| atlassian-context | Jira, Confluence and delivery-context resources plus approval-controlled writes | read-mostly |
| bitbucket-repository | Repository inventory, code search, ownership, pull requests and pipeline metadata | read-mostly |
| enterprise-architecture-repository | Capabilities, applications, standards, principles, decisions and technology radar | read-only |
| architecture-knowledge | Approved reference architectures, patterns, policies, runbooks and incident learnings | read-only |
| architecture-modeling | C4, Mermaid, Structurizr, graph and ArchiMate-compatible model generation | workspace-generate |
| openapi-contracts | OpenAPI resources, validation, compatibility and generation | read-generate |
| asyncapi-contracts | AsyncAPI resources, event schema, compatibility and generation | read-generate |
| database-metadata | Database catalog, schema history, lineage and bounded diagnostics | read-only |
| cloud-platform-catalog | Cloud accounts, services, quotas, regions and approved patterns | read-only |
| kubernetes-platform | Clusters, namespaces, workloads, policies, services and topology | observe |
| observability | Logs, metrics, traces, dashboards, SLOs, incidents and capacity evidence | read-only |
| security-posture | Threat models, vulnerability summaries, IAM posture and security evidence | read-only |
| identity-governance | Identity domains, roles, service accounts and access policies | read-only |
| cost-management | Budgets, usage, allocation, forecasts and option estimates | read-only |
| vendor-technology-catalog | Approved products, licenses, support status, lifecycle and exceptions | read-only |
| artifact-evidence | Immutable architecture artifacts, hashes, retention and retrieval | append-read |
| secret-broker | Capability lease requests without exposing raw credentials | broker-only |
| policy | OPA decisions, scope validation, data classification and approval verification | mandatory |

## Runtime plugins

| Plugin | Purpose | Status | Credential handling |
| --- | --- | --- | --- |
| jira-work-item-adapter | Read Jira epics/stories and publish approved architecture updates | Planned | Brokered if required |
| confluence-architecture-adapter | Read architecture knowledge and publish approved documents | Planned | Brokered if required |
| bitbucket-context-adapter | Repository, code, ownership, PR, pipeline and change-history context | Planned | Brokered if required |
| enterprise-architecture-adapter | Capability, application, technology, principle and decision repository access | Planned | Brokered if required |
| code-graph-adapter | Cross-repository dependency and symbol graph generation | Planned | Brokered if required |
| structurizr-c4-adapter | C4 model and diagram generation | Planned | Brokered if required |
| mermaid-diagram-adapter | Mermaid flow, sequence, state, ER and architecture diagrams | Planned | Brokered if required |
| archimate-export-adapter | ArchiMate-compatible model export without embedding licensed standard text | Planned | Brokered if required |
| openapi-adapter | OpenAPI 3.2 validation, diff and documentation | Planned | Brokered if required |
| asyncapi-adapter | AsyncAPI validation, schema evolution and documentation | Planned | Brokered if required |
| schema-registry-adapter | Event and data-schema metadata and compatibility checks | Planned | Brokered if required |
| database-catalog-adapter | Engine-aware metadata, lineage and bounded diagnostics | Planned | Brokered if required |
| cloud-catalog-adapter | AWS, Azure, Google Cloud and private-platform service metadata | Planned | Brokered if required |
| kubernetes-topology-adapter | Cluster and workload topology read model | Planned | Brokered if required |
| observability-adapter | Read-only logs, metrics, traces, SLOs and incident evidence | Planned | Brokered if required |
| threat-model-adapter | Trust-boundary, threat, mitigation and residual-risk modeling | Planned | Brokered if required |
| identity-governance-adapter | Roles, service identities and policy metadata | Planned | Brokered if required |
| cost-estimation-adapter | Architecture cost scenarios and usage-based estimates | Planned | Brokered if required |
| technology-radar-adapter | Technology lifecycle and organizational approval metadata | Planned | Brokered if required |
| artifact-store-adapter | Immutable content-addressed artifact storage | Planned | Brokered if required |
| approval-gateway-adapter | Payload-bound expiring human approvals | Planned | Brokered if required |
| teams-collaboration-adapter | Approved architecture summaries and review notifications | Planned | Brokered if required |

## Required atomic tools

- Search Jira, Confluence, repositories, architecture records, and artifact metadata.
- Generate dependency, interface, lineage, topology, and trust-boundary graphs.
- Validate OpenAPI and AsyncAPI and compare compatibility.
- Render C4, Mermaid, sequence, deployment, and data-flow diagrams.
- Query approved cloud, Kubernetes, identity, security, observability, cost, and vendor metadata.
- Calculate capacity, availability, latency budget, cost, and option scenarios.
- Hash artifacts and evaluate OPA policy and approval bindings.

Every tool requires a typed schema, side-effect classification, timeout, data-classification behavior, audit record, and prompt-injection filtering.
