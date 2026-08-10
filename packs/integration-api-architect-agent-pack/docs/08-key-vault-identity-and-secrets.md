# Key Vault, Identity, and Secrets

## Credential path

**User identity → Agent Gateway → Policy Engine → Capability Broker → Workload Identity → Vault/Secret Manager → Trusted Adapter → Target system**

The model never receives raw API keys, OAuth client secrets, broker credentials, gateway administrator tokens, private certificates, signing keys, or database passwords.

Prefer workload identity, mTLS, short-lived OAuth tokens, scoped service identities, and per-project capabilities. Partner secrets use dedicated references and rotation schedules. Production adapters expose read-only metadata unless an immutable approved change request is being executed by an authorized system.
