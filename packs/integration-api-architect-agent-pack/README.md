# Integration / API Architect Agent Pack

A governed, reusable operating package for an AI-assisted **Integration / API Architect**. The pack coordinates synchronous APIs, asynchronous events, RPC, gateways, identity, contracts, schemas, compatibility, consumer experience, testing, and lifecycle governance across engineering teams.

## Counts

- 240 tasks / 240 skills
- 27 agents
- 18 MCP servers
- 22 deterministic plugins
- 28 artifacts
- 5 workflows
- 7 JSON Schema contracts

## Core architecture

**Business intent → landscape → domain ownership → integration style → contract → security/identity → reliability/performance → observability/testing → compatibility/consumer impact → independent review → approval → publication/handoff → lifecycle monitoring**

## Protocol and contract coverage

- REST/HTTP and OpenAPI
- GraphQL
- gRPC and Protocol Buffers
- Event-driven architecture and AsyncAPI
- CloudEvents envelopes
- JSON Schema and schema registries
- OAuth/OIDC, mTLS, DPoP where appropriate
- API gateways, service ingress, brokers, partner APIs

## Safety boundary

The free-form model never receives raw credentials and cannot directly mutate production gateways, brokers, identity providers, schemas, traffic, infrastructure, or secrets. Breaking contract publication, deprecation, partner-facing changes, official Jira/Confluence updates, and production requests require independent review and payload-bound approval.

Start with `docs/01-integration-api-architect-daily-task-catalog.md`, `docs/03-agent-and-subagent-architecture.md`, and `docs/07-orchestration-and-workflows.md`.
