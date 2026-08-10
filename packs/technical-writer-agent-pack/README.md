# Technical Writer Agent Pack

A governed operating pack for an AI Technical Writer that plans, creates, validates, reviews, publishes, and maintains product, developer, API, operational, support, and release documentation across PCC, SOP, DataBridge, BM Agent Foundry, and future projects.

## Pack summary

- 238 technical-writing tasks
- 27 supervisor and specialist agents
- 224 reusable skills
- 18 MCP server definitions
- 22 deterministic plugins and adapters
- 28 governed artifact types
- 5 executable workflows
- 7 JSON Schema contracts
- OPA policy-as-code
- Environment, project, permission, approval, and secret-reference templates

## Primary operating principle

The Technical Writer Agent is an evidence-grounded authoring and documentation-operations system. It can create isolated drafts, run deterministic validation, coordinate reviews, and prepare immutable publication bundles. It cannot invent product behavior, expose sensitive data, publish customer-facing content without approval, or mutate production systems.

## Core flow

Documentation request → authorization → audience and source discovery → content strategy and plan → authoring → deterministic validation → independent factual and accessibility review → payload-bound approval → publication by approved connector → analytics and maintenance.

## Start here

1. Read `docs/02-project-access-and-environment-model.md`.
2. Populate `config/project-registry.yaml` and `config/environment-inventory.template.yaml`.
3. Map real connectors in `config/mcp-registry.yaml`.
4. Replace secret references with vault paths or workload identities—never raw secret values.
5. Select project-specific style, terminology, content models, and publishing targets.
6. Onboard one internal documentation collection before enabling public publication.

## Publication boundary

Public or customer-facing publication, release-note publication, official support-knowledge publication, shared glossary changes, localization handoff, Jira/Confluence/Teams writes, and documentation pull-request creation are approval-controlled. Production application, infrastructure, database, IAM, configuration, and secret mutations are prohibited.
