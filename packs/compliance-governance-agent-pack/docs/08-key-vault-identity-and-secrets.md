# Key Vault, Identity and Secrets

## Principle

The model never receives raw secret values. Access is mediated by trusted adapters using workload identity and short-lived capability leases.

## Flow

`Human identity → Agent Gateway → Policy Engine → Capability Broker → Workload Identity / Vault → Trusted Adapter → Target System`

## Identity separation

Use distinct identities for: reference retrieval, evidence collection, audit-log query, IAM review, GRC read, approved GRC write, vendor evidence, privacy metadata, AI governance metadata and artifact storage.

## Secret references

Configuration contains references such as `vault://compliance/prod/siem-reader`, never passwords or tokens. Production and highly restricted evidence sources should use purpose-bound access with short TTL, query limits, redaction and full audit logs.
