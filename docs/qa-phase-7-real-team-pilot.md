# Phase 7: real QA team pilot

Phase 7 moves BM Agents World from a deployable QA pilot package to a real, measurable team pilot. The repository now contains a fail-closed validation gate for the shared runtime, centralized OPA policy, approved connector registry, one real project, authenticated browser targets, and two serving replicas.

The default Phase 7 project is `PCC`. Change the project list only through an environment overlay after the first project is proven.

## Exit criteria

Phase 7 is complete only when all of the following are true in the target environment:

- two application replicas are Ready behind the trusted organization gateway;
- the shared `bm_agents_world` Postgres schema is reachable and schema-compatible;
- the private Supabase evidence bucket is reachable from both replicas;
- `BM_IDENTITY_MODE=trusted-headers` is active and requests arrive through the trusted SSO/gateway path;
- `BM_POLICY_MODE=opa` is active, OPA is healthy, fail-closed, and the approved connector registry is non-empty;
- PCC has live Jira reads and a live Bitbucket repository mapping;
- PCC has both approved `playground` and `qa` Playwright targets;
- PCC has configured authenticated Playwright storage state and at least one project test case;
- the Phase 7 validator observes at least two distinct serving pod instance IDs;
- 2-3 QA engineers and one independent reviewer complete real Jira → Bitbucket → Playwright → evidence → approval workflows;
- run/action/approval/evidence state remains available as requests move between replicas;
- pilot scorecard metrics are reviewed after the agreed evaluation window.

Jira writes remain optional unless `BM_PILOT_REQUIRE_JIRA_WRITE=true`. When enabled, defect creation continues to require the governed L3 human approval flow.

## 1. Provision shared persistence

Apply the shared schema from:

```text
deploy/supabase/shared-runtime-schema.sql
```

Create the Storage bucket named by `BM_SUPABASE_ARTIFACT_BUCKET` (the Kubernetes default is `bm-agents-world-evidence`) and keep it **private**.

Provide these values only through the deployment secret manager:

```text
BM_POSTGRES_URL
SUPABASE_URL
SUPABASE_SECRET_KEY
```

Do not place server credentials in the ConfigMap, browser bundle, model context, or agent pack files.

## 2. Configure the PCC pilot overlay

The base manifest intentionally leaves real organization values blank. In the environment overlay or deployment system set:

```text
BM_PILOT_PROJECT_IDS=PCC
BM_PILOT_REQUIRED_ENVIRONMENTS=playground,qa
BM_PILOT_EXPECTED_REPLICAS=2

QA_JIRA_BASE_URL=https://<your-org>.atlassian.net
QA_PCC_BITBUCKET_REPOS=frontend:<workspace>/<repo>,backend:<workspace>/<repo>
QA_PCC_PLAYWRIGHT_PLAYGROUND_URL=https://<pcc-playground>
QA_PCC_PLAYWRIGHT_QA_URL=https://<pcc-qa>
```

Provide Jira/Bitbucket credentials through the Secret:

```text
QA_JIRA_EMAIL
QA_JIRA_API_TOKEN
# or QA_JIRA_BEARER_TOKEN
QA_BITBUCKET_ACCESS_TOKEN
```

If the pilot should create real Jira defects after approval:

```text
BM_PILOT_REQUIRE_JIRA_WRITE=true
QA_JIRA_WRITE_ENABLED=true
```

## 3. Configure authenticated PCC browser state

The project test catalog expects the PCC Playwright storage-state secret path. Create/update the `bm-agents-world-playwright-auth` Secret so the mounted file exists at the configured `QA_PCC_PLAYWRIGHT_STORAGE_STATE` path.

Treat storage-state JSON as a credential: do not commit it and do not return it to the model or browser UI.

## 4. Deploy the shared pilot

Deploy the base plus your environment overlay:

```bash
kubectl apply -k deploy/k8s/qa-pilot
kubectl -n bm-agents-world rollout status deployment/bm-agents-world
kubectl -n bm-agents-world get pods -l app.kubernetes.io/name=bm-agents-world -o wide
kubectl -n bm-agents-world get poddisruptionbudget bm-agents-world
```

