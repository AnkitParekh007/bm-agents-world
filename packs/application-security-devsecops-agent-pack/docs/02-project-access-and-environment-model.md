# Project Access and Environment Model

## Purpose

The Application Security / DevSecOps Agent works through project-, repository-, asset-, environment-, target-, method-, and time-bound capabilities. Security responsibilities do not justify unrestricted source, cloud, production, customer, or credential access.

## Required context

- Jira, Confluence, architecture decisions, threat models, requirements, and risk records
- Bitbucket repositories, pull requests, branch protections, pipelines, tags, and releases
- Source-code intelligence for approved revisions
- Dependency manifests, lockfiles, package repositories, SBOMs, VEX, provenance, and signatures
- Infrastructure code, cloud plans, Kubernetes manifests, container images, and registry metadata
- API contracts, data classifications, identity flows, secrets architecture, and service ownership
- Redacted scanner, WAF, identity, audit, observability, incident, and vulnerability evidence
- Security policies, risk tiers, remediation SLAs, exception rules, and evidence-retention requirements

## Environment policy

| Environment | Access | Allowed actions |
|---|---|---|
| Isolated security workspace | Full drafting and analysis | Threat models, code analysis, scanner execution, fuzzing, evidence, and remediation drafts |
| Playground | Authorized active testing | Synthetic accounts and data, DAST, fuzzing, API tests, configuration validation |
| QA | Authorized bounded testing | Candidate-bound scans, security regression, read-only evidence, limited synthetic writes |
| Production | Redacted read-only by default | Inventory, configuration metadata, vulnerability posture, bounded telemetry, artifact verification |

Active production scanning, exploitation, denial-of-service testing, credential harvesting, data modification, and configuration changes are prohibited to the free-form agent. A necessary production action becomes an immutable request for an authorized operator or deterministic runbook.

## Scope binding

Every run binds to `organization`, `project`, `repository`, `asset`, `source_revision`, `release_candidate`, `environment`, `target`, `method`, `account`, `data set`, `time window`, `requester`, and `purpose`.

## Data boundary

Raw secrets, signing keys, unrestricted source exports, unredacted customer data, exploit payload collections, private vulnerability reports, and universal administrator credentials remain outside model context. Trusted adapters redact and minimize evidence before retrieval.

## Access path

`User identity → Agent gateway → OPA policy → Capability broker → Workload identity → Trusted adapter → Target system`

Capabilities are short-lived, least-privilege, non-transferable, audited, and bound to the approved target and action.
