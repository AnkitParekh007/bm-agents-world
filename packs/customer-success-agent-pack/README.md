# Customer Success Agent Pack

Version: 1.0.0  
Status: Architecture and implementation baseline  
Primary profile: Customer Success Manager / Customer Success Operations / Strategic Customer Success  
Organization context: CRM, optional Gainsight or equivalent CS platform, Jira/Confluence, Bitbucket, product analytics, support and incident systems, releases, product documentation, Microsoft Teams/email/calendar, customer feedback, playground/QA/production environments, Angular/Java/Python applications, databases, and governed AI-agent platforms.

## Purpose

This pack defines the access, skills, agents, MCP servers, deterministic tools, plugins, artifacts, orchestration, key-vault integration, approvals, evaluation, and runtime controls required for an enterprise Customer Success Agent.

It supports account context, lifecycle segmentation, onboarding, success planning, stakeholder management, adoption, customer health, risk recovery, value realization, QBR/EBR preparation, renewal and expansion readiness, Support and incident coordination, Voice of Customer, enablement, communications, advocacy, digital Customer Success, Customer Success Operations, analytics, privacy, and continuous improvement.

## Core design rule

The agent helps customers achieve documented outcomes but does not own commercial, contractual, legal, or production authority. Every run is bound to:

`organization -> project -> customer/account -> lifecycle stage -> account owner -> purpose -> evidence sources -> environment -> allowed tools -> artifacts -> approvals -> expiration`

## Recommended first implementation

1. User selects project, customer/account, lifecycle purpose, and workflow.
2. Policy resolves authorized account scope, minimum-necessary fields, customer-contact rights, and environment.
3. Supervisor assembles a bounded Customer 360 from CRM/CS, Support, product usage, releases, and documentation.
4. Specialists produce onboarding, success-plan, health/risk, value, business-review, or renewal-readiness artifacts.
5. Independent reviewer challenges evidence, customer claims, health logic, privacy, and commitment language.
6. Human approves customer communications and official system updates.
7. Deterministic adapters publish the approved payload and preserve an audit record.

## Pack facts

- **240 daily and periodic tasks**
- **27 supervisor and specialist agents**
- **240 reusable skills**
- **18 MCP server definitions**
- **22 deterministic plugins/adapters**
- **28 artifact types**
- **5 machine-readable workflows**
- **7 JSON output contracts**
- **15 YAML configuration/workflow files**

## Human-owned boundaries

The agent cannot make pricing or discount commitments, negotiate contracts, approve renewals or expansions, grant credits/refunds, alter entitlements, make legal/SLA promises, contact customers without approval, use protected traits for customer scoring, or mutate production systems.

## Pack structure

| Path | Purpose |
|---|---|
| `docs/` | Human-readable architecture and operating model |
| `config/` | Registries, permissions, environments, projects, and secrets templates |
| `workflows/` | Machine-readable Customer Success workflows |
| `schemas/` | JSON contracts for structured outputs |
| `templates/` | Reusable Customer Success artifacts |
| `security/opa/` | Policy-as-code baseline |
| `checklists/` | Project onboarding and MVP readiness |
