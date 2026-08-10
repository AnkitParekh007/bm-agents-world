# Product Owner Agent — Skills Catalog

The machine-readable registry contains **252 skills** in `config/skill-registry.yaml`. Skills are composable capabilities, not broad permissions. A workflow grants only the skills required for the current purpose.

## Skill risk model

- **Low:** analysis, summarization, drafting, deterministic validation, and isolated artifact creation.
- **Medium:** backlog ordering proposals, Jira/Confluence/Teams publication, customer-facing drafts, UAT coordination, and release recommendations.
- **High:** customer studies, experiments, final business acceptance, and release decisions; these require named human approval and separate execution systems.

## Product Goal and Value

**12 skills** covering: Understand the current Product Goal and its evidence base; Translate product strategy into a clear team-level value narrative; Check that backlog priorities support the Product Goal; Identify work that does not contribute to an agreed product outcome; Clarify the customer or user value expected from each major backlog item; Maintain a concise product-value hypothesis for active initiatives; and related controls.
## Work Intake and Context

**12 skills** covering: Read assigned Jira epics, stories, bugs, spikes, and requests; Read linked Confluence pages, product briefs, designs, and decisions; Review acceptance criteria, comments, attachments, and dependencies; Identify the originating stakeholder and requested outcome; Determine whether a request belongs in the product backlog; Detect duplicate, overlapping, or contradictory requests; and related controls.
## Stakeholder Alignment

**12 skills** covering: Map decision makers, contributors, reviewers, users, and affected teams; Prepare stakeholder interview and alignment agendas; Capture stakeholder needs without treating every request as a commitment; Separate user needs, business goals, constraints, and proposed solutions; Surface stakeholder conflicts and tradeoffs; Prepare decision options with evidence and consequences; and related controls.
## Customer and User Value

**12 skills** covering: Review approved customer research and usability findings; Review support themes and recurring customer pain points; Review product analytics and adoption signals; Identify the user problem addressed by each backlog item; Check that user stories describe a meaningful user or system outcome; Distinguish customer evidence from stakeholder opinion; and related controls.
## Backlog Ownership and Transparency

**12 skills** covering: Maintain a single transparent product backlog for the team; Ensure every backlog item has a clear purpose and owner; Order backlog items to maximize value and manage risk; Keep the highest-priority items sufficiently detailed; Archive or close obsolete items with rationale; Identify stale backlog items and outdated assumptions; and related controls.
## Backlog Refinement

**12 skills** covering: Prepare refinement candidates based on priority and team capacity; Check each candidate against a Definition of Ready or equivalent policy; Clarify scope, user value, assumptions, rules, and constraints; Split oversized items into valuable vertical slices; Identify spikes where uncertainty prevents responsible commitment; Add examples, scenarios, and edge cases; and related controls.
## User Stories and Requirements

**12 skills** covering: Draft user stories from approved product and business context; Use job, user, or system-centered story formats appropriately; Write concise problem and outcome statements; Document functional behavior without prescribing unnecessary implementation; Document business rules and calculations; Document data inputs, outputs, validation, and retention needs; and related controls.
## Acceptance Criteria and Readiness

**12 skills** covering: Write testable acceptance criteria; Use scenario-based examples for complex behavior; Cover happy paths, negative paths, boundaries, and permissions; Cover error handling and user recovery; Cover accessibility and keyboard behavior; Cover data integrity and audit behavior; and related controls.
## Prioritization and Ordering

**12 skills** covering: Apply an approved prioritization method consistently; Compare customer value, business value, risk, urgency, learning, and effort; Account for dependencies and sequencing constraints; Account for defects, security, compliance, reliability, and technical debt; Avoid treating loud stakeholder demand as objective priority; Document assumptions and confidence behind ordering decisions; and related controls.
## Sprint Planning and Sprint Goal

**12 skills** covering: Prepare ordered, ready backlog candidates before Sprint Planning; Propose a coherent Sprint Goal tied to product value; Explain how candidate items support the proposed Sprint Goal; Provide scope options rather than pushing work onto Developers; Respect Developers’ ownership of Sprint Backlog selection and plan; Clarify acceptance questions during Sprint Planning; and related controls.
## Sprint Collaboration and Decisions

**12 skills** covering: Answer product and requirement questions during the Sprint; Provide timely priority and scope decisions; Clarify behavior when new edge cases are discovered; Assess proposed scope tradeoffs against the Sprint Goal; Avoid changing Sprint scope informally or without team discussion; Coordinate stakeholder access when clarification is needed; and related controls.
## UX and Design Readiness

**12 skills** covering: Confirm relevant user journeys and states are understood; Verify approved designs are linked to backlog items; Confirm responsive and accessibility expectations; Identify missing states, errors, permissions, and edge cases in designs; Coordinate content and UX-writing decisions; Confirm design-system component usage or exceptions; and related controls.
## Technical and Architecture Readiness

**12 skills** covering: Confirm architecture decisions and constraints are linked; Identify cross-service, API, database, and infrastructure dependencies; Confirm technical spikes are completed when required; Clarify product intent without dictating engineering design; Review engineering estimates as inputs, not commitments imposed by the agent; Coordinate tradeoffs between value, scope, quality, and feasibility; and related controls.
## QA, UAT, and Business Acceptance

**12 skills** covering: Coordinate story readiness with QA; Confirm acceptance criteria can be validated; Review test plans for product-risk coverage; Provide test data and business-rule clarification; Triage defects by user impact and value risk; Distinguish release blockers from lower-priority defects; and related controls.
## Release Planning and Acceptance

**12 skills** covering: Define release scope and intended customer outcome; Confirm included backlog items and excluded scope; Review quality, security, accessibility, support, and operational readiness; Review unresolved defects and accepted risks; Confirm release notes and internal enablement materials; Confirm rollout, feature flag, migration, monitoring, and rollback plans; and related controls.
## Metrics, Outcomes, and Experiments

**12 skills** covering: Define success, quality, and guardrail measures for backlog initiatives; Ensure instrumentation requirements are included before delivery; Review baseline metrics and data quality; Track adoption, task success, quality, and business outcomes; Separate output completion from outcome achievement; Review experiment hypotheses, variants, and stopping rules; and related controls.
## Ceremonies and Agile Collaboration

**12 skills** covering: Prepare Product Owner inputs for refinement; Prepare Product Owner inputs for Sprint Planning; Participate in Daily Scrum only when useful and without directing Developers; Prepare Sprint Review narratives and evidence; Collect stakeholder feedback during Sprint Review; Prepare retrospective inputs about product and decision flow; and related controls.
## Cross-Team and Dependency Management

**12 skills** covering: Identify dependencies across PCC, SOP, DataBridge, and shared platforms; Map provider and consumer teams; Align backlog ordering with shared dependency milestones; Coordinate shared API, data, design-system, and release decisions; Detect conflicting priorities across teams; Prepare cross-team decision and sequencing options; and related controls.
## Risk, Compliance, and Governance

**12 skills** covering: Identify privacy, security, legal, regulatory, accessibility, and operational risks; Route specialist reviews early; Ensure mandatory work is visible and ordered appropriately; Document risk owners and mitigation expectations; Track unresolved policy exceptions; Prevent release acceptance when mandatory approvals are absent; and related controls.
## Communication and Reporting

**12 skills** covering: Prepare a daily Product Owner summary; Prepare backlog-health reports; Prepare refinement-readiness summaries; Prepare Sprint Goal and planning briefs; Prepare delivery and dependency updates; Prepare release-readiness and acceptance summaries; and related controls.
## Continuous Improvement and Product Operations

**12 skills** covering: Review backlog aging and throughput patterns; Review quality of stories and acceptance criteria; Review decision latency and clarification bottlenecks; Review defect escape and rework themes; Review stakeholder feedback on backlog transparency; Improve templates, taxonomies, and readiness criteria; and related controls.

## Skill governance

Every skill invocation records agent, workflow, project, input references, output hash, policy decision, approval reference, model/runtime version, and evaluation result.
