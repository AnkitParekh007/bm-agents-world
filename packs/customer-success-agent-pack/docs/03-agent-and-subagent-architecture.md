# Agent and Sub-Agent Architecture

## Supervisor pattern

`customer-success-supervisor` owns orchestration, not domain truth. It creates a scoped run, calls policy, delegates specialist analysis, merges evidence, requests independent review, and routes any external action through approval-controlled adapters.

## Specialist groups

### Account and lifecycle
Work context, customer profile, stakeholders, onboarding, success planning, journey, and CS operations agents maintain the account operating picture.

### Outcomes and adoption
Adoption, value realization, training/enablement, health, and risk agents turn product and operational evidence into customer-success recommendations.

### Customer engagement
QBR/EBR, customer communication, executive engagement, advocacy, and Voice of Customer agents prepare customer-facing and internal engagement artifacts.

### Commercial readiness
Renewal and expansion agents provide non-binding evidence and readiness signals. They cannot price, quote, negotiate, alter contracts, approve renewals, or promise expansion.

### Operational coordination
Support and incident agents consume authoritative Support/SRE sources and translate them into customer context. They do not change incident command, support severity, production configuration, or release status.

### Governance
Data Privacy, Reviewer, Evidence Manager, Policy Enforcer, and Cross-Pack Coordinator ensure isolation, approvals, evidence quality, and safe delegation.

## Delegation to other packs

The Customer Success Agent should delegate rather than simulate specialist authority: Product Manager for strategy and roadmap; Product Owner for backlog/value ordering; Business Analyst for detailed requirements; Support/L2 for case diagnosis; QA for validation; DevOps and SRE for production operations; Solution Architect and developer agents for technical design/implementation; Compliance and Application Security for assurance; Release Manager for release governance; Technical Writer for customer documentation.

## Independent review rule

A specialist that generated a material health, risk, value, renewal, escalation, or customer-facing claim should not be its sole reviewer. `customer-success-reviewer-agent` challenges evidence quality, attribution, confidence, privacy, contractual language, and decision readiness.

## Memory and context

Long-lived customer memory must reside in governed systems of record. Model context should contain only the minimum evidence required for the current run. Generated summaries are not automatically treated as factual account history until approved and written to the authorized system.
