# Deployment, Runtime, and Networking

## Runtime components

- Agent gateway and user session
- Durable workflow orchestrator
- Supervisor and isolated specialist workers
- MCP gateway with per-server trust and allowlists
- OPA policy decision point
- Capability/credential broker
- Ephemeral architecture workspace
- Diagram and contract validation workers
- Immutable artifact and audit stores
- Approval service and telemetry pipeline

Each run uses a separate workspace pinned to source revisions and authorization. Use rootless containers, read-only images, quotas, timeouts, egress allowlists, and separate untrusted-content and trusted-publication workers.

The model runtime has no direct target-system network access. It invokes typed tools through the MCP gateway. Production target systems remain read-only to agents regardless of control-plane topology.
