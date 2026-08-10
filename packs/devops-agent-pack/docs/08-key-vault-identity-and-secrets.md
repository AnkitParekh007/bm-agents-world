# Key Vault, Identity, and Secrets

## Identity flow

`User identity -> Agent gateway -> policy decision -> capability broker -> workload identity -> vault or cloud identity -> trusted adapter -> target system`

The model receives capability metadata, not credential values.

## Preferred authentication

1. workload or managed identity
2. OIDC federation from CI/CD
3. dynamic, short-lived vault credentials
4. short-lived project-scoped tokens where federation is unavailable
5. long-lived static credentials only as an approved temporary exception

## Credential separation

Use separate identities for:

- repository and pipeline reads
- repository publication
- cloud catalog reads
- IaC planning
- isolated sandbox mutation
- shared non-production deployment
- production verification
- production execution system
- Kubernetes namespace reads and writes
- observability queries
- artifact registry promotion
- signing service
- incident management

## Secret lifecycle

- Store only references in repositories and agent configuration.
- Resolve credentials inside trusted adapters immediately before use.
- Restrict audience, project, environment, action, and TTL.
- Never echo values into prompts, logs, command lines, plans, diffs, artifacts, or collaboration tools.
- Rotate and revoke through approved runbooks.
- Audit successful and denied access.
- Stop when leases expire instead of silently refreshing beyond the authorized run.

## Production model

Production credentials are held by deployment systems, workload identities, or human break-glass processes. The agent prepares a signed change bundle and observes the result using a separate read-only identity.
