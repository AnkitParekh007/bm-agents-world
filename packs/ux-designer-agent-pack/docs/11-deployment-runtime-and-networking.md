# Deployment, Runtime, and Networking

## Runtime components

- Agent UI/API gateway
- Durable workflow engine
- Supervisor and isolated specialist workers
- MCP/tool gateway
- OPA policy decision point
- Approval service
- Capability broker and vault integration
- Redaction service
- Artifact/evidence store
- Audit and evaluation pipeline
- Isolated browser and prototype-test workers

## Network policy

Default deny. Allow only approved Atlassian, Figma, Bitbucket, Storybook, analytics, research repository, asset library, collaboration, vault, and artifact endpoints. Public competitive research uses a separate allowlisted browser worker and must not authenticate into personal accounts.

## Data zones

1. Public guidance and standards.
2. Internal product and design context.
3. Confidential design, strategy, and analytics.
4. Restricted participant and production-user data.

Restricted data remains in approved source systems; the model receives redacted derivatives. Cross-zone copying is blocked unless policy explicitly permits it.

## Workspace isolation

Each run has isolated temporary storage, browser profile, Figma branch context, artifact namespace, and capability leases. Workspaces are wiped according to sensitivity and retention policy after evidence is committed.
