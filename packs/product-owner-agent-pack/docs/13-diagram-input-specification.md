# Product Owner Agent — Diagram Input Specification

## Architecture diagram nodes

### Human and governance
- Accountable Product Owner
- Product Manager / Business Sponsor
- Stakeholders and users
- Scrum Master / Agile Lead
- Architecture, Security, Privacy, Compliance, Release authorities
- Approval service and OPA policy

### Agent layer
- Product Owner Supervisor
- Context, Product Goal, Customer Value, Backlog, Refinement, Story, Acceptance, Prioritization
- Sprint Goal, Sprint Collaboration, Dependency, UX, Technical, QA, UAT, Release, Analytics, Feedback
- Risk, Decision Log, Agile Collaboration, Cross-Pack Coordination, Independent Reviewer, Evidence, Policy

### Integration layer
- Jira / Confluence / Product Discovery
- Figma
- Bitbucket/GitHub
- Analytics / research / feedback / support / CRM
- API contracts / database metadata
- CI/CD / observability / feature management / release calendar
- Teams / artifact store / vault

### Execution boundary
- Trusted adapters
- Capability broker and workload identity
- Non-production environments
- Production redacted read-only observation
- Deterministic deployment and human operators outside agent authority

## Primary flow

`Request or strategy → authorization → context → Product Goal/value → backlog option → specialist readiness checks → prioritization → independent review → human Product Owner decision → approved backlog publication → Sprint collaboration → release evidence → human acceptance → outcome review → backlog learning`

## Required diagram styles

Create:
1. Layered enterprise architecture diagram
2. End-to-end Product Owner operating flow
3. Backlog refinement sequence diagram
4. Sprint planning responsibility diagram distinguishing Product Backlog and Sprint Backlog
5. Release acceptance approval flow
6. Key-vault and capability lease flow
7. Cross-pack orchestration map

Use Mermaid subgraphs, distinct trust boundaries, approval diamonds, red dashed prohibited paths, and solid green approved execution paths.
