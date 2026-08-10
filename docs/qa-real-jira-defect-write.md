# QA real Jira defect creation

This milestone completes the first end-to-end QA vertical slice in BM Agents World:

```text
Jira story
  -> Bitbucket impact
  -> authenticated project tests
  -> evidence artifacts
  -> immutable bug-draft
  -> duplicate scan
  -> L3 human review
  -> exact payload approval
  -> Jira Cloud REST v3 create issue
  -> audit event
```

## Safety model

The model never supplies the final Jira fields. `qa.jira.bug.create` accepts only:

```json
{
  "bugDraftArtifactId": "...",
  "bugDraftSha256": "..."
}
```

The server reloads the immutable `bug-draft` artifact, verifies SHA-256, resolves evidence metadata, constructs Atlassian Document Format, and chooses the configured Jira project/type/labels.

The Capability Broker classifies Jira create as L3. It cannot execute until a human approves the exact action payload hash. The approval card loads `/api/qa/actions/:actionId/review` and shows the exact artifact plus duplicate candidates.

## Duplicate handling

`qa.jira.duplicate.search` is an L0 read capability. It performs a bounded enhanced-JQL query for recent unresolved bugs in the configured project and ranks the returned summaries locally.

The Jira create adapter runs the duplicate scan again immediately before POST. A newly detected high-confidence candidate stops the create operation with `externalSideEffect=false`, requiring a fresh review rather than silently creating a likely duplicate.

## Jira REST endpoints

This implementation uses Jira Cloud REST API v3:

- `POST /rest/api/3/search/jql` for bounded duplicate discovery.
- `POST /rest/api/3/issue` for issue creation.

The issue description is Atlassian Document Format and contains parent story, environment/build, reproduction details, expected/actual result, severity recommendation, and BM Agents World evidence IDs/URIs/SHA-256 values.

## Configuration

Jira read configuration remains unchanged. Real write is additionally opt-in:

```bash
QA_JIRA_BASE_URL=https://company.atlassian.net
QA_JIRA_EMAIL=qa-automation@company.com
QA_JIRA_API_TOKEN=...

QA_JIRA_WRITE_ENABLED=true
QA_JIRA_BUG_ISSUE_TYPE=Bug
QA_JIRA_BUG_LABELS=bm-agent,qa-automation
QA_PCC_JIRA_PROJECT_KEY=PCC
QA_SOP_JIRA_PROJECT_KEY=SOP
QA_DATABRIDGE_JIRA_PROJECT_KEY=DATABRIDGE
```

Use least-privilege Jira credentials. The identity used for real writes needs Create Issues permission only for the intended projects plus the read permissions needed for duplicate search.

## Current boundary

Real in this milestone:

- Jira story read
- Bitbucket change impact
- authenticated Playwright execution
- test/evidence/bug-draft artifacts
- Jira duplicate search
- L3 payload-bound review
- Jira bug creation when explicitly enabled

Still mock-only:

- Microsoft Teams write
- database validation

Production browser execution and free-form production mutation remain denied.
