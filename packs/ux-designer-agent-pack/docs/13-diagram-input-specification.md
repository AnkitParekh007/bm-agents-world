# Diagram Input Specification

This document is the source for the future Mermaid architecture and complete UX execution-flow diagrams.

## Architecture layers

1. **People:** UX designer, UX researcher, product manager, business analyst, frontend developer, backend developer, QA, DB architect, design-system owner, accessibility specialist, privacy/security, approver, participant.
2. **Entry:** agent UI/API, Jira action, Figma action, research request, design QA request, scheduled design-system review.
3. **Control plane:** identity, gateway, supervisor, workflow engine, registries, OPA policy, approvals, capability broker, redaction, audit/evaluation.
4. **Specialists:** context, research planning/execution/ops, synthesis, personas/journeys, IA, interaction, visual, content, design system, prototype, accessibility, usability, analytics, service blueprint, localization, handoff, design QA, review, operations.
5. **MCP/tool plane:** Atlassian, Figma, design repository, Bitbucket, Storybook, browser, accessibility, analytics, feedback, content/localization, assets, experimentation, collaboration, artifact, secret broker, policy.
6. **Project systems:** PCC, SOP, DataBridge repositories, Figma projects, design systems, Storybook catalogs, product environments.
7. **Research systems:** recruitment, consent, scheduling, recordings, redacted repository, surveys, usability platforms.
8. **Security:** vault, workload identity, short-lived leases, privacy zones, redaction, consent, purpose limitation, approval binding.
9. **Artifacts:** briefs, plans, notes, insights, personas, journeys, IA, flows, wireframes, designs, prototypes, tokens, specs, handoff, QA, decisions, evidence.

## Required architecture edges

- User request to gateway with identity and project purpose.
- Gateway to policy before workflow creation.
- Supervisor to registries and specialists.
- Specialists to MCP tools only through policy-aware runtime.
- Capability broker to vault and trusted adapters; no model-to-secret edge.
- Raw participant data remains in research systems; redaction creates bounded evidence for agents.
- Every tool call emits audit and evidence.
- Approval service gates participant-facing actions, shared Figma/library writes, publications, experiments, and production screenshots.
- UX agent has no edge that mutates production applications.

## Complete flow nodes

Request -> normalize -> authorize -> gather product/design/research context -> classify evidence and privacy -> identify assumptions -> research/design plan -> approval -> research/analytics/design-system discovery -> synthesize -> IA and flows -> content/accessibility/system review -> visual design -> prototype -> usability validation -> iterate -> design review -> handoff approval -> engineering implementation -> design QA -> resolve differences -> approved publication -> post-release observation -> close.

## Decision nodes

- Is the user problem supported by evidence?
- Is participant research needed?
- Is consent/privacy approval required?
- Can an existing pattern or component solve the need?
- Does the design meet accessibility and localization requirements?
- Is a new shared component or token required?
- Did usability validation meet success thresholds?
- Are unresolved findings release-blocking?
- Is the target a shared Figma file/library or production evidence capture?
- Did implementation match approved intent or require a documented design update?

## Visual conventions

- Blue: control-plane services
- Purple: UX specialist agents
- Teal: research and evidence systems
- Green: read-only resources and successful states
- Amber: approval and human-review gates
- Red: denied privacy, publication, production mutation, or unconsented paths
- Gray: artifacts and audit records
- Dashed lines: context and evidence
- Solid lines: tool invocation or state transition
