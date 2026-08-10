# Project Access and Environment Model

## 1. Scope hierarchy

Every run must resolve and pin:

`organization -> business project -> repository -> branch -> base commit -> component -> Python profile -> target environment -> Jira item -> requester`

A run cannot widen its scope after authorization. Repository, database, queue, and environment access are independent grants.

## 2. Required project inventory

Each Python repository record should contain:

- Bitbucket workspace/project/repository and default branch
- branch protections, code owners, merge strategy, and signed-commit policy
- Python version range and operating-system/platform matrix
- application profile: API, Django app, CLI, worker, data pipeline, library, or MCP server
- dependency manager, lockfiles, private package sources, and trusted indexes
- framework, ORM, migration tool, queue, cache, scheduler, and external integrations
- local setup, test, lint, type-check, security, build, package, and container commands
- protected files and generated-code paths
- database schemas and approved read-only roles
- playground, QA, staging, and production endpoints
- CI/CD, artifact, observability, and secret-manager references
- data classification, retention, residency, and audit requirements

## 3. Repository access

Default repository capabilities are read-only: clone, fetch, inspect branches, read diffs, read pull requests, and read pipeline results. Workspace writes are limited to an ephemeral clone and authorized paths. Commit, push, PR creation/update, tag creation, and pipeline triggers require explicit approval. Force push, history rewriting, merge, branch-protection changes, and credential-file edits are prohibited.

## 4. Database access

Database access uses purpose-specific identities:

- schema-reader: metadata and migration history
- diagnostic-reader: bounded SELECT/EXPLAIN against approved schemas and views
- test-data identity: playground or QA only, approved datasets and cleanup routines
- migration executor: external human-controlled deployment identity

The agent must not receive a universal database account. Production defaults to metadata and approved read replicas; direct production writes are prohibited.

## 5. Queue, cache, storage, and external systems

Adapters expose narrow operations such as queue metadata, dead-letter inspection, cache-key metadata, object metadata, or test-bucket access. Message publishing, queue purging, cache invalidation, object deletion, and external API mutations require approval and are normally restricted to non-production.

## 6. Environment tiers

| Tier | Default agent mode | Allowed examples | Restricted examples |
|---|---|---|---|
| Local sandbox | Read/write in ephemeral workspace | edit, format, lint, type-check, unit test, build | host filesystem outside workspace |
| Playground | Bounded test mode | deploy preview through approved pipeline, create synthetic data, integration tests | shared destructive operations |
| QA/staging | Controlled validation | read configuration, approved test data, smoke/integration tests | unapproved resets and broad mutations |
| Production | Observe and advise | read deployment metadata, logs/metrics/traces, approved read replica | code deploy, secret changes, DB writes, queue mutations |

## 7. Network policy

Each run receives an explicit egress allowlist. Package downloads are allowed only from approved indexes and mirrors. Unknown domains, arbitrary URL fetching, metadata-service access, and unrestricted callbacks are blocked. Webhook tests use organization-owned test endpoints.

## 8. Workspace isolation

Use a disposable container or VM, non-root user, resource quotas, read-only base image, separate working directory, command timeout, process limit, and no host socket mounting. Destroy the workspace after evidence is retained and secrets are revoked.
