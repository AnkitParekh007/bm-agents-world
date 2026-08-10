# QA Team Pilot Deployment

BM Agents World is packaged as a shared internal QA pilot without changing the governed QA capability contracts.

The Kubernetes pilot now assumes the shared persistence mode documented in [Shared Postgres + Supabase Storage Runtime](shared-supabase-runtime.md). Local SQLite/filesystem remains available for developer work, but it is no longer the Kubernetes team-pilot topology.

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
Trusted gateway pod + namespace labels
        |
        v
Kubernetes NetworkPolicy
        |
        v
ClusterIP: bm-agents-world
        |
        +-----------------------+
        |                       |
        v                       v
Agent Window pod A       Agent Window pod B
CopilotKit + AG-UI       CopilotKit + AG-UI
        |                       |
        +-----------+-----------+
                    |
        +-----------+-----------+
        |                       |
        v                       v
Shared Postgres          Private Supabase Storage
runs/actions/            screenshots/traces/
approvals/audit/         test evidence/bug drafts
telemetry/evaluations
        |
        +-- Jira / Bitbucket
        +-- Playwright Chromium
```

There is intentionally **no Ingress manifest** in the base package. Do not expose the service directly to users when `BM_IDENTITY_MODE=trusted-headers`; trusted identity headers are authoritative only when injected by a controlled gateway.

`ClusterIP` alone is not the security boundary. The base applies an ingress `NetworkPolicy` for the application pods and permits TCP/4000 only from pods that carry the trusted-gateway label inside namespaces carrying the same label. The cluster CNI/network provider must enforce Kubernetes `NetworkPolicy`, or equivalent isolation must be provided.

## Container image

The runtime image uses the pinned Playwright browser image matching the application package. It runs as `pwuser`, redirects writable home/temp state to `/tmp`, and supports a read-only root filesystem.

Build locally:

```bash
docker build -f apps/agent-window/Dockerfile -t bm-agents-world:qa-pilot .
```

The manual GitHub Actions workflow **Publish QA Pilot Image** publishes immutable commit-SHA images plus the `qa-pilot` convenience tag. Deploy the immutable SHA tag.

## Kubernetes base

```text
deploy/k8s/qa-pilot/
├── namespace.yaml
├── configmap.yaml
├── deployment.yaml
├── service.yaml
├── networkpolicy.yaml
├── kustomization.yaml
├── secret.example.yaml
└── playwright-auth-secret.example.yaml
```

The base has these properties:

- two replicas
- rolling-update strategy with zero planned unavailability
- no runtime-data PVC
- Postgres/Supabase shared persistence
- memory-backed `/dev/shm` for Chromium
- writable ephemeral `/tmp`
- read-only Playwright auth Secret mount
- non-root UID/GID 1000
- read-only root filesystem
- privilege escalation disabled
- Linux capabilities dropped
- RuntimeDefault seccomp
- ClusterIP only; no public Ingress
- ingress NetworkPolicy that allows only explicitly labeled trusted-gateway pods in explicitly labeled trusted-gateway namespaces

The replicas can share one durable QA workflow because runs/actions/approvals/audit/evaluations/telemetry are in Postgres and evidence is in private object storage.

## Shared persistence prerequisites

Before deploying the Kubernetes base:

1. apply `deploy/supabase/shared-runtime-schema.sql`;
2. create a private Storage bucket named `bm-agents-world-evidence` (or configure another private bucket);
3. provide `BM_POSTGRES_URL`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` through the deployment secret manager;
4. keep the private `bm_agents_world` schema out of browser-facing configuration;
5. do not make the evidence bucket public.

The base ConfigMap selects:

```text
BM_PERSISTENCE_MODE=postgres-supabase
```

See [Shared Postgres + Supabase Storage Runtime](shared-supabase-runtime.md) for schema, connection, cutover, and rollback details.

## Trusted gateway network labels

Before team access, label the namespace that hosts the authenticated gateway and the gateway pods themselves:

```bash
kubectl label namespace <gateway-namespace> \
  bm-agents-world.io/trusted-gateway=true

kubectl -n <gateway-namespace> label pod <gateway-pod> \
  bm-agents-world.io/trusted-gateway=true
```

Prefer putting the pod label in the gateway Deployment/Pod template. The policy requires both selectors.

