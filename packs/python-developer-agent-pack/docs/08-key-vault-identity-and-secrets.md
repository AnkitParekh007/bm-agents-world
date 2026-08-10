# Key Vault, Identity, and Secrets

## 1. Non-negotiable rule

The model and agent prompt never receive raw secret values. Credentials are resolved and injected inside a trusted adapter only for the duration and scope of an approved tool call.

## 2. Reference architecture

`Human/Service Identity -> Agent Gateway -> Policy Engine -> Capability Broker -> Workload Identity -> Secret Manager/Vault -> Tool Adapter -> Target System`

The adapter returns redacted data and destroys credentials after use.

## 3. Identity design

Use separate workload identities for orchestration, Bitbucket read, approved Bitbucket write, Jira read/write, database schema read, diagnostic read replica, QA test data, package-index read, artifact write, CI read/trigger, observability read, and collaboration publish. Do not share a universal bot account.

## 4. Secret references

Configuration contains references only, such as `vault://python-agents/pcc/qa/postgres-diagnostic`, not values. Each reference records owner, target system, environment, allowed operations, rotation policy, expiry, and break-glass procedure.

## 5. Capability leases

A lease binds run ID, requester, project, repository, Jira item, environment, tool, operation, resource, payload hash, maximum uses, and expiry. Leases are short-lived, non-transferable, auditable, and revocable. A lease for reading pipeline logs cannot be reused to trigger a deployment.

## 6. Database credentials

Prefer dynamic database credentials with short TTL and role-level statement controls. Production access should use approved read replicas or views. Write-capable migration credentials are held by deployment automation outside the language-model runtime.

## 7. Local development and CI

Never commit `.env`, credentials, tokens, service-account files, private keys, or copied production configuration. CI obtains identity through workload federation or managed identity. Secret scanning runs before publication and in the central repository.

## 8. Incident response

On suspected exposure: stop the run, revoke leases and tokens, quarantine artifacts, rotate affected credentials, inspect audit logs, notify security, and create a sanitized incident record. The agent must not attempt to conceal or independently remediate credential exposure.
