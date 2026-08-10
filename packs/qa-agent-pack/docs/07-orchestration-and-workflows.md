# Orchestration and Workflow Model

## Orchestration pattern

Use a stateful supervisor with specialist sub-agents, typed artifacts, policy checks, and human gates. Avoid unrestricted agent-to-agent conversation and avoid giving every sub-agent every tool.

## Run state machine

```text
RECEIVED
  -> SCOPE_RESOLVED
  -> CONTEXT_COLLECTED
  -> PLAN_DRAFTED
  -> PLAN_APPROVED
  -> ENVIRONMENT_READY
  -> EXECUTING
  -> EVIDENCE_VALIDATED
  -> RESULT_REVIEW
  -> EXTERNAL_WRITE_APPROVAL (optional)
  -> PUBLISHED
  -> CLOSED

Any state -> BLOCKED | CANCELLED | POLICY_DENIED | FAILED
```

## Standard story-to-result flow

1. **Intake:** Resolve user, project, Jira issue, environment, intent, and deadline.
2. **Authorization:** Policy Guard determines readable resources and potentially available actions.
3. **Context collection:** Story Context and Change Impact agents retrieve only relevant data.
4. **Planning:** Test Design and Regression Planner produce plan, cases, data, and execution proposal.
5. **Human gate:** Reviewer approves scope, mutation limits, environment, and expensive suites.
6. **Readiness:** Environment Agent checks deployment, dependencies, identities, and test data.
7. **Execution:** Browser, API, Database, and Integration agents run independent lanes where safe.
8. **Evidence:** Evidence Curator validates references, hashes artifacts, and runs redaction.
9. **Analysis:** Defect Investigator classifies failures and drafts defects.
10. **Approval:** External writes are presented as a human-readable diff or action summary.
11. **Publication:** Approved Jira, Bitbucket, pipeline, or Teams action is executed once.
12. **Verification:** Agent reads back the resulting object and stores its ID.
13. **Reporting:** Reporter creates story result, daily summary, and residual-risk statement.
14. **Evaluation:** Evaluation plugin scores the run and records human corrections.

## Orchestration controls

- **Plan before act:** Execution tools are unavailable until a plan artifact exists.
- **Policy before tool:** Every call includes project, environment, data class, and action risk.
- **Least privilege:** Tool credentials are leased just in time and expire after the step.
- **Parallelism:** Read-only browser, API, and database validations may run in parallel when they do not mutate shared data.
- **Mutation lock:** One writer per test dataset or business entity.
- **Idempotency:** External actions include an idempotency key derived from run and action IDs.
- **Budgets:** Limit model tokens, browser time, API requests, SQL rows, artifact size, retries, and suite duration.
- **Retry:** Retry only known transient failures; never retry destructive or ambiguous writes automatically.
- **Compensation:** Cleanup or rollback steps are explicit and separately authorized.
- **Evidence-first:** A passed or failed claim requires evidence, not model judgment alone.
- **Conflict handling:** Disagreement among agents is surfaced with each evidence set.
- **Cancellation:** The supervisor can revoke tool leases and terminate browser sessions.

## Approval levels

| Level | Examples | Default |
|---|---|---|
| L0 — Read | Story, repo, logs, schema, health | Automatic when scoped |
| L1 — Test execution | Browser/API tests in playground or QA | Plan approval or standing policy |
| L2 — Controlled mutation | Create test data, submit forms, mutating API in test tenant | Explicit approval or narrow standing policy |
| L3 — External organizational write | Jira create/edit/transition, Teams post, PR creation, pipeline retry | Explicit human approval |
| L4 — Production/high impact | Production access, deploy, rollback, merge, database mutation | Separate privileged process; normally denied |

## Event triggers

- Manual user request
- Jira assignment or status change
- Approved schedule for smoke/regression
- Bitbucket PR ready for QA
- Deployment completed event
- CI failure requiring triage
- Defect moved to ready-for-retest
- Release candidate declared

Webhook-triggered runs must enter through the same intake, policy, and audit path as manual runs.
