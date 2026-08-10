# Release Manager Agent — MVP Readiness Checklist

- [ ] One pilot project and one low-risk release type selected
- [ ] Jira, Bitbucket, CI/CD, artifact, environment, and observability reads working
- [ ] Release context schema populated correctly
- [ ] Candidate hashes and artifact digests captured
- [ ] Scope and dependency reports validated by humans
- [ ] Readiness domains and evidence sources configured
- [ ] Approval service binds exact payload, target, window, and expiry
- [ ] Jira, Confluence, and Teams writes remain approval controlled
- [ ] Non-production rehearsal succeeds through deterministic pipeline
- [ ] Production credentials are unavailable to model runtime
- [ ] Production validation is bounded, redacted, and read-only
- [ ] Rollback request workflow tested
- [ ] Emergency release workflow tested
- [ ] Audit evidence and replay protection verified
- [ ] Failure injection confirms no duplicate external writes
- [ ] Release owner signs off on pilot boundaries
