# Agent and Sub-Agent Architecture

The supervisor delegates specialist analysis in parallel and reconciles results through independent review.

## integration-api-architect-supervisor

Coordinates bounded integration and API architecture workflows, resolves cross-domain tradeoffs, and enforces contract, evidence, security, compatibility, and approval rules.

**Specialization:** orchestration, integration governance, architecture.

## business-product-context

Reads product goals, Jira epics, business processes, consumer needs, SLAs, and constraints that drive integrations.

**Specialization:** business context, requirements, outcomes.

## integration-landscape-discovery

Discovers applications, repositories, APIs, events, queues, gateways, databases, vendors, ownership, and environment topology.

**Specialization:** inventory, dependency mapping, reverse engineering.

## domain-service-boundary

Defines domain ownership, service boundaries, source-of-truth systems, responsibilities, and cross-domain dependencies.

**Specialization:** DDD, service boundaries, ownership.

## api-strategy-governance

Defines API principles, styles, lifecycle states, standards, naming, discoverability, ownership, and governance.

**Specialization:** API strategy, standards, governance.

## rest-http-api

Designs resource-oriented HTTP APIs, methods, status codes, pagination, filtering, idempotency, caching, and problem details.

**Specialization:** REST, HTTP, OpenAPI.

## graphql-api

Designs GraphQL schemas, operations, federation boundaries, pagination, authorization, performance controls, and evolution.

**Specialization:** GraphQL, schema design, federation.

## grpc-rpc

Designs gRPC/protobuf contracts, RPC semantics, deadlines, retries, health, reflection, compatibility, and generated clients.

**Specialization:** gRPC, protobuf, RPC.

## event-driven-messaging

Designs events, commands, topics, channels, envelopes, delivery semantics, ordering, replay, retention, and AsyncAPI contracts.

**Specialization:** event-driven architecture, AsyncAPI, CloudEvents.

## api-gateway-edge

Designs gateway routes, policies, quotas, throttles, transformations, WAF boundaries, ingress, egress, and API management controls.

**Specialization:** API gateway, edge, traffic policy.

## identity-authorization

Designs OAuth/OIDC profiles, workload identity, scopes, claims, service authentication, token audience, and delegated authorization.

**Specialization:** OAuth, OIDC, identity, authorization.

## api-security

Threat-models APIs and integrations and defines object/function authorization, rate controls, input validation, secrets boundaries, and abuse controls.

**Specialization:** API security, threat modeling, OWASP.

## data-contract-schema

Designs payload schemas, canonical models, JSON Schema, protobuf schemas, event schemas, semantics, ownership, and classification.

**Specialization:** data contracts, schemas, semantics.

## versioning-compatibility

Defines additive-change policy, compatibility matrices, consumer impact, deprecation, sunset, migration, and breaking-change governance.

**Specialization:** versioning, compatibility, deprecation.

## consumer-experience-sdk

Optimizes developer experience, documentation, examples, SDK strategy, sandboxing, discoverability, and onboarding.

**Specialization:** DX, SDKs, documentation.

## resiliency-reliability

Defines timeouts, retries, backoff, circuit breaking, bulkheads, idempotency, delivery guarantees, failover, and graceful degradation.

**Specialization:** resilience, reliability, distributed systems.

## performance-capacity

Models throughput, latency, payload size, concurrency, rate limits, connection pools, streaming behavior, and capacity.

**Specialization:** performance, capacity, scalability.

## observability-operability

Defines traces, metrics, logs, correlation, API analytics, SLOs, dashboards, alerts, runbooks, and support diagnostics.

**Specialization:** OpenTelemetry, observability, operations.

## integration-testing

Defines contract tests, consumer-driven tests, mocks, virtual services, negative tests, fault tests, conformance, and certification.

**Specialization:** contract testing, conformance, test strategy.

## legacy-modernization

Plans façade, strangler, anti-corruption, protocol bridging, ESB decomposition, SOAP modernization, and coexistence.

**Specialization:** legacy integration, modernization, migration.

## third-party-partner

Designs partner/vendor integrations, trust boundaries, SLAs, onboarding, certificates, sandboxing, quotas, and exit strategies.

**Specialization:** B2B, partner APIs, vendor integration.

## platform-developer-experience

Defines API platform golden paths, templates, catalogs, schema registries, generators, self-service, and governance automation.

**Specialization:** platform engineering, API platform, DevEx.

## cost-governance

Models API/integration cost drivers, egress, gateway/broker costs, quotas, chargeback, retention, and optimization tradeoffs.

**Specialization:** FinOps, cost, governance.

## architecture-review

Performs independent contract, security, reliability, compatibility, consumer-impact, and architecture readiness reviews.

**Specialization:** independent review, tradeoffs, risk.

## implementation-alignment

Creates role-specific handoffs and verifies delivery conformance across frontend, backend, data, QA, DevOps, and support teams.

**Specialization:** handoff, conformance, delivery.

## evidence-manager

Stores immutable contracts, diffs, test evidence, reviews, approvals, dependency graphs, and publication hashes.

**Specialization:** artifacts, provenance, audit.

## policy-enforcer

Evaluates authorization, project scope, environment, data classification, tool permissions, contract publication, and payload-bound approvals.

**Specialization:** OPA, authorization, guardrails.

## Separation of duties

The authoring specialist cannot approve its own breaking change, security exception, deprecation, partner commitment, or production request. Evidence Manager stores immutable inputs/outputs; Policy Enforcer evaluates scope and approvals before any external write.
