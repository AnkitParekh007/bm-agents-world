
# Agent and Sub-Agent Architecture

## Supervisor

The `sre-incident-management-supervisor` interprets the request, binds scope, creates the execution graph, delegates specialist analysis, converges evidence, invokes independent review, and requests approval for side effects.

## Main domains

- **Reliability management:** SLI/SLO, error budget, architecture, capacity, resilience, and toil.
- **Operational readiness:** observability, alerting, on-call, runbooks, change readiness, and recovery.
- **Incident management:** detection, command, diagnosis, mitigation, communication, verification, and post-incident review.
- **Governance:** policy enforcement, evidence, independent review, privacy, credentials, and approval.

## Delegation pattern

1. Policy Enforcer verifies scope and capabilities.
2. Context Agent retrieves version-bound evidence.
3. Supervisor chooses a workflow and parallel specialists.
4. Deterministic plugins calculate, redact, correlate, validate, and hash.
5. Independent Reviewer challenges high-risk conclusions.
6. Evidence Manager stores immutable outputs and approvals.
7. Human owners decide policy, production, risk, and publication actions.

## Incident role boundary

The agent can support Incident Commander, Operations Lead, Communications Lead, and Scribe functions, but the accountable human incident authority remains explicit. It cannot silently promote itself to command authority or execute unrestricted production actions.

## Cross-pack delegation

- Application defect → Angular, Java, or Python pack
- Data integrity or database incident → Database pack
- Security incident → Application Security pack
- Deployment or infrastructure action → DevOps pack
- Verification → QA pack
- Customer support → Support/L2 pack
- Release decisions → Release Manager and Product Owner packs
- Cross-system design correction → Solution Architect pack
