# Deployment, Runtime, and Networking

## Control plane

- Agent gateway and authenticated UI/API
- Workflow state store
- Project, engine, tool, skill, and artifact registries
- OPA policy decision point
- Approval service
- Credential/capability broker
- Audit and evaluation services

## Execution plane

Each run receives an ephemeral workspace, pinned repository checkout, engine-specific client tools, disposable database when required, no inbound network, allowlisted egress, quotas, and automatic destruction.

## Network zones

1. Public documentation and approved package/tool registries.
2. Source-control and work-management APIs.
3. Disposable database network.
4. Non-production database zone.
5. Production metadata/observability zone.
6. Secret-manager and identity zone.
7. Artifact and audit storage.

Routes are one-purpose and identity-aware. The model runtime never has direct network access to database endpoints; trusted adapters mediate every connection.

## Database connectivity controls

- TLS verification is mandatory.
- Connections specify an allowlisted service identifier, database, and application name.
- Statement, lock, idle, and session timeouts are enforced by adapter and server where possible.
- Read-only transactions are used for metadata and diagnostics.
- Results are row/byte limited and redacted.
- Mutating connections use separate identities and cannot be reused for diagnostics.

## High availability

Run control-plane services redundantly, persist workflow checkpoints, make artifact writes idempotent, and fail closed when policy, audit, approval, or secret-broker services are unavailable.
