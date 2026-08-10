# Project Onboarding Checklist

## Authorization and ownership
- [ ] Project, team, operating profile, and accountable manager/technical owner identified
- [ ] Jira, repositories, services, databases, environments, and deployment owners recorded
- [ ] Decision rights and escalation paths documented
- [ ] Data classifications and people-data restrictions approved

## Delivery and technical context
- [ ] Product goals, roadmap, active work, architecture, ADRs, and standards linked
- [ ] Build, test, quality, security, and release gates identified
- [ ] Service ownership, SLOs, runbooks, alerts, and on-call model recorded
- [ ] Dependency and vendor ownership recorded

## Tools and credentials
- [ ] MCP adapters allow-listed and least-privilege identities configured
- [ ] Vault references contain no secret values
- [ ] Production access is read-only/redacted and request-only for changes
- [ ] People and recruiting connectors are disabled until separately approved

## Metrics and privacy
- [ ] Metric definitions, sources, owners, and limitations documented
- [ ] Individual activity ranking is prohibited
- [ ] Retention, redaction, and audit requirements configured

## Validation
- [ ] Read-only dry run completed
- [ ] Policy denial tests completed
- [ ] Independent review route tested
- [ ] Human approval and payload invalidation tested
