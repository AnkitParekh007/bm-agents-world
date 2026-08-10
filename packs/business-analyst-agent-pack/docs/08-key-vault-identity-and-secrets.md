# Key Vault, Identity, and Secrets

The language model never receives raw credentials. Trusted adapters obtain short-lived access only after identity, policy, purpose, project, classification, and approval checks.

## Access chain

User identity → Agent Gateway → Policy Engine → Capability Broker → Workload Identity → Vault or Secret Manager → Trusted Adapter → Target system.

## Identity separation

Use separate identities for Jira/Confluence read, approved publication, artifact storage, metadata catalog, bounded database read, analytics, Teams publication, and evidence verification. Production read identities must not include write permissions.

## Secret references

Configuration stores only provider, path, consumer, scope, and lease policy. Values, tokens, connection strings, private keys, and refresh tokens never appear in YAML, prompts, artifacts, logs, or error messages.

## Lease controls

Leases are project-, environment-, action-, and time-bound. Adapters enforce audience, allowed endpoints, data filters, query templates, rate limits, and automatic revocation.

## Incident response

On suspected exposure, revoke the lease, rotate the credential, quarantine artifacts and logs, notify the security owner, preserve audit evidence, and review every capability issued to the run.
