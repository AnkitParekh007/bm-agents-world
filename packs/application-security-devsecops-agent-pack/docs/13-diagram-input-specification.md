# Diagram Input Specification

## Architecture diagram layers

1. **Users and accountable decisions** — Security, Product, Architecture, Engineering, Privacy, Release, Operations, and incident owners
2. **Agent control plane** — gateway, supervisor, specialist agents, workflow state, policy, approvals, capability broker
3. **Security capabilities** — requirements, threat modeling, code review, SAST, SCA, secrets, API, DAST, container, IaC, Kubernetes, cloud, supply chain, vulnerability response
4. **MCP and adapters** — Jira, Confluence, Bitbucket, CI/CD, scanners, registry, cloud, cluster, telemetry, vulnerability intelligence, artifact store
5. **Identity and secrets** — workload identity, vault, short-lived capability leases, signing service
6. **Targets** — PCC, SOP, DataBridge, BM Agent Foundry, playground, QA, and redacted production context
7. **Evidence and decisions** — threat models, findings, SBOM, VEX, gate packs, exceptions, approvals, audit bundles

## End-to-end flow nodes

`Request → Scope authorization → Context and risk tier → Threat model and requirements → Parallel security analysis → Finding normalization → Risk triage → Remediation or exception → Independent assurance → Human decision → Protected publication or execution request → Verification → Evidence archive → Improvement`

## Required decision diamonds

- Is the request and target authorized?
- Is active testing permitted?
- Does the evidence match the source or release candidate?
- Is the finding confirmed and materially reachable?
- Can it be remediated before release?
- Is an exception allowed and independently approved?
- Are required gates complete?
- Does approval match the final payload?
- Did remediation or release verification pass?

## Visual conventions

Use solid arrows for evidence flow, dashed arrows for approvals, red boundaries for prohibited direct production access, purple nodes for independent security review, orange nodes for exceptions, and green nodes for verified controls. Show the vault and capability broker outside model context.
