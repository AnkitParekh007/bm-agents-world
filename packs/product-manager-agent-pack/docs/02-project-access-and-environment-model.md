# Project Access and Environment Model

## Scope binding

Every run is bound to:

`organization -> project -> product area -> Jira/discovery item -> approved evidence sources -> environment -> decision owner -> requester -> purpose -> allowed tools -> outputs -> approvals -> expiration`

## Required access categories

| Category | Examples | Default | Write behavior |
|---|---|---|---|
| Work management | Jira, Jira Product Discovery, Confluence | Read | Publication requires approval |
| Source and delivery context | Bitbucket, CI/CD, releases, incidents | Read | No repository mutation |
| Design context | Figma, prototypes, design systems | Read | No shared design mutation |
| Customer evidence | Research, support, surveys, CRM themes | Redacted/aggregate | Customer contact requires approval |
| Product analytics | Curated metrics, funnels, retention, cohorts | Read-only | Metric changes require governance |
| Experiments and flags | Experiment catalog and rollout status | Read | Launch and production changes are not autonomous |
| Market evidence | Approved public browsing and internal research | Read | Evidence must retain source and date |
| Collaboration | Teams, email, meeting records | Read/draft | Sending or publishing requires approval |
| Secrets | Vault-backed capability leases | Adapter-only | Raw secrets never enter model context |

## Project profiles

- **PCC:** legacy-compatible product planning around Angular 12 and Java constraints.
- **SOP:** version-aware planning around Angular 15, Java, and shared platform dependencies.
- **DataBridge:** conservative maintenance, customer continuity, migration learning, and risk reduction for AngularJS and Java.

## Environment principles

1. Product sandbox contains synthetic or already-approved context.
2. Planning spaces can hold confidential roadmap drafts but cannot publish without approval.
3. Playground and QA may be observed for validation; PM agent does not mutate deployments.
4. Production access is read-only, privacy-thresholded, purpose-bound, and auditable.
5. Customer and commercial records are minimized before model use.
6. External commitments and production changes remain human-controlled.

## Onboarding information required

- Product owner, product lead, engineering lead, design lead, analytics owner, support owner, and release owner.
- Jira/JPD projects, Confluence spaces, repositories, design files, analytics projects, release systems, feedback sources, and approved market sources.
- Product lifecycle, supported users, contractual constraints, data classifications, metric dictionary, roadmap cadence, prioritization model, and approval chain.
- Known commitments, regulatory obligations, release freezes, customer communication policies, and experiment governance.
