# Solution Architect Agent — Project Onboarding Checklist

Use this checklist before enabling the agent for a new project, portfolio, or architecture domain.

## 1. Ownership and decision rights
- [ ] Name the product, engineering, architecture, security, data, operations, and business-risk owners.
- [ ] Document who recommends, reviews, approves, executes, and accepts residual risk.
- [ ] Define architecture review-board and exception paths.
- [ ] Define escalation and time-critical decision procedures.
- [ ] Confirm the agent cannot approve its own work.

## 2. Business and product context
- [ ] Register the product vision, business capabilities, outcomes, KPIs, and roadmap references.
- [ ] Register authoritative requirements, policies, contracts, and regulatory sources.
- [ ] Define project scope and adjacent systems.
- [ ] Identify critical customer and operational journeys.
- [ ] Record known constraints, assumptions, deadlines, and commitments.

## 3. Repositories and delivery systems
- [ ] Register Bitbucket repositories, default branches, ownership, and read/write scopes.
- [ ] Register Jira projects, issue types, fields, and approval-controlled write operations.
- [ ] Register Confluence spaces and architecture repositories.
- [ ] Register CI/CD systems and immutable artifact locations.
- [ ] Identify generated code, vendored code, and repositories that must remain read-only.

## 4. Current architecture
- [ ] Inventory applications, services, libraries, jobs, integrations, databases, queues, caches, and file exchanges.
- [ ] Record runtime versions, frameworks, deployment models, and application servers.
- [ ] Map upstream/downstream dependencies and business owners.
- [ ] Map trust boundaries, ingress/egress, networks, DNS, TLS, IAM, and secrets.
- [ ] Register environment topology for local, playground, QA, staging, and production.
- [ ] Record current incidents, debt, capacity constraints, and known single points of failure.

## 5. Data and integration
- [ ] Register API, event, message, batch, CDC, and file contracts.
- [ ] Register data ownership, classification, residency, retention, and lineage.
- [ ] Identify systems of record and authoritative sources.
- [ ] Define compatibility and versioning policies.
- [ ] Confirm production data is exposed only through approved redacted or aggregate resources.

## 6. Quality attributes
- [ ] Define measurable availability, reliability, recovery, latency, throughput, scalability, and capacity targets.
- [ ] Define security, privacy, accessibility, interoperability, modifiability, operability, and testability targets.
- [ ] Define cost and sustainability constraints.
- [ ] Prioritize conflicting quality attributes with accountable owners.
- [ ] Define architecture acceptance evidence and fitness functions.

## 7. Standards and guardrails
- [ ] Register approved architecture principles, patterns, technology standards, and exception procedures.
- [ ] Register secure-development, privacy, compliance, accessibility, and data-governance policies.
- [ ] Register cloud, Kubernetes, database, networking, observability, and software-supply-chain guardrails.
- [ ] Define prohibited technologies, operations, and data movements.
- [ ] Define review thresholds for high-risk or cross-project decisions.

## 8. MCP servers, plugins, and tools
- [ ] Approve each MCP server, owner, transport, version, network route, and published capability.
- [ ] Separate resources, prompts, read tools, draft tools, and write tools.
- [ ] Apply project, system, environment, data-classification, and operation scopes.
- [ ] Sandbox code, diagram, browser, and proof-of-concept execution.
- [ ] Deny arbitrary shell, arbitrary network, unrestricted SQL, and raw cloud-console access.
- [ ] Test prompt-injection, confused-deputy, and cross-project isolation controls.

## 9. Identity and secrets
- [ ] Create separate workload identities for context reads, repository reads, draft work, contract publication, and non-production proof-of-concepts.
- [ ] Configure capability brokering and short-lived leases.
- [ ] Store only secret references in configuration.
- [ ] Confirm secrets are injected inside trusted adapters and never returned to the model.
- [ ] Configure rotation, revocation, audit, and emergency access.
- [ ] Verify no shared administrator or production credentials are available to the agent.

## 10. Approvals
- [ ] Configure payload-bound approvals for ADRs, standards, contracts, architecture publications, and external writes.
- [ ] Configure independent review for high-risk decisions and exceptions.
- [ ] Configure producer/consumer approval for integration and data contracts.
- [ ] Configure procurement, security, legal, and budget approval for vendor recommendations.
- [ ] Confirm production changes can only be requested, not executed, by the architecture agent.

## 11. Evidence and observability
- [ ] Configure immutable artifact and evidence storage.
- [ ] Configure run, tool, policy, approval, and publication audit logs.
- [ ] Configure trace correlation across supervisor, sub-agents, adapters, and workflows.
- [ ] Define evidence freshness, provenance, redaction, and retention.
- [ ] Configure dashboards for quality, cost, latency, approval age, failure modes, and policy denials.

## 12. Evaluation
- [ ] Create representative architecture scenarios and expected outcomes.
- [ ] Test evidence grounding, option diversity, tradeoff quality, and decision traceability.
- [ ] Test hallucination and unsupported-assumption detection.
- [ ] Test architecture drift and conformance checks.
- [ ] Test safe refusal for production mutation, raw secrets, self-approval, and commitments.
- [ ] Obtain accountable owner sign-off before enabling approval-controlled writes.
