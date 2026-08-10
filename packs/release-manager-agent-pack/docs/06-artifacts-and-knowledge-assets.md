# Artifacts and Knowledge Assets

The pack defines **27 governed artifacts**.

## `release-request`
Qualified release request, type, purpose, scope boundary, owners, window, and constraints.

## `release-context-package`
Approved product, project, service, environment, repository, version, calendar, and policy context.

## `release-scope-baseline`
Committed, optional, deferred, excluded, and late-change scope with immutable references.

## `release-plan`
Milestones, owners, dependencies, environments, windows, gates, communication, validation, and closure.

## `release-calendar-entry`
Timezone-safe release window, blackout checks, conflicts, support coverage, and escalation contacts.

## `dependency-and-compatibility-map`
Service, contract, data, infrastructure, vendor, owner, sequencing, and supported-version dependencies.

## `release-bill-of-materials`
Applications, APIs, database scripts, images, packages, IaC, configuration, documentation, and hashes.

## `artifact-integrity-manifest`
Coordinates, digests, checksums, signatures, provenance, build, repository, and promotion state.

## `software-bill-of-materials`
Candidate-bound SBOM references, formats, policy status, exceptions, and evidence.

## `version-and-support-matrix`
Current, candidate, minimum, maximum, supported, deprecated, and incompatible versions.

## `quality-evidence-package`
Test, defect, UAT, accessibility, performance, resilience, and known-limitation evidence.

## `security-and-compliance-package`
Scan results, vulnerabilities, exceptions, signatures, licenses, privacy, and compliance evidence.

## `environment-readiness-report`
Health, capacity, drift, identity, observability, backup, network, and operational readiness.

## `database-migration-readiness-package`
Migration order, hashes, previews, duration, locking, data impact, validation, rollback, and operator plan.

## `change-record`
Risk, impact, implementation, validation, rollback, communication, approvals, decisions, and closure evidence.

## `release-risk-register`
Risk, probability, impact, evidence, mitigation, contingency, owner, status, and residual decision.

## `deployment-runbook`
Prechecks, exact steps, owners, stage gates, validation, stop conditions, and handoffs.

## `rollback-and-recovery-plan`
Rollback and fix-forward triggers, exact steps, data safety, artifacts, validation, and escalation.

## `release-communication-plan`
Audience, message type, owner, channel, cadence, approvals, and publication schedule.

## `go-no-go-decision-pack`
Scope, readiness by domain, blockers, conditions, dissent, risk, rollback, and decision options.

## `release-command-log`
Immutable timeline of decisions, operators, stages, outcomes, evidence, issues, and communications.

## `release-status-update`
Audience-specific factual status, timestamps, completed steps, risk, next checkpoint, and owner.

## `support-and-operations-handoff`
Versions, known issues, runbooks, dashboards, workarounds, contacts, and escalation paths.

## `release-notes`
Delivered capabilities, fixes, changes, limitations, deprecations, migration guidance, and support information.

## `post-release-validation-report`
Deployed state, telemetry, smoke tests, customer signals, incidents, and success-criteria assessment.

## `post-release-review`
Outcome, incidents, rework, lessons, root causes, follow-ups, owners, and improvement experiments.

## `release-audit-evidence-bundle`
Immutable approvals, hashes, artifacts, reports, decisions, logs, messages, policy decisions, and retention metadata.

## Evidence requirements

Every release-critical artifact records release ID, candidate hash, source references, authoring agent, human owners, timestamps, approval state, policy decision, and retention classification.
