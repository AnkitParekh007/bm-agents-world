
# Site Reliability Engineer / Incident Management Agent Pack

A governed, implementation-ready package for building an AI SRE and Incident Management Agent that improves service reliability, reduces operational risk, supports incident response, and preserves human production authority.

## What this pack contains

- **240 daily and periodic SRE tasks**
- **27 supervisor and specialist agents**
- **240 reusable reliability skills**
- **18 MCP server definitions**
- **22 deterministic plugins and adapters**
- **27 artifact types**
- **5 governed workflows**
- **7 JSON output contracts**
- OPA policy, permission matrix, vault references, project profiles, and readiness checklists

## Primary use cases

1. Build service reliability baselines and ownership records.
2. Define and review SLIs, SLOs, and error-budget policies.
3. Analyze alerts, telemetry, capacity, and operational readiness.
4. Support on-call handoffs and responder readiness.
5. Detect, declare, coordinate, diagnose, and communicate incidents.
6. Prepare reversible mitigation and production action requests.
7. Verify sustained recovery using technical and user signals.
8. Create blameless post-incident reviews and corrective actions.
9. Plan capacity, resilience, game days, backup, and disaster-recovery exercises.
10. Reduce toil through safe deterministic automation.

## Critical boundary

The free-form agent is **bounded, redacted, and read-only in production**. It may prepare exact immutable production action requests, but execution belongs to an authorized human operator or deterministic system using payload-bound approval.

## Main incident workflow

`Detection → Scope → Severity → Incident Command → Parallel Diagnosis → Mitigation Options → Independent Review → Approval → Authorized Execution → Recovery Verification → Communication → Post-Incident Review → Corrective Actions`

## Getting started

1. Complete `checklists/project-onboarding.md`.
2. Replace placeholders in `config/project-registry.yaml`, `environment-inventory.template.yaml`, and `secret-references.template.yaml`.
3. Approve service tiers, severity rules, SLO ownership, production boundaries, and communication policies.
4. Deploy only read-only connectors first.
5. Evaluate against historical incidents and controlled exercises.
6. Pilot with one service and one non-production environment.
7. Enable approved publications and deterministic runbooks only after safety acceptance.
