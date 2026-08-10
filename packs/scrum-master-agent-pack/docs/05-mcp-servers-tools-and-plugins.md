# MCP Servers, Tools, and Plugins

## Separation of concerns

- **Skill:** reusable reasoning or facilitation capability
- **MCP server:** governed boundary exposing resources, prompts, or tools
- **Tool:** one atomic operation such as reading a Sprint, calculating cycle time, or requesting approval
- **Plugin / adapter:** deterministic integration or transformation component
- **Artifact:** versioned output with provenance

## MCP baseline

The pack registers **18 MCP servers** for Atlassian, Bitbucket, product context, calendars, Teams, delivery analytics, CI/CD, quality, observability, incidents, dependencies, research feedback, architecture, releases, policies, artifacts, vault capabilities, and approvals.

## Required tool classes

1. Context reads: Sprint, backlog, issue, page, PR, build, test, incident, release, calendar, and metric reads.
2. Deterministic analysis: flow metrics, blocked age, dependency graphs, readiness, schema validation, and evidence hashing.
3. Facilitation support: agenda generation, timebox plans, prompts, activity selection, and de-identified summaries.
4. Approval-controlled writes: calendar events, Jira comments, Confluence pages, Teams posts, and impediment escalation.
5. Security controls: policy decisions, capability leases, redaction, audit events, and retention.

## Plugin baseline

The pack registers **22 adapters and deterministic engines**. Free-form model output never directly invokes privileged systems; trusted adapters validate payloads, policy, scope, approvals, and hashes.

## Recommended implementation rule

Start with read-only Jira, Confluence, Bitbucket, metrics, quality, and calendar access. Add external writes only after audit, approval, rollback, privacy, and replay-protection tests pass.
