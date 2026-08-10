# Permissions, Approvals, and Guardrails

## Default-deny model

Every tool call is checked against identity, project, product area, environment, purpose, data class, action, resource, payload, approval, and expiry.

## Allowed autonomously

- Read authorized product context.
- Read privacy-thresholded aggregate analytics.
- Read sanitized customer and market evidence.
- Create isolated drafts and calculations.
- Generate options, risks, questions, and decision memos.
- Observe approved release and experiment status.

## Approval required

- Jira, JPD, Confluence, roadmap, or Teams publication.
- Customer or prospect contact.
- Survey, research, beta, or experiment launch.
- Shared metric-definition change.
- Official release, launch, pricing, packaging, or customer communication artifact.

## Prohibited

- Production deployment, flag, entitlement, billing, or data mutation.
- Final release approval.
- Contractual, legal, pricing, discount, SLA, or roadmap commitment.
- Raw customer or commercial data export to model context.
- Fabricated evidence or manipulated scoring.
- Bypassing portfolio, security, privacy, legal, engineering, QA, or release controls.

## Separation of duties

The author of a recommendation cannot be the only reviewer. Sensitive publications require a human decision owner. Experiment launch requires product plus relevant analytics, engineering/release, and privacy approval.
