# Artifacts and Knowledge Assets

Architecture is managed as versioned, reviewable evidence rather than chat history.

## Artifact registry

| Artifact | Purpose | Immutable | Content-addressed |
| --- | --- | --- | --- |
| architecture-context | Normalized business, product, stakeholder, project, environment, constraint and evidence context | Yes | Yes |
| current-state-inventory | Applications, repositories, integrations, data stores, infrastructure, ownership and lifecycle | Yes | Yes |
| capability-map | Business capabilities mapped to products, applications, teams, data and technology | Yes | Yes |
| quality-attribute-scenarios | Measurable non-functional scenarios and acceptance evidence | Yes | Yes |
| architecture-options | Alternative designs, assumptions, benefits, tradeoffs, cost, risk and reversibility | Yes | Yes |
| solution-architecture-document | Approved end-to-end architecture narrative and views | Yes | Yes |
| c4-context-diagram | People, systems, responsibilities and external dependencies | Yes | Yes |
| c4-container-diagram | Applications, services, data stores, queues and major interfaces | Yes | Yes |
| component-diagram | High-value internal component responsibilities and relationships | Yes | Yes |
| deployment-topology | Environment, region, zone, cluster, runtime, network and failure-domain view | Yes | Yes |
| sequence-diagram | Critical interaction, failure, retry and recovery sequences | Yes | Yes |
| data-flow-trust-boundary | Sensitive data flows, trust boundaries, controls and stores | Yes | Yes |
| domain-context-map | Domains, bounded contexts, ownership and relationship patterns | Yes | Yes |
| integration-contract-set | OpenAPI, AsyncAPI, schema, versioning, ownership and compatibility requirements | Yes | Yes |
| data-architecture | Conceptual/logical models, ownership, storage, lifecycle, lineage and migration | Yes | Yes |
| security-architecture | Threats, controls, identity, network, encryption, audit and residual risk | Yes | Yes |
| reliability-resilience-model | SLOs, failure modes, redundancy, degradation, recovery, RTO and RPO | Yes | Yes |
| performance-capacity-model | Workload, latency, throughput, capacity, bottleneck and scaling assumptions | Yes | Yes |
| observability-operability-plan | Telemetry, dashboards, alerts, runbooks, support and operational readiness | Yes | Yes |
| cost-sustainability-model | Cost scenarios, unit economics, allocation, growth sensitivity and sustainability | Yes | Yes |
| migration-transition-roadmap | Transition architectures, sequencing, coexistence, cutover, rollback and decommissioning | Yes | Yes |
| architecture-decision-record | Context, considered options, decision, consequences, status and review triggers | Yes | Yes |
| architecture-risk-register | Risks, assumptions, triggers, mitigations, owners and residual exposure | Yes | Yes |
| architecture-review-report | Independent review findings, sensitivity points, tradeoffs, actions and decision | Yes | Yes |
| implementation-handoff | Role-specific constraints, interfaces, acceptance evidence and conformance criteria | Yes | Yes |
| architecture-conformance-report | Implementation drift, exceptions, evidence and remediation actions | Yes | Yes |
| audit-record | Immutable run, identity, policy, tool, evidence, decision and approval history | Yes | Yes |

## Knowledge hierarchy

1. Authoritative policies, contracts, security standards, production configuration, schemas, and approved decisions.
2. Current repository, runtime, topology, observability, cost, incident, and Jira/Confluence evidence.
3. Approved reference architectures, patterns, technology radar, and templates.
4. Official external standards and vendor documentation, marked advisory.
5. Agent inference, explicitly labeled with confidence and assumptions.

Artifacts must include project, systems, revisions, environments, classification, run ID, sources, assumptions, and content hash. Raw secrets, private keys, personal data, production payloads, and unrestricted logs are prohibited.
