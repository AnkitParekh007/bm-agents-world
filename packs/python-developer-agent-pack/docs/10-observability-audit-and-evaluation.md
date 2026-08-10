# Observability, Audit, and Evaluation

## 1. Run telemetry

Capture run/state IDs, project/repository/commit, agents and skills invoked, model and tool versions, policy decisions, approval references, command duration and exit code, token/cost/resource use, artifacts, retries, errors, and external actions. Sensitive inputs and outputs are redacted before storage.

## 2. Application observability produced by the agent

Code changes should preserve or improve structured logging, correlation, metrics, tracing, error classification, health checks, and operational dashboards. Do not add personal data, secrets, raw payloads, or unbounded-cardinality labels.

## 3. Audit record

External writes create an immutable audit event containing actor, requester, approver, run, purpose, source and target, before/after hashes, capability lease, result, and rollback reference.

## 4. Quality evaluation

Evaluate requirement coverage, patch correctness, test adequacy, type safety, security findings, migration safety, compatibility, maintainability, scope discipline, false-positive rate, human rework, and post-release outcomes.

## 5. Golden tasks and adversarial tests

Maintain representative repositories and tasks for APIs, Django, async workers, database migrations, packaging, PySpark, CLIs, and MCP servers. Include prompt injection, malicious package names, secret bait, unsafe deserialization, SQL/shell injection, stale documentation, conflicting Jira comments, and base-commit drift.

## 6. Operational SLOs

Track tool failure rate, successful resume rate, policy-denial correctness, approval latency, deterministic-gate reliability, escaped defects, rollback rate, and audit completeness. Do not optimize solely for autonomous completion rate.
