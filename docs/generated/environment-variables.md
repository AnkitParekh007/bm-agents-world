<!-- GENERATED FILE: DO NOT EDIT DIRECTLY. Run `npm run docs:generate`. -->

# Generated environment-variable inventory

Authoritative sources:

- `apps/agent-window/.env.example`

| Variable | Section | Example/default |
| --- | --- | --- |
| `AI_MODEL` | Runtime and model | `openai:gpt-5.4-mini` |
| `OPENAI_API_KEY` | Runtime and model | server-side secret |
| `ANTHROPIC_API_KEY` | Runtime and model | server-side secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Runtime and model | server-side secret |
| `PORT` | Runtime and model | `4000` |
| `BM_DEPLOYMENT_MODE` | Runtime and model | `development` |
| `BM_PILOT_REQUIRE_JIRA_WRITE` | Runtime and model | `false` |
| `BM_AGENTS_REPO_ROOT` | Runtime and model | `/absolute/path/to/bm-agents-world` |
| `BM_PILOT_PROJECT_IDS` | Runtime and model | `PCC` |
| `BM_PILOT_REQUIRED_ENVIRONMENTS` | Runtime and model | `playground,qa` |
| `BM_PILOT_EXPECTED_REPLICAS` | Runtime and model | `2` |
| `BM_PILOT_BASE_URL` | Runtime and model | `https://bm-agents-world.internal.example` |
| `BM_PILOT_VALIDATION_REQUESTS` | Runtime and model | `12` |
| `BM_PILOT_VALIDATION_BEARER_TOKEN` | Runtime and model | server-side secret |
| `BM_PILOT_VALIDATION_COOKIE` | Runtime and model | unset example |
| `BM_POLICY_MODE` | Central policy + approved connector registry | `local` |
| `BM_OPA_URL` | Central policy + approved connector registry | `http://127.0.0.1:8181` |
| `BM_OPA_TIMEOUT_MS` | Central policy + approved connector registry | `1500` |
| `BM_CONNECTOR_REGISTRY_PATH` | Central policy + approved connector registry | `/absolute/path/to/config/approved-connectors.yaml` |
| `BM_PERSISTENCE_MODE` | Runtime persistence | `sqlite-filesystem` |
| `BM_STATE_DB_PATH` | Runtime persistence | `/secure/runtime/data/state/qa-pilot.sqlite` |
| `BM_ARTIFACT_ROOT` | Runtime persistence | `/secure/runtime/data` |
| `BM_POSTGRES_URL` | Shared team pilot / horizontal scaling | server-side secret |
| `BM_POSTGRES_POOL_MAX` | Shared team pilot / horizontal scaling | `10` |
| `BM_POSTGRES_STATEMENT_TIMEOUT_MS` | Shared team pilot / horizontal scaling | `15000` |
| `SUPABASE_URL` | Shared team pilot / horizontal scaling | `https://your-project-ref.supabase.co` |
| `SUPABASE_SECRET_KEY` | Shared team pilot / horizontal scaling | server-side secret |
| `BM_SUPABASE_ARTIFACT_BUCKET` | Shared team pilot / horizontal scaling | `bm-agents-world-evidence` |
| `BM_IDENTITY_MODE` | Request identity | `local-dev` |
| `BM_LOCAL_USER_ID` | Request identity | `local-dev-user` |
| `BM_LOCAL_TENANT_ID` | Request identity | `local-dev` |
| `BM_LOCAL_PROJECT_IDS` | Request identity | `PCC,SOP,DataBridge` |
| `BM_LOCAL_ALLOW_SELF_APPROVAL` | Request identity | `true` |
| `QA_PROJECT_TEST_CATALOG` | Request identity | `/absolute/path/to/qa-project-tests.yaml` |
| `COPILOTKIT_TELEMETRY_DISABLED` | Request identity | `true` |
| `BM_MODEL_INPUT_USD_PER_1M_TOKENS` | Model usage + OpenTelemetry | unset example |
| `BM_MODEL_OUTPUT_USD_PER_1M_TOKENS` | Model usage + OpenTelemetry | unset example |
| `BM_OTEL_ENABLED` | Model usage + OpenTelemetry | `false` |
| `OTEL_SERVICE_NAME` | Model usage + OpenTelemetry | `bm-agents-world-agent-window` |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Model usage + OpenTelemetry | `http://otel-collector.observability.svc:4318/v1/traces` |
| `OTEL_EXPORTER_OTLP_HEADERS` | Model usage + OpenTelemetry | server-side secret |
| `OTEL_SDK_DISABLED` | Model usage + OpenTelemetry | `false` |
| `QA_JIRA_BASE_URL` | QA Jira Cloud read + governed defect adapter | `https://your-company.atlassian.net` |
| `QA_JIRA_EMAIL` | QA Jira Cloud read + governed defect adapter | `qa-automation@your-company.com` |
| `QA_JIRA_API_TOKEN` | QA Jira Cloud read + governed defect adapter | unset example |
| `QA_JIRA_BEARER_TOKEN` | QA Jira Cloud read + governed defect adapter | server-side secret |
| `QA_JIRA_ACCEPTANCE_CRITERIA_FIELD` | QA Jira Cloud read + governed defect adapter | unset example |
| `QA_JIRA_WRITE_ENABLED` | QA Jira Cloud read + governed defect adapter | `false` |
| `QA_JIRA_BUG_ISSUE_TYPE` | QA Jira Cloud read + governed defect adapter | `Bug` |
| `QA_JIRA_BUG_LABELS` | QA Jira Cloud read + governed defect adapter | `bm-agent,qa-automation` |
| `QA_PCC_JIRA_PROJECT_KEY` | QA Jira Cloud read + governed defect adapter | `PCC` |
| `QA_SOP_JIRA_PROJECT_KEY` | QA Jira Cloud read + governed defect adapter | `SOP` |
| `QA_DATABRIDGE_JIRA_PROJECT_KEY` | QA Jira Cloud read + governed defect adapter | `DATABRIDGE` |
| `QA_BITBUCKET_ACCESS_TOKEN` | QA Bitbucket Cloud read adapter | server-side secret |
| `QA_BITBUCKET_BASE_URL` | QA Bitbucket Cloud read adapter | `https://api.bitbucket.org/2.0` |
| `QA_BITBUCKET_WORKSPACE` | QA Bitbucket Cloud read adapter | `your-workspace` |
| `QA_PCC_BITBUCKET_REPOS` | QA Bitbucket Cloud read adapter | `frontend:pcc-ui,backend:pcc-api` |
| `QA_SOP_BITBUCKET_REPOS` | QA Bitbucket Cloud read adapter | `frontend:sop-ui,backend:sop-api` |
| `QA_DATABRIDGE_BITBUCKET_REPOS` | QA Bitbucket Cloud read adapter | `frontend:databridge-ui,backend:databridge-api` |
| `QA_PLAYWRIGHT_ENABLED` | QA Playwright worker | `true` |
| `QA_PLAYWRIGHT_TIMEOUT_MS` | QA Playwright worker | `45000` |
| `QA_PCC_PLAYWRIGHT_PLAYGROUND_URL` | QA Playwright worker | `https://pcc-playground.example.internal` |
| `QA_PCC_PLAYWRIGHT_QA_URL` | QA Playwright worker | `https://pcc-qa.example.internal` |
| `QA_SOP_PLAYWRIGHT_PLAYGROUND_URL` | QA Playwright worker | `https://sop-playground.example.internal` |
| `QA_SOP_PLAYWRIGHT_QA_URL` | QA Playwright worker | `https://sop-qa.example.internal` |
| `QA_DATABRIDGE_PLAYWRIGHT_PLAYGROUND_URL` | QA Playwright worker | `https://databridge-playground.example.internal` |
| `QA_DATABRIDGE_PLAYWRIGHT_QA_URL` | QA Playwright worker | `https://databridge-qa.example.internal` |
| `QA_PCC_PLAYWRIGHT_STORAGE_STATE` | QA Playwright worker | `/secure/runtime/playwright-auth/pcc-user.json` |
| `QA_SOP_PLAYWRIGHT_STORAGE_STATE` | QA Playwright worker | `/secure/runtime/playwright-auth/sop-user.json` |
| `QA_DATABRIDGE_PLAYWRIGHT_STORAGE_STATE` | QA Playwright worker | `/secure/runtime/playwright-auth/databridge-user.json` |
| `QA_TEAMS_WEBHOOK_URL` | QA Teams status adapter | server-side secret |
| `QA_DATABASE_VALIDATION_ENABLED` | QA database validation adapter | `false` |
| `QA_DATABASE_URL` | QA database validation adapter | server-side secret |
| `QA_DATABASE_VALIDATIONS_PATH` | QA database validation adapter | `/absolute/path/to/qa-database-validations.yaml` |
| `QA_API_CONTRACTS_PATH` | QA API contract adapter | `/absolute/path/to/qa-api-contracts.yaml` |

Secret values are intentionally replaced with classifications. See [Environment variables](../development/environment-variables.md) for behavior and security guidance.
