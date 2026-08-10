# Orchestration and Workflows

## Workflow state machine

`intake -> scope authorization -> platform discovery -> risk classification -> plan -> deterministic validation -> independent review -> approval -> controlled execution -> verification -> evidence -> closeout`

## Core rules

- No mutation before platform discovery and scope authorization.
- Repositories, infrastructure state, desired state, artifact digest, and approval payload must remain consistent.
- Read-only and speculative operations may run in parallel.
- A plan that contains an unexpected destroy, replacement, privilege escalation, public exposure, data loss, or production outage stops automatically.
- Production changes are executed by a deterministic pipeline or authorized human, not free-form model tool use.
- Every workflow has explicit stop conditions and rollback or containment behavior.

## Included workflows

1. `story-to-change-plan.yaml` — resolves context and produces a governed implementation plan.
2. `infrastructure-change.yaml` — creates and validates IaC, network, cloud, or Kubernetes changes.
3. `pipeline-build-release.yaml` — modifies CI/CD, builds immutable artifacts, and prepares promotion.
4. `incident-response-recovery.yaml` — creates an evidence-linked timeline and approved mitigation plan.
5. `production-release-and-rollback.yaml` — prepares and verifies an approval-gated production release or rollback.

## Approval binding

Approval records include run ID, project, service, environment, action, exact payload hash, source revision, artifact digest, approver, reason, and expiration. A changed plan, commit, image, environment, target, or command invalidates approval.

## Human escalation

Escalate when ownership is unclear, evidence conflicts, a change is not reversible, production data may be affected, regulatory controls apply, an emergency bypass is proposed, or the tool cannot provide a trustworthy preview.
