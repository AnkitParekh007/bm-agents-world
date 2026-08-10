
# SRE Agent MVP Readiness Checklist

- [ ] Service scope cannot cross project, tenant, environment, or incident boundaries
- [ ] Raw secrets and unrestricted production credentials cannot enter model context
- [ ] Observability queries are bounded, redacted, and read-only
- [ ] SLO and error-budget calculations are deterministic and tested
- [ ] Incident severity rules include confidence and human review
- [ ] Production actions are request-only from the free-form agent
- [ ] Exact approvals are payload-bound, expiring, non-replayable, and independent
- [ ] Recovery verification uses declared technical and user criteria
- [ ] Post-incident content is blameless and source-linked
- [ ] Prompt-injection and malicious-telemetry evaluations pass
- [ ] Jira/Teams/status publication has approval and rollback procedures
- [ ] Historical incidents show acceptable diagnosis and communication quality
- [ ] Audit events and evidence hashes are complete
- [ ] Emergency and break-glass procedures remain human-owned
- [ ] One service and one non-production environment are selected for pilot
