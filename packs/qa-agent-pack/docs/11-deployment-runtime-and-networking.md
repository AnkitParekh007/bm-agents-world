# Deployment, Runtime, and Networking

## Logical services

- Agent API and UI
- Workflow/orchestration service
- Agent worker pool
- MCP gateway and server registry
- Policy decision point
- Identity and credential broker
- Approval service
- Artifact/evidence store
- Run-state database
- Telemetry collector
- Scheduler/event receiver

## Isolation

- Separate worker pools or namespaces for playground, QA, and production access.
- Browser workers run in short-lived containers with isolated profiles and restricted egress.
- Database and internal API adapters run near private networks; the model endpoint does not connect directly.
- Use per-project service identities and network policies.
- Prevent a worker assigned to one project from mounting another project's credentials or artifact paths.

## Reliability

- Durable workflow state and resumable approved steps.
- Idempotency for all external writes.
- Queues with dead-letter handling.
- Timeouts and circuit breakers per tool.
- Bounded retries only for transient operations.
- Browser session cleanup and credential revocation on cancellation.
- Immutable evidence and audit logs.

## Configuration lifecycle

1. Config changes are reviewed in source control.
2. Schemas validate registries and workflows.
3. Policy tests run in CI.
4. Changes deploy first to a development control plane.
5. A canary project validates behavior.
6. Production policy/config rollout requires an authorized owner.

## Suggested technology-neutral data stores

- Relational store for run state, registries, approvals, and artifact metadata.
- Object storage for screenshots, videos, traces, logs, and reports.
- Search index for approved knowledge and artifact retrieval.
- Secret manager/vault for credentials.
- OpenTelemetry-compatible telemetry backend.

Avoid using the vector or knowledge store as a source of truth for permissions, secrets, approvals, workflow state, or audit records.
