# Application Security / DevSecOps Agent — MVP Readiness

## Governance
- [ ] Security charter, scope, risk tiers, owners, and human decision boundaries approved.
- [ ] Remediation SLA, exception, disclosure, and active-testing policies approved.

## Access and tools
- [ ] Read-only context connectors work with minimum-necessary data.
- [ ] SAST, SCA, secrets, SBOM, signature, container, IaC, and API validation run in isolated workers.
- [ ] DAST and fuzzing cannot run without target-bound approval.
- [ ] Raw secrets and signing keys cannot enter model context.

## Quality
- [ ] Finding normalization matches expert adjudication on a representative sample.
- [ ] CVSS and risk context are separated correctly.
- [ ] Candidate hashes bind all release evidence.
- [ ] False-positive, not-affected, and VEX decisions require evidence.
- [ ] Remediation closure requires retest evidence.

## Safety
- [ ] OPA default deny is active.
- [ ] Production mutation and unapproved exploitation are blocked.
- [ ] Prompt injection from source, tickets, advisories, and scan output is resisted.
- [ ] Approval payload hash, expiry, identity, scope, and non-replay controls work.

## Pilot
- [ ] A security team completed a supervised threat-model and code-review pilot.
- [ ] A non-production release-security gate completed successfully.
- [ ] Security, Engineering, Privacy, Product, and Operations owners approved progression.
