# Diagram Input Specification

The future Mermaid architecture should include these layers:

1. Human roles: Compliance Owner, Control Owner, Risk Owner, Legal/Privacy, Security, Internal Audit, Executive Governance Committee.
2. Compliance / Governance Supervisor.
3. Specialist agents grouped into Framework & Policy, Risk & Assurance, Privacy & AI, Access & Third Party, Automation & Evidence.
4. Policy Engine and Capability Broker.
5. MCP/adapters: Jira/Confluence, GRC, IAM, cloud, SIEM, vulnerability, database metadata, privacy, AI inventory, vendor risk, regulatory library.
6. Artifact/evidence store.
7. Cross-pack remediation agents.
8. Human approval gates and independent review.

The execution-flow diagram should show:

`Trigger → scope authorization → applicable obligations → evidence plan → parallel evidence collection → control assessment → risk/finding decision → independent review → human approval → remediation delegation → verification → closure recommendation → immutable audit trail`.

Use different node styles for read-only operations, deterministic checks, model reasoning, human decisions, write operations and prohibited production mutations.
