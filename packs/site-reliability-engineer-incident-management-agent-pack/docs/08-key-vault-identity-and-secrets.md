
# Key Vault, Identity, and Secrets

## Core rule

The language model never receives raw credentials, kubeconfigs, cloud keys, database passwords, signing keys, customer tokens, session cookies, or vault values.

## Access path

`Human identity → Agent Gateway → OPA Policy → Capability Broker → Workload Identity → Vault/Secret Manager → Trusted Adapter → Target`

## Identity separation

Use separate identities for observability reads, incident coordination, platform diagnostics, database diagnostics, non-production exercises, communication publishing, and approved production execution. Never use universal administrator or cluster-admin credentials.

## Capability lease

A lease includes project, service, environment, action, target, incident or change ID, time window, payload hash, maximum calls, query bounds, expiry, approver, and audit correlation ID.

## Emergency access

Break-glass access remains human-controlled, time-limited, separately audited, and reviewed. The model may prepare evidence and instructions but never receives break-glass secret material.
