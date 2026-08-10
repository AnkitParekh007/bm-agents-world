# QA Agent Pack Implementation Roadmap

## Phase 0 — Decisions and inventory

- Confirm Jira/Bitbucket Cloud versus Data Center.
- Confirm project keys, repositories, environments, database engines, APIs, CI/CD, logs, and identity provider.
- Assign owners for QA platform, security, Jira, Bitbucket, database, DevOps, and Teams integration.
- Approve data classification, retention, and production restrictions.

## Phase 1 — Read-only context MVP

- Agent UI/API and run state
- Jira read/search
- Bitbucket read/diff/PR/pipeline metadata
- Documentation retrieval
- Story Context, Change Impact, Test Design, and Reporting agents
- Typed context brief, test plan, test cases, and traceability artifacts
- Policy and audit baseline

**Exit:** A QA engineer can select a story and receive an evidence-linked, reviewable test package without external writes.

## Phase 2 — Controlled browser execution

- Playwright MCP in sandboxed workers
- Project/environment registry
- Test identities from secret provider
- Browser snapshots, screenshots, traces, console, and network evidence
- Readiness and Browser QA agents
- Human gate before mutation

**Exit:** Approved playground and QA browser cases execute with reproducible evidence.

## Phase 3 — API and database validation

- OpenAPI testing adapter
- Read-only database MCP with query guard
- Synthetic test-data service
- API, Database, and Integration agents
- Cross-layer correlation

**Exit:** UI, API, and persisted-state validations produce one evidence graph.

## Phase 4 — Defect and collaboration workflow

- Duplicate search and bug draft
- Human-approved Jira create/edit/transition
- Teams update drafts and approved publication
- Fix-ready event and retest workflow

**Exit:** The full story -> test -> defect -> fix -> retest loop is supported with approvals.

## Phase 5 — Automation engineering and CI

- Test Automation Agent
- Bitbucket branch/patch/PR prepare actions
- CI result interpretation and approved retry
- Flake triage and suite registry

**Exit:** Agent-generated test changes are reviewable and delivered through normal engineering controls.

## Phase 6 — Release readiness and scale

- Regression scheduling and release workflows
- Observability and evaluation dashboards
- Multi-project isolation tests
- Cost and performance controls
- Production read-only assurance process

**Exit:** PCC, SOP, and DataBridge can onboard independently with audited policies and measurable quality outcomes.

## Recommended MVP boundary

Include Jira and Bitbucket read, story analysis, test-plan/test-case generation, Playwright execution in playground, evidence storage, and bug drafting. Defer production access, direct database writes, deployments, merges, autonomous Jira transitions, and autonomous Teams posting.
