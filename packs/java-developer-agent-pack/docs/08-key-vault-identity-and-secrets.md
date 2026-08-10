# Key Vault, Identity and Secrets

## Non-negotiable rule

The language model and its conversation context must never receive raw Bitbucket tokens, database passwords, broker credentials, signing keys, private keys, client secrets or vault values.

## Reference architecture

`User identity -> Agent gateway -> Policy engine -> Capability broker -> Workload identity -> Secret manager -> Trusted adapter -> Target system`

The adapter consumes the secret inside a protected process and returns sanitized structured results.

## Secret reference format

A reference identifies provider, path or resource name, intended adapter, environment, rotation owner and allowed use. It contains no secret value. The template in `config/secret-references.template.yaml` demonstrates the expected structure.

## Workload identity

Prefer managed/workload identities, OIDC federation and short-lived database or cloud credentials. Avoid service-account key files and shared personal tokens. Where Bitbucket or an enterprise system requires a static token, keep it only in the vault and expose it exclusively to the scoped adapter.

## Capability leases

A lease includes:

- run and step ID
- requesting agent and adapter
- target project/repository/environment
- allowed operation and resource
- payload hash or query template
- maximum calls and data volume
- issuance and expiry
- approval reference when required

## Java-specific secrets

- Private Maven repository credentials
- Artifact-signing keys and certificates
- Database and migration credentials
- Kafka/JMS/RabbitMQ credentials and schema-registry tokens
- OAuth client credentials, truststores and keystores
- Observability and APM tokens
- Container registry and deployment credentials

Signing keys, production keystores and production database mutation credentials are not available to the autonomous development agent.

## Secret scanning and redaction

Workspace patches, build logs, test reports, stack traces and collaboration drafts are scanned before storage or publication. Detected secrets stop the workflow, quarantine the artifact and create a security event without repeating the value.

## Rotation and revocation

All credential use is attributable to a workload identity. Leases expire automatically; adapters revoke cached sessions at run completion. Vault administrators can revoke a project, adapter or credential class without changing prompts or agent definitions.
