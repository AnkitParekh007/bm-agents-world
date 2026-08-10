# Key Vault, Identity, and Secrets

## Principle

The language model never receives raw credentials. Trusted adapters consume short-lived capabilities.

## Identity separation

- Jira / Confluence read identity
- Jira / Confluence approved-write identity
- Calendar scheduling identity
- Teams approved-post identity
- Aggregated metrics read identity
- Artifact-store identity
- Policy and approval service identity

## Capability lease

Each lease binds to actor, project, team, connector, action, resource, payload hash when applicable, audience, expiry, and nonce. Leases are short-lived and non-replayable.

## Supported vaults

Use the organization standard: Azure Key Vault with managed identity, Google Secret Manager with workload identity federation, HashiCorp Vault with workload identity, or an equivalent enterprise broker.

## Prohibited patterns

- Credentials in prompts, YAML, source control, logs, screenshots, or artifacts
- Shared universal tokens
- Production administrator credentials
- Long-lived personal access tokens when workload identity is available
- Returning raw secret values from MCP tools
