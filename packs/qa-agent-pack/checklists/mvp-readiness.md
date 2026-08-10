# QA Agent MVP Readiness Checklist

## Organization and ownership
- [ ] QA platform owner assigned
- [ ] Security owner assigned
- [ ] Jira, Bitbucket, database, DevOps, and Teams owners assigned
- [ ] PCC, SOP, and DataBridge onboarding owners assigned

## Inventory
- [ ] Jira deployment type and project keys confirmed
- [ ] Bitbucket Cloud/Data Center and repository IDs confirmed
- [ ] Environment URLs and health endpoints registered
- [ ] API contracts collected
- [ ] Database engine, approved views, and read-only roles defined
- [ ] CI/CD and observability sources registered
- [ ] Test accounts and synthetic-data strategy defined

## Security
- [ ] Workload identity configured
- [ ] Secret provider configured with references only
- [ ] Read/write identities separated
- [ ] Project/environment network isolation tested
- [ ] Production mutations denied
- [ ] Approval service and expiry tested
- [ ] Secret and PII redaction tested
- [ ] Prompt-injection tests passing

## Capabilities
- [ ] Jira read works
- [ ] Bitbucket read/diff works
- [ ] Story context artifact validates
- [ ] Test plan and case artifacts validate
- [ ] Playwright sandbox works in playground
- [ ] Evidence manifest hashes and redacts artifacts
- [ ] Bug draft generated without creating Jira issue
- [ ] Full audit trace visible

## Go-live
- [ ] Golden evaluation set passes
- [ ] Human reviewers trained
- [ ] Incident and revocation runbook tested
- [ ] Canary project approved
- [ ] Cost and rate limits configured
