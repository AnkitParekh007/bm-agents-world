# QA Agent and Sub-Agent Architecture

## Supervisor

### QA Supervisor Agent

Owns the run state, chooses skills, delegates work, enforces policy decisions, consolidates evidence, detects conflicts, and presents approval requests. It does not directly hold Jira, repository, browser, database, or production credentials.

## Specialist sub-agents

| Agent | Primary responsibility | Typical inputs | Outputs | High-risk actions |
|---|---|---|---|---|
| Story Context Agent | Understand Jira story and linked context | Issue key, project | Context brief, gaps, dependencies | Jira comments |
| Change Impact Agent | Analyze repository and schema change impact | Commits, PR, diff, migration | Impact map, regression targets | Repository writes |
| Test Design Agent | Produce plans and cases | Context brief, standards | Test plan, cases, coverage matrix | None by default |
| Environment Readiness Agent | Verify deploy and dependency readiness | Environment registry | Readiness report | Pipeline retry |
| Browser QA Agent | Execute browser scenarios | Approved plan, URL, test identity | Steps, screenshots, traces, findings | Destructive UI actions |
| API QA Agent | Validate contracts and behaviors | OpenAPI, endpoints, test data | API run report, request/response evidence | Mutating API calls |
| Database Validation Agent | Validate persisted state | Schema, allowlisted queries | Read-only validation report | Any write or unrestricted query |
| Integration Agent | Validate cross-system behavior | Flow definition, correlation IDs | Integration evidence graph | Triggering external side effects |
| Defect Investigator Agent | Reproduce and isolate failures | Failed case, evidence | Root-cause hypothesis, bug draft | Jira creation/transition |
| Test Automation Agent | Create and maintain test code | Test plan, repo conventions | Patch, tests, review notes | Commit, branch, PR |
| Regression Planner Agent | Select and interpret regression | Impact map, suite registry | Suite selection, risk report | Large suite execution |
| Release Readiness Agent | Consolidate quality position | All run outputs | Go/conditional/no-go brief | Final release decision |
| QA Reporter Agent | Format stakeholder updates | Run state, findings | Jira/Teams/report drafts | External publication |
| Evidence Curator Agent | Normalize and retain artifacts | Screenshots, logs, traces | Evidence manifest and bundle | Retention override/deletion |
| Policy Guard Agent | Evaluate action policy | Action request, context | Allow/deny/approval decision | Policy changes |

## Delegation rules

1. The supervisor creates a run plan but the Policy Guard must authorize each capability class.
2. Each sub-agent receives only the minimum context and short-lived tool lease required for its step.
3. Data is passed through typed artifacts, not unstructured hidden memory.
4. A sub-agent cannot delegate to an unregistered agent or invoke a tool outside its allowlist.
5. Findings must include evidence references and confidence; unsupported conclusions are rejected by the supervisor.
6. Conflicting findings trigger review or human escalation rather than silent resolution.
7. All write operations use a prepare -> review -> approve -> execute -> verify sequence.

## Context boundaries

- One active project and environment per execution lane.
- No cross-project retrieval unless the user explicitly requests comparison and policy permits it.
- Production context is isolated from playground and QA credentials and data.
- Secret values are never inserted into prompts, chat history, artifacts, screenshots, or logs.
- Large source files and logs are retrieved just in time and reduced to relevant excerpts.
