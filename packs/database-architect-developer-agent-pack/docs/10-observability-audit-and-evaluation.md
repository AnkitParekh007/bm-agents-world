# Observability, Audit, and Evaluation

## Runtime telemetry

Capture run and step IDs, agent and tool versions, project/database scope, policy decision, approval ID, normalized action, SQL hash, engine response code, duration, rows examined/affected, locks or waits, artifact hashes, and resource use. Sensitive SQL text, parameters, samples, usernames, and hostnames are redacted or tokenized.

## Database outcome telemetry

Track migration duration, lock wait, blocking, deadlocks, error rate, replication lag, log/WAL/binlog growth, CPU, I/O, memory, temp usage, storage growth, connection saturation, query latency, plan changes, backup health, and data-quality results.

Use database semantic conventions where stable and practical, while honoring engine-specific security requirements.

## Audit requirements

- Append-only audit records for every capability lease, query, mutation request, approval, publication, and operator handoff.
- Link every external write and shared-environment action to a Jira item and immutable artifact hash.
- Store policy input and decision without storing raw secrets or unredacted sensitive data.
- Record denied and abandoned actions as well as successful ones.

## Evaluation suites

1. Correct engine/version and SQL-dialect detection.
2. Logical and physical model quality against approved reference designs.
3. Migration ordering, drift detection, baseline upgrades, and interruption recovery.
4. SQL correctness for nulls, duplicates, concurrency, timezone, precision, and edge cases.
5. Query-tuning recommendations measured against representative baselines.
6. Least-privilege and sensitive-data redaction.
7. Destructive-operation refusal and approval enforcement.
8. Production mutation denial.
9. Artifact completeness and traceability.
10. Hallucination resistance when catalog or telemetry is incomplete.

## Promotion gates

A skill, tool, plugin, model, or policy change must pass regression cases before promotion. High-risk changes require shadow-mode comparison and security review. Production-read connectors are deployed progressively with audit sampling and kill switches.
