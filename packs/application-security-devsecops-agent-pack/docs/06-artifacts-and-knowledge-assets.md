# Artifacts and Knowledge Assets

- **`security-context-packet`** — Authorized project, asset, architecture, repository, pipeline, environment, data, owner, and policy context.
- **`application-security-program-plan`** — Secure-SDLC scope, maturity baseline, roadmap, roles, controls, gates, training, metrics, and improvement backlog.
- **`security-requirements-catalog`** — Versioned, testable, traceable application-security and privacy requirements with owners and evidence.
- **`threat-model`** — Assets, actors, trust boundaries, data flows, threats, abuse cases, mitigations, residual risk, and validation.
- **`secure-architecture-review`** — Architecture findings, security decisions, trust assumptions, requirements, risks, and required controls.
- **`security-test-plan`** — Risk-based static, dynamic, dependency, API, fuzz, configuration, and manual security validation plan.
- **`sast-findings-report`** — Normalized static-analysis findings bound to source revision with evidence, confidence, severity, and remediation.
- **`sca-dependency-report`** — Dependency inventory, vulnerabilities, reachability, licenses, support status, upgrade options, and risk.
- **`secrets-findings-report`** — Redacted credential-exposure findings, containment status, affected history, rotation requests, and preventive actions.
- **`api-security-review`** — API authorization, authentication, validation, abuse, inventory, rate, integration, and evidence assessment.
- **`dast-assessment-report`** — Authorized target, configuration, tests, findings, evidence, false-positive analysis, and retest status.
- **`container-security-report`** — Image, Dockerfile, package, privilege, configuration, provenance, signature, and runtime-assumption findings.
- **`iac-security-report`** — Infrastructure-code findings, plan impact, policy evidence, exceptions, remediation, and verification.
- **`kubernetes-security-report`** — Manifest, RBAC, identity, network, secret, Pod Security, admission, and multitenancy findings.
- **`cloud-security-posture-report`** — Scoped cloud identity, network, storage, encryption, logging, public exposure, and service findings.
- **`ci-cd-security-review`** — Source-control, runner, token, secret, build, approval, artifact, and deployment-separation assessment.
- **`software-bill-of-materials`** — Machine-readable inventory of components, services, dependencies, versions, hashes, licenses, and suppliers.
- **`vulnerability-exploitability-exchange`** — Evidence-backed status and justification for vulnerabilities affecting a specific product or release.
- **`supply-chain-assurance-report`** — Source, build, artifact, provenance, signature, attestation, dependency-source, and verification evidence.
- **`vulnerability-triage-record`** — Finding identity, affected assets, CVSS, reachability, exploit status, KEV, exposure, risk, owner, SLA, and disposition.
- **`security-remediation-plan`** — Fix options, owner, milestones, backports, validation, rollout, rollback, communication, and residual risk.
- **`security-exception-request`** — Scoped exception, alternatives, business need, compensating controls, owner, expiry, review, and revocation triggers.
- **`security-gate-decision-pack`** — Candidate-bound findings, policy status, blockers, exceptions, evidence gaps, and human decision options.
- **`security-release-readiness-report`** — Release-specific security requirements, scans, SBOM, provenance, findings, exceptions, and readiness recommendation.
- **`product-security-incident-package`** — Affected versions, evidence, exposure, containment, remediation, disclosure inputs, and lessons learned.
- **`security-status-update`** — Audience-specific factual status, risk, completed work, blockers, decisions, and next actions.
- **`security-assurance-report`** — Independent assessment of evidence quality, control coverage, unsupported claims, and residual uncertainty.
- **`security-audit-evidence-bundle`** — Immutable reports, scans, hashes, tool versions, approvals, decisions, logs, and retention metadata.

## Artifact requirements

Every artifact includes owner, project, asset, environment, source revision or candidate hash, status, evidence references, data classification, redaction status, created time, expiry where applicable, and approval records.

Security artifacts must distinguish confirmed facts, scanner observations, analyst inference, assumptions, disputed findings, accepted exceptions, and human decisions. Sensitive vulnerability detail is shared only with the minimum necessary audience.
