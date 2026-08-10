
# Deployment, Runtime, and Networking

## Runtime zones

1. Agent Gateway and identity
2. Orchestrator and state store
3. Policy and approval plane
4. Read-only connector workers
5. Isolated non-production execution workers
6. Deterministic production executor outside model control
7. Artifact and evidence store
8. Observability and audit pipeline

## Network controls

Default-deny egress, DNS and certificate validation, allowlisted MCP endpoints, private connectivity where possible, mTLS, service identity, rate limits, payload limits, query timeouts, and no unrestricted shell or arbitrary URL fetch.

## Production executor

Accepts only a signed immutable bundle whose project, service, environment, action, target, payload hash, approvals, expiry, runbook version, stop conditions, rollback, and verification match policy. It returns structured evidence to the agent; it does not accept conversational instructions.

## Isolation

Incident state and telemetry caches are partitioned by organization, project, service, environment, incident, and data classification. Temporary evidence expires according to policy.
