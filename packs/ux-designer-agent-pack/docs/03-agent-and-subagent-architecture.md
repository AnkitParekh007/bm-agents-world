# Agent and Sub-Agent Architecture

## Supervisor

The `ux-designer-supervisor` owns the run. It normalizes the request, binds scope, asks policy for authorization, selects specialists, manages parallel work, resolves conflicts, requests approvals, and produces the final evidence bundle.

## Specialist registry

| Agent | Responsibility | Capabilities |
|---|---|---|
| `ux-designer-supervisor` | Coordinates bounded UX discovery, research, design, validation, handoff, approvals, and evidence. | orchestration, risk, evidence |
| `work-context` | Reads Jira, Confluence, product strategy, support themes, analytics summaries, code and design history. | jira, requirements, traceability |
| `research-planner` | Defines research questions, method, sample, consent, risk, schedule, and analysis plan. | research-plan, methods, ethics |
| `user-researcher` | Conducts approved interviews, contextual inquiry, surveys, diary studies, and moderated sessions. | interviews, observation, surveys |
| `research-operations` | Manages recruitment criteria, consent records, scheduling, incentives, repositories, and privacy controls. | recruitment, consent, research-ops |
| `insight-synthesizer` | Codes evidence, clusters findings, separates observation from interpretation, and produces prioritized insights. | synthesis, affinity, evidence |
| `persona-journey-modeler` | Creates evidence-backed personas, jobs, journeys, scenarios, moments of truth, and pain-point maps. | personas, jtbd, journey-mapping |
| `information-architect` | Designs navigation, taxonomy, labeling, hierarchy, search, sitemap, and content organization. | ia, taxonomy, navigation |
| `interaction-designer` | Designs task flows, state models, controls, errors, recovery, responsive behavior, and interaction details. | flows, states, interaction |
| `visual-ui-designer` | Creates hierarchy, layout, typography, color, imagery, responsive compositions, and polished UI. | visual-design, responsive, ui |
| `content-designer` | Creates interface copy, labels, instructions, errors, empty states, notifications, and content hierarchy. | ux-writing, content-model, plain-language |
| `design-system-architect` | Defines tokens, components, patterns, variants, governance, contribution rules, and code/design alignment. | tokens, components, governance |
| `prototype-builder` | Builds low-to-high fidelity prototypes with realistic states, data, transitions, and test instrumentation. | figma, prototype, interaction |
| `accessibility-inclusive-designer` | Applies WCAG, APG, keyboard, screen-reader, contrast, motion, cognitive, and inclusive-design requirements. | wcag, aria, inclusive-design |
| `usability-test-engineer` | Creates tasks, protocols, success measures, session capture, analysis, and validated findings. | usability-testing, metrics, moderation |
| `analytics-experiment-designer` | Maps UX questions to product analytics, funnels, events, hypotheses, experiments, and success criteria. | analytics, experimentation, measurement |
| `service-blueprint-architect` | Maps frontstage, backstage, people, systems, policies, handoffs, failure points, and operational dependencies. | service-design, blueprints, operations |
| `localization-content-specialist` | Reviews internationalization, translation expansion, date/number formats, RTL, terminology, and cultural risks. | localization, i18n, content |
| `design-qa-specialist` | Compares implemented UI with approved design, tests responsive states, accessibility, content, and visual quality. | design-qa, visual-diff, browser |
| `developer-handoff-engineer` | Produces implementation-ready specs, tokens, assets, behavior notes, acceptance criteria, and change traceability. | handoff, specification, code-connect |
| `design-reviewer` | Reviews research rigor, usability, consistency, accessibility, feasibility, risk, and evidence sufficiency. | review, quality, risk |
| `design-operations` | Maintains libraries, templates, naming, branching, versioning, intake, capacity, rituals, and metrics. | design-ops, libraries, workflow |
| `evidence-manager` | Hashes, stores, links, redacts, and retains research, design, test, approval, and handoff evidence. | artifacts, provenance, audit |
| `policy-enforcer` | Evaluates participant privacy, project scope, data use, tool permissions, approvals, publication, and production prohibitions. | opa, authorization, guardrails |

## Delegation contract

Every specialist receives run ID, purpose, project scope, selected artifacts, known facts, assumptions, sensitivity labels, allowed tools, output schema, time/token budget, and approval state. Every response must return evidence references, conclusions, uncertainties, risks, proposed actions, and confidence.

## Parallelism

After work-context resolution, the supervisor may parallelize research planning, analytics review, design-system discovery, accessibility analysis, and implementation feasibility. It serializes dependencies: evidence before insight; IA and flows before detailed UI; design-system decisions before component specs; prototype before usability validation; approved design before handoff; deployed build before design QA.

## Conflict resolution

1. Policy denial always wins.
2. Participant consent, privacy, accessibility, and safety concerns can block execution.
3. Direct user evidence and measured behavior outrank stakeholder preference.
4. Implemented system constraints inform design but do not silently redefine user needs.
5. Conflicting evidence is documented rather than averaged away.
6. Shared-library owners decide final component publication.

## Context minimization

Specialists receive only data needed for their responsibility. Direct identifiers, raw recordings, unredacted screenshots, access tokens, and unrelated analytics are excluded. Evidence is linked by immutable reference.
