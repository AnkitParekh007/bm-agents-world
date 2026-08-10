# QA Real Context Read Adapters

This slice upgrades `qa.jira.story.read` and `qa.bitbucket.change-impact.read` from mock-only execution to live-capable, read-only adapters.

## Safety boundary

- Jira and Bitbucket credentials are read only by server-side adapters from environment variables.
- Credentials are never returned in adapter results, browser APIs, CopilotKit context, or prompts.
- Jira and Bitbucket write capabilities remain mock-only.
- Playwright and database capabilities remain mock-only in this slice.
- Production reads still inherit the capability broker's L4 human-approval rule.
- Production mutation remains denied.
- Live upstream errors fail visibly; the runtime does not silently replace a failed live call with mock evidence.
- If live configuration is absent, the corresponding read capability intentionally falls back to mock mode.

## Jira Cloud

Configure one of the following server-side credential forms.

### API token

```bash
QA_JIRA_BASE_URL=https://your-company.atlassian.net
QA_JIRA_EMAIL=qa-automation@your-company.com
QA_JIRA_API_TOKEN=...
```

### Bearer credential

```bash
QA_JIRA_BASE_URL=https://your-compatible-jira-api-base
QA_JIRA_BEARER_TOKEN=...
```

For organizations with acceptance criteria in a custom Jira field, set the field id:

```bash
QA_JIRA_ACCEPTANCE_CRITERIA_FIELD=customfield_12345
```

The adapter reads only a bounded set of issue fields and normalizes Atlassian Document Format text before the result enters agent context.

## Bitbucket Cloud

Configure a read-scoped access token:

```bash
QA_BITBUCKET_ACCESS_TOKEN=...
QA_BITBUCKET_BASE_URL=https://api.bitbucket.org/2.0
QA_BITBUCKET_WORKSPACE=your-workspace
```

Then configure repositories by project:

```bash
QA_PCC_BITBUCKET_REPOS=frontend:pcc-ui,backend:pcc-api
QA_SOP_BITBUCKET_REPOS=frontend:sop-ui,backend:sop-api
QA_DATABRIDGE_BITBUCKET_REPOS=frontend:databridge-ui,backend:databridge-api
```

Each repository entry can also use an explicit workspace:

```bash
QA_PCC_BITBUCKET_REPOS=frontend:workspace-a/pcc-ui,backend:workspace-b/pcc-api
```

If overrides are absent, the adapter attempts to infer Bitbucket Cloud workspace/repository slugs from repository URLs in `packs/qa-agent-pack/config/project-registry.yaml`.

For story analysis, the adapter searches configured repositories for pull requests referencing the Jira key in the title, description, or source branch and then reads bounded diffstat metadata. It returns changed paths and line counts, not raw repository contents.

## Runtime modes

The QA Workbench shows the read mode independently:

```text
Jira read: live | mock
Bitbucket read: live | mock
Writes/Playwright: mock
```

This lets users distinguish real external evidence from simulation without changing the agent workflow.

## Next slice

After these read adapters are proven against the organization's Atlassian environment, the next recommended slice is the real Playwright execution worker plus evidence artifacts. Jira bug creation should only move to a real adapter after the approval/capability broker is backed by persistent authentication and durable approval storage.
