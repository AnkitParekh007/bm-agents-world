# MCP Servers, Tools, and Runtime Plugins

## Definitions

- **MCP server:** A standardized capability endpoint exposing resources, prompts, and/or tools to an MCP client.
- **Tool:** One atomic callable operation, such as `jira.get_issue` or `browser.click`.
- **Plugin:** A runtime extension or adapter loaded by the agent platform. A plugin may wrap an MCP server, REST API, policy engine, renderer, vault provider, or internal service.
- **Skill:** A procedural playbook that combines tools and validation rules to produce a typed result.

## Required and recommended MCP servers

| Server | Status | Purpose | Deployment recommendation |
|---|---|---|---|
| Atlassian Rovo MCP | Preferred where supported | Jira, Confluence, and supported Atlassian context/actions | Remote OAuth; admin-controlled; write tools gated |
| Bitbucket Adapter MCP | Required when Rovo coverage is insufficient or for Data Center | Repositories, files, diffs, PRs, pipelines, build metadata | Organization-owned server using Bitbucket REST APIs |
| Microsoft Playwright MCP | Required | Browser automation through Playwright | Pinned version, sandboxed browser, domain allowlist |
| QA API MCP | Required | OpenAPI-driven API testing and evidence capture | Organization-owned; per-project/environment allowlist |
| QA Database MCP | Required | Schema metadata and allowlisted read-only validation | Organization-owned; read-only role; query guard |
| Environment MCP | Required | Health, version, flags, service status, deployment metadata | Organization-owned control-plane adapter |
| Observability MCP | Recommended | Search logs, traces, metrics, and correlation IDs | Read-only adapter to existing platform |
| Artifact MCP | Required | Store and retrieve plans, cases, screenshots, traces, reports | Private artifact store; signed short-lived URLs |
| Test Management MCP | Optional | Sync cases and runs with an existing test-management system | Add only when a product is selected |
| Teams Context MCP | Optional/read-only | Retrieve approved channel/thread context | Narrow scope; separate from publisher plugin |

## Tool inventory by server

### Atlassian/Jira

- `jira.search_issues`
- `jira.get_issue`
- `jira.get_issue_history`
- `jira.get_comments`
- `jira.get_attachments_metadata`
- `jira.get_linked_issues`
- `jira.get_project_metadata`
- `jira.get_sprint_release_metadata`
- `jira.prepare_comment`
- `jira.prepare_create_bug`
- `jira.prepare_transition`
- `jira.execute_approved_write`

### Bitbucket

- `bitbucket.list_repositories`
- `bitbucket.get_repository`
- `bitbucket.list_branches`
- `bitbucket.get_commit`
- `bitbucket.get_file`
- `bitbucket.get_diff`
- `bitbucket.search_code`
- `bitbucket.get_pull_request`
- `bitbucket.get_pull_request_diff`
- `bitbucket.get_build_status`
- `bitbucket.get_pipeline`
- `bitbucket.get_pipeline_logs`
- `bitbucket.prepare_branch`
- `bitbucket.prepare_commit`
- `bitbucket.prepare_pull_request`
- `bitbucket.execute_approved_write`

### Browser/Playwright

- `browser.open_session`
- `browser.navigate`
- `browser.snapshot`
- `browser.click`
- `browser.fill`
- `browser.select`
- `browser.upload`
- `browser.keyboard`
- `browser.wait_for_condition`
- `browser.get_console`
- `browser.get_network_events`
- `browser.screenshot`
- `browser.start_trace`
- `browser.stop_trace`
- `browser.close_session`

### API

- `api.load_contract`
- `api.list_operations`
- `api.prepare_request`
- `api.execute_read_request`
- `api.execute_approved_mutation`
- `api.validate_schema`
- `api.compare_response`
- `api.capture_exchange`
- `api.run_collection`

### Database

- `db.list_schemas`
- `db.list_tables`
- `db.describe_table`
- `db.get_constraints`
- `db.get_migration_metadata`
- `db.validate_query`
- `db.explain_readonly_query`
- `db.execute_readonly_query`
- `db.compare_expected_record`

Explicitly exclude generic `db.execute_sql` from the agent interface.

### Environment and CI/CD

- `env.get_health`
- `env.get_deployed_version`
- `env.get_feature_flags`
- `env.get_dependency_status`
- `env.get_test_tenant_status`
- `ci.get_pipeline_status`
- `ci.get_test_results`
- `ci.get_artifacts`
- `ci.prepare_retry`
- `ci.execute_approved_retry`

### Observability

- `obs.search_logs`
- `obs.get_trace`
- `obs.get_metrics_window`
- `obs.correlate_request`
- `obs.get_alert_context`

### Artifact storage

- `artifact.create_run_folder`
- `artifact.put_text`
- `artifact.put_binary`
- `artifact.get`
- `artifact.list_run_artifacts`
- `artifact.create_manifest`
- `artifact.redact_copy`
- `artifact.sign_read_url`

## Runtime plugin inventory

1. **Atlassian connector plugin** — OAuth, pagination, rate limits, normalized issue model.
2. **Bitbucket connector plugin** — Cloud/Data Center adapters, repository and pipeline normalization.
3. **Playwright session plugin** — isolated profiles, tracing, downloads, screenshots, and cleanup.
4. **OpenAPI test plugin** — contract parsing, request generation, schema validation, redaction.
5. **Database guard plugin** — SQL parser, allowlist, row/timeout limits, read-only enforcement.
6. **Environment registry plugin** — resolves project/environment endpoints and metadata.
7. **Secret-provider plugin** — GCP, Azure, HashiCorp Vault, or another approved provider.
8. **Identity-broker plugin** — exchanges workload identity for short-lived system tokens.
9. **Policy engine plugin** — evaluates tool, resource, environment, and approval policies.
10. **Approval plugin** — creates, expires, records, and verifies approvals.
11. **Artifact renderer plugin** — Markdown, HTML, JSON, JUnit, and PDF-ready outputs.
12. **Evidence redaction plugin** — masks secrets, tokens, PII, cookies, and sensitive headers.
13. **Teams publisher plugin** — prepares and posts approved messages through an approved Teams integration.
14. **Observability plugin** — OpenTelemetry traces, metrics, logs, and run correlation.
15. **Prompt-injection defense plugin** — labels external content as untrusted and blocks tool escalation instructions.
16. **LLM provider router plugin** — model selection, fallback, budget, data-residency, and logging controls.
17. **Evaluation plugin** — schema, citation, evidence, safety, and task-quality scoring.
18. **Test data plugin** — synthetic-data generation and controlled cleanup through a service API.
19. **Notification plugin** — human approval requests, blocked-run alerts, and completion notices.
20. **Retention plugin** — evidence lifecycle, legal hold, deletion, and archive enforcement.

## Supply-chain controls

- Use official or organization-owned servers where possible.
- Pin package and container versions and verify checksums/signatures.
- Maintain an allowlisted MCP registry and owner for each server.
- Disable unused tools, prompts, and resource templates.
- Run servers with non-root identities, read-only filesystems, resource limits, and egress controls.
- Treat browser content, Jira text, repository files, logs, and MCP responses as untrusted input.
- Never allow an MCP server to retrieve raw vault values on behalf of the model.
