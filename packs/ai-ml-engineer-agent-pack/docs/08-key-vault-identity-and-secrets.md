# Key Vault, Identity, and Secrets

## Credential path
`User identity -> Agent gateway -> Policy engine -> Capability broker -> Workload identity -> Vault/Secret Manager -> Trusted adapter -> Target system`

The language model receives logical capability references, not raw long-lived secrets. Hosted-model API keys, registry tokens, warehouse credentials, cloud credentials, signing keys, and production observability credentials stay inside trusted adapters.

## AI-specific controls
- Never place secrets in prompts, fine-tuning datasets, retrieval corpora, experiment tags, notebooks, or model cards.
- Use project-specific model-provider credentials and budgets.
- Separate training-data access from production-serving identity.
- Use short-lived credentials for compute jobs.
- Keep artifact signing and production promotion identities outside the agent runtime.
- Redact credentials and sensitive fields before traces or prompts are persisted.
