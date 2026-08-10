# Orchestration and Workflows

## State machine

`INTAKE -> AUTHORIZE -> CONTEXT -> EVIDENCE -> FRAME -> OPTIONS -> ANALYZE -> REVIEW -> HUMAN_DECISION -> PUBLISH_OR_EXECUTE -> OBSERVE -> LEARN -> CLOSE`

## Core workflow files

1. `idea-to-product-brief.yaml`
2. `discovery-to-prioritization.yaml`
3. `roadmap-and-quarterly-planning.yaml`
4. `story-to-delivery-readiness.yaml`
5. `release-and-outcome-review.yaml`

## Parallelism

Customer evidence, market evidence, analytics, design context, delivery context, and risk screening can run concurrently after authorization. Prioritization, roadmap, and requirements synthesis wait for these bounded outputs.

## Approval checkpoints

- Publishing or materially changing ideas, priorities, and roadmaps.
- Creating or updating delivery items.
- Contacting customers or prospects.
- Launching research, survey, beta, experiment, or customer communication.
- Publishing internal stakeholder updates when they represent an official decision.
- Any commercial recommendation that could be interpreted as a commitment.

## Failure behavior

The agent stops when required evidence is unavailable, metric definitions conflict, decision authority is unclear, customer data cannot be safely minimized, approvals expire, or a requested action exceeds product authority. It preserves partial artifacts and states what remains unresolved.

## Human ownership

Humans retain product accountability, commercial authority, release authority, legal judgment, customer relationship ownership, and prioritization decisions. The agent improves speed, consistency, evidence retrieval, and traceability.
