<!-- GENERATED FILE: DO NOT EDIT DIRECTLY. Run `npm run docs:generate`. -->

# Generated capability and connector catalog

Authoritative sources:

- `apps/agent-window/src/server/qa/qa-capabilities.ts`
- `config/approved-connectors.yaml`

## Capabilities

| ID | Description | Risk | Approval | Environments | Adapter |
| --- | --- | --- | --- | --- | --- |
| `qa.jira.story.read` | Read a scoped Jira story and acceptance criteria. | L0 | none | playground, qa, prod | `qa-jira-read-adapter` |
| `qa.jira.duplicate.search` | Search recent unresolved Jira bugs for likely duplicates of an immutable bug-draft artifact. | L0 | none | playground, qa, prod | `qa-jira-defect-adapter` |
| `qa.bitbucket.change-impact.read` | Inspect repository metadata and prepare a change-impact summary. | L0 | none | playground, qa, prod | `qa-bitbucket-read-adapter` |
| `qa.database.validation.read` | Run a bounded read-only QA validation against an approved view. | L0 | none | playground, qa, prod | `qa-mock-adapter` |
| `qa.playwright.test.run` | Run an allowlisted isolated Chromium smoke test against a server-configured non-production target and persist evidence artifacts. | L1 | standing-policy | playground, qa | `qa-playwright-worker-adapter` |
| `qa.jira.bug.create` | Create a Jira bug from the exact immutable bug-draft artifact after payload-bound L3 human approval. | L3 | human | playground, qa, prod | `qa-jira-defect-adapter` |
| `qa.teams.status.post` | Post a QA status message to an approved Teams channel. | L3 | human | playground, qa, prod | `qa-mock-adapter` |

## Approved connectors

| ID | Display name | Kind | Status | Transports |
| --- | --- | --- | --- | --- |
| jira | Jira Cloud | native-or-mcp | approved | native-http, streamable-http |
| bitbucket | Bitbucket | native-or-mcp | approved | native-http, streamable-http |
| playwright | Playwright Browser Worker | native-or-mcp | approved | native-worker, stdio, streamable-http |
| qa-database | QA Database Read Adapter | mcp | approved | streamable-http |
| teams | Microsoft Teams | mcp | pilot | streamable-http |

See [Capability broker and data flow](../architecture/capability-broker.md) for policy semantics.
