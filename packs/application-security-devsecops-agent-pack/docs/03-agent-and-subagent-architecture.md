# Agent and Sub-Agent Architecture

## Supervisor

The `application-security-devsecops-supervisor` decomposes a request, authorizes scope, delegates independent specialist analysis, converges evidence, requests human decisions, and preserves the final audit trail.

## Specialist agents

- **`security-context-agent`** — Retrieves approved product, architecture, repository, dependency, pipeline, environment, data-classification, incident, and security-policy context.
- **`secure-sdlc-governance-agent`** — Maps the organization secure-development program to SSDF, SAMM, internal policy, roles, gates, training, and measurable improvement.
- **`security-requirements-agent`** — Derives versioned, testable application-security requirements from risk, data, architecture, ASVS, API, mobile, privacy, and organizational controls.
- **`threat-modeling-agent`** — Models assets, trust boundaries, entry points, threats, abuse cases, mitigations, residual risk, and validation needs.
- **`secure-architecture-agent`** — Reviews authentication, authorization, cryptography, secrets, tenancy, integrations, data flows, resilience, and security boundaries.
- **`secure-code-review-agent`** — Performs evidence-backed security review of focused code changes and validates remediation quality without replacing deterministic scanners.
- **`sast-agent`** — Configures, runs, normalizes, deduplicates, and interprets static-analysis findings against the exact source revision.
- **`sca-dependency-agent`** — Inventories dependencies, vulnerabilities, licenses, reachability, transitive risk, upgrade paths, and unsupported components.
- **`secrets-security-agent`** — Detects exposed secrets, classifies exposure, coordinates containment, rotation requests, history cleanup, and preventive controls.
- **`api-security-agent`** — Reviews REST, GraphQL, event, webhook, and service APIs for authorization, authentication, validation, abuse, inventory, and unsafe consumption risks.
- **`client-application-security-agent`** — Reviews Angular, browser, desktop, and mobile-client security including storage, transport, sessions, CSP, permissions, and tamper resistance.
- **`iac-security-agent`** — Scans Terraform, OpenTofu, CloudFormation, Bicep, Helm, and configuration code for policy, exposure, encryption, identity, and drift risks.
- **`container-image-security-agent`** — Reviews Dockerfiles, base images, packages, image configuration, privileges, signatures, attestations, and runtime assumptions.
- **`kubernetes-security-agent`** — Reviews manifests, Helm, admission policy, workload identity, network policy, secrets, RBAC, Pod Security, and multitenancy controls.
- **`cloud-platform-security-agent`** — Reviews cloud IAM, networks, storage, encryption, logging, managed services, posture findings, and service-control boundaries.
- **`ci-cd-security-agent`** — Reviews build isolation, branch protection, runner trust, token scope, secret handling, approvals, artifact flow, and deployment separation.
- **`supply-chain-provenance-agent`** — Validates source integrity, trusted builds, provenance, signatures, attestations, dependency sources, and artifact verification using SLSA-aligned controls.
- **`sbom-vex-agent`** — Generates and validates SBOMs, maps vulnerabilities to components, and produces evidence-backed VEX status without suppressing unknown risk.
- **`vulnerability-triage-agent`** — Combines technical severity, exploitability, exposure, reachability, asset criticality, KEV intelligence, compensating controls, and business impact.
- **`remediation-coordination-agent`** — Creates remediation options, owners, SLAs, verification plans, backport strategy, rollout constraints, and escalation paths.
- **`dast-and-penetration-agent`** — Plans and runs authorized, rate-limited DAST and penetration-test activities in isolated or explicitly approved targets.
- **`product-security-incident-agent`** — Coordinates application-security incident evidence, containment recommendations, affected-version analysis, disclosure inputs, and lessons learned.
- **`security-exception-agent`** — Prepares time-bound, scoped exception requests with alternatives, compensating controls, owners, expiry, and verification requirements.
- **`security-assurance-reviewer-agent`** — Independently reviews security claims, findings, gates, exceptions, evidence, unsupported conclusions, and separation of duties.
- **`evidence-management-agent`** — Creates redacted, attributable, immutable security evidence bundles with source revisions, tool versions, approvals, and retention metadata.
- **`policy-enforcer-agent`** — Evaluates authorization, target scope, data minimization, scan safety, approvals, production boundaries, and prohibited actions.

## Separation of duties

- The authoring or implementation agent cannot approve its own finding suppression, exception, release gate, or residual risk.
- Scanner output is evidence, not a final decision.
- Security findings require reproducible evidence and affected-version identity.
- Risk acceptance belongs to an accountable human Business/Product owner with Security review.
- Production operations belong to authorized operators or deterministic deployment systems.

## Cross-pack delegation

The supervisor delegates domain work to Product Manager, Product Owner, Business Analyst, UX, Solution Architect, Engineering Leadership, Angular, Java, Python, Database, QA, DevOps, Release, Support, Scrum Master, and Technical Writer packs. The security pack provides independent controls and assurance rather than replacing those roles.
