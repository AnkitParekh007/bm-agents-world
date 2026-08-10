# DevOps Agent Project Onboarding Checklist

## Ownership and scope

- [ ] Project, services, repositories, environments, and owners identified
- [ ] Jira/change/incident workflows and approvers documented
- [ ] Production change authority and separation of duties documented
- [ ] Freeze windows, maintenance windows, and escalation paths documented

## Platform profile

- [ ] CI/CD engine, runners, templates, artifacts, and deployment records identified
- [ ] IaC tools, versions, providers, modules, state backends, locks, and owners identified
- [ ] Cloud/on-prem accounts, regions, networks, clusters, namespaces, and registries inventoried
- [ ] Configuration, secrets, certificates, feature flags, and identity flows inventoried
- [ ] Observability, incident, backup, DR, cost, and service catalog integrations identified

## Security and access

- [ ] Read identities created and scoped
- [ ] Sandbox identities created with quota and TTL
- [ ] Shared non-production mutations require approval
- [ ] Production agent access is read-only
- [ ] Production executor is deterministic or human-operated
- [ ] Raw secrets and signing keys are adapter-only
- [ ] Egress allow-list and worker isolation approved

## Validation

- [ ] Repository and pipeline dry run succeeds
- [ ] IaC plan or manifest render works without exposing secrets
- [ ] Security, policy, SBOM, and evidence gates work
- [ ] Rollback or restore procedure is tested
- [ ] Audit and artifact retention are verified
