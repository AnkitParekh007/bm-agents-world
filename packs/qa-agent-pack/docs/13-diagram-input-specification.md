# Diagram Input Specification

This file is the source for the next deliverable: a beautiful Mermaid architecture diagram and a complete execution-flow diagram.

## Architecture diagram layers

1. **People and triggers:** QA engineer, product owner, developer, Jira event, Bitbucket PR, CI/CD deployment, schedule.
2. **Experience layer:** Agent UI, chat, run dashboard, approval center, artifact viewer.
3. **Control plane:** QA Supervisor, workflow engine, agent registry, skill registry, policy engine, approval service, run state.
4. **Sub-agent layer:** Context, Impact, Test Design, Readiness, Browser, API, Database, Integration, Defect, Automation, Regression, Release, Reporting, Evidence.
5. **Capability layer:** MCP gateway, plugins, tool registry, identity broker, credential leases.
6. **Connected systems:** Jira/Confluence, Bitbucket, Playwright/browser, APIs, PostgreSQL, CI/CD, logs/traces, Teams, artifact store.
7. **Security layer:** Secret manager/vault, workload identity, network policy, DLP/redaction, audit.
8. **Environment lanes:** playground, QA, production with visibly different boundaries.

## Complete flow diagram phases

- Trigger and intake
- Project/environment resolution
- Authorization
- Context collection
- Change impact
- Test planning
- Plan approval
- Environment readiness
- Parallel browser/API/database execution
- Evidence validation/redaction
- Failure classification
- Bug draft and approval
- Jira publication
- Fix-ready trigger
- Retest and targeted regression
- Release readiness
- Teams/report publication
- Audit and evaluation

## Visual requirements for the future Mermaid output

- Use subgraphs for layers and environment trust zones.
- Use consistent node classes for people, agents, MCP servers, systems, artifacts, security, approvals, and decisions.
- Show read operations with solid arrows, approved writes with emphasized arrows, and denied/prohibited paths with dotted red-style classes where Mermaid supports them.
- Show key vault access only through the identity broker; never draw a direct model-to-vault line.
- Show an explicit human approval loop.
- Show evidence artifacts returning to the supervisor and feeding Jira/Teams drafts.
- Produce both an executive architecture view and an engineering-level sequence/flow view.
