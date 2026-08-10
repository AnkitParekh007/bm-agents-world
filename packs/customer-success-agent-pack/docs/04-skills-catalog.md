# Skills Catalog

The machine-readable registry contains **240 skills** across 24 categories. Skills are declarative capabilities used by the supervisor to compose workflows; they are not credentials or unrestricted tool permissions.

## Skill families

- Account context and lifecycle segmentation
- Handoff and onboarding
- Success planning and mutual action plans
- Stakeholder and relationship management
- Adoption and product usage
- Customer health and risk management
- Value realization and business reviews
- Renewal and expansion readiness
- Support and incident coordination
- Voice of Customer and feedback
- Training and enablement
- Customer communication and advocacy
- Digital Customer Success and journey design
- CS Operations and analytics
- Privacy, governance, cross-functional coordination, and continuous improvement

## Skill execution model

A skill defines expected inputs, reasoning/output behavior, and risk class. Actual data access comes from MCP servers or deterministic adapters after policy evaluation. High-risk skills may prepare an action but cannot bypass approval policies.

## Examples

`health-score-calculation` uses approved weights and inputs, while `health-score-fairness-check` ensures inappropriate personal attributes are excluded. `renewal-risk-scenario-analysis` prepares evidence and confidence ranges but `commercial-boundary-enforcement` prevents the agent from turning that analysis into a pricing, contract, or forecast commitment. `customer-email-drafting` may create a draft, while actual send is a separately governed action.

See `config/skill-registry.yaml` for the complete registry.
