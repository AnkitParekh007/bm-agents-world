# QA Playwright Execution Worker and Evidence Artifacts

This slice upgrades `qa.playwright.test.run` from a contract-level mock to an opt-in real Chromium worker for approved non-production QA targets.

## Why a bounded worker

The daily smoke path is intentionally deterministic. The model requests a named capability and named suite; it does not receive unrestricted Playwright primitives and cannot choose an arbitrary URL. The server resolves the target from trusted configuration and the capability broker remains the execution authority.

Microsoft Playwright also provides an MCP server for persistent exploratory browser-agent loops. BM Agents World can add that later as a separate governed capability. This worker is the safer primitive for repeatable smoke execution and evidence generation.

## Execution flow

```text
QA Agent
  -> requestQaCapabilityAction(qa.playwright.test.run)
  -> Capability Broker (L1 standing policy, non-prod only)
  -> PlaywrightWorkerAdapter
  -> server-configured PCC/SOP/DataBridge target
  -> isolated headless Chromium
  -> document/body/console checks
  -> screenshot + trace + bounded network evidence
  -> test-execution-result artifact
  -> evidence-manifest artifact
  -> CopilotKit response with artifact URIs
```

`prod` is not an allowed environment for `qa.playwright.test.run`.

## Enable the worker

Install the browser binary matching the pinned Playwright package:

```bash
npm run playwright:install --workspace @bm-agents-world/agent-window
```

Playwright packages do not automatically install browser binaries, so the browser install is an explicit deployment/runtime step.

Then configure only approved non-production targets:

```bash
QA_PLAYWRIGHT_ENABLED=true
QA_PLAYWRIGHT_TIMEOUT_MS=45000

QA_PCC_PLAYWRIGHT_PLAYGROUND_URL=https://pcc-playground.example.internal
QA_PCC_PLAYWRIGHT_QA_URL=https://pcc-qa.example.internal
QA_SOP_PLAYWRIGHT_PLAYGROUND_URL=https://sop-playground.example.internal
QA_SOP_PLAYWRIGHT_QA_URL=https://sop-qa.example.internal
QA_DATABRIDGE_PLAYWRIGHT_PLAYGROUND_URL=https://databridge-playground.example.internal
QA_DATABRIDGE_PLAYWRIGHT_QA_URL=https://databridge-qa.example.internal
```

If an environment URL already exists in `packs/qa-agent-pack/config/project-registry.yaml`, the worker can use that URL. Environment variables override registry values.

The worker stays in mock mode unless `QA_PLAYWRIGHT_ENABLED=true` and at least one non-production target exists.

## Current suite allowlist

Only `story-smoke` is executable.

The suite currently performs bounded page-health checks:

- navigate to the server-configured target
- require a successful document response
- require a visible document body
- capture browser console errors
- capture a bounded network summary
- capture a full-page screenshot
- capture a Playwright trace

It does not execute arbitrary model-generated JavaScript, arbitrary test files, arbitrary URLs, or production browser flows.

## Evidence model

Runtime evidence is written below `.bm-agents-runtime/artifacts` by default and is excluded from git. `BM_ARTIFACT_ROOT` may point to another runtime volume.

The worker emits artifacts compatible with the existing QA pack contracts:

- `test-execution-result`
- `evidence-manifest`
- screenshot evidence
- Playwright trace
- bounded/redacted network evidence

Every stored file gets:

- a UUID artifact id
- run id
- SHA-256 digest
- media type
- classification
- byte size
- creation timestamp
- a `/api/qa/artifacts/{id}` URI

The evidence manifest references immutable artifact ids and hashes instead of embedding binary data in the LLM context.

## Artifact HTTP boundary

Development endpoints:

```text
GET /api/qa/artifacts/{artifactId}
GET /api/qa/artifacts/{artifactId}/metadata
```

Responses use `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`.

The project does not yet have production authentication/RBAC on artifact download endpoints. Before BM Foundry integration, artifact retrieval must be bound to authenticated user/project/run authorization and backed by durable object storage rather than a local runtime volume.

## Remaining mock integrations

This slice does not enable a real write path:

- `qa.jira.bug.create` remains mock after L3 approval
- `qa.teams.status.post` remains mock after L3 approval
- database validation remains mock

## Next browser increments

After this slice is stable:

1. authentication/session fixtures via secret references and test identities
2. project-specific smoke suites loaded from approved repository revisions
3. browser/API correlation and stronger network redaction
4. isolated container/Kubernetes worker execution
5. optional Playwright MCP capability for exploratory/manual-test style loops
6. artifact storage in object storage with RBAC and retention policies
