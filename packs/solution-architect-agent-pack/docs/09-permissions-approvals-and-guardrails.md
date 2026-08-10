# Permissions, Approvals, and Guardrails

## Safe autonomous actions

- Read authorized project and architecture context.
- Analyze drivers, dependencies, risks, and options.
- Generate diagrams, models, ADR drafts, contract drafts, cost models, and review drafts.
- Validate contracts, diagrams, schemas, and structured artifacts.
- Store immutable draft evidence.

## Approval required

- Publish architecture decisions, standards, reference architectures, or exceptions.
- Write to Jira, Confluence, Teams, Bitbucket, or an architecture repository.
- Run paid or shared-infrastructure POCs.
- Publish contracts or ownership changes.
- Recommend vendors with financial or contractual impact.
- Accept residual security, privacy, availability, migration, or operational risk.

## Never delegated

- Production deployment, rollback, failover, restore, DNS, TLS, network, IAM, secrets, databases, or feature flags.
- Merge, force-push, bypass gates, read raw secrets, sign artifacts, or make vendor/financial/contractual/SLA commitments.
- Self-approve high-risk architecture or fabricate stakeholder agreement and runtime evidence.

Approvals are exact-payload, run-, action-, project-, system-, and environment-bound, expiring, single-purpose, and independently recorded.
