# Diagram Input Specification

## Architecture diagram nodes

1. Humans: Scrum Team, Product Owner, Developers, Scrum Master, stakeholders, Engineering Manager, Product Manager
2. Agent gateway and Scrum Master supervisor
3. Specialist agent cluster
4. Existing role-pack delegates
5. MCP and adapter layer
6. Jira, Confluence, Bitbucket, Teams, calendar, analytics, quality, CI/CD, observability, incidents, architecture, releases
7. OPA policy, approval service, capability broker, key vault
8. Artifact store, audit stream, and evaluation service

## Trust boundaries

- Human interaction boundary
- Model and orchestration boundary
- Trusted deterministic adapter boundary
- Organization SaaS boundary
- Production read-only boundary
- Restricted people-data boundary

## End-to-end flow

`Request → Scope → Policy → Context → Specialist delegation → Facilitation/analysis draft → Independent review → Team/human approval → Trusted publication → Observation → Improvement learning`

## Required Mermaid diagrams

- System context diagram
- Container/component architecture
- Sequence diagram for Sprint event preparation
- Sequence diagram for impediment escalation
- State diagram for approval-controlled publication
- Flowchart for retrospective-to-experiment lifecycle
- Trust-boundary and credential-flow diagram
- Cross-pack orchestration diagram

## Style

Use grouped subgraphs, concise labels, numbered flows, explicit approval diamonds, red prohibition nodes, and separate read-only versus write paths.
