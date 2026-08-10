# Agent and Sub-Agent Architecture

The Compliance / Governance Supervisor acts as an orchestrator, not as a legal authority, auditor-of-record or automatic risk owner. Specialist agents produce bounded analyses that are recombined into an evidence-backed governance decision package.

## Agent registry

| ID | Agent | Responsibility |
| --- | --- | --- |
| compliance-governance-supervisor | Compliance Governance Supervisor | Coordinates scoped governance work, delegates specialists, assembles evidence-backed recommendations, and enforces approvals. |
| regulatory-intelligence-agent | Regulatory Intelligence Agent | Tracks authoritative regulatory and standards changes and identifies potential applicability changes. |
| framework-scoping-agent | Framework Scoping Agent | Determines organizational, product, system, jurisdiction and customer scope. |
| policy-governance-agent | Policy Governance Agent | Maintains policy lifecycle, mapping, approvals, review dates and supersession. |
| control-library-agent | Control Library Agent | Maintains normalized controls, mappings, ownership, frequency and inheritance. |
| risk-management-agent | Risk Management Agent | Maintains evidence-backed risks, treatments, tolerances and expiry-aware acceptance requests. |
| audit-readiness-agent | Audit Readiness Agent | Plans audits, evidence requests, walkthroughs and closeout packages. |
| evidence-assurance-agent | Evidence Assurance Agent | Validates evidence provenance, freshness, completeness, redaction and chain of custody. |
| access-governance-agent | Access Governance Agent | Coordinates access reviews, SoD checks, privileged access evidence and identity governance. |
| privacy-governance-agent | Privacy Governance Agent | Coordinates privacy inventories, DPIAs, retention, data rights, consent and processor governance. |
| ai-governance-agent | AI Governance Agent | Maintains AI inventory, classification, transparency, oversight and AI-risk governance evidence. |
| third-party-risk-agent | Third Party Risk Agent | Coordinates vendor due diligence, reassessment, findings and contractual control evidence. |
| contractual-compliance-agent | Contractual Compliance Agent | Maps approved customer commitments to internal controls without making legal interpretations. |
| security-compliance-agent | Security Compliance Agent | Coordinates security control evidence with AppSec, DevSecOps, SRE and DevOps packs. |
| change-compliance-agent | Change Compliance Agent | Assesses control impacts of system, release, architecture, data and AI changes. |
| resilience-governance-agent | Resilience Governance Agent | Coordinates BCP, DR, backup, recovery and resilience control evidence. |
| data-governance-agent | Data Governance Agent | Coordinates classification, lineage, retention, ownership, quality and handling controls. |
| training-awareness-agent | Training and Awareness Agent | Coordinates role-based training requirements and aggregate completion evidence. |
| findings-remediation-agent | Findings and Remediation Agent | Normalizes findings and tracks corrective actions and independent validation. |
| exceptions-agent | Compliance Exceptions Agent | Prepares time-bound exception packages with compensating controls and expiry. |
| metrics-reporting-agent | Compliance Metrics Agent | Calculates bounded governance metrics and prepares management reporting with limitations. |
| customer-assurance-agent | Customer Assurance Agent | Prepares evidence-backed questionnaire and assurance responses for approval. |
| records-retention-agent | Records and Retention Agent | Coordinates evidence and governance record retention, legal-hold routing and deletion schedules. |
| compliance-automation-agent | Compliance Automation Agent | Designs deterministic evidence collection and control-testing automation without bypassing owners. |
| independent-assurance-agent | Independent Assurance Agent | Performs independent review of material compliance conclusions and closure recommendations. |
| governance-evidence-agent | Governance Evidence Agent | Creates immutable evidence manifests and audit trails for governance decisions. |
| policy-enforcement-agent | Policy Enforcement Agent | Evaluates requests against policy-as-code, approvals, environment and data-access constraints. |

## Delegation rules

- Framework or law changes route first to Regulatory Intelligence and Framework Scoping.
- Privacy matters require Privacy Governance; AI matters require AI Governance; security findings require Security Compliance.
- Material closure, risk acceptance or exceptions require Independent Assurance plus an accountable human decision.
- The agent that authored a material finding cannot be the sole validator of closure.
- Cross-pack remediation is delegated to the owning engineering pack; Compliance retains evidence and status tracking, not production write authority.
