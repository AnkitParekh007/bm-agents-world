# Diagram Input Specification

## Architecture layers

- Human decision authority: Product Owner, Solution Architect, Technical Lead, Security, Data, UX, QA, DevOps, Operations, and Architecture Review Board.
- Agent control plane: user workspace, supervisor, specialists, workflow state, OPA, approval service, evidence/audit store.
- Context/tools: Jira, Confluence, Bitbucket, architecture repository, API/event catalogs, databases, cloud/Kubernetes/network/identity, observability, cost/vendor systems, and vault.
- Engineering packs: Product, UX, Angular, Java, Python, Database, QA, and DevOps.
- Targets: PCC, SOP, DataBridge, BM Agent Foundry, shared platforms, sandbox, playground, QA, and production.

## Trust boundaries

Human governance; model/orchestration; untrusted content; trusted adapters; secrets/identity; non-production; production read-only; external vendors.

## Complete flow

`request -> authorization -> discovery -> drivers -> specialist analysis -> options -> tradeoff/cost/risk/migration -> diagrams/contracts/ADR -> independent review -> human decision -> role handoffs -> implementation -> conformance evidence -> approved publication -> release recommendation -> post-implementation learning`

Use separate Mermaid architecture and execution-flow diagrams. Mark approval diamonds, production read-only, and secret brokering without secrets entering the model.
