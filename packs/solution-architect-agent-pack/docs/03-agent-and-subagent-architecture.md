# Agent and Sub-Agent Architecture

## Operating model

The Solution Architect Supervisor delegates bounded analysis, preserves evidence, detects conflicts, requests approvals, and assembles a coherent recommendation. It cannot approve its own high-risk architecture or authorize production.

## Agent registry

| Agent ID | Purpose | Primary concerns |
| --- | --- | --- |
| solution-architect-supervisor | Coordinates bounded solution-architecture workflows, resolves conflicts, and enforces evidence, decision, and approval rules. | orchestration, tradeoffs, governance |
| business-product-context | Reads product strategy, business capabilities, Jira epics, requirements, roadmaps, constraints, and stakeholder decisions. | business, product, requirements |
| current-state-discovery | Discovers applications, repositories, integrations, databases, infrastructure, ownership, environments, and operations. | inventory, dependency mapping, reverse engineering |
| enterprise-context | Maps capabilities, value streams, shared platforms, standards, portfolio dependencies, and strategic constraints. | enterprise architecture, portfolio, capabilities |
| quality-attribute-analysis | Elicits measurable availability, performance, security, data, operability, cost, and changeability scenarios. | NFRs, scenarios, evidence |
| domain-boundary | Models domains, bounded contexts, ownership, aggregates, terminology, and cross-domain dependencies. | DDD, boundaries, ownership |
| application-architecture | Designs application decomposition, module/service boundaries, patterns, responsibilities, and component interactions. | application architecture, patterns, components |
| integration-api-architecture | Designs APIs, events, messaging, gateways, contracts, versioning, retries, and integration governance. | OpenAPI, AsyncAPI, integration |
| data-architecture | Designs data models, ownership, storage choices, consistency, lineage, lifecycle, migration, and analytics interfaces. | data, storage, lineage |
| cloud-infrastructure-architecture | Designs cloud/on-prem topology, compute, network, storage, regions, zones, platforms, and deployment boundaries. | cloud, infrastructure, topology |
| security-architecture | Designs trust boundaries, threat mitigations, encryption, secure defaults, and security controls. | security, threat modeling, zero trust |
| identity-access-architecture | Designs identity federation, service identities, authorization, privileged access, and secrets boundaries. | identity, authorization, secrets |
| privacy-compliance-architecture | Maps data classification, privacy, retention, residency, audit, and regulatory controls. | privacy, compliance, governance |
| reliability-resilience | Designs availability, redundancy, failure isolation, recovery, disaster recovery, and graceful degradation. | reliability, resilience, DR |
| performance-scalability | Models latency, throughput, capacity, concurrency, caching, scaling, and bottlenecks. | performance, capacity, scalability |
| observability-operability | Defines telemetry, SLOs, dashboards, alerting, runbooks, supportability, and incident diagnostics. | observability, SRE, operations |
| network-edge-architecture | Designs ingress, egress, DNS, TLS, service networking, segmentation, CDN, and load balancing. | network, edge, connectivity |
| platform-developer-experience | Designs platforms, golden paths, templates, self-service environments, and engineering experience. | platform engineering, DevEx, standards |
| cost-sustainability | Estimates cost, identifies cost drivers, models unit economics, and assesses sustainability tradeoffs. | FinOps, cost, sustainability |
| migration-modernization | Plans strangler, replatform, refactor, rewrite, coexistence, cutover, rollback, and decommissioning. | migration, modernization, transition |
| vendor-technology-evaluation | Evaluates products, cloud services, frameworks, licenses, support, lock-in, exit strategy, and POCs. | vendor, technology selection, risk |
| architecture-modeling | Creates C4, deployment, sequence, data-flow, trust-boundary, capability, and ArchiMate-compatible views. | C4, diagrams, models |
| decision-governance | Maintains ADRs, principles, standards, exceptions, technology radar entries, and decision traceability. | ADR, governance, standards |
| architecture-review | Performs independent tradeoff, sensitivity, risk, and readiness reviews. | ATAM, review, risk |
| implementation-alignment | Creates role-specific handoffs and verifies implementation drift across engineering agent packs. | handoff, conformance, delivery |
| evidence-manager | Stores immutable architecture inputs, models, decisions, reviews, approvals, and hashes. | artifacts, audit, provenance |
| policy-enforcer | Evaluates authorization, project scope, environment, data classification, tools, and payload-bound approvals. | OPA, authorization, guardrails |

## Delegation principles

- Delegate by concern and evidence source, not by open-ended persona discussion.
- Give each specialist only the minimum context and tools required.
- Require assumptions, confidence, source references, risks, and open questions.
- Run an independent review after option generation for high-impact decisions.
- Resolve conflicts against measurable architecture drivers and human decision rights.
- Treat prose, diagrams, contracts, and ADRs as views of one architecture model.
- Re-check policy before every sensitive read or external write.

## Cross-pack orchestration

| Role pack | Inputs from architect | Outputs consumed by architect |
| --- | --- | --- |
| Product Manager | Architecture constraints, option impacts and technical risks | Outcomes, priorities, roadmap and business constraints |
| UX Designer | Capabilities, constraints, performance and security implications | Journeys, flows, accessibility and design-system requirements |
| Angular Developer | Frontend boundaries, contracts, state, NFRs and migration rules | Repository, implementation and test evidence |
| Java Developer | Service boundaries, contracts, data, runtime, security and reliability | Implementation and runtime evidence |
| Python Developer | Python workload role, contracts, data and deployment constraints | Implementation and test evidence |
| Database Architect/Developer | Ownership, models, consistency, lifecycle and migration requirements | Schema, query, migration and operational evidence |
| QA Engineer | Quality scenarios, risks and validation obligations | Functional, performance, security and resilience evidence |
| DevOps | Topology, identity, network, capacity, observability and recovery design | IaC, pipeline, deployment and runtime evidence |
