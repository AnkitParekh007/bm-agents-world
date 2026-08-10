# Observability, Audit, and Evaluation

Observability must show what the agent knew, what it did, why it did it, which policy allowed it, and how well the output performed.

## Operational telemetry

Record run and stage IDs, latency, token and tool usage, retries, failures, policy decisions, approvals, evidence freshness, and artifact versions. Redact prompts and responses according to classification.

## Audit trail

Capture requester, purpose, project, sources accessed, fields retrieved, tool parameters, result hashes, generated artifacts, reviewer findings, approvals, publications, and retention actions.

## Quality evaluation

Evaluate requirement ambiguity, atomicity, consistency, completeness, testability, traceability, stakeholder coverage, rule conflicts, process exception coverage, NFR coverage, and unsupported claims.

## Outcome evaluation

Track escaped requirement defects, clarification loops, rework caused by requirement issues, orphan rates, UAT coverage, decision latency, change volatility, stakeholder validation, and outcome realization. Do not use these measures to rank individuals.

## Evaluation datasets

Maintain redacted benchmark cases for ambiguous requirements, conflicting rules, process exceptions, data definitions, integration failure paths, NFRs, traceability, change impact, and acceptance decisions.
