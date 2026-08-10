# BM Agents World

BM Agents World is the incubation repository for turning the organization agent packs under `packs/` into runnable, governed AI coworkers. The implementation is intentionally being stabilized here before it is merged into BM Agent Foundry.

## Current milestone: scalable QA team pilot

`apps/agent-window` uses CopilotKit + AG-UI as the agent experience layer and contains a real QA vertical slice plus a deployable, measurable, horizontally scalable shared-pilot package.

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
- Request-scoped tenant/project authorization and trusted-mode self-approval denial.
- Run-scoped artifact authorization.
- QA pilot observability derived from persistent execution facts.
- Persistent per-run human evaluation: outcome, usefulness, reuse intent, false positives, manual override time, and notes.
- AG-UI agent-run telemetry with measured token usage when provider metadata is present.
- Explicit measured/partial/unavailable model-usage coverage instead of fake zeroes.
- Configured token-rate cost estimates without hard-coded provider prices.
- OpenTelemetry spans for agent runs, governed capability execution, and approval decisions.
- Persistent capability execution latency and per-capability timing breakdowns.
- Local SQLite/filesystem persistence for developer workflows.
- Shared Postgres persistence for runs, actions, approvals, audit, evaluations, and model telemetry.
- Private Supabase Storage evidence repository for cross-pod QA workflows.
- Two-replica rolling-update Kubernetes pilot without a runtime data PVC.
- Health/readiness probes that validate shared state/evidence availability in pilot mode.
- Trusted-gateway-only ingress NetworkPolicy and no public Ingress.
- CI for strict TypeScript, policy/integration/deployment/observability/telemetry/shared-persistence tests, production build, and container build.

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
        +--> Agent-run telemetry
        |       +-- provider/model
        |       +-- measured tokens
        |       +-- configured cost estimate
        |       +-- trace id
        |
        v
Agent Window pods
        |
        v
Capability Broker contract
   +----+-------------------------------+
   |                                    |
   | local development                  | shared pilot
   v                                    v
SQLite + filesystem              Postgres + private Storage
                                        |
                           +------------+------------+
                           |                         |
                           v                         v
                    durable state              QA evidence
                    approvals/audit            traces/screenshots
                    evaluations                bug drafts/results
                           |
                           v
                    Trusted adapters
                     Jira / Bitbucket /
                       Playwright
                           |
                           v
                    Pilot Observability
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

Local development defaults to:

```text
BM_IDENTITY_MODE=local-dev
BM_PERSISTENCE_MODE=sqlite-filesystem
```

Shared team deployments must use the trusted gateway model and shared persistence documented in `docs/qa-team-pilot-deployment.md` and `docs/shared-supabase-runtime.md`.

## QA shared pilot

The deployment package is under:

```text
deploy/k8s/qa-pilot/
```

The shared pilot uses:

```text
BM_DEPLOYMENT_MODE=pilot
BM_IDENTITY_MODE=trusted-headers
BM_PERSISTENCE_MODE=postgres-supabase
replicas=2
RollingUpdate
```

Runtime state lives in the private `bm_agents_world` Postgres schema and QA evidence lives in a private Supabase Storage bucket. The Kubernetes base therefore does not mount a runtime data PVC.

Apply the shared database bootstrap before deployment:

```text
deploy/supabase/shared-runtime-schema.sql
```

Then create the private evidence bucket and provide the server-only Postgres/Supabase credentials through the deployment secret manager.

The Kubernetes base creates a `ClusterIP` service plus a NetworkPolicy that only permits explicitly labeled trusted-gateway pods in explicitly labeled gateway namespaces. There is intentionally no public Ingress.

Pilot probes:

```text
GET /healthz
GET /readyz
```

In shared pilot mode, readiness fails closed if Postgres or private artifact storage is unavailable, in addition to the existing identity/model/Jira/Bitbucket/Playwright requirements.

See:

- [QA Team Pilot Deployment](docs/qa-team-pilot-deployment.md)
- [Shared Postgres + Supabase Storage Runtime](docs/shared-supabase-runtime.md)

## QA pilot scorecard

When the QA pack is selected, BM Agents World renders a Team Pilot Scorecard built from persisted execution facts and human feedback. It tracks run/action success, browser test pass/fail, approvals, bug drafts, confirmed Jira side effects, usefulness, would-use-again rate, false-positive defects, manual override time, model usage, configured cost estimates, and capability latency.

Model usage is reported only when numeric provider/AG-UI metadata is present. A workflow can therefore be `measured`, `partial`, or `unavailable`; missing usage is never reported as zero. Cost remains unavailable unless validated input/output token rates are explicitly configured server-side.

See [QA Pilot Observability and Evaluation](docs/qa-pilot-observability.md) and [Model Usage Telemetry and OpenTelemetry](docs/model-usage-opentelemetry.md).

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
Shared durable state / evidence
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

Postgres credentials, Supabase secret keys, Jira/Bitbucket/model-provider credentials, and Playwright authentication material remain server-side and must not enter model context. Private Storage objects are returned only through the BM authorization boundary; the shared persistence implementation does not expose public or signed evidence URLs to the employee UI.

Free-form production mutation remains unavailable.

## Current constraints

- Shared pilot mode requires the `bm_agents_world` Postgres schema and a private Supabase Storage bucket to be provisioned before startup.
- Local SQLite/filesystem mode remains single-process and must not be used as independent state across multiple pods.
- The Kubernetes base has no public Ingress and requires trusted-gateway network isolation.
- Jira writes remain separately opt-in and always require L3 approval.
- Database validation and Teams posting are not yet live integrations.
- Production browser execution is not supported.
- Model token telemetry depends on actual provider/AG-UI usage metadata; unsupported runs remain `unavailable`.
- Cost is an explicit configured estimate and not provider billing.

## Next milestones

1. Provision the shared schema/private bucket and deploy the two-replica QA pilot behind organization SSO/gateway.
2. Configure one real project, an approved OTLP collector if desired, and validated model token rates if cost estimates are needed.
3. Onboard 2-3 QA engineers plus an independent reviewer and prove cross-pod run/approval/evidence continuity.
4. Use the scorecard to measure task success, defect quality, approval rejection, usefulness, manual overrides, latency, token usage, and cost.
5. Add OPA-backed centralized policy evaluation and organization-approved MCP connection management.
6. Reuse the proven capability/approval/audit/telemetry/shared-persistence pattern for Angular, Java, Database, DevOps, Product, SRE, Security, AI/ML, MLOps, and the remaining packs.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run build
npm run test --workspace @bm-agents-world/agent-window
docker build -f apps/agent-window/Dockerfile -t bm-agents-world:qa-pilot .
```
