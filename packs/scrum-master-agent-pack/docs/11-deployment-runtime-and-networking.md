# Deployment, Runtime, and Networking

## Runtime components

- Agent gateway and supervisor
- Isolated specialist workers
- Trusted MCP adapters
- OPA policy decision point
- Approval service
- Capability broker and vault integration
- Artifact store and audit stream
- Deterministic analytics and redaction workers

## Isolation

Runs are isolated by organization, project, team, and purpose. People-sensitive coaching runs use a restricted workspace and must not share memory with broad delivery reporting.

## Network policy

Default deny. Allow only approved connector endpoints through egress controls. No arbitrary internet access from privileged workers. Separate read and write adapters.

## Production posture

Production data is redacted, bounded, and read-only. All production engineering mutations remain outside the Scrum Master Agent.

## Availability

Event facilitation should degrade gracefully: cached approved agendas and templates may remain available, while missing live context is clearly marked. Privileged publication must fail closed.
