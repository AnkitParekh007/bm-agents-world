# Orchestration and Workflows

The supervisor operates a stateful, deny-by-default workflow. Typical stages are:

**Intake → Authorization → Landscape discovery → Domain/ownership → Contract/style design → Security/reliability/performance reviews → Consumer impact → Deterministic validation → Independent review → Approval → Publication request → Implementation handoff → Release verification → Lifecycle monitoring**

Five machine-readable workflows are provided:

1. `story-to-integration-architecture.yaml`
2. `api-contract-design-and-review.yaml`
3. `event-driven-integration-design.yaml`
4. `breaking-change-and-modernization.yaml`
5. `api-release-governance.yaml`

Parallel specialist work is preferred for security, compatibility, reliability, observability, testing, and consumer-impact analysis. Conflicts are reconciled by the supervisor and escalated when tradeoffs require human ownership.
