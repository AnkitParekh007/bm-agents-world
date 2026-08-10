# Data Engineer / PySpark Agent Pack

A governed, implementation-ready package for building an AI Data Engineer / PySpark Agent that designs, implements, validates, releases, and operates data pipelines while preserving human authority over production data changes.

## What this pack contains

- **240 daily and periodic Data Engineer tasks**
- **27 supervisor and specialist agents**
- **240 reusable data-engineering skills**
- **18 MCP server definitions**
- **22 deterministic plugins and adapters**
- **28 artifact types**
- **5 governed workflows**
- **7 JSON output contracts**
- OPA policy, permission matrix, vault references, project profiles, and readiness checklists

## Primary use cases

1. Design data products, data contracts, source-to-target mappings, and pipeline architectures.
2. Build PySpark batch and Structured Streaming pipelines.
3. Implement ingestion, CDC, replay, deduplication, and late-data handling.
4. Manage governed lakehouse tables and schema evolution.
5. Create data quality, reconciliation, lineage, and observability controls.
6. Test and optimize Spark jobs using measured execution evidence.
7. Prepare safe backfill, repair, migration, and release plans.
8. Coordinate incident diagnosis and read-only production verification.

## Critical boundary

The free-form model is **bounded, redacted, and read-only in production**. It may prepare an exact immutable action request, but production pipeline execution, backfills, data repairs, schema changes, checkpoint changes, and destructive table maintenance belong to authorized deterministic systems or human operators.

## Main workflow

`Request → Authorization → Source and Contract Discovery → Architecture → Implementation → Tests and Quality → Performance and Security Review → Independent Review → Approval → Deterministic Execution → Read-only Verification → Evidence`

## Getting started

1. Complete `checklists/project-onboarding.md`.
2. Replace placeholders in the project, environment, and secret-reference templates.
3. Approve source, data classification, contract, quality, backfill, and production policies.
4. Deploy read-only catalog, repository, lineage, and observability connectors first.
5. Pilot with one bounded DataBridge batch pipeline in playground and QA.
6. Enable shared writes and production action requests only after independent safety evaluation.
