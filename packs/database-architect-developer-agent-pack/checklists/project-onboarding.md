# Database Project Onboarding Checklist

## Ownership and scope
- [ ] Project, repositories, Jira project, database owners, data stewards, application owners, operations, security, and approvers identified
- [ ] Database instances/services, databases, schemas, environments, and object scopes inventoried
- [ ] Production autonomous access confirmed as read-only

## Platform profile
- [ ] Engine, version, edition, compatibility level, extensions, managed service, topology, and regions recorded
- [ ] Workloads, critical queries, jobs, reports, CDC, replication, and consumers identified
- [ ] HA, backup, restore, RPO/RTO, maintenance, and patching model documented

## Repository and migrations
- [ ] Bitbucket repositories and branch protections connected
- [ ] Flyway, Liquibase, schema project, or native migration conventions documented
- [ ] Supported baselines and disposable database images available
- [ ] SQL lint, schema diff, test, and pipeline commands known

## Security and data
- [ ] Data classification, residency, retention, masking, and audit requirements recorded
- [ ] Catalog, diagnostic, sandbox, migration, monitoring, and production-verifier identities created
- [ ] Secret references mapped through capability broker
- [ ] Redaction rules tested

## Governance
- [ ] Approval matrix and separation of duties configured
- [ ] Destructive and production actions denied
- [ ] Artifact retention and audit destination configured
- [ ] Incident, break-glass, and kill-switch procedures tested
