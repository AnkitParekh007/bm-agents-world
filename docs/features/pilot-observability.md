# QA pilot scorecard

`QaPilotDashboard.tsx` reads the session plus scoped summary and recent-run APIs. `qa-pilot-observability.ts` derives success, action, browser-test, approval, bug-draft, and confirmed side-effect metrics from persisted runs/actions. Human evaluation adds outcome, usefulness, reuse intent, false positives, override minutes, and notes.

Filters are restricted to projects in the request identity and a 1–90 day period. Responses are private and not cached. Missing model usage is labeled `not_instrumented`, never treated as zero.

Evaluation is one record per run and can be updated through `POST /api/qa/runs/:runId/evaluation`. Use the scorecard to judge pilot value and safety; it is not a billing or full production telemetry system.
