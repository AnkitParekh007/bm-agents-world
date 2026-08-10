# Project structure

```text
bm-agents-world/
├── apps/agent-window/          React + Express application
│   ├── config/                 Project test allowlist
│   └── src/
│       ├── client/             Agent shell, QA workbench, scorecard
│       └── server/
│           ├── platform/       Broker, identity, persistence, artifacts
│           └── qa/             QA capabilities and adapters
├── packs/                      Declarative organization agent packs
├── deploy/k8s/qa-pilot/        Single-replica Kubernetes package
├── docs/                       This HonKit portal and QA runbooks
└── .github/workflows/          CI and image publication
```

Each pack contains registries, workflows, schemas, templates, checklists, security policy, and long-form documentation. `PackRegistry` searches candidate repository roots and compiles public pack metadata at server startup.

When changing behavior, start at `apps/agent-window/src/server/index.ts`, then follow the imported platform or QA module. When changing UI, start at `src/client/App.tsx`; QA-specific views are `QaWorkbench.tsx` and `QaPilotDashboard.tsx`.
