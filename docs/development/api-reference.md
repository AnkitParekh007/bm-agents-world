# API reference

All application routes except `/healthz` and `/readyz` pass through identity middleware. The CopilotKit handler uses `/api/copilotkit` in single-route mode.

| Method | Path | Purpose |
|---|---|---|
| GET | `/healthz` | Process liveness; no protected data |
| GET | `/readyz` | Deployment readiness; 200 or 503 |
| GET | `/api/session` | Current scoped identity and self-approval flag |
| GET | `/api/health` | Runtime, adapters, storage, packs, and readiness |
| GET | `/api/packs[/:packId]` | Public pack list or detail |
| GET | `/api/control-plane/overview` | Platform posture, totals, and capability risk distribution |
| GET | `/api/control-plane/capabilities` | Every governed capability with its pack, adapter, connector, and grantees |
| GET | `/api/control-plane/agents` | Governed agent roster with per-specialist grants |
| GET | `/api/control-plane/approvals` | Actions awaiting a human decision, in the caller's scope |
| POST | `/api/workflows/:packId/:workflowId/runs` | Launch or resume a governed workflow run |
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

The `/api/control-plane/*` routes are pack-agnostic and read-only: they describe every governed pack, not just QA. Their payloads are fully derived server-side by `src/server/control-plane.ts`, so a client renders them without re-deriving risk ordering, grant resolution, or posture — what an operator reads is what the server would enforce. Approvals and runs are filtered to the caller's identity scope.

List limits are bounded server-side. Observability accepts `projectId`, `days` (1–90), and bounded `limit`. Errors use JSON `{ error, message? }`; callers should handle 400, 401, 403, 404, and conflict-state 409 separately.

No OpenAPI contract is currently present. Treat `src/server/index.ts`, request validation, and tests as authoritative.
