# BM Agents World

BM Agents World is the incubation repository for turning the organization agent packs under `packs/` into runnable, governed AI coworkers. The implementation is intentionally being stabilized here before it is merged into BM Agent Foundry.

## Current milestone: QA team pilot

`apps/agent-window` uses CopilotKit + AG-UI as the agent experience layer and now contains a real QA vertical slice plus a deployable and measurable shared-pilot package.

What is working:

- Repository-driven agent pack discovery and one named CopilotKit agent per pack.
- Global BM Agents World supervisor for agent-pack discovery.
- Pack task launcher and Copilot chat workspace.
- Governed capability broker with L0-L4 risk levels and payload-bound approvals.
- Real Jira story reads.
- Real Bitbucket change-impact reads.
- Story-aware, allowlisted project-test selection.
- Authenticated Playwright execution on approved non-production targets.
- Screenshot, trace, network, test-result, evidence-manifest, and bug-draft artifacts.
- Jira duplicate search.
- Real Jira defect creation behind L3 exact-artifact human approval.
- Durable QA run/action/approval/audit state in SQLite.
- Request-scoped tenant/project authorization.
- Self-approval denial in trusted shared-pilot mode.
- Run-scoped artifact authorization.
- QA pilot observability derived from persistent run/action/approval results.
- Persistent per-run human evaluation: outcome, usefulness, reuse intent, false positives, manual override time, and notes.
- Tenant/project-scoped pilot scorecard with recent-run drilldown.
- Docker image with pinned Playwright browser runtime.
- Kubernetes single-replica pilot package with persistent storage, health/readiness probes, and trusted-gateway-only ingress NetworkPolicy.
- CI for strict TypeScript, policy/integration/deployment/observability tests, production build, and container build.

## Architecture

```text
Organization Agent Packs
        |
        v
PackRegistry / Pack Compiler
        |
        v
CopilotKit + AG-UI
        |
        v
Agent Window
        |
        v
Capability Broker
        |
        +-- Policy / risk level
        +-- Persistent run/action state
        +-- Human approval
        +-- Audit
        |
        v
Trusted adapters
        |
        +-- Jira
        +-- Bitbucket
        +-- Playwright
        |
        v
Evidence / governed Jira defect
        |
        v
Pilot Observability
        +-- derived run metrics
        +-- human evaluation
        +-- team scorecard
```

The pack files remain the source material. The core application must not become a separate hard-coded implementation for every organizational role.

## Run locally

Prerequisites:

- Node.js 22.13+
- An API key for the model provider selected in `AI_MODEL`

```bash
cp apps/agent-window/.env.example apps/agent-window/.env
npm install
npm run dev
```

The UI runs at `http://localhost:5173` and proxies API calls to the runtime on `http://localhost:4000`.

For OpenAI, for example:

```bash
AI_MODEL=openai:gpt-5.4-mini
OPENAI_API_KEY=...
```

Local development defaults to `BM_IDENTITY_MODE=local-dev`. Shared team deployments must use the trusted gateway model documented in `docs/qa-team-pilot-deployment.md`.

## QA shared pilot

The deployment package is under:

```text
deploy/k8s/qa-pilot/
```

The container can be built with:

```bash
docker build -f apps/agent-window/Dockerfile -t bm-agents-world:qa-pilot .
```

A manual GitHub Actions workflow can publish the image to GHCR. The Kubernetes base creates a `ClusterIP` service plus a NetworkPolicy that only permits explicitly labeled trusted-gateway pods in explicitly labeled gateway namespaces. There is intentionally no public Ingress. The cluster network provider must enforce NetworkPolicy, or an equivalent network restriction must be provided before trusted identity headers are accepted.

Pilot probes:

```text
GET /healthz
GET /readyz
```

`BM_DEPLOYMENT_MODE=pilot` makes readiness fail until the required trusted identity, persistent storage, model credential, Jira, Bitbucket, and Playwright configuration is live.

See [QA Team Pilot Deployment](docs/qa-team-pilot-deployment.md) for the full gateway, network, secret, storage, image, and pilot-admission contract.

## QA pilot scorecard

When the QA pack is selected, BM Agents World renders a Team Pilot Scorecard built from persisted execution facts and human feedback. It tracks run/action success, browser test pass/fail, approvals, bug drafts, confirmed Jira side effects, usefulness, would-use-again rate, false-positive defects, and manual override time.

Model token/cost telemetry is deliberately shown as `not_instrumented` until provider usage is written into the BM Agents World persistence contract; missing usage is never reported as zero.

See [QA Pilot Observability and Evaluation](docs/qa-pilot-observability.md).

## Security boundary

External capability execution follows:

```text
Authenticated user
   ↓
Trusted gateway
   ↓
NetworkPolicy / equivalent isolation
   ↓
Tenant / project authorization
   ↓
CopilotKit agent
   ↓
Capability broker
   ↓
Risk / policy
   ↓
Payload-bound human approval when required
   ↓
Trusted server adapter
   ↓
Jira / Bitbucket / Playwright
   ↓
Persistent audit + authorized evidence
```

Raw Jira, Bitbucket, model-provider, and Playwright authentication material remains server-side and must not enter model context.

Free-form production mutation remains unavailable.

## Current constraints

- The QA pilot intentionally runs as **one replica** while SQLite is authoritative.
- The Kubernetes base has **no public Ingress** and requires trusted-gateway network isolation.
- Jira writes remain separately opt-in and always require L3 approval.
- Database validation and Teams posting are not yet live integrations.
- Production browser execution is not supported.
- Model call/token/cost usage is not yet persisted by the current CopilotKit integration.
- Horizontal scaling should wait for a shared Postgres/Supabase capability store and object storage.

## Next milestones

1. Deploy the QA pilot behind organization SSO/gateway and verify NetworkPolicy/equivalent isolation.
2. Configure one real project first, then onboard 2-3 QA engineers and an independent reviewer.
3. Use the pilot scorecard to measure task success, defect quality, approval rejection, usefulness, manual overrides, and latency.
4. Add model/provider usage telemetry and OpenTelemetry export for operational diagnosis.
5. Replace SQLite/filesystem persistence with shared Postgres/Supabase + object storage before horizontal scale.
6. Add OPA-backed centralized policy evaluation and organization-approved MCP connection management.
7. Reuse the proven capability/approval/audit pattern for Angular, Java, Database, DevOps, Product, SRE, Security, AI/ML, MLOps, and the remaining packs.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run build
npm run test --workspace @bm-agents-world/agent-window
docker build -f apps/agent-window/Dockerfile -t bm-agents-world:qa-pilot .
```
