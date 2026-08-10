# Key Vault, Identity, and Secrets

## Principle

The language model never receives raw credentials. Trusted adapters obtain short-lived capabilities after policy evaluation.

## Access path

User identity → Agent Gateway → OPA Policy → Capability Broker → Workload Identity or Vault → Trusted Adapter → Target system.

## Identity separation

Use separate identities for repository reads, documentation previews, analytics reads, localization handoff, CMS publication, and pull-request publication. Public publication identities must not have source-code, production, or secret-administration privileges.

## Secret references

Configuration files contain only secret references such as vault paths, workload identity audiences, connector IDs, and rotation metadata. They must never contain passwords, tokens, cookies, private keys, signing keys, or customer credentials.

## Sensitive content controls

The redaction layer removes secrets, personal information, customer identifiers, private hostnames, internal IP addresses, session data, access tokens, unapproved screenshots, and confidential commercial information before model context or publication.
