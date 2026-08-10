# Observability, Audit, and Evaluation

## Required telemetry

Use a run ID and distributed trace ID across the supervisor, sub-agents, MCP gateway, adapters, browser sessions, policy engine, approval service, and artifact store.

### Traces

- Workflow state transitions
- Agent and skill invocations
- MCP/tool calls and durations
- Policy decisions
- Approval wait and execution
- External API, browser, SQL, and artifact operations
- Retries and failure classification

### Metrics

- Story-to-plan time
- Plan approval rate
- Test execution duration
- Pass/fail/blocked counts
- Defects drafted, approved, rejected, and reopened
- Human correction rate
- Unsupported-claim rate
- Tool error and retry rate
- Flaky-test classification rate
- Cross-project/policy-denial attempts
- Cost, tokens, browser minutes, API calls, and artifact volume

### Logs

Use structured logs with run, project, environment, agent, skill, tool, action, decision, approval, and evidence IDs. Redact headers, cookies, tokens, credentials, personal data, and sensitive payload fields.

## Audit record

For each external action retain:

- Initiating user or event
- Supervisor and sub-agent versions
- Model/provider and configuration
- Skill version
- Input artifact IDs
- Tool request summary and normalized response status
- Policy input and decision
- Approval ID and approver
- Credential lease metadata
- Result object ID
- Evidence manifest and hashes
- Human overrides or edits

## Evaluation layers

1. **Schema evaluation:** Output validates against the expected contract.
2. **Grounding evaluation:** Claims link to resolvable source or evidence artifacts.
3. **Task evaluation:** Test plan/cases/bug draft satisfy a curated rubric.
4. **Safety evaluation:** No secret leakage, policy bypass, unsafe SQL, or unauthorized action.
5. **Execution evaluation:** Browser/API/database result agrees with deterministic assertions.
6. **Human evaluation:** QA reviewer scores usefulness and corrects outputs.
7. **Outcome evaluation:** Defect acceptance, reopened defect rate, escaped defect rate, and cycle-time impact.

## Release gates for agent changes

- Unit tests for skills, adapters, and policy rules
- Contract tests for every MCP tool
- Recorded replay tests for Jira, Bitbucket, API, database, and Teams adapters
- Prompt-injection and secret-leak tests
- Project/environment isolation tests
- Approval and idempotency tests
- Canary rollout to playground
- QA rollout with read-only tools first
- Human-reviewed expansion of write scopes
