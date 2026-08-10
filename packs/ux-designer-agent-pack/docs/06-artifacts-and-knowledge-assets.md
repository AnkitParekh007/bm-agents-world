# Artifacts and Knowledge Assets

## Artifact registry

| Artifact | Purpose |
|---|---|
| `design-brief` | Problem, users, outcomes, constraints, scope, assumptions, risks, and success measures. |
| `research-plan` | Questions, methods, sample, consent, logistics, analysis, privacy, and decision linkage. |
| `participant-screener` | Approved recruitment criteria without unnecessary sensitive attributes. |
| `interview-guide` | Neutral discussion guide, probes, timing, consent reminders, and wrap-up. |
| `usability-test-plan` | Tasks, prototype, measures, participant criteria, moderation, capture, and analysis. |
| `redacted-research-notes` | Sanitized observations and timestamps with evidence references. |
| `research-insight-report` | Findings, evidence strength, frequency, impact, confidence, risks, and recommendations. |
| `persona-jtbd-pack` | Evidence-backed personas, jobs, contexts, goals, barriers, and anti-assumptions. |
| `journey-map` | Stages, actions, thoughts, emotions, pain points, opportunities, channels, and evidence. |
| `service-blueprint` | Frontstage, backstage, systems, policies, handoffs, failure points, and measures. |
| `information-architecture` | Content model, taxonomy, navigation, sitemap, labeling, search, and rationale. |
| `task-flow` | Actors, states, decisions, alternate paths, errors, recovery, permissions, and completion. |
| `wireframe-set` | Low-fidelity layouts covering key tasks, states, breakpoints, and content hierarchy. |
| `high-fidelity-design` | Approved visual designs with variants, responsive states, content, and annotations. |
| `interactive-prototype` | Testable prototype with realistic data, states, transitions, and version metadata. |
| `content-specification` | Approved labels, helper text, errors, empty states, notifications, tone, and localization notes. |
| `design-token-package` | Color, typography, spacing, radius, elevation, motion, semantic tokens, and mappings. |
| `component-specification` | Anatomy, props, variants, states, behavior, content, accessibility, and responsive rules. |
| `accessibility-annotation` | WCAG mapping, semantics, keyboard behavior, focus order, announcements, contrast, and motion. |
| `design-system-change-proposal` | Need, evidence, API, variants, migration, compatibility, governance, and rollout. |
| `developer-handoff-package` | Design links, scope, flows, specs, tokens, assets, acceptance criteria, and unresolved decisions. |
| `design-qa-report` | Implementation differences, severity, evidence, responsive/accessibility issues, and disposition. |
| `experiment-measurement-plan` | Hypothesis, metrics, events, guardrails, segmentation, analysis, and stopping rules. |
| `design-decision-log` | Decision, alternatives, evidence, participants, constraints, date, and consequences. |
| `ux-daily-summary` | Completed work, findings, decisions, blockers, next actions, and approvals needed. |

## Provenance requirements

Every artifact records run ID, project, Jira item, authoring agents, evidence references, source versions, Figma/file/branch references, sensitivity, approvals, creation time, superseded-by relation, and cryptographic hash.

## Research evidence

Raw recordings and identifiable participant data remain in approved systems. Agent-generated artifacts contain redacted excerpts, coded observations, counts, and source references. Findings must distinguish direct observation, participant statement, analytics fact, interpretation, inference, and recommendation.

## Design versioning

Design artifacts must link to the exact Figma file, page, section, component, branch, and version or timestamp used. Handoff packages must identify the approved version and list later design changes explicitly.

## Retention

Retention follows product, legal, privacy, research, and organizational policy. Superseded designs are archived rather than silently overwritten when they are part of a decision or release record.
