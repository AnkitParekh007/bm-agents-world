# Diagram Input Specification

## Architecture diagram nodes

### People and decision owners
- Product Owner / Product Manager
- Release Manager
- Engineering Lead
- QA Lead
- DevOps / Platform Operator
- Database Owner
- Security / Compliance Owner
- Support Owner
- Business Owner

### Agent control plane
- Release Manager Supervisor
- Specialist Agents
- Workflow Engine
- OPA Policy Engine
- Approval Service
- Capability Broker
- Evidence and Artifact Store
- Audit / Observability

### Connected systems
- Jira / Confluence / JSM
- Bitbucket
- CI/CD
- Artifact and Container Registries
- Security and SBOM Systems
- Environment / Service Inventory
- Cloud / Kubernetes
- Database Migration Systems
- Feature Management
- Observability
- Microsoft Teams / Email
- Vault / Secret Manager

### Existing agent packs
- Product Manager
- Product Owner
- Business Analyst
- Solution Architect
- Engineering Manager / Technical Lead
- UX Designer
- Angular, Java, and Python Developers
- Database Architect
- QA Engineer
- DevOps
- Support / L2

## Trust boundaries

1. Human interaction boundary
2. Model and isolated workspace
3. Trusted connector and policy boundary
4. Non-production execution boundary
5. Production read-only observation boundary
6. Authorized production operator / deterministic pipeline boundary
7. Vault and signing-key boundary

## End-to-end flow

Release request → policy authorization → context → scope and versions → dependencies and calendar → parallel readiness agents → independent review → immutable go/no-go pack → human decision → operator/pipeline handoff → staged deployment → read-only telemetry validation → rollback request when criteria are met → closure → post-release review.

## Mermaid diagram recommendation

Create two diagrams:

1. `flowchart LR` for the architecture, trust boundaries, systems, and cross-pack delegation.
2. `flowchart TD` for the detailed release lifecycle with approval and rollback branches.
