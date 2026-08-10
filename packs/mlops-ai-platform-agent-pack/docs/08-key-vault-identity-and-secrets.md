# Key Vault, Identity and Secrets

## Principle

The language model never receives raw credentials. Identity is workload-based, short-lived and scoped to the run.

## Flow

**User identity → Agent Gateway → OPA/policy → Capability Broker → Workload Identity → Vault/Cloud IAM → Trusted Adapter → Target service**

## Credential classes

Separate identities are used for tracking, registry, pipeline compilation, non-production execution, bounded production reads, artifact registry, model gateway, vector/feature services, GPU telemetry and observability.

## Forbidden patterns

- Static kubeconfig in prompt/context
- Provider API keys in agent memory
- Registry passwords in YAML
- Cloud service-account JSON keys
- Shared production admin tokens
- Artifact-signing private keys exposed to the model
- Customer credentials or session tokens
