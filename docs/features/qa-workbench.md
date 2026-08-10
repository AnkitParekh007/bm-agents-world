# QA workbench

`src/client/QaWorkbench.tsx` appears for the QA pack. It loads capability and integration status, shares selected story/project/environment context with CopilotKit, and renders protected-action review controls.

```mermaid
flowchart TD
  S[Select project, story, environment] --> C[Provide context to QA agent]
  C --> R[Read Jira story]
  C --> B[Read Bitbucket impact]
  R --> T[Resolve allowlisted suite/cases]
  B --> T
  T --> P[Run Playwright in playground or QA]
  P --> E[Persist screenshot, trace, network, results, manifest]
  E --> D[Create immutable bug draft]
  D --> V[Review duplicates and exact fields]
  V --> A{Human decision}
  A -- approve --> J[Create Jira issue]
  A -- reject --> X[Audit rejection]
```

The browser does not hold integration credentials. It receives statuses and action records only. Approval calls may fail with 409 if state changed, the payload expired, or self-approval is denied.
