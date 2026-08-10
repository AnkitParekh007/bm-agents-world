# Authenticated browser testing

`PlaywrightWorkerAdapter` executes only catalog-defined suites from `apps/agent-window/config/qa-project-tests.yaml`. The model selects semantic inputs; it cannot provide arbitrary browser code or a target URL. `resolveProjectTestSelection` validates project, suite, cases, tags, and configured environment.

```mermaid
sequenceDiagram
  participant Agent
  participant Broker
  participant Catalog
  participant Worker as Playwright worker
  participant Artifacts
  Agent->>Broker: request project/suite/cases
  Broker->>Catalog: resolve allowlisted selection
  Catalog-->>Broker: fixed steps + server target
  Broker->>Worker: execute isolated Chromium
  Worker->>Artifacts: screenshot/trace/network/results
  Worker-->>Broker: evidence manifest + outcome
  Broker-->>Agent: authorized artifact references
```

Production is excluded by the capability definition. Authentication state is a secret file referenced by an environment-variable name in the catalog; its contents are never returned. The deployment provides `/dev/shm`, temporary storage, a non-root user, and the exact Playwright browser image version.
