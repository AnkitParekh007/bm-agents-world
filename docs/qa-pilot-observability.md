# QA Pilot Observability and Evaluation

This slice adds a tenant/project-scoped pilot scorecard without introducing a second source of truth for operational telemetry.

## Data model

Operational metrics are **derived** from the persistent QA records that already drive execution and audit:

```text
runs
  + actions
  + approvals embedded in actions
  + adapter results
        |
        v
QaPilotObservabilityStore
        |
        +-- per-run metrics
        +-- period summary
```

Only human pilot feedback is stored as new state:

```text
qa_run_evaluations
```

Each run can have one current evaluation with:

- outcome: successful / partially successful / failed / abandoned
- usefulness score: 1-5
- would-use-again flag
- false-positive-defect flag
- manual override minutes
- bounded reviewer notes
- reviewer identity and timestamps

The record is scoped to the run's tenant and project. API access still passes through the same request identity and run authorization used by actions, approvals, audit, and artifacts.

## Measured run metrics

The server derives:

- run duration
- action count
- executed / failed / rejected actions
- live adapter actions
- confirmed external side effects
- approvals requested / approved / rejected
- average approval decision latency
- Playwright selected / passed / failed cases
- bug-draft generation
- Jira duplicate candidates
- confirmed real Jira defect creation
- per-capability breakdown

A real Jira defect is counted only when the governed create action reports all of:

```text
mode = live
externalSideEffect = true
ok = true
```

No external action is inferred from chat text.

## Summary metrics

The dashboard exposes configurable 1/7/30/90 day views for all authorized projects or one authorized project:

- total runs
- action success rate
- browser test pass rate
- average usefulness score
- would-use-again rate
- false-positive-defect rate
- average manual override minutes
- approval rejection rate
- average run duration
- selected/passed/failed tests
- bug drafts generated
- Jira defects created
- live actions
- confirmed external side effects
- evaluated-run coverage

## Model usage / token cost

Token, call-count, and cost fields are currently reported as:

```text
not_instrumented
```

They are intentionally not represented as zero. The current CopilotKit integration does not yet write provider usage into the BM Agents World persistence contract. A later provider-telemetry adapter can populate these fields without changing the dashboard or the run/evaluation model.

## APIs

All endpoints are behind request identity middleware.

```text
GET  /api/qa/observability/summary?days=7&projectId=PCC
GET  /api/qa/observability/runs?days=7&projectId=PCC&limit=30
POST /api/qa/runs/{runId}/evaluation
```

`projectId` is optional. If supplied, it must be present in the authoritative project membership from the trusted gateway. Cross-project and cross-tenant access is denied.

Example evaluation body:

```json
{
  "outcome": "partially_successful",
  "usefulnessScore": 4,
  "wouldUseAgain": true,
  "falsePositiveDefect": false,
  "manualOverrideMinutes": 8,
  "notes": "The test selection was useful; one additional manual boundary case was needed."
}
```

## Dashboard

When the QA pack is selected, the Agent Window now renders a Team Pilot Scorecard beneath the QA workbench. It provides:

- project and time-window filters
- metric cards
- recent run rows
- run-level action/test/approval outcome details
- inline evaluation/editing
- explicit token/cost telemetry status

## Pilot interpretation

Do not use a single metric as the go/no-go criterion. Review the combination of:

```text
automation correctness
+ test quality
+ human usefulness
+ false-positive rate
+ approval behavior
+ manual override effort
+ latency
+ confirmed side effects
```

For the initial 2-3 person QA pilot, useful questions include:

1. Are engineers repeatedly choosing to use the agent for real assigned stories?
2. Are story-scoped test selections relevant enough to reduce manual setup?
3. How often are bug drafts false positives or rejected by humans?
4. How much manual work remains per run?
5. Are real Jira defects created only after the intended independent approval?
6. Which capability causes most failures or retries?

## Next telemetry step

After several real pilot runs, add model/provider usage telemetry and OpenTelemetry export. Keep the SQLite scorecard as the pilot product view, while traces/metrics become the operational diagnostics layer.
