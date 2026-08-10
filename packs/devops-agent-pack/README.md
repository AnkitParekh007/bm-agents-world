# DevOps Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: DevOps / Platform / Cloud / SRE Engineer  
Organization context: Bitbucket repositories, Jira/Confluence, Bitbucket Pipelines or approved CI/CD systems, cloud and on-prem infrastructure, Terraform/OpenTofu, containers, Kubernetes, Helm, GitOps, observability, vault services, playground/QA/production environments, Microsoft Teams, Angular frontends, Java/Python services, and enterprise databases.

## Purpose

This pack defines the access, skills, agents, MCP servers, deterministic tools, runtime plugins, artifacts, orchestration, key-vault integration, approvals, evaluation, and operational controls required for an enterprise DevOps Agent.

It supports infrastructure design and provisioning, CI/CD, container engineering, Kubernetes, GitOps, environment configuration, secrets and identity, networking, observability, SRE, incident response, backups, disaster recovery, FinOps, platform engineering, release operations, and continuous improvement.

## Core design rule

The agent never receives universal cloud credentials, unrestricted kubeconfig, production shell access, raw secrets, signing keys, database administrator passwords, or direct production mutation rights. Every run is bound to:

`organization -> project -> Jira/change/incident item -> repositories -> cloud account/subscription/project -> cluster/namespace -> environment -> service -> requester -> approved purpose -> allowed tools -> change payload -> evidence -> approvals -> expiration`

## Supported execution profiles

| Profile | Typical work | Required behavior |
|---|---|---|
| CI/CD engineering | Build, test, scan, package, promote, and release pipelines | Build once, promote immutable artifacts, protect secrets, preserve evidence |
| Infrastructure as code | Terraform/OpenTofu and approved IaC modules | Format, validate, plan, policy-check, review, and require approval before apply |
| Container and Kubernetes platform | Docker, registries, manifests, Helm, Kustomize, GitOps | Render and validate locally; scope cluster access; no autonomous production mutation |
| Cloud and network operations | Compute, storage, identity, networking, DNS, TLS, managed services | Detect provider/version/topology; apply least privilege and blast-radius analysis |
| Observability and SRE | Metrics, logs, traces, dashboards, alerts, SLOs, capacity | Protect telemetry data; use bounded queries; tie alerts to owners and runbooks |
| Incident and recovery | Diagnosis, mitigation plans, rollback, restore, failover, post-incident review | Preserve timeline and evidence; incident commander approves mutations |
| Platform engineering | Golden paths, templates, modules, self-service APIs and MCP tools | Encode guardrails, previews, approvals, idempotency, audit, and expiry |

## Organization project templates

- **PCC:** Angular 12 and Java; existing CI/CD and platform profile resolved before change.
- **SOP:** Angular 15 and Java; environment-aware delivery and shared platform integration.
- **DataBridge:** AngularJS and Java; conservative change mode for legacy runtime and deployment constraints.
- **Environments:** local/sandbox, playground, QA, and production. Production is read-only by default and all mutations require independent, payload-bound approval or a pre-authorized deterministic runbook.

## Recommended first implementation

1. User selects project, Jira/change/incident item, repositories, environment, service, and desired workflow.
2. Supervisor resolves identity, ownership, platform profile, change class, sensitivity, freeze window, blast radius, and approvals.
3. Discovery specialists inspect pipelines, IaC, manifests, versions, environments, observability, runbooks, and recent changes.
4. Agent produces a change plan, diff or speculative plan, deterministic gate results, rollback, and evidence requirements.
5. Changes occur only in isolated worktrees and non-production sandboxes until approval.
6. Deterministic gates run: format, validate, lint, unit/integration tests, IaC plan, manifest rendering, policy, security, SBOM, signature, cost, and observability checks.
7. A separate reviewer evaluates operational risk, reversibility, capacity, security, cost, and release readiness.
8. Human approval is required for repository publication, shared-environment mutation, pipeline triggers with side effects, production deployment, rollback, DNS/TLS changes, secret rotation, failover, or restore.

## Pack facts

- **235 daily tasks**
- **26 supervisor and specialist agents**
- **184 reusable skills**
- **18 MCP server definitions**
- **22 runtime plugins/adapters**
- **25 artifact types**
- **5 machine-readable workflows**
- **7 JSON output contracts**
- **15 YAML configuration/workflow files**

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable DevOps workflows |
| `schemas/` | JSON contracts for structured outputs |
| `templates/` | Reusable change, deployment, incident, and reporting artifacts |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |
