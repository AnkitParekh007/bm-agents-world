# Implementation Roadmap

## Phase 0 — Governance and inventory

Approve owners, data classifications, source boundaries, platforms, identities, contracts, quality policies, and production denials.

## Phase 1 — Read-only assistant

Enable Jira/Confluence, Bitbucket, catalog, lineage, documentation, and observability reads. Produce designs, mappings, contracts, and reviews only.

## Phase 2 — Isolated development

Enable local Spark, synthetic fixtures, unit tests, schema validation, quality checks, plan analysis, and package builds.

## Phase 3 — Playground pilot

Pilot one DataBridge batch pipeline with approved bounded sources, non-production writes, quality, reconciliation, and evidence.

## Phase 4 — QA and streaming

Add shared QA runs, scale tests, Structured Streaming recovery tests, contract publication, and lineage integration.

## Phase 5 — Release preparation

Enable approval-controlled commits, pull requests, artifacts, candidate-bound evidence, and production action bundles.

## Phase 6 — Governed operations

Allow deterministic systems to execute approved production releases and backfills. The agent remains read-only for verification and learning.

## Recommended MVP

`Jira story → repository/platform profile → source and contract analysis → PySpark batch implementation → unit/quality/reconciliation tests → Spark plan review → evidence bundle → human-approved PR`
