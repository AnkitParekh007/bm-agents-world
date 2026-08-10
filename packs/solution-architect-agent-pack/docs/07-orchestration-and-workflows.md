# Orchestration and Workflows

## State model

`requested -> authorized -> discovered -> drivers-confirmed -> options-generated -> reviewed -> decision-pending -> approved|rejected|rework -> handed-off -> implementation-observed -> closed`

Each transition records actor, timestamp, artifact hashes, policy decision, approval, and next obligations.

## Five workflows

1. **Story to solution architecture:** context, current state, quality drivers, options, recommendation, diagrams, independent review, decision, and team handoff.
2. **Architecture option evaluation:** normalize options, compare quality attributes, cost, vendor, migration and reversibility, then request a decision or POC.
3. **Integration and data design:** contracts, ownership, consistency, security, reliability, observability, testing, and migration.
4. **Modernization and migration:** legacy profile, target drivers, strategy, transition architecture, rehearsal, cutover, rollback, and decommissioning.
5. **Architecture review and governance:** evidence validation, independent reviews, findings, conditions, exceptions, publication, and conformance.

Parallel analysis is allowed, but final recommendation waits for relevant specialists and resolves contradictory evidence. Architecture publication, shared standards, exceptions, vendor recommendations, contracts, and non-production POCs require human approval.
