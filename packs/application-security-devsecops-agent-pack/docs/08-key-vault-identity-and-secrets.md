# Key Vault, Identity, and Secrets

## Principle

The language model never receives secret values. Trusted adapters obtain short-lived credentials after policy evaluation.

## Identity classes

- Context readers for Jira, Confluence, repositories, packages, and architecture
- Isolated scanner workers for SAST, SCA, secrets, DAST, fuzzing, IaC, and images
- Read-only cloud, Kubernetes, registry, and observability identities
- Evidence writers for the security artifact store
- Approval-controlled ticket, pull-request, and documentation publishers
- Human or deterministic production operators outside the free-form agent

## Credential flow

`Agent request → scope and policy validation → workload identity → vault or cloud credential broker → adapter-side injection → target → immediate revocation or expiry`

## Secret handling

- Never store passwords, tokens, cookies, private keys, signing keys, or connection strings in prompts or artifacts.
- Redact secret findings before the model sees context.
- Preserve only detector type, fingerprint, location, exposure window, status, and evidence reference.
- Rotation, revocation, and history cleanup are separate approved workflows.
- Artifact signing occurs in a protected signing service; the agent may request and verify signatures but never access signing keys.

## Vault options

The templates support HashiCorp Vault, Azure Key Vault, Google Secret Manager, AWS Secrets Manager, or an enterprise broker. Use workload identity and dynamic or short-lived credentials where the platform supports them.
