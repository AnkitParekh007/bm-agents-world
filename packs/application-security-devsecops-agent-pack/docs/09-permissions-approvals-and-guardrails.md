# Permissions, Approvals, and Guardrails

## Safe autonomous actions

- Read approved project and security context
- Analyze source and configuration in isolated workers
- Run approved non-production scanners
- Generate threat models, requirements, findings, reports, and remediation drafts
- Verify hashes, signatures, schemas, SBOMs, and attestations
- Calculate configured severity and SLA values
- Store drafts and immutable evidence

## Approval-controlled actions

- Active DAST, fuzzing, or penetration testing
- Jira, Confluence, Teams, pull-request, or security-system writes
- Finding suppression or disposition that changes official state
- Security exception or waiver publication
- Customer, vendor, or coordinated-disclosure communication
- Secret rotation, credential revocation, artifact blocking, or production action requests
- Release-security gate publication

## Human-owned decisions

- Residual security, privacy, legal, or business risk acceptance
- Final production go/no-go
- Exception approval
- Public vulnerability disclosure timing and content
- Contractual, regulatory, customer, or SLA commitments

## Prohibited actions

- Production mutation by the free-form agent
- Unapproved active testing or exploit execution
- Denial-of-service, persistence, credential theft, or data exfiltration
- Disabling scanners, branch protections, admission policy, logging, or security gates
- Approving its own exception, suppression, or release recommendation
- Accessing raw secrets or private signing keys
- Deleting or altering audit evidence
- Fabricating findings, tests, approvals, exploitability, or affected scope
