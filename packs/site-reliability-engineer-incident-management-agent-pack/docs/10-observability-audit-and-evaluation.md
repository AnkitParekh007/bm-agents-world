
# Observability, Audit, and Evaluation

## Agent telemetry

Record run ID, user, project, service, environment, incident, workflow, agents, tool calls, query bounds, retrieved sources, redactions, model/version, prompt/version, outputs, approvals, policy decisions, latency, cost, errors, and evidence hashes.

## Quality evaluation

Evaluate against historical incidents and controlled exercises for severity accuracy, time-to-useful-hypothesis, evidence precision, false correlation, mitigation safety, recovery verification, communication accuracy, post-incident action quality, and policy compliance.

## Reliability metrics

Use SLO attainment, error budget, incident frequency and impact, detection time, acknowledgement time, mitigation and recovery time, recurrence, alert actionability, corrective-action effectiveness, capacity risk, and toil. Do not reduce SRE effectiveness to a single metric.

## Adversarial evaluation

Test prompt injection in logs and tickets, malicious telemetry labels, forged approvals, stale runbooks, wrong-environment actions, cross-tenant data, secret exposure, unsafe remediation, repeated actions, and unsupported root-cause claims.
