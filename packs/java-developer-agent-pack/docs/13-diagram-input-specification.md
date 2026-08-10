# Diagram Input Specification

This file is the source for the future Mermaid architecture and end-to-end flow diagrams.

## Architecture diagram layers

1. **Users and channels:** Java developer, tech lead, QA, product owner, Jira, Teams and IDE/web UI.
2. **Agent gateway:** authentication, request validation, project selector and session context.
3. **Control plane:** supervisor, workflow engine, agent registry, skill registry, policy engine, approval service, capability broker, audit and artifact metadata.
4. **Specialist agents:** context, repository, architecture, compatibility, domain, API, persistence, messaging, batch, concurrency, testing, security, performance, build, modernization, review, observability, documentation and release.
5. **MCP/adapters:** Atlassian, Bitbucket/workspace, Java docs, framework docs, database, messaging, package registry, CI/CD, observability, artifact, secret broker and policy.
6. **Execution plane:** ephemeral Java workspace, JDK toolchains, Maven/Gradle wrappers, Testcontainers, scanners and container builder.
7. **Enterprise systems:** Bitbucket, Jira/Confluence, databases, Kafka/JMS/RabbitMQ, artifact registry, pipelines, vault, playground, QA and production observability.

## Trust boundaries

- User/channel to gateway
- Control plane to isolated worker
- Worker to MCP adapters
- Adapters to secret manager and enterprise targets
- Non-production to production

## Mandatory visual distinctions

- Solid arrows: data and artifact flow
- Dashed arrows: approval and policy decisions
- Red/blocked path: prohibited direct model-to-secret and model-to-production mutation
- Human approval gates before external writes
- Read-only production path

## End-to-end flow states

`request -> authorize -> discover -> retrieve context -> analyze impact -> plan -> approval if required -> create workspace -> implement -> compile -> test -> scan -> specialist review -> aggregate evidence -> publication approval -> commit/push/PR/Jira/Teams -> pipeline -> report -> evaluate -> revoke leases`

## Decision branches

- Scope invalid: reject
- Repository profile incomplete: request onboarding data
- High-risk contract/schema/security change: mandatory plan approval
- Compile/test failure: bounded repair loop
- Critical finding: stop and escalate
- Payload changed after approval: invalidate approval
- Production mutation requested: deny and hand off to external release process

## Suggested Mermaid outputs

- System context and trust-boundary architecture
- Agent/sub-agent orchestration graph
- Sequence diagram for feature implementation
- State diagram for approvals and retries
- Deployment/network diagram
- Credential lease and secret-access sequence
