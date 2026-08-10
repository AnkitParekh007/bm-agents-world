# Frontend component system

The frontend is intentionally small and product-oriented rather than a general-purpose component library. Four React modules own the visible application experience; CSS is split by surface. There are no custom React hooks, Storybook stories, or reusable design-system package in the current repository.

## Component relationships

```mermaid
flowchart TD
  MAIN[main.tsx] --> PROVIDER[CopilotKit provider]
  PROVIDER --> APP[App.tsx]
  APP --> CHAT[CopilotKit chat primitives]
  APP --> WORKBENCH[QaWorkbench.tsx]
  APP --> DASHBOARD[QaPilotDashboard.tsx]
  WORKBENCH --> ACTIONS[Capability and approval APIs]
  DASHBOARD --> METRICS[Session and observability APIs]
```

## Major components

| Component | Location | Responsibility | State and dependencies |
|---|---|---|---|
| `App` | `apps/agent-window/src/client/App.tsx` | Pack discovery, selection, metadata, task launch, and chat shell | Local selection/loading/error state; CopilotKit agent switching; `/api/packs` |
| `QaWorkbench` | `apps/agent-window/src/client/QaWorkbench.tsx` | QA context, capability status, action review, and approval controls | Local form/action state; CopilotKit tools; capability/action APIs; Zod |
| `QaPilotDashboard` | `apps/agent-window/src/client/QaPilotDashboard.tsx` | Pilot summary, recent runs, filters, and human evaluation | Local filter/loading/evaluation state; session and observability APIs |
| `main` | `apps/agent-window/src/client/main.tsx` | React mount and CopilotKit provider configuration | Runtime URL `/api/copilotkit`; default agent; top-level error handler |

## State ownership

State stays close to the surface that renders it. `App` owns the selected pack; `QaWorkbench` owns QA inputs and protected-action review state; `QaPilotDashboard` owns scorecard filters and evaluations. CopilotKit supplies agent runtime state. There is no Redux, Zustand, React Context owned by this repository, client router, or query cache.

## Styling

`styles.css` defines the agent-window shell. `qa-workbench.css` and `pilot-dashboard.css` scope the QA workbench and scorecard. When adding UI, keep surface-specific styles with the owning component and preserve native controls, focus visibility, loading states, empty states, and conflict/error feedback.

## Adding a component

1. Decide which existing product surface owns the state.
2. Keep credentials and integration configuration out of props and browser state.
3. Use an existing authorized API rather than bypassing the capability broker.
4. Add loading, empty, error, and authorization-denied behavior.
5. Add component tests if a frontend test harness is introduced; none exists today.

Continue with [Frontend, routing, and state](../architecture/frontend.md) or [QA workbench](../features/qa-workbench.md).
