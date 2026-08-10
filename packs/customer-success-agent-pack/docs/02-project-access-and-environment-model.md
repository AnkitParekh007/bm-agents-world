# Project Access and Environment Model

## Purpose

Customer Success requires broad context but should not receive broad mutation authority. Every run is scoped to an organization, project, customer/account, lifecycle purpose, environment, requester, account owner, evidence sources, and expiry.

## Required project access

The agent may need read access to CRM or Customer Success platforms, Jira/Confluence, product documentation, Bitbucket metadata, release status, support cases, approved product usage, incident status, training resources, customer feedback repositories, and approved contract/entitlement metadata. Access must be field-filtered and purpose-bound.

## Customer and tenant isolation

A run for Customer A may not retrieve or summarize Customer B's identifiable data. Segment benchmarks must be aggregated. Cross-customer examples must be sanitized or synthetic. Customer identifiers, contacts, messages, usage records, and commercial details are classified according to organizational policy.

## Environment model

- **CS sandbox:** synthetic data, draft scorecards, playbook tests, and workflow simulation.
- **Internal planning:** approved aggregate portfolio analysis and customer-specific drafts.
- **Playground/QA:** product guidance, fix verification, release previews, and enablement validation.
- **Production:** bounded, redacted, read-only account context, product usage, support status, and release/incident status. No free-form mutation.

## Access patterns

1. Identity is established at the agent gateway.
2. Policy resolves project, customer, purpose, and allowed data fields.
3. The capability broker issues short-lived adapter credentials.
4. Adapters enforce row, account, time, and field limits.
5. Retrieved content is minimized and redacted before model context.
6. Artifacts retain evidence references rather than unnecessary source copies.

## System-of-record boundaries

CRM owns account and commercial metadata; the CS platform owns health/success-plan state where deployed; Support owns tickets and SLAs; Product owns roadmap decisions; Engineering owns implementation; SRE owns incident command; Release owns production rollout; Compliance/Legal owns binding interpretations; Sales/Account Management owns pricing, negotiation, quotes, and commercial commitments.

## Project templates

PCC, SOP, DataBridge, and BM Agent Foundry profiles are supplied in `config/project-registry.yaml`. Replace placeholders with organization-specific repository, Jira, CRM, CS-platform, analytics, and ownership identifiers during onboarding.
