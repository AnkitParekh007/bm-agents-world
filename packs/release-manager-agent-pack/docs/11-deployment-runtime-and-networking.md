# Deployment Runtime and Networking

## Runtime components

- Agent gateway and supervisor
- Isolated artifact workspace
- Policy decision point
- Capability broker
- MCP adapters
- Workflow state store
- Approval service
- Immutable artifact store
- Audit and observability pipeline

## Network model

Default deny. Allow only approved connector destinations. Production control planes are reachable only by deterministic deployment systems or authorized operator workstations—not by the free-form model runtime.

## Execution isolation

Use ephemeral workers, pinned tool images, read-only source mounts where possible, egress controls, resource limits, and complete audit logging.

## Availability

Workflows are resumable and idempotent. A failed model call must not repeat an external write or production request. Approval and execution tokens are one-time and expire automatically.
