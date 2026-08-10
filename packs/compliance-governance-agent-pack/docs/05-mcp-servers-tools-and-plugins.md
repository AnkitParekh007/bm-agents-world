# MCP Servers, Tools and Plugins

## MCP servers

| ID | Integration | Purpose |
| --- | --- | --- |
| jira-confluence-mcp | Jira and Confluence | Read governance work, evidence references, policies and approved issue metadata; writes gated. |
| bitbucket-mcp | Bitbucket | Read repositories, pull requests, branches and policy files; write actions gated. |
| identity-governance-mcp | Identity Governance | Read users, groups, roles, access-review campaigns and entitlement metadata using least privilege. |
| cloud-inventory-mcp | Cloud Inventory | Read approved cloud asset, IAM, logging, encryption and configuration metadata. |
| kubernetes-governance-mcp | Kubernetes Governance | Read cluster policy, namespace, admission and workload metadata. |
| database-metadata-mcp | Database Metadata | Read catalog, roles, grants and approved aggregated evidence; no unrestricted row access. |
| siem-evidence-mcp | SIEM and Audit Logs | Run bounded read-only audit and compliance evidence queries. |
| vulnerability-mcp | Vulnerability Management | Read findings, remediation status and scanner evidence. |
| grc-platform-mcp | GRC Platform | Read controls, risks, evidence, audits, findings and mappings; controlled writes gated. |
| vendor-risk-mcp | Vendor Risk | Read approved vendor assessments, attestations and remediation status. |
| privacy-governance-mcp | Privacy Governance | Read processing inventory, DPIA metadata, rights-process evidence and approved data maps. |
| ai-governance-mcp | AI Governance | Read AI inventory, classifications, model/system documentation and approval records. |
| artifact-mcp | Governance Artifact Store | Read/write isolated evidence bundles, reports and drafts with immutable versions. |
| key-vault-mcp | Vault and Capability Broker | Issue short-lived scoped credentials to trusted adapters; never expose raw secret values to model. |
| policy-engine-mcp | OPA Policy Engine | Evaluate operation, project, environment, purpose, approval and data-access policy. |
| contract-repository-mcp | Contract Repository | Read approved extracted contractual obligations and clause metadata, not unrestricted legal files. |
| training-mcp | Training Platform | Read aggregate role-based training assignments and completion evidence; no employment scoring. |
| regulatory-library-mcp | Regulatory Library | Retrieve versioned authoritative framework references and organization-approved interpretations. |

## Deterministic plugins / adapters

| ID | Purpose |
| --- | --- |
| framework-mapper | Cross-framework mapping and deduplication |
| evidence-hasher | SHA-256 evidence manifest generation |
| schema-validator | JSON/YAML evidence schema validation |
| policy-linter | Policy metadata and lifecycle validation |
| control-tester | Deterministic control-test execution |
| access-review-analyzer | Access review and SoD analysis |
| retention-checker | Retention/deletion schedule checking |
| privacy-inventory-analyzer | Privacy processing inventory validation |
| ai-inventory-analyzer | AI inventory completeness and classification checks |
| vendor-evidence-parser | Extract approved metadata from vendor assurance evidence |
| soc-report-indexer | Index approved SOC report sections without reproducing restricted content |
| audit-log-query | Bounded audit-log querying |
| cloud-control-evaluator | Read-only cloud control posture checks |
| k8s-policy-evaluator | Read-only Kubernetes policy checks |
| db-grant-analyzer | Database role/grant review |
| finding-normalizer | Normalize findings across scanners and audits |
| risk-calculator | Approved risk matrix calculations |
| exception-expiry-monitor | Detect expiring exceptions |
| evidence-freshness-checker | Check evidence age against control frequency |
| metrics-calculator | Calculate aggregate governance metrics |
| document-redactor | Redact secrets/PII from evidence copies |
| report-builder | Generate management/audit evidence packs |

## Governance distinction

- **MCP servers** expose governed resources and tools from connected systems.
- **Tools** are atomic operations such as `read_control`, `query_audit_log`, `collect_evidence`, or `create_draft`.
- **Plugins/adapters** perform deterministic parsing, validation, hashing, calculation, scanning and redaction.
- **Skills** describe reusable capability and decision logic.
- **Artifacts** are versioned outputs with owners, evidence and approval state.

Model-controlled writes to Jira, Confluence, GRC, IAM, production systems or customer channels require policy checks and, where designated, payload-bound human approval.
