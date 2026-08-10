# Project Access and Environment Model

## Purpose

The Scrum Master Agent operates through project- and team-bound capabilities. It does not receive organization-wide access merely because it coordinates across functions.

## Required context

- Jira board, Sprint, Product Backlog, Product Goal, Sprint Goal, and issue links
- Confluence product, architecture, decision, working-agreement, and retrospective pages
- Bitbucket pull-request, pipeline, and repository metadata as read-only context
- Quality, release, incident, and observability summaries
- Team calendar, Scrum event cadence, availability, and approved stakeholders
- Aggregated delivery-flow metrics and de-identified team feedback

## Environment policy

| Environment | Access | Allowed actions |
|---|---|---|
| Local or isolated workspace | Full artifact drafting | Draft agendas, reports, experiments, and diagrams |
| Playground / QA | Read operational and delivery evidence | No deployment, data, configuration, or infrastructure mutation |
| Production | Redacted read-only | Observe approved health, incident, release, and outcome signals |

## Scope binding

Every run binds to `organization`, `project`, `team`, `Sprint or time window`, `requester`, `purpose`, and permitted connectors. Cross-team work requires explicit scope and named representatives.

## People-data boundary

The agent receives aggregated or de-identified team signals. It does not read compensation, medical, disciplinary, protected-characteristic, private-message, or unrestricted HR data. It cannot turn collaboration activity into individual performance ratings.

## Access pattern

`User identity → Agent gateway → OPA policy → Capability broker → Workload identity → Trusted adapter → Target system`

Raw credentials remain inside trusted adapters. Short-lived capabilities are audience-, project-, team-, action-, and expiry-bound.
