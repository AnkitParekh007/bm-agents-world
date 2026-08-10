# Artifacts and Knowledge Assets

## Artifact strategy

Artifacts are structured, versioned outputs with clear ownership, sensitivity, retention, evidence references, and approval state. The registry includes 28 types spanning account context, onboarding, success plans, adoption, health, risk, value, business reviews, renewals, expansion signals, training, journeys, feedback, advocacy, incidents, support, communications, decisions, and daily summaries.

## Evidence rules

Every material customer claim should be attributable to an approved source. Customer quotes remain quotes; generated interpretations remain labeled interpretations. Metrics include definition, period, freshness, exclusions, and source. Health and risk artifacts include confidence and missing-data caveats. Value artifacts distinguish measured outcomes from inferred attribution.

## Sensitive-data handling

Artifacts should store references to source systems rather than duplicating raw messages, complete contact records, support transcripts, or large telemetry datasets. Fields should be minimized, redacted, and tenant-scoped. Commercially sensitive values use stricter retention and access rules.

## Customer-facing versus internal

Draft internal analysis can include risk hypotheses and confidence. Customer-facing artifacts require fact validation, professional language, authorized claims, and approval. Internal renewal or expansion analysis must not accidentally appear as a customer commitment.

## Knowledge assets

Reusable knowledge includes product documentation, implementation guides, known issues, support knowledge, release notes, enablement content, security/compliance assurance materials, customer-success playbooks, health definitions, lifecycle policies, and approved value frameworks.

See `config/artifact-registry.yaml` and the templates directory.
