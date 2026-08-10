# Implementation Roadmap

## Phase 0 — Decisions and inventory

Confirm projects, repositories, JDKs, frameworks, build systems, databases, messaging, CI/CD, vault, identity provider and production boundaries. Assign platform, security and Java architecture owners.

## Phase 1 — Read-only foundation

Implement identity, project registry, Bitbucket/Jira/Confluence reads, repository profiling, version-matched documentation, artifact storage, audit and policy decisions. Deliver story understanding and implementation plans without code execution.

## Phase 2 — Isolated coding workspace

Add ephemeral Git workspaces, JDK toolchains, Maven/Gradle wrappers, patch generation and deterministic compile/unit-test/static-analysis gates. No external writes.

## Phase 3 — Integration validation

Add Testcontainers, database metadata, OpenAPI diff, migration validation, messaging metadata, security scans, SBOM and container builds. Keep all target-system mutations disabled.

## Phase 4 — Approval-controlled publication

Add payload-bound approvals for commit, push, pull-request creation, Jira updates, Teams messages and pipeline triggers. Preserve branch protection and human review.

## Phase 5 — Non-production environment workflows

Enable narrowly scoped, reversible playground/QA test data, message publication and deployment requests through dedicated service identities and approvals.

## Phase 6 — Scale and optimization

Add evaluation suites, project-specific skills, cache optimization, parallel specialist reviews, cost controls, dashboards, incident drills and continuous policy testing.

## MVP success criteria

- Correctly profiles representative Maven and Gradle repositories
- Produces traceable plans and bounded patches
- Compiles and runs project tests reproducibly
- Cannot access raw secrets or production mutation capabilities
- Requires valid approval for every external write
- Produces complete evidence and audit records
- Demonstrates useful work on at least one PCC, SOP or DataBridge Java repository
