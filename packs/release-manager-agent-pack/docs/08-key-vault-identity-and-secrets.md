# Key Vault, Identity, and Secrets

## Principle

The language model never receives raw credentials. Trusted adapters exchange workload identity for short-lived, scope-bound capabilities.

## Access path

User identity → Agent Gateway → OPA policy → Capability Broker → Workload Identity → Vault/Secret Manager → Trusted Adapter → Target system.

## Identity separation

Use separate identities for repository reads, pipeline reads, non-production rehearsal, artifact metadata, observability, database migration status, communications, and production action requests.

## Production execution identity

Production deployment credentials belong only to the deterministic pipeline or authorized operator. Approval is bound to release ID, candidate hash, target, runbook hash, window, and expiry.

## Prohibited data

Passwords, tokens, cookies, private keys, signing keys, raw vault values, universal administrator credentials, and unrestricted customer records must never enter model context or generated artifacts.
