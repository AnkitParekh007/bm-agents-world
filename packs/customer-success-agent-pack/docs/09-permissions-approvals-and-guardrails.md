# Permissions, Approvals, and Guardrails

## Safe autonomous operations

- Read authorized CRM/CS account context.
- Read privacy-safe product usage and support/release status.
- Calculate deterministic health, adoption, value, and time-window metrics.
- Draft success plans, meeting briefs, QBRs/EBRs, risk plans, and customer communications in isolated workspace.
- Prepare cross-functional handoffs and recommended next actions.

## Approval-controlled operations

- Write CRM or CS-platform fields.
- Change official health/risk status or manual score overrides.
- Send customer communications.
- Schedule or alter customer meetings.
- Publish QBR/EBR or value claims.
- Publish renewal/expansion signals.
- Launch surveys, advocacy/reference requests, or other customer outreach.

## Prohibited operations

- Pricing, discount, contract, SLA, credit, refund, or legal commitments.
- Approving renewal/expansion transactions.
- Editing billing or entitlements.
- Production system mutation.
- Reading raw secrets.
- Exporting unbounded customer/contact data.
- Cross-customer or cross-tenant mixing.
- Scoring customer health using protected traits or inappropriate individual monitoring.
- Fabricating customer quotes, usage, outcomes, incident facts, or product commitments.

## Approval binding

Approval records bind run ID, project, customer/account ID, action, target, payload hash, approver, purpose, and expiry. A changed payload requires reapproval.

## Commercial separation

The Customer Success Agent may prepare renewal and expansion evidence but must route pricing, negotiation, contracting, forecast ownership, credits, and commercial approval to Sales/Account Management or other authorized owners.
