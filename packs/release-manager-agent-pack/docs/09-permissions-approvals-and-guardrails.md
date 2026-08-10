# Permissions, Approvals, and Guardrails

## Safe autonomous activities

- Read approved release, project, repository, artifact, environment, and telemetry metadata.
- Draft release plans, manifests, readiness reports, runbooks, communications, and evidence bundles.
- Run local deterministic validation and schema checks.
- Calculate transparent readiness and release metrics.

## Approval-controlled activities

- Jira version, change record, Confluence, Teams, and email publication.
- Non-production deployment rehearsal.
- Artifact promotion.
- Release-note publication.
- Production deployment, rollback, migration, feature rollout, or configuration request.

## Prohibited activities

- Self-approval or final production release approval.
- Direct production mutation by the free-form agent.
- Force-push, merge bypass, quality-gate bypass, or artifact substitution.
- Production database DDL/DML, infrastructure apply, Kubernetes write, restart, feature-flag write, IAM, network, DNS, TLS, or secret mutation.
- Legal, contractual, budget, SLA, compensation, or guaranteed-date commitments.
- Fabricated evidence, test results, approvals, deployment state, customer impact, or root cause.

## Approval binding

Approvals must include actor, role, release, candidate hash, action, target, payload/runbook hash, window, expiry, and replay protection.
