# Deployment, Runtime, and Networking

## Runtime services

- Agent gateway and workflow engine.
- Policy and approval service.
- Connector adapters.
- Isolated authoring workspace.
- Documentation build and preview workers.
- Code-sample test workers.
- Browser and screenshot workers.
- Diagram-rendering workers.
- Artifact and evidence store.
- Audit and observability service.

## Network controls

Use default-deny egress for execution workers. Permit only approved package registries, documentation targets, contract endpoints, and synthetic test services. Production connectors are read-only and row-, time-, field-, tenant-, and query-bounded.

## Publication architecture

The model prepares a content bundle. Deterministic validators produce signed results. Independent reviewers approve the exact payload. A trusted connector publishes only the approved hash to the approved target.

## High availability

Publication requests, evidence bundles, review decisions, and content sources must be durable and replay-safe. A failed publication must not partially update navigation, redirects, and content without rollback capability.
