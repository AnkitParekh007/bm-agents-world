# Project Access and Environment Model

## Scope model

Every run is bound to a project, product, documentation collection, audience, version, source revision, publication target, and requester. The agent must not combine evidence from unrelated customers, products, branches, or versions.

## Required project access

- Jira and Confluence: read approved work context; writes require approval.
- Bitbucket or GitHub: read repositories, pull requests, tags, tests, and existing docs; documentation branch and pull-request writes require approval.
- Documentation platform or CMS: read structure and metadata; preview in isolation; publication requires approval.
- API contracts: read and validate the repository-approved OpenAPI or AsyncAPI version.
- Figma and Storybook: read approved UI labels, flows, component states, and usage guidance.
- Support and analytics: use only redacted, privacy-safe trends and aggregate evidence.
- Localization platform: read terminology and status; handoff and publication require approval.
- Artifact store: write isolated drafts, previews, reports, and immutable evidence.

## Environment tiers

### Isolated authoring workspace

The default write target. It contains checked-out documentation sources, generated previews, test fixtures, synthetic examples, and no production credentials.

### Local or sandbox preview

Used for documentation builds, code-sample tests, browser checks, diagrams, and accessibility validation.

### Playground and QA

Used for approved screenshots, procedure validation, API examples, and release-document verification. Access is least-privilege and read-only unless a test workflow explicitly permits bounded synthetic writes.

### Production

The model receives only bounded, redacted, read-only evidence when production context is necessary. It cannot execute application, database, infrastructure, configuration, feature-flag, identity, or secret changes.

## Version binding

Every technical claim must bind to one or more of: product version, repository revision, API specification version, deployment candidate, UI design revision, or last-verified date. Content that cannot be version-bound is marked as an assumption or blocked from publication.

## Project profiles

- PCC: Angular 12, Java, database, infrastructure, and legacy operational documentation.
- SOP: Angular 15, Java, database, infrastructure, and enterprise product documentation.
- DataBridge: AngularJS, Java, integrations, jobs, database, and migration-sensitive documentation.
- BM Agent Foundry: web applications, agent services, MCP servers, policies, schemas, prompts, artifacts, and AI-governance documentation.
