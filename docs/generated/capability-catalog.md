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
| `qa.testplan.generate` | Persist an immutable, story-scoped QA test plan artifact (scope, test types, entry/exit criteria, and traceable cases) derived from the story and change-impact reads. | L0 | none | playground, qa, prod | `qa-testplan-adapter` |
| `qa.database.validation.read` | Run a bounded read-only QA validation against an approved view. | L0 | none | playground, qa, prod | `qa-database-read-adapter` |
| `qa.integration.trace` | Correlate a run's test plan, execution result, and bug draft into an immutable traceability artifact with cross-step consistency checks. | L0 | none | playground, qa, prod | `qa-integration-trace-adapter` |
| `qa.playwright.test.run` | Run an allowlisted isolated Chromium smoke test against a server-configured non-production target and persist evidence artifacts. | L1 | standing-policy | playground, qa | `qa-playwright-worker-adapter` |
| `qa.api.contract.test` | Run allowlisted read-only API contract checks (status, latency, and JSON field presence) against approved non-production endpoints. | L1 | standing-policy | playground, qa | `qa-api-contract-adapter` |
| `qa.jira.bug.create` | Create a Jira bug from the exact immutable bug-draft artifact after payload-bound L3 human approval. | L3 | human | playground, qa, prod | `qa-jira-defect-adapter` |
| `qa.teams.status.post` | Post a QA status message to an approved Teams channel. | L3 | human | playground, qa, prod | `qa-teams-adapter` |

## Approved connectors

| ID | Display name | Kind | Status | Transports |
| --- | --- | --- | --- | --- |
| jira | Jira Cloud | native-or-mcp | approved | native-http, streamable-http |
| bitbucket | Bitbucket | native-or-mcp | approved | native-http, streamable-http |
| playwright | Playwright Browser Worker | native-or-mcp | approved | native-worker, stdio, streamable-http |
| qa-test-design | QA Test Design | native | approved | native-worker |
| qa-api | QA API Contract Checks | native | approved | native-http |
| qa-integration | QA Integration Traceability | native | approved | native-worker |
| qa-database | QA Database Read Adapter | mcp | approved | streamable-http |
| frontend-jira | Jira Cloud (frontend-angular) | native-or-mcp | approved | native-http, streamable-http |
| frontend-bitbucket | Bitbucket (frontend-angular) | native-or-mcp | approved | native-http, streamable-http |
| frontend-design-system | Design System Tokens | mcp | pilot | streamable-http |
| frontend-quality | Frontend Quality Gates | native | approved | native-worker |
| teams | Microsoft Teams | mcp | pilot | streamable-http |

See [Capability broker and data flow](../architecture/capability-broker.md) for policy semantics.
