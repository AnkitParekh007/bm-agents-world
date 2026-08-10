
# Diagram Input Specification

## Architecture diagram groups

1. Humans: SRE, Incident Commander, service owner, engineering lead, Support, Security, Release Manager.
2. Agent layer: supervisor and 26 specialist agents.
3. Control plane: gateway, identity, OPA, approval service, capability broker, state store.
4. Integration layer: 18 MCP servers and 22 deterministic plugins.
5. Systems: Jira/Confluence, Bitbucket, Teams, status page, observability, on-call, cloud, Kubernetes, network, databases, CI/CD, feature flags.
6. Evidence: artifact store, audit log, schemas, hashes, retention.
7. Environments: playground, QA, production, DR.

## Required architecture edges

`Human → Gateway → Policy → Supervisor → Specialists → MCP/Plugins → Systems`

`Supervisor → Independent Reviewer → Approval → Artifact or Deterministic Executor`

`Deterministic Executor → Production → Read-only Verification → Evidence Store`

## Incident flow nodes

Detection → Scope → Severity → Incident Command → Parallel Diagnosis → Mitigation Options → Safety Review → Approval → Operator/Executor → Recovery Verification → Communication → Post-Incident Review → Corrective Actions.

## Visual conventions

- Green: read-only and analysis
- Amber: approval-controlled publication or non-production execution
- Red: human/operator-only production mutation
- Blue: evidence and control plane
- Dashed edges: proposed or approval-pending actions
