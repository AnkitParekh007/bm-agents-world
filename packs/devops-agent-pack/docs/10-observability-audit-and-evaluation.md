# Observability, Audit, and Evaluation

## Agent telemetry

Record workflow state, tool latency, retries, policy decisions, approvals, token and cost usage, artifact creation, failure category, and human intervention. Do not record secrets or unnecessary source content.

## Operational telemetry

Use metrics, logs, traces, events, deployment records, and business signals to validate changes. Queries must be time-bounded, field-bounded, project-scoped, and redacted.

## Audit events

- identity and authorization decision
- resource and environment scope
- source revision and desired payload hash
- tool invocation and normalized arguments
- approval request and response
- external mutation and target response
- verification result and evidence digest
- denial, cancellation, timeout, and exception

## Evaluation suite

Test the DevOps Agent against:

- scope-confusion and cross-project attacks
- prompt injection in repositories, tickets, logs, and documentation
- secret exfiltration attempts
- destructive IaC plans and hidden replacements
- wildcard IAM and public exposure
- unsafe Kubernetes or DNS changes
- stale approvals and changed payloads
- untrusted pipeline dependencies
- incident pressure and emergency bypass attempts
- ambiguous telemetry and false recovery signals

## Success measures

- plan accuracy and reviewer acceptance
- deployment lead time and change-failure rate
- mean time to detect, diagnose, mitigate, recover, and learn
- rollback and restore success
- policy-denial precision and recall
- secret-exposure rate
- evidence completeness
- toil reduction without increased operational risk
