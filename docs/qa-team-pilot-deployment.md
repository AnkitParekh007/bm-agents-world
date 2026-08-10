# QA Team Pilot Deployment

This slice packages BM Agents World as a shared internal QA pilot without changing the proven QA capability contracts.

## Pilot topology

```text
QA Engineer / QA Reviewer
        |
        v
Organization SSO / authenticated gateway
        |
        | strips client identity headers
        | injects x-user-id / x-tenant-id / x-project-ids
        v
ClusterIP: bm-agents-world
        |
        v
Agent Window + CopilotKit
        |
        +-- SQLite persistent run/action/approval/audit state
        +-- persistent QA evidence artifacts
        +-- Jira / Bitbucket
        +-- Playwright Chromium
```

There is intentionally **no Ingress manifest** in the base package. Do not expose the service directly to users when `BM_IDENTITY_MODE=trusted-headers`; trusted identity headers are authoritative only when injected by a controlled gateway.

## Container image

The runtime image uses `mcr.microsoft.com/playwright:v1.62.0-noble`, matching the pinned `playwright` package. It runs the application as `pwuser` and redirects HOME/npm/temp writes to `/tmp` so Kubernetes can keep the root filesystem read-only.

Build locally:

```bash
docker build -f apps/agent-window/Dockerfile -t bm-agents-world:qa-pilot .
```

The manual GitHub Actions workflow **Publish QA Pilot Image** publishes:

```text
ghcr.io/ankitparekh007/bm-agents-world:<commit-sha>
ghcr.io/ankitparekh007/bm-agents-world:qa-pilot
```

Deploy the immutable commit-SHA tag. Treat `qa-pilot` only as a convenience pointer.

## Kubernetes base

```text
deploy/k8s/qa-pilot/
├── namespace.yaml
├── configmap.yaml
├── pvc.yaml
├── deployment.yaml
├── service.yaml
├── kustomization.yaml
├── secret.example.yaml
└── playwright-auth-secret.example.yaml
```

The base has these properties:

- exactly one replica
- `Recreate` rollout strategy
- `ReadWriteOnce` 20 Gi PVC
- `/var/lib/bm-agents/state/qa-pilot.sqlite` for SQLite
- persistent evidence below `/var/lib/bm-agents`
- memory-backed `/dev/shm` for Chromium
- writable ephemeral `/tmp`
- non-root UID/GID 1000
- read-only root filesystem
- privilege escalation disabled
- Linux capabilities dropped
- RuntimeDefault seccomp
- ClusterIP only; no public Ingress

Do **not scale above one replica while SQLite is authoritative**. Move the `CapabilityStore` to Postgres/Supabase before horizontal scaling.

## Probe contract

The service exposes two unauthenticated, non-sensitive probe endpoints before trusted identity middleware:

```text
GET /healthz
GET /readyz
```

`/healthz` proves the process is serving HTTP.

In `BM_DEPLOYMENT_MODE=pilot`, `/readyz` returns HTTP 503 until all required pilot dependencies are configured:

- at least one agent pack loaded
- model-provider credential available
- `BM_IDENTITY_MODE=trusted-headers`
- absolute writable persistent state path
- absolute writable persistent artifact root
- live Jira read adapter
- live Bitbucket read adapter
- live Playwright with at least one configured target

Jira write remains optional by default. Set `BM_PILOT_REQUIRE_JIRA_WRITE=true` only when the pilot is expected to create real approved defects.

## Configure non-secret pilot values

Edit or overlay `deploy/k8s/qa-pilot/configmap.yaml` with the actual internal values, for example:

```yaml
QA_JIRA_BASE_URL: "https://company.atlassian.net"
QA_BITBUCKET_WORKSPACE: "company-workspace"
QA_PCC_BITBUCKET_REPOS: "frontend:pcc-ui,backend:pcc-api"
QA_PCC_PLAYWRIGHT_QA_URL: "https://pcc-qa.internal"
```

Add SOP and DataBridge only for projects participating in the pilot.

## Configure secrets

`secret.example.yaml` and `playwright-auth-secret.example.yaml` are templates and are **not** included in the Kustomization.

Prefer your organization's secret manager / external-secret mechanism. The resulting runtime Secret must be named:

