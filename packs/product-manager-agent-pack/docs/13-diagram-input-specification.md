# Diagram Input Specification

## Architecture diagram layers

1. **Users and governance:** Product Manager, Product Lead, Engineering Lead, UX Lead, Analytics, QA, DevOps, Sales, Support, Legal, Security.
2. **Agent gateway:** identity, scope selection, request intake, response and approval UI.
3. **Control plane:** workflow engine, supervisor, policy engine, approval service, capability broker, evidence manager, audit.
4. **Specialist agents:** context, customer insights, market, strategy, discovery, problem framing, analytics, experiments, prioritization, roadmaps, portfolio, requirements, story mapping, backlog, stakeholders, delivery, release, GTM, pricing, risk, outcomes, review.
5. **MCP and adapters:** Atlassian/JPD, product platform, Bitbucket, Figma, feedback, CRM, analytics, experiments, warehouse, browser, roadmap, delivery, calendar, Teams, artifact store.
6. **Systems of record:** Jira, Confluence, JPD/Productboard, Bitbucket, Figma, analytics, warehouse, support, CRM, research, feature flags, CI/CD, Teams, vault.
7. **Trust boundaries:** public internet, customer/commercial data, internal planning, production read-only, publication actions.

## Main arrows

- User request to gateway.
- Gateway to policy and workflow engine.
- Workflow engine to supervisor and specialists.
- Specialists to MCP adapters through capability broker.
- Adapters to systems of record.
- All actions to audit and evidence store.
- Sensitive writes to approval service before adapter execution.
- Approved artifacts back to Jira/JPD/Confluence/Teams.

## Complete flow diagram

`Idea or signal -> authorize -> collect context -> gather customer/market/analytics evidence -> frame problem -> map opportunity -> generate options -> prioritize -> human decision -> roadmap -> product brief/PRD -> story map -> delivery readiness -> build/test -> release plan -> human release decision -> observe outcomes -> learn -> update strategy/roadmap/backlog`

## Visual conventions

- Green: read-only and autonomous.
- Amber: draft or approval-controlled.
- Red: prohibited autonomous action.
- Blue: human decision.
- Purple: evidence and audit.
- Dashed arrows: optional or conditional integrations.
