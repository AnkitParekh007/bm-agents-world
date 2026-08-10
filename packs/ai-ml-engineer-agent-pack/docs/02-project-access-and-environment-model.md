# Project Access and Environment Model

## Principle
The AI/ML Agent receives only project-scoped and purpose-scoped access. A project authorization binds the work item, repository, dataset sources, model providers, registries, evaluation assets, compute limits, environment, and allowed actions.

## Access layers
1. **Work context:** Jira/Confluence and approved product documents.
2. **Source:** isolated Git checkout and read-only repository metadata.
3. **Data:** catalog-first discovery; synthetic or approved non-production data by default.
4. **Experiment:** bounded compute, experiment tracker, artifact storage, and model registry.
5. **Evaluation:** immutable evaluation sets and deterministic/model-assisted evaluators.
6. **Production:** bounded, redacted, read-only telemetry only for the free-form agent.

## Environment progression
`local -> playground -> QA/validation -> production candidate -> human-approved deterministic promotion`

Production training, model promotion, traffic changes, vector-index writes, feature-store writes, and destructive data actions are never direct free-form agent capabilities.

## Data rules
- Purpose limitation and provenance are mandatory.
- Production data is not copied into model context by default.
- Customer, employee, regulated, or other sensitive data requires data-owner and privacy/security approval.
- Dataset snapshots and splits must be reproducible and linked to evaluation claims.
