# Artifacts and Knowledge Assets

Artifacts are durable, schema-validated outputs with provenance. Knowledge assets are approved source material used to produce them.

## Artifact registry

| Artifact | Purpose |
|---|---|
| `work-context` | Resolved request, project, environment, ownership, evidence, assumptions, and constraints |
| `platform-profile` | Detected CI/CD, cloud, IaC, Kubernetes, registry, observability, and version profile |
| `change-plan` | Scope, risk, implementation, validation, rollback, communication, and approval plan |
| `architecture-decision` | Infrastructure or platform architecture decision with alternatives and consequences |
| `iac-plan` | Redacted machine-readable and human-readable infrastructure plan |
| `iac-drift-report` | Observed drift and recommended disposition |
| `pipeline-design` | Pipeline stages, triggers, runners, artifacts, caches, gates, and credentials |
| `container-build-report` | Image digest, SBOM, vulnerabilities, signature, provenance, and tests |
| `kubernetes-manifest-bundle` | Rendered manifests, diffs, policy results, and ownership |
| `gitops-diff` | Desired-versus-live diff, health, history, and synchronization recommendation |
| `deployment-plan` | Release manifest, strategy, checks, stop conditions, rollback, and communications |
| `deployment-evidence` | Immutable timeline of approvals, artifacts, actions, telemetry, and results |
| `rollback-plan` | Trigger, prerequisites, commands, validation, and recovery ownership |
| `network-change-plan` | Traffic flow, rules, DNS/TLS changes, tests, risk, and rollback |
| `secret-rotation-plan` | Secret reference, consumers, order, validation, rollback, and audit |
| `observability-spec` | SLIs, dashboards, alerts, logs, traces, retention, and ownership |
| `slo-report` | SLO performance, error budget, risks, and recommendations |
| `incident-timeline` | Evidence-linked incident chronology |
| `incident-report` | Impact, detection, response, recovery, causes, and actions |
| `security-gate-report` | Security, supply-chain, IAM, policy, and exception results |
| `cost-impact-report` | Estimated or observed cost, allocation, optimization, and tradeoffs |
| `backup-recovery-report` | Backup status, restore evidence, RTO/RPO, gaps, and actions |
| `quality-gate-report` | Consolidated deterministic and specialist validation results |
| `runbook` | Operational procedure with prerequisites, commands, checks, stop conditions, and escalation |
| `devops-daily-summary` | Daily work, changes, incidents, risk, blockers, and next actions |

## Required provenance

Every release- or incident-relevant artifact records:

- run ID, project, work item, service, and environment
- repository URL, branch, commit, and diff hash
- tool and plugin versions
- artifact, image, plan, and manifest digests
- source evidence identifiers and timestamps
- assumptions, unresolved risks, and exceptions
- approvals, approvers, payload hashes, and expiration
- redaction and retention classification

## Knowledge sources

- Jira stories, change records, incidents, and approvals
- Confluence architecture, standards, runbooks, and decisions
- Bitbucket source, history, pull requests, pipelines, and deployment records
- service catalog, ownership, dependency, and environment inventory
- IaC state metadata and redacted plans
- cloud, Kubernetes, registry, and GitOps metadata
- metrics, logs, traces, dashboards, alerts, and SLO records
- security, vulnerability, SBOM, signature, and policy results
- cost, quota, capacity, backup, and disaster-recovery evidence

## Data handling

Raw secrets, signing keys, production credentials, unrestricted log exports, and unredacted sensitive datasets are not artifacts for model consumption. Store them only in approved systems and expose references or redacted summaries.
