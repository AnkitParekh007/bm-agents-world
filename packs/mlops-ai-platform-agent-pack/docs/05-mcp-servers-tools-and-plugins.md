# MCP Servers, Tools and Plugins

MCP servers expose governed external capabilities; plugins are deterministic local or sandboxed executors. Skills are reasoning/operational capabilities and are intentionally registered separately.

## MCP server registry

- **atlassian-mcp** — Jira/Confluence work context. Access: read + approved write.
- **bitbucket-mcp** — Repositories, pull requests, pipeline metadata. Access: read + approved write.
- **mlflow-mcp** — Experiments, traces, registry, prompts, evaluations. Access: scoped.
- **kubeflow-mcp** — Pipeline, training, notebook and model-registry metadata. Access: scoped.
- **kserve-mcp** — InferenceService and LLMInferenceService metadata. Access: read + approved change request.
- **kubernetes-mcp** — Cluster, workload, quota and event metadata. Access: bounded read.
- **container-registry-mcp** — Images, digests, attestations, SBOM references. Access: read.
- **artifact-store-mcp** — Model/checkpoint/evaluation artifact metadata. Access: bounded read.
- **feature-store-mcp** — Feature definitions, freshness, ownership and materialization state. Access: bounded read.
- **vector-platform-mcp** — Index metadata, embedding versions, freshness and tenancy. Access: bounded read.
- **model-gateway-mcp** — Provider catalog, quotas, routing and usage metadata. Access: read + approved policy change.
- **observability-mcp** — Metrics, logs, traces and dashboards. Access: bounded read.
- **gpu-platform-mcp** — GPU inventory, allocation and telemetry. Access: bounded read.
- **cloud-platform-mcp** — Cloud capacity, quotas and managed AI service metadata. Access: bounded read.
- **cost-management-mcp** — Cost and budget data. Access: bounded read.
- **security-assurance-mcp** — Vulnerability, provenance and policy evidence. Access: read.
- **key-vault-mcp** — Secret references and capability leases. Access: broker-only.
- **policy-approval-mcp** — OPA decisions, approval records and immutable action bundles. Access: policy/approval.

## Deterministic plugins

- **git-read-plugin** — Resolve commits, diffs and tags without write access.
- **workspace-sandbox-plugin** — Create isolated workspaces for manifests and platform code.
- **kubectl-read-plugin** — Run allowlisted read-only kubectl queries.
- **helm-render-plugin** — Render and lint Helm charts without applying them.
- **kustomize-build-plugin** — Build Kustomize overlays without cluster mutation.
- **terraform-plan-plugin** — Validate and plan infrastructure without apply.
- **container-build-plugin** — Build immutable candidate images in sandboxed builders.
- **sbom-plugin** — Generate software bills of materials.
- **vulnerability-scan-plugin** — Run approved image/dependency vulnerability scans.
- **cosign-verify-plugin** — Verify signatures and attestations.
- **mlflow-cli-plugin** — Run scoped MLflow validation and metadata operations.
- **kfp-compile-plugin** — Compile and validate Kubeflow pipeline definitions.
- **kserve-validate-plugin** — Validate KServe manifests and runtime compatibility.
- **evaluation-runner-plugin** — Run deterministic model/agent evaluation suites.
- **load-test-plugin** — Run approved bounded non-production serving load tests.
- **otel-analysis-plugin** — Analyze OpenTelemetry traces and semantic attributes.
- **prometheus-query-plugin** — Execute allowlisted bounded metric queries.
- **gpu-telemetry-plugin** — Analyze accelerator utilization and health telemetry.
- **manifest-schema-plugin** — Validate YAML/JSON/Kubernetes schemas.
- **network-policy-check-plugin** — Validate intended egress and network policy rules.
- **policy-evaluator-plugin** — Evaluate OPA/Rego policies against candidate actions.
- **hash-provenance-plugin** — Calculate digests and produce provenance manifests.

## Integration rule

Adapters resolve credentials internally. Tool responses should be bounded, redacted, project-scoped, and attributable to the exact environment/candidate. Destructive or privileged operations are represented as approval requests, not general-purpose tools.
