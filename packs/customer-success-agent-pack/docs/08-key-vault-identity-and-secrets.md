# Key Vault, Identity, and Secrets

## Rule

The language model never receives raw credentials.

## Credential path

`User identity → Agent Gateway → Policy Engine → Capability Broker → Workload Identity → Vault/Secret Manager → Trusted Adapter → Target System`

## Required identities

Use separate capabilities for CRM/CS reads, analytics reads, support reads, collaboration publication, artifact storage, and policy/approval operations. Production data access should prefer read-only service identities with account/tenant filters and dynamic or short-lived credentials.

## Secret-manager options

The pattern can be implemented with Google Secret Manager and Workload Identity Federation, Azure Key Vault with managed identities, HashiCorp Vault dynamic credentials, AWS IAM/Secrets Manager, or an approved enterprise vault.

## No universal Customer Success token

Do not give the supervisor one token that can read every customer and write every system. Capabilities should be project-, customer-, purpose-, action-, and time-scoped. High-risk writes use separate publisher identities and payload-bound approvals.

## Customer communication credentials

Customer email or collaboration publication must use a governed sender identity, not a user's raw mailbox password. The approval must bind the exact recipient/account, channel, payload hash, and expiry.

## Logging

Audit logs record credential reference, capability, target, action, policy decision, approval identity, and result—never secret values.

See `config/secret-references.template.yaml`.
