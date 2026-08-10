# Research and Standards Notes

## Release and service management

- ITIL groups change enablement, deployment management, release management, service configuration management, and IT asset management within its Plan, Implement and Control practice area. Use organization-approved licensed guidance where applicable.
- Atlassian release guidance emphasizes planning, tracking, coordination, and post-release learning across the product and engineering lifecycle.

## Delivery performance

DORA’s current software-delivery performance model uses change lead time, deployment frequency, failed deployment recovery time, change failure percentage, and deployment rework rate. Use governed team/service definitions; do not convert these into simplistic individual productivity scores.

## Deployment protection

Modern CI/CD systems can use protected environments, required reviewers, wait conditions, branch restrictions, custom policy gates, and delayed secret access. This pack generalizes those controls to Bitbucket and organization-owned delivery systems.

## Supply chain

Use immutable artifacts, digests, signatures, SBOMs, provenance, and trusted pipelines. Signing keys and raw credentials stay outside model context.

## Versioning

Use semantic versioning only where the product and compatibility model support it. Existing organizational version policies remain authoritative.

## Source list

See `SOURCES.md` for the research links used as design inputs.
