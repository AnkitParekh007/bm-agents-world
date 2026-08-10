# Environment variables

The canonical template is `apps/agent-window/.env.example`. Values below are categories, never real secrets.

## Runtime and model

| Variable | Purpose | Typical safe value |
|---|---|---|
| `PORT` | Express port | `4000` |
| `AI_MODEL` | CopilotKit provider/model | `openai:gpt-5.4-mini` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Provider credential | secret |
| `BM_AGENTS_REPO_ROOT` | Repository root for pack discovery | absolute path |

## Identity and persistence

| Variable | Purpose |
|---|---|
| `BM_IDENTITY_MODE` | `local-dev` or `trusted-headers` |
| `BM_LOCAL_USER_ID`, `BM_LOCAL_TENANT_ID`, `BM_LOCAL_PROJECT_IDS` | Development identity |
| `BM_LOCAL_ALLOW_SELF_APPROVAL` | Disable local self-approval when `false` |
| `BM_STATE_DB_PATH` | SQLite database file |
| `BM_ARTIFACT_ROOT` | Artifact directory |
| `BM_DEPLOYMENT_MODE` | `pilot` enables strict readiness |
| `BM_PILOT_REQUIRE_JIRA_WRITE` | Require live Jira writes for readiness |

## QA integrations

Jira uses `QA_JIRA_BASE_URL` plus either bearer token or email/API token; optional variables configure acceptance-criteria field, issue type, labels, and write enablement. Bitbucket uses `QA_BITBUCKET_ACCESS_TOKEN`, base URL, workspace, and project-to-repository mappings. Playwright uses `QA_PLAYWRIGHT_ENABLED`, timeout, per-project environment URLs, test catalog path, and storage-state file references.

{% hint style="warning" %}
Readiness checks only confirm required configuration is present and writable; they do not prove remote credentials or target applications work. Test those integrations explicitly.
{% endhint %}
