# Product Owner Agent — Project Access and Environment Model

## Purpose

The Product Owner Agent needs broad product context but narrow execution rights. Access is granted per **organization, project, product area, team, Jira board, repository set, environment, data classification, and workflow purpose**.

## Required project context

- Product strategy, Product Goal, roadmap, approved business cases, and decision history
- Jira Product Backlog, epics, stories, defects, spikes, dependencies, releases, and workflow state
- Confluence requirements, architecture, process, release, operational, and support documentation
- Approved customer research, support themes, feedback summaries, analytics, and experiment readouts
- Figma journeys, prototypes, design-system context, and handoff status
- Bitbucket/GitHub pull requests, commits, ownership, build status, and release history as read-only evidence
- API contracts, database metadata, data ownership, observability, incidents, and environment readiness

## Environment access

| Environment | Default capability | Allowed examples | Prohibited examples |
|---|---|---|---|
| Local sandbox | Isolated read/write | Generate artifacts, simulate ordering, validate schemas | External publication |
| Playground | Read plus approved bounded actions | Validate journeys, collect evidence, approved test-data operations via owning packs | Unreviewed shared changes |
| QA | Read and approved validation | Review deployed behavior, UAT evidence, release readiness | Direct configuration or database writes |
| Production | Redacted read-only | Product telemetry, release evidence, approved critical-journey observation | Feature flags, deployment, data, IAM, network, or secret mutation |

## Data minimization

Raw customer records, participant lists, recordings, compensation data, unrestricted support exports, and production data must not enter the model context. Trusted adapters return redacted summaries, aggregates, semantic metrics, and immutable references.

## Cross-pack delegation

The Product Owner Agent delegates technical implementation to Angular, Java, Python, Database, DevOps, and UX packs; quality validation to QA; detailed requirements/process analysis to Business Analysis; architecture authority to Solution Architecture; and staffing/technical leadership decisions to Engineering Leadership.
