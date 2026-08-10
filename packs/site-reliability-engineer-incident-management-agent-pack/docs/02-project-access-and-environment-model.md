
# Project Access and Environment Model

## Isolation model

Every run is bound to a project, service, environment, incident or review identifier, time window, user identity, and approved capabilities. Context cannot silently cross PCC, SOP, DataBridge, BM Agent Foundry, customers, tenants, regions, or environments.

## Access layers

1. **Metadata:** service catalog, owners, dependencies, SLOs, runbooks, topology, releases, and escalation paths.
2. **Telemetry:** bounded redacted metrics, logs, traces, alerts, events, and synthetic results.
3. **Operational systems:** incident records, on-call schedules, Jira, Confluence, Teams, and status pages.
4. **Platform diagnostics:** read-only Kubernetes, cloud, network, DNS, TLS, database, queue, and configuration views.
5. **Execution:** isolated non-production tools or payload-bound deterministic production runbooks.

## Environment policy

- **Local/playground:** synthetic data, isolated tests, safe execution, no shared customer impact.
- **QA:** masked or synthetic data, approved load and resilience tests, strict target limits.
- **Production:** bounded, redacted, read-only model access. All mutations are delegated to authorized operators or deterministic executors.
- **DR:** read-only until an exercise or real event is explicitly authorized.

## Required onboarding facts

Service tier, users, owners, dependencies, regions, data classification, RTO/RPO, SLOs, observability systems, on-call team, runbooks, deployment model, rollback, maintenance windows, third parties, and approved production procedures.
