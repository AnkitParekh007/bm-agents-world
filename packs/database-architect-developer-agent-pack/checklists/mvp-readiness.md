# Database Agent MVP Readiness Checklist

## Read-only discovery
- [ ] Jira/Confluence/Bitbucket reads work
- [ ] Engine/version/profile detection is accurate
- [ ] Catalog, dependency, grants, migration history, and redacted observability reads are scoped
- [ ] No raw credentials or sensitive samples reach model context

## Disposable development
- [ ] Ephemeral database creation and destruction work
- [ ] Supported migration baselines can be applied
- [ ] SQL lint, migration validation, schema diff, tests, and evidence hashing work
- [ ] Network, CPU, memory, storage, and lifetime quotas are enforced

## Policy and approval
- [ ] OPA denies production mutations and destructive actions
- [ ] Repository and non-production approvals bind to exact payload hashes
- [ ] Approval expiration and invalidation work
- [ ] Audit records include denied actions

## Quality
- [ ] Reference evaluation suite passes for each enabled engine
- [ ] Query tuning requires measured evidence
- [ ] Migration interruption and recovery tests pass
- [ ] Role/grant and redaction tests pass

## Operations
- [ ] Monitoring, alerts, artifact storage, audit retention, and kill switch are operational
- [ ] Human operator handoff for production is documented and rehearsed
- [ ] Pilot project and bounded use cases are approved
