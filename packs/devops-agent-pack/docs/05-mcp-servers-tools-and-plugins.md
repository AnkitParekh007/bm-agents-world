# MCP Servers, Tools, and Plugins

## Definitions

- **MCP server:** governed capability boundary exposing resources, prompts, and/or tools.
- **Tool:** atomic deterministic operation such as `terraform plan`, manifest render, bounded log query, or image verification.
- **Plugin/adapter:** runtime integration that implements authentication, redaction, retries, vendor APIs, and audit.
- **Skill:** reusable procedure that orchestrates tools and evidence.

## MCP registry

| MCP server | Purpose | Access model |
|---|---|---|
| `atlassian-rovo-mcp` | Jira and Confluence context and approved publication | read/write-approved |
| `bitbucket-mcp` | Repositories, pull requests, diffs, pipelines, deployments, and approved writes | read/write-approved |
| `workspace-git-mcp` | Scoped filesystem, worktree, Git diff, validation, and patch operations | sandbox-write |
| `cloud-control-plane-mcp` | Provider-neutral adapter over approved AWS, Azure, GCP, or private-cloud APIs | read/approved-write |
| `terraform-opentofu-mcp` | Format, validate, plan, show, graph, test, and approved apply brokerage | plan/approved-apply |
| `ansible-automation-mcp` | Inventory, lint, check mode, playbook execution, and approved operations | check/approved-run |
| `kubernetes-mcp` | Scoped Kubernetes discovery, diff, events, logs, and approved non-production actions | read/approved-write |
| `helm-kustomize-mcp` | Chart, template, lint, dependency, Kustomize, and manifest rendering tools | local-render |
| `gitops-mcp` | Argo CD or approved GitOps status, diff, history, and approved sync/rollback | read/approved-write |
| `container-build-registry-mcp` | BuildKit/Docker build, SBOM, scan, sign, verify, and registry promotion | sandbox/approved-publish |
| `cicd-runner-mcp` | Pipeline validation, run status, logs, artifacts, retries, and approved triggers | read/approved-trigger |
| `observability-mcp` | Bounded metrics, logs, traces, dashboards, alerts, and service-health queries | read/approved-config |
| `incident-management-mcp` | Incident records, paging context, timelines, communications, and approved actions | read/write-approved |
| `vault-identity-mcp` | Capability leases, workload identity, dynamic credentials, and secret references | adapter-only |
| `security-scanner-mcp` | Secret, dependency, container, IaC, Kubernetes, SBOM, signature, and policy scans | local/read |
| `finops-mcp` | Cost, usage, allocation, budgets, anomalies, and approved forecasts | read |
| `artifact-evidence-mcp` | Immutable evidence, reports, hashes, provenance, and retention metadata | write-artifacts |
| `policy-approval-mcp` | OPA decisions, human approvals, payload binding, expiry, and audit | decision |

## Runtime plugins and adapters

| Plugin | Purpose |
|---|---|
| `bitbucket-connector` | Repository, PR, pipeline, deployment, and reviewer integration |
| `jira-confluence-connector` | Work item, change record, runbook, and decision integration |
| `aws-adapter` | Approved AWS control-plane operations through workload identity |
| `azure-adapter` | Approved Azure control-plane operations through managed identity |
| `gcp-adapter` | Approved Google Cloud control-plane operations through federation |
| `private-cloud-adapter` | Approved VMware/OpenStack/private-cloud operations |
| `terraform-runner` | Pinned Terraform execution in isolated workers |
| `opentofu-runner` | Pinned OpenTofu execution in isolated workers |
| `ansible-runner` | Pinned Ansible lint, check, and approved execution |
| `kubernetes-adapter` | Scoped cluster and namespace operations |
| `helm-kustomize-runner` | Local manifest rendering and validation |
| `argocd-adapter` | GitOps diff, health, history, and approved sync |
| `docker-buildkit-runner` | Reproducible isolated container builds |
| `registry-adapter` | Container and artifact registry promotion |
| `observability-adapter` | Prometheus, logs, traces, dashboards, and alert integrations |
| `incident-adapter` | Pager/incident-management integration |
| `vault-adapter` | Secret manager and dynamic credential brokerage |
| `security-scanner-adapter` | Trivy, Checkov, tfsec, scanners, and policy tools |
| `sigstore-adapter` | Artifact signing and verification |
| `finops-adapter` | Cloud cost and usage data |
| `teams-publisher` | Approved Microsoft Teams updates |
| `artifact-store-adapter` | Immutable reports, logs, plans, and evidence bundles |

## Mandatory tool behavior

Every mutation-capable tool must support:

1. explicit project and environment scope
2. preview or diff when technically possible
3. idempotency or a declared non-idempotent risk
4. timeout, cancellation, and retry boundaries
5. payload hash and approval validation
6. immutable audit record
7. secret and personal-data redaction
8. post-action verification
9. safe failure without automatic privilege escalation

## Shell policy

The language model does not receive an unrestricted shell connected to organizational networks. Commands run through allow-listed, argument-validated runners in isolated workspaces. Production commands are emitted as reviewed runbook steps and executed by deterministic systems or humans.