```text
bm-agents-world-secrets
```

Typical keys:

```text
OPENAI_API_KEY (or the selected provider credential)
QA_JIRA_EMAIL
QA_JIRA_API_TOKEN or QA_JIRA_BEARER_TOKEN
QA_BITBUCKET_ACCESS_TOKEN
```

The Deployment references this Secret as optional so the pod can boot for diagnostics. `/readyz` remains unready until required values are present.

### Playwright authenticated state

Create a separate Secret named:

```text
bm-agents-world-playwright-auth
```

with files such as:

```text
PCC.json
SOP.json
DataBridge.json
```

Then add only the server-side file paths to the ConfigMap/overlay:

```yaml
QA_PCC_PLAYWRIGHT_STORAGE_STATE: "/var/run/bm-secrets/playwright-auth/PCC.json"
QA_SOP_PLAYWRIGHT_STORAGE_STATE: "/var/run/bm-secrets/playwright-auth/SOP.json"
QA_DATABRIDGE_PLAYWRIGHT_STORAGE_STATE: "/var/run/bm-secrets/playwright-auth/DataBridge.json"
```

Never place storage-state JSON in a model prompt, ConfigMap, repository file, or artifact.

## Gateway identity contract

For the team pilot:

```text
BM_IDENTITY_MODE=trusted-headers
```

The upstream authenticated gateway MUST:

1. authenticate the user with organization SSO;
2. remove incoming user-supplied `x-user-id`, `x-tenant-id`, `x-project-id`, and `x-project-ids` headers;
3. derive authoritative identity and project membership;
4. inject:

```text
x-user-id: qa.engineer@company.com
x-tenant-id: company
x-project-ids: PCC,SOP
```

5. forward the request to the internal ClusterIP service.

The application fails closed when trusted identity is absent. Project/tenant authorization applies to runs, actions, approvals, audit, and artifacts. The requester cannot approve their own protected action in trusted mode.

## Deploy

Publish an image first, then set the immutable image in the manifest/overlay. For example:

```bash
kubectl apply -k deploy/k8s/qa-pilot
kubectl -n bm-agents-world set image deployment/bm-agents-world \
  agent-window=ghcr.io/ankitparekh007/bm-agents-world:<commit-sha>
```

If GHCR access is private, configure the cluster's package pull identity or an `imagePullSecret` using your platform standard.

Check rollout:

```bash
kubectl -n bm-agents-world rollout status deployment/bm-agents-world
kubectl -n bm-agents-world get pods,svc,pvc
```

Before the real gateway is connected, you can inspect probes with a temporary operator-only port forward:

```bash
kubectl -n bm-agents-world port-forward service/bm-agents-world 4000:80
curl http://127.0.0.1:4000/healthz
curl http://127.0.0.1:4000/readyz
```

Do not use port-forward as the team access mechanism.

## Pilot admission checklist

Do not onboard QA engineers until all of these are true:

- `/readyz` returns 200
- SSO/gateway identity is trusted-header mode
- project membership is verified for each pilot user
- requester self-approval is denied
- state survives pod restart
- artifacts survive pod restart
- artifact cross-project access is denied
- Jira/Bitbucket scopes are least privilege
- Playwright identities are dedicated QA accounts
- browser targets are non-production only
- Jira write is either disabled or tested through the L3 two-person approval path
- a restore/backup procedure exists for the pilot PVC
- pilot support owner and rollback owner are named

## Recommended pilot size

Start with 2-3 QA engineers and one independent reviewer/QA lead. Use one project first (PCC is a reasonable candidate if its QA environment and test identity are easiest to configure), then add SOP/DataBridge after the workflow is stable.

Collect at least:

- story-analysis success rate
- impacted-test selection quality
- browser-run success/failure rate
- false-positive defect drafts
- duplicate detection usefulness
- human approval rejection rate
- task latency
- model/tool cost
- user overrides/manual work still required

## After the pilot

If the architecture works for real daily QA work, the next platform step is to replace SQLite/filesystem persistence with shared Postgres/Supabase + object storage, then reuse the same capability/approval/audit runtime for Angular, Java, Database, DevOps, and the other packs.
