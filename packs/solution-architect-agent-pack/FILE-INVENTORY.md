# Solution Architect Agent Pack — File Inventory

Version: 1.0.0  
Generated: 2026-08-06  
Total files: 48

| # | File | Purpose |
|---:|---|---|
| 1 | `README.md` | Pack overview, operating model, boundaries, and quick start. |
| 2 | `FILE-INVENTORY.md` | Complete inventory of all files in this pack. |
| 3 | `SOURCES.md` | Official standards and research sources used for the architecture baseline. |
| 4 | `docs/01-solution-architect-daily-task-catalog.md` | Comprehensive daily task catalog for the Solution Architect Agent. |
| 5 | `docs/02-project-access-and-environment-model.md` | Project, system, repository, environment, data, and access model. |
| 6 | `docs/03-agent-and-subagent-architecture.md` | Supervisor and specialist agent architecture. |
| 7 | `docs/04-skills-catalog.md` | Human-readable registry of architecture skills. |
| 8 | `docs/05-mcp-servers-tools-and-plugins.md` | MCP, tool, plugin, and adapter architecture. |
| 9 | `docs/06-artifacts-and-knowledge-assets.md` | Architecture artifacts and governed knowledge assets. |
| 10 | `docs/07-orchestration-and-workflows.md` | Workflow states, delegation, convergence, and approvals. |
| 11 | `docs/08-key-vault-identity-and-secrets.md` | Workload identity, capability leases, vault, and secret boundaries. |
| 12 | `docs/09-permissions-approvals-and-guardrails.md` | Permission model, decision rights, approval controls, and prohibitions. |
| 13 | `docs/10-observability-audit-and-evaluation.md` | Telemetry, audit, evaluation, quality, and drift detection. |
| 14 | `docs/11-deployment-runtime-and-networking.md` | Runtime isolation, networking, execution, and deployment topology. |
| 15 | `docs/12-implementation-roadmap.md` | Phased implementation plan for the pack. |
| 16 | `docs/13-diagram-input-specification.md` | Source specification for architecture and end-to-end Mermaid diagrams. |
| 17 | `docs/14-research-and-standards-notes.md` | Application notes for architecture standards and frameworks. |
| 18 | `config/pack-manifest.yaml` | Machine-readable pack metadata and counts. |
| 19 | `config/agent-registry.yaml` | Supervisor and specialist agent registry. |
| 20 | `config/skill-registry.yaml` | Machine-readable architecture skill registry. |
| 21 | `config/mcp-registry.yaml` | Approved MCP server definitions and trust rules. |
| 22 | `config/plugin-registry.yaml` | Runtime plugin and adapter registry. |
| 23 | `config/artifact-registry.yaml` | Artifact types, classification, and immutability rules. |
| 24 | `config/project-registry.yaml` | PCC, SOP, DataBridge, and BM Agent Foundry profiles. |
| 25 | `config/environment-inventory.template.yaml` | Template for environment and system inventory. |
| 26 | `config/secret-references.template.yaml` | Secret-reference-only vault configuration template. |
| 27 | `config/approval-policies.yaml` | Payload-bound human approval policies. |
| 28 | `config/permission-matrix.csv` | Human-readable resource and operation permission matrix. |
| 29 | `workflows/story-to-solution-architecture.yaml` | End-to-end solution-architecture workflow. |
| 30 | `workflows/architecture-option-evaluation.yaml` | Architecture option and technology tradeoff workflow. |
| 31 | `workflows/integration-and-data-design.yaml` | API, event, integration, and data contract workflow. |
| 32 | `workflows/modernization-and-migration.yaml` | Legacy modernization and migration workflow. |
| 33 | `workflows/architecture-review-and-governance.yaml` | Independent review, decision, exception, and conformance workflow. |
| 34 | `schemas/architecture-context.schema.json` | Contract for normalized architecture context. |
| 35 | `schemas/quality-attribute-scenarios.schema.json` | Contract for measurable quality-attribute scenarios. |
| 36 | `schemas/architecture-option.schema.json` | Contract for option comparison and recommendation. |
| 37 | `schemas/architecture-decision-record.schema.json` | Contract for architecture decision records. |
| 38 | `schemas/integration-contract.schema.json` | Contract for API, event, message, and data integrations. |
| 39 | `schemas/architecture-review.schema.json` | Contract for independent architecture reviews. |
| 40 | `schemas/approval-request.schema.json` | Contract for immutable payload-bound approvals. |
| 41 | `templates/solution-architecture-document.md` | Reusable solution architecture document template. |
| 42 | `templates/architecture-decision-record.md` | Reusable ADR template. |
| 43 | `templates/architecture-review-report.md` | Reusable independent review template. |
| 44 | `templates/solution-architect-daily-summary.md` | Daily architecture status and decision summary template. |
| 45 | `templates/implementation-handoff.md` | Cross-role implementation handoff template. |
| 46 | `security/opa/solution-architect-agent-policy.rego` | OPA policy baseline for scope, approvals, secrets, and production safety. |
| 47 | `checklists/project-onboarding.md` | Checklist for onboarding a project or portfolio. |
| 48 | `checklists/mvp-readiness.md` | Checklist for enabling the Solution Architect Agent MVP. |

## Structural summary

| Area | Count |
|---|---:|
| Root documents | 3 |
| Architecture documents | 14 |
| Configuration and registries | 11 |
| Workflows | 5 |
| JSON schemas | 7 |
| Templates | 5 |
| Policy-as-code | 1 |
| Checklists | 2 |
| **Total** | **48** |
