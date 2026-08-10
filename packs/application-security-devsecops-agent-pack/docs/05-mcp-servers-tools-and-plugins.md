# MCP Servers, Tools, and Plugins

## MCP server registry

- **`atlassian-security-context-mcp`** — Jira and Confluence read access plus approval-controlled security findings, exceptions, and remediation updates. Mode: `mixed`.
- **`bitbucket-security-mcp`** — Read repositories, branches, commits, pull requests, permissions, and pipelines; protected writes require approval. Mode: `mixed`.
- **`source-code-intelligence-mcp`** — Read-only symbols, data flows, frameworks, dependencies, configuration, and test context from approved repositories. Mode: `read-only`.
- **`ci-cd-security-mcp`** — Read pipeline definitions, runs, runner metadata, gates, artifacts, and approvals; protected changes require approval. Mode: `mixed`.
- **`security-scanner-mcp`** — Broker approved SAST, SCA, secrets, license, and policy scanners in isolated workers. Mode: `isolated-execution`.
- **`api-contract-security-mcp`** — Read and validate OpenAPI, AsyncAPI, GraphQL, and service contracts against security requirements. Mode: `read-only`.
- **`dast-browser-security-mcp`** — Run authorized, rate-limited browser, API, DAST, and fuzzing checks against approved targets. Mode: `isolated-execution`.
- **`container-registry-security-mcp`** — Read image metadata, digests, packages, vulnerabilities, signatures, attestations, and registry policy. Mode: `read-only`.
- **`iac-policy-mcp`** — Validate infrastructure code, plans, Helm, cloud templates, and organization policy before apply. Mode: `isolated-execution`.
- **`kubernetes-security-mcp`** — Read approved cluster and manifest security metadata; no free-form production mutation. Mode: `read-only`.
- **`cloud-security-posture-mcp`** — Read scoped cloud IAM, posture findings, network, storage, logging, and encryption metadata. Mode: `read-only`.
- **`sbom-provenance-mcp`** — Generate, store, validate, and verify SBOMs, VEX, provenance, signatures, and attestations. Mode: `mixed`.
- **`vulnerability-intelligence-mcp`** — Read CVE, CVSS, KEV, vendor advisory, exploit, fix, and end-of-support intelligence. Mode: `read-only`.
- **`security-observability-mcp`** — Read redacted, bounded WAF, identity, audit, application, cloud, and runtime security telemetry. Mode: `read-only`.
- **`security-ticket-and-exception-mcp`** — Manage draft findings, remediation, exception, disclosure, and verification records with approval-controlled writes. Mode: `mixed`.
- **`artifact-and-evidence-mcp`** — Store versioned threat models, reports, scan results, decision packs, and immutable evidence bundles. Mode: `mixed`.
- **`vault-capability-mcp`** — Provides short-lived scanner and connector capabilities to trusted adapters without exposing secret values to the model. Mode: `broker-only`.
- **`policy-and-approval-mcp`** — Evaluates OPA policies and obtains payload-bound approvals for protected security actions. Mode: `control-plane`.

## Deterministic plugins and adapters

- **`repository-security-profiler`** — Detects languages, frameworks, build tools, entry points, authentication, data access, dependencies, and existing security controls.
- **`threat-model-engine`** — Builds structured assets, actors, trust boundaries, data flows, threats, abuse cases, mitigations, and test mappings.
- **`asvs-control-mapper`** — Maps requirements and evidence to versioned OWASP ASVS controls and organization policies.
- **`sast-orchestrator`** — Runs repository-approved static analyzers, preserves tool versions, normalizes results, and binds findings to source revisions.
- **`sca-vulnerability-scanner`** — Builds dependency graphs and identifies vulnerabilities, unsupported versions, malicious packages, and risky licenses.
- **`secret-detection-engine`** — Scans source, history, artifacts, logs, and configuration for credential material using approved detectors and redaction.
- **`dependency-reachability-analyzer`** — Estimates whether vulnerable code paths are imported, invoked, exposed, or blocked by configuration and compensating controls.
- **`license-policy-evaluator`** — Evaluates package licenses, notices, attribution, prohibited terms, and organization policy.
- **`sbom-generator`** — Creates CycloneDX or SPDX SBOMs for source, build, package, image, and release candidates.
- **`vex-generator`** — Creates evidence-backed vulnerability status statements with justification, impact, action, and expiry.
- **`artifact-signature-verifier`** — Verifies package, image, provenance, and attestation signatures against configured trusted identities.
- **`container-image-scanner`** — Scans OS and application packages, malware indicators, image configuration, secrets, and base-image provenance.
- **`dockerfile-security-linter`** — Checks Dockerfile construction, users, capabilities, package pinning, downloads, checksums, secrets, and attack surface.
- **`iac-security-scanner`** — Evaluates Terraform, OpenTofu, cloud templates, Helm, and configuration against security and compliance rules.
- **`kubernetes-policy-scanner`** — Checks workload privileges, RBAC, network policy, resources, secrets, admission, Pod Security, and supply-chain policy.
- **`cloud-policy-evaluator`** — Evaluates identity, network, storage, encryption, logging, public exposure, and service configuration from approved plans or metadata.
- **`api-security-linter`** — Checks contracts and implementations for authorization, authentication, validation, mass assignment, rate limits, inventory, and unsafe integrations.
- **`dast-orchestrator`** — Runs approved passive and active scans with explicit target, rate, method, authentication, and stop conditions.
- **`fuzz-test-runner`** — Executes bounded fuzz and property-based security tests in isolated environments and records minimized failing inputs.
- **`cvss-and-risk-enricher`** — Calculates CVSS v4 vectors and combines them with exposure, reachability, KEV, exploitability, asset, and business context.
- **`remediation-sla-calculator`** — Applies configured vulnerability SLAs, freeze rules, exceptions, exploit status, and asset criticality.
- **`security-evidence-bundler`** — Packages scans, hashes, tool versions, decisions, approvals, redaction reports, and verification evidence.

## Design rules

MCP resources, prompts, and tools are separate. Read-only context, isolated scanners, and protected write operations use distinct capabilities. No scanner or tool receives broader source, network, cloud, or secret access than required for the approved task.

Tools must emit structured results with tool version, rule or database version, target identity, source or artifact hash, timestamps, configuration, evidence references, and limitations.
