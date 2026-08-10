# Release Manager Agent Pack

A governed operating pack for an AI Release Manager that plans, validates, coordinates, communicates, and closes software and platform releases across PCC, SOP, DataBridge, BM Agent Foundry, and future projects.

## Pack summary

- 240 release-management tasks
- 27 supervisor and specialist agents
- 253 reusable skills
- 18 MCP server definitions
- 22 deterministic plugins and adapters
- 27 governed artifact types
- 5 executable workflows
- 7 JSON Schema contracts
- OPA policy-as-code
- Environment, project, permission, approval, and secret-reference templates

## Primary operating principle

The Release Manager Agent is a **decision-support and coordination system**, not a production superuser. It may prepare immutable release bundles, validate evidence, coordinate checkpoints, and request approved actions. It cannot approve its own release, accept residual risk, or directly mutate production.

## Core flow

Release request → scope and candidate identity → planning and dependencies → readiness evidence → change and approvals → human go/no-go → approved operator or deterministic pipeline → read-only validation → closure → learning.

## Start here

1. Read `docs/02-project-access-and-environment-model.md`.
2. Populate `config/project-registry.yaml` and `config/environment-inventory.template.yaml`.
3. Map real connectors in `config/mcp-registry.yaml`.
4. Replace secret references in `config/secret-references.template.yaml` with vault paths or workload identities—never secret values.
5. Review `config/approval-policies.yaml` and the OPA policy.
6. Onboard one low-risk release type in playground and QA before production use.

## Production boundary

Production deployment, rollback, database migration, infrastructure apply, feature-flag mutation, restart, configuration write, and secret operations are prohibited for the free-form model. These actions must be performed by an authorized human or deterministic, policy-gated pipeline using a payload-bound approval.
