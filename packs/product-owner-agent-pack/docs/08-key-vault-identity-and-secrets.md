# Product Owner Agent — Key Vault, Identity, and Secrets

## Principle

The language model never receives raw credentials. Trusted adapters consume short-lived capabilities issued to workload identities.

## Access path

**Human identity → Agent Gateway → OPA policy → Capability Broker → Workload Identity → Vault/Secret Manager → Trusted Adapter → Target system**

## Identity separation

Use separate identities for Jira read, Jira approved write, Confluence read, Confluence approved publish, analytics read, research-summary read, artifact write, Teams approved post, and policy/approval operations. Separate all identities by project and environment.

## Lease controls

Capabilities are purpose-bound, project-bound, environment-bound, tool-bound, action-bound, short-lived, non-exportable, revocable, and fully audited. Approval-required capabilities include the exact payload hash.

## Prohibitions

No personal access tokens in prompts, repositories, logs, artifacts, or environment templates. No shared universal Product Owner account. No production credentials. No secret retrieval tool available to the model.
