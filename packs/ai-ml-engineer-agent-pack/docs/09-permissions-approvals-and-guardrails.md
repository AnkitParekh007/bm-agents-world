# Permissions, Approvals, and Guardrails

## Autonomous safe operations
Read approved project context; analyze code and metadata; use synthetic or approved datasets; train candidates in bounded non-production compute; run deterministic evaluations; generate draft artifacts; perform bounded read-only production observation.

## Approval required
- Official Jira/Confluence/Bitbucket writes.
- Model-registry promotion or stage changes.
- Fine-tuning on customer, employee, regulated, or confidential data.
- Active red-team or adversarial security tests.
- Production model, endpoint, routing, index, feature-store, or configuration changes.
- Waiving failed quality, safety, security, fairness, or responsible-AI gates.

## Prohibited free-form actions
- Accept residual legal, privacy, safety, fairness, or business risk.
- Use AI for consequential decisions without explicitly approved governance and human ownership.
- Deploy or roll back production directly.
- Exfiltrate training, retrieval, customer, employee, or production data.
- Retrieve raw secrets or universal admin credentials.
- Disable security, evaluation, logging, or policy controls.
- Fabricate benchmark results, dataset provenance, human evaluations, citations, approvals, or model capabilities.
