# Diagram Input Specification

The future Mermaid architecture should show these layers:

1. **Users and triggers** — Jira, Product Owner, Business Analyst, Solution Architect, Engineering Lead, incident/release triggers.
2. **Integration/API Architect Supervisor** — orchestration, evidence, checkpoints, approvals.
3. **Specialist agents** — REST, GraphQL, gRPC, events, gateway, identity, security, schemas, compatibility, reliability, performance, observability, testing, partner/legacy.
4. **MCP/resource layer** — Atlassian, Bitbucket, catalogs, registries, gateway, broker, IdP, observability, security assurance.
5. **Deterministic validation layer** — OpenAPI/AsyncAPI/protobuf/GraphQL/schema linters, breaking-change tools, contract tests, performance checks.
6. **Policy/security layer** — OPA, capability broker, key vault, payload-bound approvals.
7. **Artifacts** — contracts, ADRs, diagrams, impact assessments, test plans, handoff bundles.
8. **Execution owners** — frontend/backend/data/QA/DevOps/SRE/Support/Release agents.
9. **Environment boundary** — playground, QA, production read-only, production operator/pipeline.

The end-to-end flow diagram should show branching for new API, event integration, partner integration, breaking change, and emergency compatibility issue, including independent review and rejection/rework paths.
