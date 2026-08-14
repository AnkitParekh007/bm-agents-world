<!-- GENERATED FILE: DO NOT EDIT DIRECTLY. Run `npm run docs:generate`. -->

# Generated deployment reference

Authoritative sources:

- `deploy/k8s/qa-pilot/deployment.yaml`
- `deploy/k8s/qa-pilot/service.yaml`
- `deploy/k8s/qa-pilot/configmap.yaml`
- `deploy/k8s/qa-pilot/networkpolicy.yaml`

| Fact | Configured value |
| --- | --- |
| Replicas | 2 |
| Update strategy | RollingUpdate |
| Service type | ClusterIP |
| Service port | 80 |
| Application container port | 4000 |
| Containers | agent-window, opa |
| Ingress policy | bm-agents-world-trusted-gateway-only |
| Runtime configuration keys | AI_MODEL, BM_AGENTS_REPO_ROOT, BM_CONNECTOR_REGISTRY_PATH, BM_DEPLOYMENT_MODE, BM_IDENTITY_MODE, BM_OPA_TIMEOUT_MS, BM_OPA_URL, BM_PERSISTENCE_MODE, BM_PILOT_EXPECTED_REPLICAS, BM_PILOT_PROJECT_IDS, BM_PILOT_REQUIRED_ENVIRONMENTS, BM_PILOT_REQUIRE_JIRA_WRITE, BM_POLICY_MODE, BM_POSTGRES_POOL_MAX, BM_POSTGRES_STATEMENT_TIMEOUT_MS, BM_SUPABASE_ARTIFACT_BUCKET, COPILOTKIT_TELEMETRY_DISABLED, NODE_ENV, PORT, QA_BITBUCKET_WORKSPACE, QA_DATABRIDGE_BITBUCKET_REPOS, QA_DATABRIDGE_PLAYWRIGHT_PLAYGROUND_URL, QA_DATABRIDGE_PLAYWRIGHT_QA_URL, QA_JIRA_BASE_URL, QA_JIRA_WRITE_ENABLED, QA_PCC_BITBUCKET_REPOS, QA_PCC_PLAYWRIGHT_PLAYGROUND_URL, QA_PCC_PLAYWRIGHT_QA_URL, QA_PLAYWRIGHT_ENABLED, QA_PLAYWRIGHT_TIMEOUT_MS, QA_SOP_BITBUCKET_REPOS, QA_SOP_PLAYWRIGHT_PLAYGROUND_URL, QA_SOP_PLAYWRIGHT_QA_URL |

See [Deployment](../deployment/deployment.md) and [Security](../deployment/security.md) for operational requirements and trust-boundary guidance.
