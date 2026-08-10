# Agent and Sub-Agent Architecture

## Supervisor pattern

`devops-supervisor` owns workflow state, scope, risk, evidence, parallelization, retries, approval checkpoints, and final status. Specialist agents receive the minimum context and tools needed for one bounded responsibility.

## Agent registry

| Agent | Responsibility | Core capabilities |
|---|---|---|
| `devops-supervisor` | Coordinates bounded infrastructure, delivery, reliability, incident, approval, and evidence workflows | orchestration, risk, evidence |
| `work-context` | Reads Jira, Confluence, repositories, change history, ownership, service catalog, and environment metadata | jira, requirements, traceability |
| `repo-pipeline-discovery` | Profiles repositories, CI/CD, IaC, deployment assets, versions, and platform conventions | repository, pipeline, discovery |
| `infrastructure-architect` | Designs cloud/on-prem topology, landing zones, resilience, tenancy, and infrastructure boundaries | architecture, resilience, topology |
| `iac-engineer` | Creates and validates Terraform, OpenTofu, CloudFormation, Bicep, Pulumi, and module changes | iac, planning, modules |
| `cloud-platform-engineer` | Manages bounded cloud services, quotas, identities, networking, storage, and compute declarations | cloud, platform, capacity |
| `kubernetes-platform-engineer` | Designs and validates Kubernetes resources, RBAC, policies, controllers, and cluster operations | kubernetes, rbac, workloads |
| `container-build-engineer` | Builds secure reproducible container images, SBOMs, signatures, and registry workflows | containers, sbom, registry |
| `cicd-engineer` | Creates and maintains build, test, security, artifact, and promotion pipelines | ci, pipelines, quality-gates |
| `gitops-engineer` | Manages declarative delivery, application sets, sync policies, drift, and reconciliation | gitops, argocd, drift |
| `release-deployment-engineer` | Plans and validates releases, canaries, rollbacks, smoke tests, and traffic changes | release, deployment, rollback |
| `configuration-engineer` | Manages typed configuration, overlays, feature configuration, and environment parity | configuration, validation, overlays |
| `secrets-identity-engineer` | Designs workload identity, vault paths, leases, rotations, and least-privilege access | secrets, identity, vault |
| `network-dns-engineer` | Designs and validates network, firewall, load balancer, DNS, TLS, and connectivity changes | network, dns, tls |
| `observability-engineer` | Creates metrics, logs, traces, dashboards, alerts, collectors, and telemetry governance | observability, otel, alerts |
| `sre-reliability-engineer` | Defines SLOs, error budgets, capacity, resilience, and toil reduction | sre, slo, reliability |
| `incident-response-agent` | Builds timelines, diagnoses incidents, proposes bounded mitigations, and preserves evidence | incident, diagnostics, recovery |
| `security-supply-chain-agent` | Runs security scans, verifies provenance, reviews IAM, and protects build/deployment supply chains | security, supply-chain, iam |
| `policy-compliance-agent` | Maps controls, validates policies, exceptions, retention, and separation of duties | compliance, policy, audit |
| `cost-capacity-agent` | Analyzes spend, utilization, growth, limits, scaling, and optimization tradeoffs | finops, capacity, forecast |
| `backup-dr-agent` | Plans backup, restore, failover, failback, RTO/RPO, and disaster exercises | backup, dr, recovery |
| `database-platform-agent` | Coordinates database infrastructure, migrations, connectivity, backup, and release dependencies | database, migration, coordination |
| `platform-automation-agent` | Creates self-service templates, golden paths, CLIs, APIs, MCP tools, and reusable automation | platform-engineering, automation, developer-experience |
| `change-reviewer` | Performs independent technical, operational, security, cost, and rollback review | review, risk, quality |
| `evidence-manager` | Creates immutable evidence bundles, provenance, redaction, and traceability | evidence, provenance, redaction |
| `policy-enforcer` | Evaluates scope, environment, identity, approval, payload hash, and prohibited actions | opa, authorization, guardrails |

## Separation of duties

- The implementation agent cannot approve its own production change.
- `change-reviewer` receives the diff, plans, evidence, and risk register but not hidden implementation reasoning.
- `policy-enforcer` evaluates structured facts, authorization, approval, and payload hashes; it does not generate infrastructure.
- `evidence-manager` stores immutable outputs and redacts sensitive values.
- Production execution is delegated to a deterministic deployment system or authorized human operator.

## Parallel execution

After scope resolution, the supervisor may run these tracks in parallel:

1. repository and platform discovery
2. IaC and cloud impact
3. Kubernetes/container impact
4. CI/CD and release impact
5. identity/network/security review
6. observability/reliability/cost review

The supervisor joins the tracks only after every required artifact passes its schema and evidence checks.

## Failure behavior

- Stop on scope mismatch, missing ownership, expired approval, plan drift, secret exposure, or unexpected destructive action.
- Preserve partial evidence and clearly mark incomplete results.
- Never silently broaden access or substitute another environment.
- Re-plan when the repository head, infrastructure state, artifact digest, or approved payload changes.
