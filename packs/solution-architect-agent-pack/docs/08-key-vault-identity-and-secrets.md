# Key Vault, Identity, and Secrets

## Reference flow

`User identity -> Agent gateway -> Policy engine -> Capability broker -> Workload identity -> Vault/secret manager -> Trusted adapter -> Target system`

The model never receives raw credentials, private keys, database passwords, unrestricted kubeconfig, cloud access keys, vendor API secrets, or signing material.

Use separate workload identities for Atlassian read/write, Bitbucket read, architecture repository read/write, artifact append, database metadata, cloud/Kubernetes inventory, observability, security posture, cost data, and approval verification.

A capability lease binds run ID, requester, project, systems, environment, tool, action, resource selectors, classification, redaction profile, maximum calls, expiry, and payload hash when approval is required.

Production access is read-only, purpose-bound, redacted, time-limited, and independently auditable. Production mutations, secret-value reads, signing, IAM changes, and break-glass access are never delegated.
