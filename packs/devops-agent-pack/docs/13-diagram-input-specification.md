# Diagram Input Specification

## Architecture diagram zones

1. **Users and collaboration:** engineers, service owners, approvers, incident commander, Jira, Confluence, Teams.
2. **Agent control plane:** gateway, DevOps supervisor, workflow engine, agent registry, skills, memory/context, schemas.
3. **Governance:** OPA policy, approval service, capability broker, audit, evidence, evaluation.
4. **Specialist agents:** repository/CI, IaC/cloud, Kubernetes/container/GitOps, identity/network/security, observability/SRE/incident, cost/DR/platform.
5. **MCP and adapters:** Atlassian, Bitbucket, cloud, Terraform/OpenTofu, Kubernetes, Helm, GitOps, registry, observability, vault, incident, FinOps.
6. **Execution workers:** code worktree, IaC plan, container build, manifest render, security scan, diagnostic query.
7. **Organization systems:** PCC, SOP, DataBridge repositories; playground, QA, and production; cloud accounts; clusters; registries; telemetry backends.
8. **Artifacts:** plans, diffs, SBOM, signatures, reports, runbooks, timelines, approval records.

## Required relationship labels

- `requests`
- `reads scoped context`
- `delegates bounded task`
- `issues short-lived capability`
- `runs deterministic tool`
- `creates immutable artifact`
- `requests payload-bound approval`
- `executes approved change`
- `verifies read-only`
- `writes audit event`

## End-to-end flow

`Request -> authorization -> platform profile -> impact/risk -> plan/diff -> deterministic gates -> independent review -> approval -> controlled execution -> telemetry verification -> rollback if needed -> evidence -> Jira/Teams closeout -> evaluation`

## Visual rules

- Use separate colors for human, control plane, agents, tools, external systems, artifacts, and risk gates.
- Use solid arrows for data/action and dashed arrows for approval/evidence.
- Mark production with a strong boundary and show that the language model has no direct credential or shell path.
- Show parallel specialist analysis and a join gate before approval.
- Show rollback as an explicit branch, not a note.
