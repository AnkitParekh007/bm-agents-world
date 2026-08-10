# Implementation Roadmap

## Phase 0 — Discovery and controls

- confirm Bitbucket and Jira deployment types
- inventory repositories, branches, Angular versions, Node versions, package managers, test frameworks, and pipelines
- define identity, vault, approval, retention, and audit standards
- select one low-risk pilot repository

Exit: project registry and permission matrix approved.

## Phase 1 — Read-only context agent

- Jira/Confluence and Bitbucket read access
- repository indexing and codebase map
- Angular version-profile resolver
- story context and impact analysis
- implementation-plan artifact

Exit: agent reliably produces grounded plans without code changes.

## Phase 2 — Isolated patch workspace

- ephemeral clone and branch
- workspace read/write tools
- allowlisted formatter, lint, typecheck, test, and build commands
- patch manifest and secret scanning
- no remote writes

Exit: patches compile and pass project gates in a sanitized pilot repository.

## Phase 3 — Browser, design, and quality agents

- Figma context
- Playwright and Chrome DevTools workers
- accessibility checks
- SonarQube and dependency analysis
- quality-gate aggregation

Exit: evidence-backed review-ready patches.

## Phase 4 — Approval-controlled collaboration

- approval service
- agent commit identity
- branch push and PR creation
- Jira comment and Teams draft publication
- external-write verification and idempotency

Exit: human-approved writes are auditable and reversible.

## Phase 5 — Dependency and migration workflows

- version compatibility matrix
- official migration execution
- lockfile governance
- Angular 12 and 15 upgrade planning
- AngularJS characterization and migration planning

Exit: upgrades are isolated, repeatable, and rollback-ready.

## Phase 6 — Multi-project rollout

Suggested order:

1. SOP for a bounded Angular 15 feature or defect workflow
2. PCC after Angular 12 toolchain image and compatibility tests are stable
3. DataBridge in recommendation and minimal-fix mode

Exit: each project has separate identities, commands, policies, and evaluations.

## Phase 7 — Optimization

- component/design-system knowledge
- reusable skills and organization schematics
- improved code-search and change-impact models
- quality and cycle-time dashboards
- feedback-based skill versioning

## Initial 30-day backlog

- fill project and environment registries
- implement repository reader and workspace tools
- create toolchain images
- implement seven core output schemas
- implement story-to-plan and feature workflows
- add OPA enforcement
- create 25 evaluation scenarios
- run shadow mode with frontend engineers
- review false assumptions and path-scope errors weekly
