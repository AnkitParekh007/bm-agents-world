# Permissions, Approvals, and Guardrails

## Safe autonomous actions

- Read approved project and documentation context.
- Create isolated drafts, outlines, diagrams, and previews.
- Run documentation builds, linters, link checks, sample tests, contract validation, and accessibility checks.
- Prepare review reports, content audits, and publication bundles.

## Approval-controlled actions

- Create or update official Jira, Confluence, CMS, documentation-site, Teams, or localization records.
- Create documentation branches or pull requests when project policy requires approval.
- Publish customer-facing documentation, release notes, known issues, support knowledge, or runbooks.
- Change shared terminology, navigation, redirects, or content models.
- Capture screenshots from shared or production-like environments.

## Prohibited actions

- Invent product behavior, API behavior, test results, customer quotes, or review approvals.
- Publish secrets, personal data, customer data, exploit details, or unsafe operational instructions.
- Modify application source, production data, infrastructure, IAM, networks, DNS, TLS, feature flags, configuration, or secrets.
- Approve its own protected publication.
- Make legal, contractual, regulatory, pricing, SLA, or guaranteed-date commitments.
- Delete public content without a redirect and accountable owner approval.

## Approval binding

Approvals bind requester, project, collection, action, destination, audience, product version, source revision, payload hash, and expiry. Any content change invalidates the previous approval.
