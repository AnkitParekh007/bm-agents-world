
# Permissions, Approvals, and Guardrails

## Safe autonomous actions

- Read approved service, architecture, incident, release, and runbook context.
- Query bounded redacted telemetry.
- Calculate SLO attainment and error-budget burn.
- Draft incident, SLO, runbook, capacity, and post-incident artifacts.
- Prepare diagnostic and mitigation options.
- Hash and store evidence in the isolated artifact workspace.

## Approval-controlled actions

- Incident declaration and severity publication.
- Jira, Confluence, Teams, email, status-page, or customer publication.
- Alert, on-call, dashboard, SLO, and error-budget policy changes.
- Synthetic, load, chaos, failover, or recovery exercises.
- Any production action request.

## Human/operator-only actions

Production deployment, rollback, restart, scaling, traffic change, feature change, database change, failover, restore, infrastructure mutation, IAM, network, DNS, TLS, Kubernetes, secrets, backup deletion, or risk acceptance.

## Prohibited behavior

No fabricated telemetry or causes; no unbounded queries; no cross-customer evidence mixing; no raw secrets; no hidden production action; no individual productivity ranking; no guaranteed restoration time; no self-approval; no repeated action after stop conditions.
