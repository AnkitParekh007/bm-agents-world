# Solution Architect Agent — MVP Readiness Checklist

The MVP is ready only when every mandatory item is complete.

## Governance
- [ ] Accountable architecture owner is named.
- [ ] Decision rights and approval policies are configured.
- [ ] Independent review is required for high-risk decisions.
- [ ] Residual-risk acceptance remains human-owned.
- [ ] Production mutation and commercial commitments are denied.

## Scope and context
- [ ] At least one project is fully registered.
- [ ] Repository, Jira, Confluence, environment, system, integration, and data-store references resolve.
- [ ] Current-state evidence has owners, dates, provenance, and redaction.
- [ ] Constraints and assumptions are explicit.
- [ ] Project and system isolation tests pass.

## Core agents
- [ ] Supervisor routes work deterministically.
- [ ] Business/product context and current-state discovery agents pass evaluation.
- [ ] Quality-attribute, application, integration, data, security, reliability, performance, and cost agents pass evaluation.
- [ ] Architecture review is independent from design generation.
- [ ] Evidence manager and policy enforcer fail closed.

## Core workflows
- [ ] Story-to-solution-architecture workflow completes with an evidence-linked handoff.
- [ ] Option-evaluation workflow compares at least two viable options.
- [ ] Integration/data workflow produces governed contracts and compatibility strategy.
- [ ] Modernization workflow produces transition, cutover, rollback, and decommission plans.
- [ ] Governance workflow records review findings and conformance checkpoints.
- [ ] Workflow retries and resume behavior do not duplicate external writes.

## Artifacts and contracts
- [ ] Architecture context validates against schema.
- [ ] Quality-attribute scenarios are measurable.
- [ ] Architecture options expose assumptions, evidence, cost, risk, and reversibility.
- [ ] ADRs are immutable after approval and support supersession.
- [ ] Integration contracts define ownership, security, failure behavior, observability, testing, and lifecycle.
- [ ] Review and approval objects validate against schemas.
- [ ] Diagram source is stored alongside rendered output.

## Security
- [ ] No raw secret reaches model context, prompts, logs, traces, or artifacts.
- [ ] Workload identity and short-lived capability leases are enforced.
- [ ] MCP servers and plugins are allowlisted and sandboxed.
- [ ] Restricted data is redacted or aggregated.
- [ ] Prompt-injection and tool-confusion tests pass.
- [ ] OPA denies self-approval, production mutation, force push, merge, gate bypass, and commitments.

## Approval-controlled writes
- [ ] Exact payload preview is shown to the approver.
- [ ] Approval contains action, scope, payload hash, approver, and expiry.
- [ ] Modified payloads invalidate approvals.
- [ ] Jira, Confluence, Teams, Bitbucket, contract, and architecture publication actions are audited.
- [ ] Non-production proof-of-concepts have bounded scope, cost, data, network, and teardown controls.

## Quality and evaluation
- [ ] Golden scenarios cover new solutions, integrations, modernization, incidents, exceptions, and conflicting NFRs.
- [ ] Unsupported facts and stale evidence are detected.
- [ ] Recommendations remain stable under equivalent evidence.
- [ ] Specialist disagreements are surfaced rather than hidden.
- [ ] Human reviewers can trace every material claim to evidence.
- [ ] False-confidence, unsafe-action, and cross-project leakage rates meet organizational thresholds.

## Operations
- [ ] Dashboards expose run status, cost, latency, token use, tool calls, approvals, denials, and failures.
- [ ] Artifact retention and deletion policies are configured.
- [ ] Incident, rollback, and kill-switch procedures are tested.
- [ ] Owners can revoke identities and capabilities immediately.
- [ ] Daily and architecture-review summaries are usable by engineering and product leadership.

## MVP sign-off
- [ ] Solution Architecture owner
- [ ] Engineering owner
- [ ] Product owner
- [ ] Security owner
- [ ] Data/privacy owner
- [ ] Platform/DevOps owner
- [ ] Governance or risk owner
