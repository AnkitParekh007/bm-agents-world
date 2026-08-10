# UX Designer Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: UX Designer / UX Research and Design  
Organization context: Bitbucket repositories, Jira/Confluence, Figma/FigJam, design systems, Storybook, product analytics, research repositories, playground/QA/production environments, CI/CD, Microsoft Teams, Angular frontends, Java/Python services, databases, and enterprise security controls.

## Purpose

This pack defines the access, skills, agents, MCP servers, tools, plugins, artifacts, orchestration, vault integration, approvals, and operational controls required for an enterprise UX Designer Agent.

It supports product discovery, user research, information architecture, interaction and visual design, content design, design systems, accessibility, prototyping, usability validation, analytics, developer handoff, and design QA.

## Core design rule

The agent never receives universal Figma access, participant contact lists, raw recordings, direct identifiers, analytics administrator credentials, production application credentials, or unrestricted publication rights. Every run is bound to:

`organization -> project -> product area -> Jira item -> Figma project/file/branch -> design system -> repositories -> environment -> requester -> approved purpose -> participant-data class -> allowed tools -> evidence -> approvals -> expiration`

## Supported execution profiles

| Profile | Typical work | Required behavior |
|---|---|---|
| Discovery and research | Problem framing, interviews, observation, surveys, synthesis | Consent, privacy, evidence strength, and no invented research |
| Information and interaction design | IA, task flows, forms, states, permissions, recovery | Model complete workflows and edge cases, not isolated screens |
| Visual and content design | Layout, typography, color, icons, copy, responsive design | Reuse system patterns and meet accessibility/localization constraints |
| Design systems | Tokens, components, variants, patterns, governance | Inspect implemented catalog and require approval for shared publication |
| Prototyping and validation | Wireframes, prototypes, usability testing, iteration | Use realistic states and evidence-backed findings |
| Handoff and design QA | Specifications, Code Connect, acceptance criteria, browser review | Preserve traceability and classify differences explicitly |

## Organization project templates

- **PCC:** Angular 12 and Java; legacy-compatible design and implementation constraints.
- **SOP:** Angular 15 and Java; version-aware component and design-system integration.
- **DataBridge:** AngularJS and Java; conservative usability/accessibility improvements and modernization planning.
- **Environments:** design sandbox, playground, QA, and production. Production is read-only and privacy-controlled; the UX agent never mutates production applications.

## Recommended first implementation

1. User selects project, Jira item, product area, Figma file/branch, and desired workflow.
2. Supervisor resolves access, evidence, user segments, design-system scope, implementation constraints, sensitivity, and approvals.
3. Specialists read requirements, prior research, analytics summaries, support themes, designs, tokens, code, Storybook, and product behavior.
4. Agent produces a design brief, evidence gaps, research/design plan, IA, flows, accessibility/content/system requirements, prototype or handoff draft.
5. Work occurs in isolated drafts or approved Figma branches.
6. Deterministic gates run: schema validation, contrast, target size, content lint, token mapping, accessibility mapping, visual comparison, and evidence checks.
7. Usability findings, design decisions, handoff, and design QA are stored with provenance.
8. Human approval is required for participant-facing work, shared Figma/library writes, publication, experiments, and production screenshots.

## Pack facts

- **207 daily tasks**
- **24 supervisor and specialist agents**
- **175 reusable skills**
- **16 MCP server definitions**
- **20 runtime plugins/adapters**
- **25 artifact types**
- **5 machine-readable workflows**
- **7 JSON output contracts**
- **15 YAML configuration/workflow files**

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries and deployable configuration templates |
| `workflows/` | Machine-readable UX workflows |
| `schemas/` | JSON contracts for structured outputs |
| `templates/` | Reusable research, design, handoff, and QA artifacts |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |
