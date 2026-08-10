# Observability, Audit and Evaluation

## Run telemetry

Capture workflow duration, step latency, model/tool usage, retries, approval wait, compile/test time, cache hits, artifact sizes and failure categories. Trace context should propagate from the user request through supervisor, specialists, adapters and evidence store.

## Audit events

Record authenticated requester, selected project and repository, base commit, retrieved resource identifiers, tool calls, policy decisions, lease issuance, approvals, mutations, output hashes and final disposition. Do not place raw secrets or unnecessary source content in audit logs.

## Java quality metrics

- Compile and packaging success
- Unit, integration and contract test results
- Mutation score where configured
- Static-analysis and security findings
- Dependency convergence and vulnerability status
- API/event/schema compatibility
- Migration validation
- JFR/performance regression indicators
- Flaky test rate and rerun behavior
- Human review changes and rejected suggestions

## Agent evaluation suite

Maintain curated tasks for bug fixing, feature implementation, JPA/query correctness, migration safety, API compatibility, Spring/Jakarta upgrades, concurrency, security and build troubleshooting. Evaluate exact patch correctness, tests, policy compliance, evidence completeness and unnecessary-change rate.

## Release gates

A green aggregate status requires all mandatory deterministic gates, no unresolved critical findings, valid approvals, complete traceability and a clean scope check. Human reviewers can override advisory findings, but the reason and residual risk must be recorded.

## Incident response

A kill switch disables write capabilities globally or by project. Suspected secret leakage, unauthorized access, destructive tool behavior or compromised adapters triggers lease revocation, artifact quarantine, audit preservation and security escalation.
