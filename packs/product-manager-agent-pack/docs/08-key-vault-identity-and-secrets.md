# Key Vault, Identity, and Secrets

## Core rule

The language model never receives raw API keys, access tokens, passwords, signing secrets, customer export credentials, or unrestricted service-account material.

## Access path

`User identity -> Agent gateway -> Policy engine -> Capability broker -> Workload identity / Vault -> Trusted adapter -> Target system`

## Identity separation

Use separate identities for:

- Jira and Confluence read.
- Product discovery and roadmap read.
- Product analytics read.
- Feedback and research read with redaction.
- CRM aggregate insights.
- Experiment and flag read.
- Artifact storage.
- Approval-controlled publication.

## Capability lease

A lease includes requester, project, product area, purpose, target system, resource scope, allowed operations, environment, payload hash when writing, issue or decision identifier, expiry, and audit correlation ID.

## Secret rotation and revocation

Prefer workload federation, managed identity, OAuth delegation, dynamic credentials, and short-lived tokens. Revoke leases when the run ends, approval expires, scope changes, or policy denies continued access.

## Data minimization

Customer, sales, support, and research systems should expose sanitized themes, aggregates, and evidence references. Raw records remain in their systems of record.
