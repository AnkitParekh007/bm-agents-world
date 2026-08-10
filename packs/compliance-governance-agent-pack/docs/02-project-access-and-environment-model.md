# Project Access and Environment Model

## Purpose

The Compliance / Governance Agent operates across PCC, SOP, DataBridge, BM Agent Foundry and future portfolios, but access is granted per purpose, project, data class, framework and environment. The agent never receives a universal compliance credential.

## Access tiers

1. **Public/approved reference:** authoritative standards metadata, internal approved interpretations and policy references.
2. **Enterprise metadata:** repository metadata, architecture inventory, asset inventory, policy/control metadata and issue metadata.
3. **Restricted evidence:** audit logs, access-review records, vulnerability details, vendor reports, contractual obligation extracts, privacy inventories and AI governance evidence.
4. **Highly restricted records:** raw HR, customer, legal, investigation, credential, production-data or special-category records. These are not placed in normal model context and require a dedicated human-controlled workflow if genuinely necessary.

## Environment rules

- **Local / sandbox:** isolated control-test development with synthetic data.
- **Playground / QA:** read-only or explicitly approved deterministic testing; no hidden production credential reuse.
- **Production:** bounded, redacted, read-only evidence collection by trusted adapters. Mutations are converted into approved remediation/change requests and executed by the appropriate engineering or operations pack.

## Project profiles

- **PCC:** Angular 12 / Java; legacy-compatible evidence and change governance.
- **SOP:** Angular 15 / Java; standard engineering and release controls.
- **DataBridge:** AngularJS / Java and data integrations; conservative change, data and dependency governance.
- **BM Agent Foundry:** agent platform; additional AI governance, tool/MCP permissions, prompt/tool audit, tenant isolation and model/provider controls.

## Scope token

Every run must carry: `purpose + project + environment + framework_scope + data_class + allowed_operations + requester + expiry`.
