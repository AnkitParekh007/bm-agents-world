# Deployment, Runtime, and Networking

Deploy the Business Analyst Agent as a controlled orchestration service with isolated workers and adapter-mediated network access.

## Runtime components

Agent gateway; workflow engine; specialist worker pool; policy decision point; capability broker; MCP gateway; artifact/evidence service; traceability store; approval service; observability pipeline; evaluation service.

## Isolation

Use a per-run workspace, read-only source mounts where possible, egress allowlists, no host shell, no universal credentials, resource limits, timeouts, and automatic workspace deletion.

## Networking

Workers connect only to the MCP gateway. Adapters connect to approved targets through private networking or allowlisted endpoints. Database access uses bounded query services, not arbitrary sockets. Production endpoints are read-only and separately authorized.

## Data storage

Separate ephemeral working context, approved artifact storage, traceability graph, audit logs, and restricted evidence. Encrypt in transit and at rest; apply project-specific retention and residency.

## Availability and recovery

Persist workflow checkpoints and artifact hashes so interrupted runs can resume safely. Revalidate authorization and evidence freshness on restart. Back up approved artifacts and audit records according to organizational policy.
