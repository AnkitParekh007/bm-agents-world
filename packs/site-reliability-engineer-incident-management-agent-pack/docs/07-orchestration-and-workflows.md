
# Orchestration and Workflows

## Orchestration principles

- Bind every run to an explicit service and environment.
- Prefer parallel independent analysis for telemetry, release, platform, database, and dependency evidence.
- Use deterministic calculations for SLOs, burn rates, severity rules, hashes, and approval validation.
- Keep incident command, production execution, and risk acceptance human-accountable.
- Persist intermediate state so responders can hand off without losing context.
- Stop when evidence conflicts with safety or success criteria.

## Included workflows

1. **Service reliability baseline** — onboard service ownership, SLOs, telemetry, alerting, runbooks, and roadmap.
2. **SLO and error-budget operations** — validate measurements, calculate budget, diagnose burn, and prepare decision evidence.
3. **Incident response and recovery** — declare, command, diagnose, mitigate, verify, communicate, and preserve evidence.
4. **Resilience, capacity, and DR** — forecast, exercise, recover, reconcile, and improve.
5. **Post-incident learning** — create blameless review, corrective actions, toil backlog, and reliability roadmap.

## Convergence gate

High-risk outputs require scope validation, source citations, redaction, evidence confidence, independent review, policy decision, and payload-bound approval before publication or execution.
