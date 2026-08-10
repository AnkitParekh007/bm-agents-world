# Key Vault, Identity, and Secrets

Credential flow:

`User identity -> Agent gateway -> OPA policy -> Capability broker -> Workload identity -> Vault/secret manager -> Trusted adapter -> Target system`

The model receives capability metadata and redacted results, never passwords, tokens, connection strings, signing keys, unrestricted kubeconfig, or employee-system credentials. People-data connectors additionally require purpose, initiating manager, approved fields, retention, and audit metadata.

Recommended implementations include Google Secret Manager with Workload Identity Federation, Azure Key Vault with managed identities, or HashiCorp Vault with short-lived dynamic credentials.
