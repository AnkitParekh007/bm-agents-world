# Orchestration and Workflows

The workflow engine is stateful, deny-by-default, resumable, evidence-linked, and approval-aware. It can parallelize specialist analysis but must converge through traceability, independent review, and human decisions.

## Workflow catalog

1. Request to Analysis Plan. 2. Discovery to Requirements. 3. Process Analysis and Redesign. 4. Change Impact and Delivery Readiness. 5. UAT and Solution Evaluation.

## Common state model

Intake → authorization → context → analysis plan → evidence gathering → specialist analysis → validation → traceability → independent review → human decision → controlled publication → handoff → outcome review.

## Checkpointing

Every stage persists the input hash, evidence references, policy decision, generated artifact, review findings, and next allowed actions. A resumed run revalidates scope, permissions, evidence freshness, and approval validity.

## Failure behavior

Missing owners, contradictory sources, stale baselines, insufficient evidence, unauthorized data, failed validation, or changed payloads move the workflow to blocked or decision-required. The system does not fill gaps with invented business facts.

## Human-in-the-loop

Humans approve official requirements, business rules, baselines, waivers, business acceptance, external communication, customer engagement, and any commitment. The agent can recommend and prepare the exact payload but cannot substitute for accountability.
