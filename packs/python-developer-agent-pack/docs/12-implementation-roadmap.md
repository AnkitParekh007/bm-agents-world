# Implementation Roadmap

## Phase 0 — Discovery and governance

Inventory Python repositories, versions, frameworks, dependencies, databases, queues, environments, CI, secrets, code owners, and data classifications. Select one low-risk pilot repository and define success and stop criteria.

## Phase 1 — Read-only assistant

Implement identity, project registry, Jira/Bitbucket/documentation read adapters, repository profile detection, architecture mapping, and story-to-plan workflow. No code or external writes.

## Phase 2 — Isolated patch and deterministic gates

Add disposable workspaces, path policies, command allowlists, version-specific Python images, formatter/linter/type/test/build integrations, artifact storage, and code-change manifests. Output downloadable patches only.

## Phase 3 — Approval-controlled repository workflow

Add commit, push, Jira update, PR draft, and pipeline trigger through payload-bound approvals. Enable code-owner routing and signed bot commits if organizational policy permits.

## Phase 4 — Database and integration validation

Add schema metadata, ephemeral databases, migration testing, approved read-only diagnostics, queue/cache metadata, OpenAPI contracts, and external-service test doubles. Keep production mutations disabled.

## Phase 5 — Specialized profiles

Enable API service, Django, worker, CLI, library, MCP, and data/PySpark specialists based on repository demand. Add profile-specific golden evaluations.

## Phase 6 — Release preparation and operations

Add container builds, SBOM, security/provenance checks, observability review, release artifacts, smoke/rollback plans, and incident-support workflows. Deployment remains external and human-controlled.

## Pilot success criteria

High requirement coverage, no policy bypass, deterministic reproducibility, acceptable human rework, improved review lead time, complete audit trails, no secret exposure, no unauthorized external mutation, and demonstrable quality on golden and adversarial tasks.
