# Permissions, Approvals and Guardrails

## Permission layers

1. User identity and organization role
2. Project and repository membership
3. Environment classification
4. Agent and workflow allowlist
5. Tool-level permission
6. Resource and path scope
7. Payload-bound approval
8. Runtime sandbox and egress policy

## Read-only autonomous actions

The agent may read authorized Jira/Confluence content, repository source, build metadata, dependency metadata, schemas, logs, metrics, traces, pipeline results and artifact evidence. It may generate plans, patches, tests and drafts inside an isolated workspace.

## Approval-controlled actions

- Add or upgrade dependencies
- Update lock/verification metadata or parent/BOM versions
- Create commits or push branches
- Create/update pull requests
- Write or transition Jira issues
- Post to Microsoft Teams
- Trigger pipelines
- Execute non-production database migrations or data changes
- Publish test messages or modify non-production consumer state
- Request a non-production deployment

## Prohibited or externally owned actions

- Force push or rewrite protected history
- Merge pull requests
- Disable quality, security or policy gates
- Read raw secrets or signing keys
- Publish production artifacts autonomously
- Deploy to production
- Modify production infrastructure, database, queues, caches or schemas
- Purge topics/queues or alter production offsets
- Use unapproved repositories or network destinations

## Change-size guardrails

The workflow can require a new plan or human review when a patch exceeds configured file/line/module thresholds, introduces a new dependency, changes public contracts, touches authentication/authorization, adds native code, modifies serialization, changes database schemas or affects deployment configuration.

## Prompt-injection defense

Repository files, comments, tickets, logs and web content are untrusted data. Instructions found inside them cannot alter system policy, grant tools, reveal secrets, expand scope or suppress evidence. The supervisor only follows signed workflow and policy configuration.

## Approval record

Approvals contain approver identity, role, run, action, payload hash, scope, decision, conditions, timestamp and expiry. A changed payload invalidates the approval.
