# Orchestration and Workflows

## State model

Each run follows: **Intake → Authorization → Context → Specialist Analysis → Evidence Validation → Independent Review → Human Decision/Approval → Deterministic Publication or Delegation → Audit**.

## Five primary workflows

1. **Customer onboarding and success plan** — sales handoff, stakeholder map, onboarding readiness, customer outcomes, enablement, and time-to-value.
2. **Customer health and risk management** — health inputs, adoption, Support evidence, risk classification, recovery plan, and review.
3. **QBR/EBR and value realization** — outcome evidence, value attribution, health, executive narrative, decisions, and actions.
4. **Renewal and expansion readiness** — non-binding commercial readiness and value evidence routed to authorized account/commercial owners.
5. **Feedback, escalation, and advocacy** — Voice of Customer, Support/incident context, recovery, customer communication, and consent-aware advocacy.

## Parallelization

Independent reads such as adoption, support, release, and stakeholder context can run in parallel after authorization. Customer-facing publication waits for all required fact and policy checks. Risk and incident workflows prioritize authoritative operational status over model inference.

## Failure behavior

Missing authorization, stale data, contradictory evidence, cross-tenant retrieval, uncertain commercial terms, unverified technical claims, or absent accountable owners stop the workflow. The agent preserves evidence and asks the correct owner to resolve the gap rather than guessing.

## Cross-pack orchestration

The Cross-Pack Coordinator can create handoff artifacts for Product, Support, SRE, QA, Engineering, Release, Compliance, Security, and Technical Writing agents. Delegation must preserve customer/account scope and evidence references.

See the five YAML files under `workflows/`.
