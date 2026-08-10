# Project Access and Environment Model

## Access principle

Access is capability-based, time-limited, project-bound, environment-bound, tool-bound, and purpose-bound. A successful login is not sufficient authorization for an action.

## Scope tuple

Every run carries these immutable fields:

- organization and business unit
- project and service
- Jira, change, or incident identifier
- repositories and approved branches
- cloud account/subscription/project and region
- cluster, namespace, host group, or serverless target
- environment and data classification
- requester, service owner, technical owner, and approvers
- allowed read tools and allowed mutation tools
- change payload hash, expiration, and evidence location

## Repository access

| Capability | Default | Notes |
|---|---|---|
| Read source and history | Allowed within selected repositories | Includes pipeline, IaC, manifest, runbook, and ownership files |
| Create local worktree and patch | Allowed in isolated workspace | No direct shared branch write |
| Read pull requests and pipeline status | Allowed within project | Redact secrets and sensitive logs |
| Commit, push, or open pull request | Approval required | Approval binds exact diff and destination |
| Merge, force-push, delete branch | Prohibited for autonomous agent | Human or governed merge automation only |

## Infrastructure access classes

1. **Catalog reader:** metadata, inventory, versions, health, tags, and configuration summaries.
2. **Diagnostic reader:** bounded logs, metrics, traces, events, plans, and safe describe operations.
3. **Sandbox operator:** isolated non-production resources with quota, expiry, and cleanup policy.
4. **Shared non-production operator:** approved mutations in playground or QA.
5. **Production verifier:** read-only health and post-change evidence.
6. **Production executor:** deterministic deployment system or human operator, never the language model directly.

## Environment boundaries

| Environment | Autonomous reads | Autonomous writes | Approval-gated writes |
|---|---:|---:|---:|
| Local / isolated sandbox | Yes | Yes, within quotas and TTL | Destructive or external publication |
| Playground | Yes | Limited idempotent test actions | Infrastructure, cluster, secrets, pipeline, or environment mutation |
| QA | Yes | Artifact generation only by default | All shared-environment mutation |
| Production | Bounded and redacted | No | Executed by approved deterministic system or human operator |

## Project templates

### PCC

- Frontend: Angular 12
- Backend: Java
- Repositories: `<PCC_REPOSITORIES>`
- CI/CD: `<PCC_CICD_SYSTEM>`
- Infrastructure: `<PCC_IAC_REPOSITORIES>`
- Runtime: `<PCC_RUNTIME_PROFILE>`
- Conservative compatibility mode is required.

### SOP

- Frontend: Angular 15
- Backend: Java
- Repositories: `<SOP_REPOSITORIES>`
- CI/CD: `<SOP_CICD_SYSTEM>`
- Infrastructure: `<SOP_IAC_REPOSITORIES>`
- Runtime: `<SOP_RUNTIME_PROFILE>`

### DataBridge

- Frontend: AngularJS
- Backend: Java
- Repositories: `<DATABRIDGE_REPOSITORIES>`
- CI/CD: `<DATABRIDGE_CICD_SYSTEM>`
- Infrastructure: `<DATABRIDGE_IAC_REPOSITORIES>`
- Runtime: `<DATABRIDGE_RUNTIME_PROFILE>`
- Legacy-safe change mode and explicit rollback are mandatory.

## Network and data controls

- Workers run in isolated network segments with deny-by-default egress.
- Package, module, provider, chart, and image sources are allow-listed.
- Production telemetry queries require minimum necessary fields and bounded time ranges.
- Raw credentials, signing keys, database passwords, and unrestricted kubeconfigs never enter model context.
- All mutation adapters validate scope and approval immediately before execution.
