# Artifacts and Knowledge Assets

Artifacts are controlled business-analysis outputs, not unstructured chat history. Each artifact includes project, request, authoring agents, source references, assumptions, classification, version, status, review findings, approvals, and retention.

## Artifact registry

| Artifact | Title | Control |
|---|---|---|
| `business-analysis-plan` | Business Analysis Plan | Evidence-linked; versioned; approval according to registry |
| `stakeholder-map` | Stakeholder Map | Evidence-linked; versioned; approval according to registry |
| `raci-matrix` | RACI Matrix | Evidence-linked; versioned; approval according to registry |
| `problem-opportunity-brief` | Problem and Opportunity Brief | Evidence-linked; versioned; approval according to registry |
| `business-case-outline` | Business Case Outline | Evidence-linked; versioned; approval according to registry |
| `capability-gap-assessment` | Capability and Gap Assessment | Evidence-linked; versioned; approval according to registry |
| `current-state-process` | Current-State Process Model | Evidence-linked; versioned; approval according to registry |
| `future-state-process` | Future-State Process Model | Evidence-linked; versioned; approval according to registry |
| `process-improvement-brief` | Process Improvement Brief | Evidence-linked; versioned; approval according to registry |
| `business-requirements-document` | Business Requirements Document | Evidence-linked; versioned; approval according to registry |
| `requirements-catalog` | Requirements Catalog | Evidence-linked; versioned; approval according to registry |
| `functional-specification` | Functional Requirements Specification | Evidence-linked; versioned; approval according to registry |
| `nonfunctional-requirements` | Nonfunctional Requirements Catalog | Evidence-linked; versioned; approval according to registry |
| `user-story-package` | User Story and Acceptance Package | Evidence-linked; versioned; approval according to registry |
| `use-case-specification` | Use-Case Specification | Evidence-linked; versioned; approval according to registry |
| `business-rules-catalog` | Business Rules and Decision Tables | Evidence-linked; versioned; approval according to registry |
| `business-data-dictionary` | Business Data Dictionary | Evidence-linked; versioned; approval according to registry |
| `interface-requirements` | Interface and Integration Requirements | Evidence-linked; versioned; approval according to registry |
| `requirements-traceability-matrix` | Requirements Traceability Matrix | Evidence-linked; versioned; approval according to registry |
| `change-impact-assessment` | Change Impact Assessment | Evidence-linked; versioned; approval according to registry |
| `change-readiness-plan` | Change Readiness Plan | Evidence-linked; versioned; approval according to registry |
| `uat-plan` | User Acceptance Test Plan | Evidence-linked; versioned; approval according to registry |
| `uat-scenario-pack` | UAT Scenario Pack | Evidence-linked; versioned; approval according to registry |
| `business-acceptance-report` | Business Acceptance Report | Evidence-linked; versioned; approval according to registry |
| `solution-evaluation-report` | Solution Evaluation Report | Evidence-linked; versioned; approval according to registry |
| `decision-and-action-log` | Decision and Action Log | Evidence-linked; versioned; approval according to registry |
| `business-analysis-handoff` | Business Analysis Handoff Package | Evidence-linked; versioned; approval according to registry |

## Knowledge layers

Source evidence remains in systems of record. The pack stores immutable references, redacted excerpts where permitted, structured requirements, relationships, versions, decisions, and artifact snapshots. A traceability graph links business goals through requirements, implementation, validation, release, and outcomes.

## Lifecycle

Artifacts move through draft → reviewed → decision-pending → approved → superseded or retired. Approval is attached to an immutable payload hash. Editing an approved artifact creates a new version and invalidates the earlier approval for the changed content.

## Quality metadata

Required metadata includes owner, decision owner, requirement source, confidence, rationale, dependencies, acceptance method, test links, unresolved questions, and known limitations.
