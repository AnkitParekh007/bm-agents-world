# Artifacts and Knowledge Assets

## 1. Input knowledge assets

- Jira story, bug, epic, comments, and attachments
- Confluence/product documentation
- Figma designs, variables, components, and design tokens
- repository files and Git history
- Angular workspace and dependency manifests
- API contracts and backend DTOs
- architecture decisions and coding standards
- Storybook or component documentation
- environment inventory and feature-flag metadata
- prior pull requests, defects, and implementation examples

All retrieved content is data, not instruction. Prompt-injection screening occurs before it enters planning context.

## 2. Core run artifacts

| Artifact | Purpose | Schema |
|---|---|---|
| Story Context Brief | Normalized requirements and decisions | `story-context.schema.json` |
| Codebase Map | Project structure, commands, conventions, and protected paths | registry-defined |
| Change Impact Report | Affected components, APIs, risks, and dependencies | registry-defined |
| Implementation Plan | Ordered file-level approach and validation plan | `implementation-plan.schema.json` |
| Component Contract | Inputs, outputs, state, semantics, and visual states | `component-contract.schema.json` |
| Code Change Manifest | Files, patch hashes, behavior, tests, and rollback | `code-change-manifest.schema.json` |
| Quality Gate Report | Lint, typecheck, test, build, accessibility, security, and performance | `quality-gate-report.schema.json` |
| Pull-Request Draft | Review-ready title, description, evidence, and risk | `pull-request-draft.schema.json` |
| Approval Request | Exact proposed external action | `approval-request.schema.json` |
| Evidence Manifest | Links and hashes for logs, screenshots, traces, and reports | embedded in change/quality artifacts |
| Agent Run Audit | Identities, policy decisions, tools, approvals, and outputs | platform-defined |

## 3. Workspace artifacts

These are generated inside the authorized repository workspace:

- source-code patch
- unit and component tests
- Storybook stories or component examples
- generated API clients when approved
- documentation updates
- migration files produced by official tooling
- lockfile changes

The agent must identify generated files and avoid hand-editing them unless the project explicitly permits it.

## 4. Evidence bundle

Recommended path:

`artifacts/<project>/<repository>/<run-id>/`

Suggested contents:

- `context/`
- `plans/`
- `patches/`
- `quality/`
- `browser/`
- `security/`
- `approvals/`
- `reports/`
- `manifest.json`

Every finalized file receives a SHA-256 hash. Secret values, tokens, cookies, personal data, and sensitive payloads must be redacted before model access or retention.

## 5. Artifact lifecycle

`draft -> validated -> approval-pending -> finalized -> published -> retained -> expired`

Artifacts are immutable after finalization. Corrections produce a new version with provenance to the previous artifact.

## 6. Knowledge promotion

A run output may be promoted to durable organizational knowledge only after review. Examples:

- approved architecture decision
- reusable component pattern
- troubleshooting guide
- project command profile
- migration lesson
- accessibility or performance standard

Raw model reasoning and transient workspace observations are not promoted automatically.