The deployment uses two replicas, rolling updates with `maxUnavailable: 0`, host topology spreading, preferred pod anti-affinity, and a PodDisruptionBudget with `minAvailable: 1`.

The service remains `ClusterIP`. There is intentionally no public Ingress in this repository. Route traffic through the organization gateway that strips client-supplied identity headers and injects authoritative identity.

## 5. Verify readiness

Application readiness is fail-closed for the shared pilot. `/readyz` now requires:

- shared Postgres state health;
- private artifact storage health;
- trusted identity configuration;
- model credential;
- Jira/Bitbucket/Playwright live configuration;
- `BM_POLICY_MODE=opa`;
- healthy OPA;
- a readable, non-empty approved connector registry.

OPA also has its own Kubernetes readiness/liveness probe, so either the application gate or the sidecar probe can remove an unhealthy pod from service.

## 6. Run the Phase 7 validator

Run this **through the trusted gateway URL**, not against a pod IP:

```bash
BM_PILOT_BASE_URL=https://<trusted-gateway-host> \
BM_PILOT_VALIDATION_BEARER_TOKEN=<only-if-your-gateway-uses-bearer-auth> \
npm run pilot:validate
```

For cookie-backed SSO automation, provide `BM_PILOT_VALIDATION_COOKIE` instead of a bearer token.

The validator checks `/readyz`, calls `/api/qa/pilot/validation` repeatedly, and fails unless it observes the configured number of distinct serving instances. The validation endpoint is behind request identity middleware and does not expose credentials.

Expected success output includes:

```text
BM Agents World Phase 7 QA pilot validation passed.
Target projects: PCC
Observed instances (2/2 required): <pod-a>, <pod-b>
```

If only one pod is observed, inspect gateway load balancing, pod readiness, topology placement, and replica health before onboarding users.

## 7. Onboard the pilot cohort

Use a deliberately small cohort:

- 2-3 QA engineers who normally execute PCC story validation;
- 1 independent reviewer who can approve/reject protected actions;
- one operator/engineering owner who watches readiness, audit, and scorecard signals.

The reviewer should not be the requesting QA engineer for protected actions. Trusted identity mode already denies requester self-approval.

## 8. Execute the real workflow

For at least several representative PCC Jira stories, run the complete sequence:

```text
Jira story + acceptance criteria
        ↓
Bitbucket change impact
        ↓
Story-scoped test selection
        ↓
Authenticated Playwright on playground/QA
        ↓
Screenshots / traces / results / evidence manifest
        ↓
Duplicate defect search
        ↓
Defect draft
        ↓
Independent L3 approval (when creating Jira bug)
        ↓
Jira side effect
        ↓
Persistent audit + telemetry + pilot scorecard
```

During the pilot, refresh run/action/evidence views repeatedly while requests are distributed across both pods. The shared Postgres/Supabase design means the workflow must remain coherent regardless of which replica serves the next request.

## 9. Mandatory policy scenarios

Before calling the pilot proven, exercise these controls:

| Scenario | Expected result |
| --- | --- |
| Unregistered capability/connector | Deny |
| Connector not approved for QA pack | Deny |
| Playwright against production | Deny |
| Jira read in QA | Allow according to standing policy |
| Jira bug creation | L3 human approval |
| Production read | L4 privileged-process approval |
| OPA unavailable | Fail closed / deny and pod not Ready |
| Policy becomes stricter after approval | Existing action cannot execute; new request required |

## 10. Measure the pilot

Use the existing Team Pilot Scorecard and run evaluations. Review at least:

- workflow/task success rate;
- Playwright pass/fail outcomes;
- defect false-positive rate;
- duplicate defects avoided;
- approval rejection rate;
- usefulness and would-use-again rate;
- manual override minutes;
- capability latency;
- measured token usage coverage;
- configured model cost estimates when token rates are supplied.

Do not treat missing provider token metadata as zero usage.

## Go / no-go

**Go to the next agent-pack expansion only when:** the validator is green, both replicas are observed, the real PCC workflow works for the pilot cohort, policy scenarios behave correctly, and the scorecard shows acceptable reliability/quality.

**No-go:** keep the architecture focused on the QA pilot and fix the failing readiness, continuity, approval, policy, evidence, or quality signal before adding Angular/Java/DevOps packs.
