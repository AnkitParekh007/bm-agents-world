# API reference

All application routes except `/healthz` and `/readyz` pass through identity middleware. The CopilotKit handler uses `/api/copilotkit` in single-route mode.

| Method | Path | Purpose |
|---|---|---|
| GET | `/healthz` | Process liveness; no protected data |
| GET | `/readyz` | Deployment readiness; 200 or 503 |
| GET | `/api/session` | Current scoped identity and self-approval flag |
| GET | `/api/health` | Runtime, adapters, storage, packs, and readiness |
| GET | `/api/packs[/:packId]` | Public pack list or detail |
| GET | `/api/qa/capabilities` | Capability, integration, and test-catalog status |
| GET | `/api/qa/integrations` | Sanitized integration modes |
| GET | `/api/qa/project-tests` | Sanitized allowlisted test profiles |
| GET | `/api/qa/runs[/:runId]` | Authorized run list or detail |
| POST | `/api/qa/runs/:runId/evaluation` | Save human pilot evaluation |
| GET | `/api/qa/observability/summary` | Tenant/project scoped scorecard |
| GET | `/api/qa/observability/runs` | Scoped recent run metrics |
| GET | `/api/qa/artifacts/:id[/metadata]` | Authorized artifact or metadata |
| GET | `/api/qa/actions/:id` | Authorized action record |
| GET | `/api/qa/actions/:id/review` | Jira create preview only |
| POST | `/api/qa/actions/:id/decision` | Approve or reject protected action |
| GET | `/api/audit` | Authorized audit events |

List limits are bounded server-side. Observability accepts `projectId`, `days` (1–90), and bounded `limit`. Errors use JSON `{ error, message? }`; callers should handle 400, 401, 403, 404, and conflict-state 409 separately.

No OpenAPI contract is currently present. Treat `src/server/index.ts`, request validation, and tests as authoritative.
