# Artifacts and Knowledge Assets

## Input artifacts

- Jira story snapshot, history, comments, links, attachments, epic, sprint, and release metadata
- Product requirements, Confluence pages, designs, business rules, decision records, and runbooks
- Repository tree, changed files, commit and PR metadata, frontend routes/components, Java services, and migrations
- OpenAPI/AsyncAPI/GraphQL contracts and example payloads
- Database schemas, data dictionaries, approved views, migration history, and data classification
- Environment inventory, deployment manifest, feature flags, dependency status, and test-account catalog
- Existing test cases, Playwright suites, API collections, regression tags, and defect history
- CI results, logs, traces, metrics, alerts, and previous release reports

## Agent-produced artifacts

| Artifact | Format | Required contents |
|---|---|---|
| Story context brief | Markdown + JSON | Objective, actors, flow, dependencies, gaps, risks, sources |
| Test plan | Markdown + JSON | Scope, strategy, environments, data, cases, entry/exit, evidence |
| Test case set | JSON/CSV/Markdown | Preconditions, steps, data, expected result, risk, tags, traceability |
| Traceability matrix | CSV/JSON | Requirement to case to run to defect mapping |
| Environment readiness report | Markdown + JSON | Versions, health, dependencies, blockers |
| Test execution result | JSON + JUnit | Status, timing, step results, evidence IDs, errors |
| Evidence bundle | Binary + manifest | Screenshots, video, trace, logs, requests, responses, checksums |
| Defect draft | Markdown + JSON | Reproduction, expected/actual, impact, evidence, severity recommendation |
| Retest report | Markdown + JSON | Original issue, fix version, results, regression scope |
| Regression report | Markdown + JSON/JUnit | Suites, coverage, failures, classifications, residual risk |
| Release readiness brief | Markdown/PDF-ready | Quality status, open defects, risks, recommendation, approvals |
| Daily QA summary | Markdown/Teams card | Completed, in progress, blocked, defects, risk, next actions |
| Agent run audit | JSONL | Decisions, tools, policies, approvals, models, tokens, timestamps |
| Evaluation report | JSON/Markdown | Correctness, evidence, safety, efficiency, human overrides |

## Knowledge-base organization

```text
knowledge/
  organization/
    qa-standards/
    security-policies/
    release-process/
  projects/
    PCC/
      architecture/
      requirements/
      api/
      database/
      tests/
      runbooks/
    SOP/
    DataBridge/
  shared/
    defect-taxonomy/
    test-design-patterns/
    browser-matrix/
```

## Metadata required on every artifact

- `artifact_id`
- `artifact_type`
- `schema_version`
- `organization_id`
- `project_id`
- `environment`
- `jira_issue_keys`
- `run_id`
- `created_by_agent`
- `created_at`
- `classification`
- `retention_class`
- `source_artifact_ids`
- `evidence_hash`
- `approval_id`, when applicable

## Evidence rules

- Evidence must be reproducible, time-stamped, and linked to a specific run and build.
- Screenshots must include only the minimum relevant viewport and be redacted when needed.
- API evidence must redact authorization, cookies, tokens, secrets, and sensitive payload fields.
- Database evidence stores query templates and bounded result excerpts, not uncontrolled exports.
- Artifacts are immutable after finalization; corrections create a new version.
- Every defect claim must reference one or more evidence items.
- Retention varies by classification, release status, and legal requirements.
