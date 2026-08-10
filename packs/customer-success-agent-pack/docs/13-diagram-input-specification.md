# Diagram Input Specification

This file defines the inputs for the future Mermaid architecture and complete Customer Success flow diagrams.

## Architecture layers

1. **People and channels:** Customer Success Manager, Account Executive, Product Owner/Manager, Support, Engineering Lead, SRE, Customer stakeholders, Executives.
2. **Customer Success Supervisor:** scope, planning, orchestration, approvals, memory references.
3. **Specialist agents:** onboarding, stakeholders, success planning, adoption, health, risk, value, QBR/EBR, renewal, expansion, communication, Support/incident, feedback, advocacy, enablement, CS Ops, privacy, review.
4. **Policy and identity:** gateway, OPA, capability broker, workload identity, vault, approval service.
5. **MCP/connectors:** CRM, Gainsight/CS platform, Jira/Confluence, Support, analytics, usage telemetry, billing/entitlement read, calendar/email, Teams, docs, releases, incidents, assurance, artifacts.
6. **Systems of record:** CRM, Customer Success platform, Support, product analytics, product/engineering systems, documentation, incident/release systems.
7. **Evidence and artifacts:** Customer 360, success plan, health, risk, value, QBR/EBR, renewal readiness, feedback, communications.

## Primary Mermaid flow

`Customer signal → Authorize → Customer 360 → Lifecycle route → Parallel specialists → Health / Value / Risk → Reviewer → Human decision → Approved communication or system update → Cross-pack handoff → Evidence store → Outcome feedback`

## Incident branch

`Declared incident → Impacted customer lookup → Authoritative SRE/Support status → Customer-specific brief → Draft communication → Approval → Send → Recovery verification → Follow-up`

## Renewal branch

`Renewal window → Value + Health + Risk + Stakeholders + Support → Renewal-readiness pack → Commercial owner → Human commercial decision`

## Boundary markers

Diagrams must visually distinguish read-only tools, approval-controlled writes, prohibited commercial/production actions, and delegated specialist-pack execution.
