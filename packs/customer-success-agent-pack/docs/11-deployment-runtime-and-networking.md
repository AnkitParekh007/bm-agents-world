# Deployment, Runtime, and Networking

## Runtime model

Run the supervisor in an isolated agent runtime. External systems are reached only through approved MCP servers or deterministic adapters. Network egress uses explicit allowlists. Customer-data sources should not be reachable through arbitrary shell, browser, or unrestricted SQL tools.

## Recommended components

- Agent gateway with user identity and account scope.
- OPA or equivalent policy engine.
- Capability broker and workload identity.
- Connector/MCP tier for CRM, CS, Support, analytics, documents, collaboration, release, incident, and vault systems.
- Artifact store with classification and retention.
- Audit/event stream.
- Approval service.

## Data plane controls

Queries are account-scoped, row/time bounded, and field filtered. Customer text is minimized before model context. Analytics uses curated metrics or approved semantic views. Cross-tenant joins are denied.

## Publication plane

Customer communications and official CRM/CS writes are executed by separate publisher adapters only after payload-bound approval. The model does not receive publisher credentials.

## High availability

Agent unavailability should never block customers from accessing Support, product, or contractual services. CS agents are assistive workflow components, not critical-path infrastructure for customer service restoration.

## Disaster recovery

Configuration, policies, registries, and artifact metadata should be versioned and recoverable. Raw customer source systems remain authoritative; the agent's derived artifacts are reproducible from approved evidence.
