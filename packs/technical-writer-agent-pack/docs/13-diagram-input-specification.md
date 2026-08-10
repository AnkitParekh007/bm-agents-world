# Diagram Input Specification

## Architecture diagram layers

1. Users: Technical Writer, Product Owner, Developer, Architect, QA, Support, Release Manager, approver.
2. Entry points: Chat UI, Jira request, repository event, release event, content audit schedule.
3. Control plane: Agent Gateway, Supervisor, OPA Policy, Approval Service, Capability Broker.
4. Specialist agents: audience, strategy, IA, developer docs, API docs, product help, runbooks, release notes, samples, diagrams, style, accessibility, localization, quality, analytics.
5. MCP and adapters: Atlassian, Bitbucket, source code, documentation platform, API contracts, Figma, Storybook, browser, support, analytics, TMS, artifact store.
6. Deterministic workers: build, lint, links, samples, contracts, diagrams, accessibility, redaction, diff.
7. Data stores: isolated workspace, artifact store, evidence store, audit log, registries.
8. Publication targets: documentation site, CMS, repository pull request, Confluence, support knowledge base, localization platform, Teams.

## Primary flow diagram

Request → authorize → retrieve context → analyze audience → select content type → plan → author → parallel validation → independent review → remediate → create payload hash → approval → trusted publication → verify → observe feedback → maintain.

## Decision nodes

- Is the scope authorized?
- Are authoritative sources complete and consistent?
- Can examples and procedures be tested?
- Does the content expose sensitive information?
- Is accessibility validation complete?
- Is the target customer-facing or operationally sensitive?
- Does approval match the final payload?
- Did publication and links verify successfully?

## Visual conventions

Use subgraphs for control plane, authoring, validation, evidence, and publication. Use solid arrows for data flow, dashed arrows for approvals, red boundaries for prohibited direct production access, and explicit human decision nodes.
