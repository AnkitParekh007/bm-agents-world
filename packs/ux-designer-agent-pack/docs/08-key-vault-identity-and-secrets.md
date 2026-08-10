# Key Vault, Identity, and Secrets

## Rule

The language model never receives raw API tokens, participant repository credentials, analytics keys, Figma tokens, signing keys, or collaboration credentials.

## Access path

`User identity -> Agent gateway -> OPA policy -> Capability broker -> Workload identity / vault -> Trusted adapter -> Target system`

## Identity classes

- Context reader: Jira, Confluence, approved documentation.
- Figma reader: selected projects, files, variables, components, and Dev Mode metadata.
- Figma isolated writer: personal draft or approved branch only.
- Research redacted reader: sanitized notes and evidence references.
- Analytics reader: aggregate, privacy-thresholded, read-only queries.
- Browser reviewer: approved environment, isolated session, no credential export.
- Artifact writer: redacted evidence store.
- Collaboration publisher: payload-bound, one-time approval.
- Shared-library publisher: separate privileged identity, human-controlled.

## Capability leases

Leases are short-lived and bind run, user, project, purpose, target, allowed actions, source version, payload hash when writing, expiration, and redaction rules. Leases are revoked at run completion or policy violation.

## Secret hygiene

Secrets are resolved only within trusted adapters; logs contain references, not values. Screenshots, transcripts, design exports, and browser recordings are scanned and redacted before model access or retention.
