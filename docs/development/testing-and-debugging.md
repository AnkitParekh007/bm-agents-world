# Testing and debugging

The server uses Node's test runner through `tsx --test`. Tests cover broker policy and approval transitions, SQLite persistence, request identity, readiness and deployment contracts, observability derivation, live-adapter shaping/fallbacks, project test selection, Playwright evidence behavior, and Jira defect safety.

```bash
npm run typecheck
npm run test --workspace @bm-agents-world/agent-window
npm run build
```

There are no React unit tests or end-to-end tests for the agent-window UI in the current repository. Browser tests exercised by the QA agent target configured external projects, not this UI.

## Debugging order

1. Check `/healthz`, then `/readyz`, then `/api/health`.
2. Confirm the adapter reports `live` rather than `mock`.
3. Confirm the request identity includes the tenant/project.
4. Inspect the run, action, and audit endpoints.
5. For browser failures, inspect the evidence manifest before individual artifacts.
6. For approval conflicts, reload the action and compare its status and payload hash.

Avoid logging credentials, raw authorization headers, or Playwright storage state while debugging.