Verify the cluster network provider actually enforces `networking.k8s.io/v1` NetworkPolicy before trusted-header mode is used.

## Probe contract

The service exposes two unauthenticated, non-sensitive probe endpoints before trusted identity middleware:

```text
GET /healthz
GET /readyz
```

`/healthz` proves the process is serving HTTP.

In `BM_DEPLOYMENT_MODE=pilot`, `/readyz` requires:

- at least one agent pack loaded;
- model-provider credential available;
- `BM_IDENTITY_MODE=trusted-headers`;
- shared Postgres reachable and runtime schema compatible;
- private artifact storage reachable;
- live Jira read adapter;
- live Bitbucket read adapter;
- live Playwright with at least one configured target.

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

Prefer the organization's secret manager / external-secret mechanism. The resulting runtime Secret must be named:

```text
bm-agents-world-secrets
```

Typical keys now include:

```text
OPENAI_API_KEY (or selected provider credential)
BM_POSTGRES_URL
SUPABASE_URL
SUPABASE_SECRET_KEY
QA_JIRA_EMAIL
QA_JIRA_API_TOKEN or QA_JIRA_BEARER_TOKEN
QA_BITBUCKET_ACCESS_TOKEN
```

Postgres and Supabase secret values are server-only and must never enter browser configuration, model context, logs, tool payloads, or artifacts.

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

Then add only server-side file paths to the ConfigMap/overlay:

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
4. inject trusted identity headers;
5. forward from a pod/namespace allowed by the trusted-gateway NetworkPolicy.

The application fails closed when trusted identity is absent. Tenant/project authorization applies to runs, actions, approvals, audit, evaluations, and artifacts. The requester cannot approve their own protected action in trusted mode.

## Deploy

Publish an image first, then set the immutable image in the manifest/overlay:

```bash
kubectl apply -k deploy/k8s/qa-pilot
kubectl -n bm-agents-world set image deployment/bm-agents-world \
  agent-window=ghcr.io/ankitparekh007/bm-agents-world:<commit-sha>
```

Check rollout:

```bash
kubectl -n bm-agents-world rollout status deployment/bm-agents-world
kubectl -n bm-agents-world get pods,svc,networkpolicy
```

For operator-only probe inspection if policy permits:

```bash
kubectl -n bm-agents-world port-forward service/bm-agents-world 4000:80
curl http://127.0.0.1:4000/healthz
curl http://127.0.0.1:4000/readyz
```

Do not use port-forward as the team access mechanism.

## Pilot admission checklist

Do not onboard QA engineers until all of these are true:

- `/readyz` returns 200;
- shared Postgres schema/version check passes;
- private artifact bucket health check passes;
- SSO/gateway identity is trusted-header mode;
- client-supplied identity headers are stripped at the gateway;
- gateway namespace and gateway pods carry the trusted-gateway labels;
- NetworkPolicy/equivalent isolation is proven;
- project membership is verified for each pilot user;
- requester self-approval is denied;
- a run created on one pod is readable from another pod;
- an approval requested before a pod restart remains available afterward;
- evidence written by one pod is readable by another authorized pod;
- artifact cross-project access is denied;
- Jira/Bitbucket scopes are least privilege;
- Playwright identities are dedicated QA accounts;
- browser targets are non-production only;
- Jira write is either disabled or tested through the L3 two-person approval path;
- Postgres backup/restore and Storage retention/restore procedures are defined;
- pilot support owner and rollback owner are named.

## Recommended pilot size

Start with 2-3 QA engineers and one independent reviewer/QA lead. Use one project first, then add SOP/DataBridge after the workflow is stable.

Collect at least:

- story-analysis success rate;
- impacted-test selection quality;
- browser-run success/failure rate;
- false-positive defect drafts;
- duplicate detection usefulness;
- human approval rejection rate;
- task latency;
- model/tool cost;
- user overrides/manual work still required;
- cross-pod run/approval/artifact continuity.

## After the pilot

If the shared QA pilot works for real daily tasks, the next platform layer should be centralized policy/capability management (OPA + approved MCP/connector registry), then reuse the proven shared capability/approval/audit/telemetry runtime for Angular, Java, Database, DevOps, and the remaining packs.
