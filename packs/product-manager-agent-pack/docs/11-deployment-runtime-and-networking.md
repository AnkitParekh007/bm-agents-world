# Deployment, Runtime, and Networking

## Runtime components

- Product Agent Gateway
- Durable workflow engine
- Specialist worker pool
- MCP adapter layer
- Policy and approval service
- Capability broker and vault integration
- Redaction service
- Artifact and evidence store
- Audit and observability pipeline

## Network zones

1. User and collaboration zone.
2. Agent orchestration zone.
3. Trusted adapter zone.
4. Product data and analytics zone.
5. Customer evidence zone.
6. Production observation zone.

Direct model-to-system network access is denied. Egress is allow-listed. Public browsing runs in an isolated browser with source capture and no organization credentials.

## Data controls

- Encrypt in transit and at rest.
- Redact before model context.
- Use curated semantic metrics instead of unrestricted warehouse access.
- Apply row, segment, project, and purpose restrictions.
- Prevent cross-project retrieval.
- Store immutable hashes for published decisions and approvals.

## Availability

Read and draft workflows may degrade gracefully. Publication, experiment, and customer-contact actions fail closed when policy, approval, vault, or audit services are unavailable.
