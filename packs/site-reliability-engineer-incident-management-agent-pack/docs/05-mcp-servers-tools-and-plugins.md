
# MCP Servers, Tools, and Plugins

## Concept separation

- **MCP server:** governed integration boundary exposing resources, prompts, or tools.
- **Tool:** atomic operation such as querying a metric, fetching an incident, or validating an SLO.
- **Plugin/adapter:** deterministic implementation that redacts, calculates, validates, correlates, or executes a constrained operation.
- **Skill:** reusable agent capability combining reasoning, tools, and policies.

## Required MCP groups

1. Service catalog and CMDB
2. Observability and telemetry
3. Alerting and on-call
4. Incident command and status communication
5. Kubernetes, cloud, network, DNS, and TLS diagnostics
6. CI/CD, release, feature, and configuration context
7. Database diagnostics
8. Synthetic monitoring and approved resilience tests
9. Jira, Confluence, Bitbucket, and Teams
10. Artifact, vault, policy, and approval services

## Tool safety

Telemetry queries must be time-bound, service-bound, row-bound, redacted, and read-only. Active synthetic, load, chaos, failover, restore, and production operations require explicit target allowlists, rate limits, stop conditions, payload hashes, approvals, and non-replay controls.

## Recommended implementation order

Start with service context, observability, incident records, release history, and artifact storage in read-only mode. Add approved Jira/Teams/status publication next. Add non-production tests after target isolation. Add deterministic production procedures last.
