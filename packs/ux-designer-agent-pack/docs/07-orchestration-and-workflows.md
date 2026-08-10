# Orchestration and Workflows

## Stateful orchestration

The supervisor uses a durable state machine:

`Intake -> Scope authorization -> Context -> Evidence gap analysis -> Research/design plan -> Approval -> Parallel specialist work -> Synthesis -> Design/prototype -> Validation -> Review -> Handoff/publication approval -> Design QA -> Evidence/evaluation -> Close`

## Workflow files

- `story-to-design-brief.yaml`
- `research-to-insights.yaml`
- `design-and-prototype.yaml`
- `usability-validation.yaml`
- `handoff-and-design-qa.yaml`

## Human gates

Human review is mandatory before participant recruitment or contact, session recording, incentives, survey distribution, experiment launch, shared Figma edits, library publication, Jira/Confluence/Teams publication, production screenshots, or acceptance of critical accessibility/usability risk.

## Recovery

Every step is idempotent where practical. State stores artifact hashes and tool-call evidence. A resumed run re-validates authorization, source versions, Figma branch, environment, and approval expiration before continuing.

## Evaluation

The workflow evaluates traceability, evidence quality, design completeness, accessibility coverage, design-system reuse, research rigor, handoff clarity, implementation consistency, privacy compliance, and stakeholder decision usefulness.
