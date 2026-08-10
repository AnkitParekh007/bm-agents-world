# External integrations

Integration configuration is centralized in `src/server/qa/qa-integration-config.ts`. Status endpoints reveal mode and readiness, not credential values.

| System | Authentication | Behavior |
|---|---|---|
| Jira | Bearer token or email + API token | Story reads, duplicate search, opt-in defect write |
| Bitbucket Cloud | Access token | Repository and pull-request/change context reads |
| Playwright | Server target URL and optional storage-state file | Allowlisted Chromium flows on playground/QA |
| Database | None | Mock bounded validation only |
| Teams | None | Mock post only, even after approval |

All outbound JSON calls use `safe-http.ts`, which applies timeouts, response-size bounds, JSON checks, and redacted error handling. Credentials remain server-side. Live adapters fall back to `QaMockAdapter` when configuration is absent, so always inspect `/api/health` or `/api/qa/integrations` before interpreting a result as live.
