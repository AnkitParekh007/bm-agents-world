# Diagram Input Specification

This file is the source for the future Mermaid architecture and complete flow diagrams.

## Architecture layers

1. **Users and channels:** Python developer, reviewer, product owner, QA, DevOps, security; agent UI, IDE, Jira, Teams.
2. **Agent gateway:** authentication, request normalization, project selection, run creation.
3. **Control plane:** supervisor, state store, project registry, skill registry, policy engine, approval service, model router, artifact catalog, audit/evaluation.
4. **Specialist agents:** context, repository, architecture, compatibility, domain, API, data access, async/workers, data pipeline, CLI, testing, security, reliability, dependency/package, review, build, documentation, PR/release, evidence.
5. **Execution plane:** disposable Python workers, ephemeral database, container builder, data worker, browser/API worker.
6. **MCP and adapters:** Atlassian, workspace/Git, Python/framework docs, OpenAPI, DB, queue/cache, package registry, CI/CD, observability, artifacts, collaboration, secret broker.
7. **Identity and security:** workload identity, capability broker, vault/key manager, network policy, OPA, approval binding, redaction.
8. **Enterprise systems:** Bitbucket, Jira/Confluence, PostgreSQL/other databases, queues/caches, package indexes, CI/CD, container registry, playground/QA/production, observability, Teams.

## Mandatory architecture edges

- User -> Gateway -> Supervisor
- Supervisor <-> State/registries/policy/approval/model router
- Supervisor -> specialist agents with delegation contracts
- Specialists -> MCP client -> adapters -> enterprise systems
- Policy engine authorizes every tool call
- Capability broker issues short-lived lease to adapter, never model
- Execution workers store artifacts and telemetry
- External writes route through approval service
- Production systems expose observation paths only by default

## Complete flow nodes

Request; resolve scope; authorize; pin branch/commit; detect Python profile; load context; analyze impact; calculate risk; draft plan; optional human plan approval; create workspace; acquire file leases; implement selected workstreams; integrate patch; run format/lint/type/test/security/dependency/build/package gates; parallel code/security/reliability review; remediate; validate migration/API/data contracts; create evidence; publication approval; commit/push/PR/Jira/Teams/pipeline action; revoke credentials; retain audit; evaluate outcome.

## Decision diamonds

Scope valid? Profile supported? Requirements sufficient? Plan approval needed? Schema/security/public-API impact? Gates passed? Findings remediable within scope? Base commit drifted? External write approved? Production action requested? Evidence complete?

## Visual conventions

Use separate colors for user/channel, control plane, specialist agents, execution plane, adapters, security, enterprise systems, approval boundaries, and prohibited production mutations. Mark trust boundaries and show that raw secrets never enter the model context.
