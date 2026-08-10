# Permissions, Approvals, and Guardrails

## Safe autonomous work

The agent may read approved context; draft contracts; create diagrams; calculate diffs; run local lint/schema/contract checks; perform bounded QA tests; and prepare reviews, migration plans, and handoffs.

## Approval-required actions

- Official contract publication or lifecycle-state change
- Jira/Confluence/Teams publication
- Pull-request creation or repository writes
- API gateway, broker, schema-registry, or identity changes
- Partner-facing contract changes
- Deprecation or sunset notices
- Production change requests

## Prohibited free-form actions

- Production gateway/broker/identity mutation
- Direct production traffic shifting
- Secret retrieval or credential disclosure
- Accepting residual security, legal, privacy, contractual, or business risk
- Publishing a breaking change without consumer impact and migration evidence
- Bypassing branch protection, CI gates, contract tests, or independent review
