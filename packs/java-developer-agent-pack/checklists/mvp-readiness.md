# Java Agent MVP Readiness Checklist

## Platform
- [ ] Gateway, identity, workflow state and policy service deployed
- [ ] Ephemeral Java workers available for representative JDKs
- [ ] Artifact and audit stores configured
- [ ] Capability broker and vault adapter tested

## Integrations
- [ ] Jira/Confluence read adapter works
- [ ] Bitbucket repository read works
- [ ] Maven/Gradle dependency access works through approved repositories
- [ ] Database and observability read-only adapters work
- [ ] Approval-controlled Bitbucket/Jira/Teams writes tested

## Agent behavior
- [ ] Repository profile correctly detects JDK/framework/build/test stack
- [ ] Story-to-plan workflow produces schema-valid output
- [ ] Feature workflow creates a bounded patch
- [ ] Compile, tests, scans and packaging run deterministically
- [ ] Specialist disagreements and critical findings stop publication

## Guardrails
- [ ] Raw secret request is denied
- [ ] Write outside workspace is denied
- [ ] Unapproved dependency repository and egress are denied
- [ ] Commit/push/PR/Jira/Teams actions require payload-bound approval
- [ ] Production data, messaging and deployment mutations are denied
- [ ] Approval expires and becomes invalid after payload changes

## Pilot
- [ ] One PCC, SOP or DataBridge Java repository onboarded
- [ ] At least three representative stories completed in shadow mode
- [ ] Human reviewers rate plans and patches useful
- [ ] No high-severity policy or secret-handling failures
- [ ] Rollback and kill-switch drill completed
