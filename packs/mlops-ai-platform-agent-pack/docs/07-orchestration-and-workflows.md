# Orchestration and Workflows

## Orchestration model

1. **Authorize scope** — project, environment, tenant, candidate, data classification and allowed actions.
2. **Resolve context** — source revision, platform versions, registry state, deployment state, model/agent lineage and ownership.
3. **Parallel specialist analysis** — architecture, evaluation, serving, security, governance, cost, reliability and capacity as needed.
4. **Evidence normalization** — every important claim links to deterministic evidence or an explicit assumption.
5. **Independent review** — high-risk changes are reviewed by an agent that did not author the proposal.
6. **Policy decision** — prohibited actions are denied; protected actions create an immutable payload-bound request.
7. **Human/deterministic execution** — authorized systems execute production changes.
8. **Read-only verification** — verify exact candidate, endpoint, traffic, telemetry, quality and rollback readiness.
9. **Closeout** — archive evidence, approvals, lessons and follow-up work.

## Five packaged workflows

- Platform onboarding and baseline
- Experiment to model registry
- Model and agent serving
- Evaluation and promotion gates
- AI platform operations and recovery
