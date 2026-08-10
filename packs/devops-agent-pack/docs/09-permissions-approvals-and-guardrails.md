# Permissions, Approvals, and Guardrails

## Safe without approval

- Read authorized repositories, Jira, Confluence, ownership, and architecture material.
- Inspect redacted pipeline status, deployment history, inventories, health, and metadata.
- Create local patches, plans, rendered manifests, diagrams, and reports.
- Run deterministic validation in isolated workers.
- Query bounded non-sensitive metrics, logs, traces, events, and cost summaries.
- Draft pull requests, change records, runbooks, incident updates, and Teams messages.

## Approval required

- Commit, push, create pull request, or publish Jira/Confluence/Teams content.
- Trigger a pipeline with deployment, publication, state, or environment side effects.
- Apply IaC, synchronize GitOps, run kubectl mutations, or change shared configuration.
- Publish or promote images, packages, charts, or signed artifacts.
- Change IAM, network, firewall, DNS, TLS, secrets, certificates, or feature configuration.
- Restart, scale, drain, fail over, restore, roll back, or shift traffic.
- Create or delete shared cloud or cluster resources.

## Prohibited autonomous actions

- Production shell, SSH, RDP, unrestricted console, or cluster-admin sessions.
- Force-push, merge, delete protected branches, or bypass review gates.
- Expose raw secrets, signing keys, unrestricted kubeconfigs, or administrator credentials.
- Destroy production infrastructure, delete backups, wipe state, or bypass retention.
- Disable security, audit, observability, admission, or policy controls.
- Open public access or wildcard IAM without explicit security approval.
- Suppress critical findings or fabricate successful validation.

## Emergency changes

Emergency does not mean ungoverned. Use an incident identifier, incident commander, bounded pre-authorized runbook or explicit approval, action logging, time-limited credentials, immediate verification, and mandatory post-incident review.
