# Product Owner Agent — Deployment, Runtime, and Networking

## Runtime components

- Agent gateway and session isolation
- Workflow/orchestration engine
- Specialist-agent workers
- MCP proxy and connector allowlist
- OPA policy decision point
- Approval service
- Capability broker and workload identity
- Artifact/evidence store
- Audit and evaluation pipeline

## Isolation

Run each job in an ephemeral workspace with a read-only base image, non-root identity, no host mounts, bounded CPU/memory/time, egress allowlist, and automatic cleanup. External writes occur only in trusted adapters.

## Network zones

Separate model inference, orchestration, connectors, data systems, artifact storage, policy/approval, and production observation. The model network must not have direct routes to databases, Kubernetes APIs, cloud control planes, or secret managers.

## Availability

Workflow state, approval records, and artifact hashes are durable. Tool calls are idempotent where possible. Publication uses replay protection and one-time approval identifiers.
