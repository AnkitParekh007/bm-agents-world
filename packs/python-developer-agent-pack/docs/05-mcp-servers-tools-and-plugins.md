# MCP Servers, Tools, and Plugins

## 1. Separation of concepts

- **MCP server:** capability boundary exposing resources, prompts, or tools.
- **Tool:** atomic typed operation such as reading a file, running pytest, or querying a read replica.
- **Plugin/adapter:** runtime integration that implements authentication, policy, redaction, retries, and vendor-specific behavior.
- **Skill:** orchestrated reasoning and tool sequence producing a validated artifact.
- **Agent:** bounded decision-maker that invokes approved skills.

## 2. Recommended MCP servers

| Server | Primary resources/tools | Default mode |
|---|---|---|
| Atlassian context | Jira/Confluence/Bitbucket issue, page, repository, PR, pipeline context | Read; writes approval-controlled |
| Workspace and Git | files, search, diff, branch status, patch application, commands | Ephemeral workspace only |
| Python documentation | version-matched stdlib, language, typing, and migration docs | Read-only |
| Framework documentation | pinned FastAPI/Django/Flask/Pydantic/SQLAlchemy/Celery/PySpark docs | Read-only |
| OpenAPI/contracts | API specifications, schema validation, generated clients/servers | Read; generation in workspace |
| Database metadata | schemas, migrations, approved views, EXPLAIN, bounded SELECT | Read-only by default |
| Queue/cache metadata | queue depth, message metadata, dead letters, cache metadata | Observe; mutations approval-controlled |
| Package registry | private index metadata, trusted packages, provenance, versions | Read; publication prohibited by default |
| CI/CD | pipeline definitions, statuses, logs, artifacts | Read; triggers require approval |
| Container/build | isolated commands, image build, SBOM, scanning | Sandbox only |
| Observability | logs, metrics, traces, dashboards, incidents | Read-only |
| Artifact/evidence | immutable run artifacts, hashes, retention, retrieval | Append through broker |
| Collaboration | Teams summaries and Jira updates | Draft; publish with approval |
| Secret broker | capability lease requests, never raw secret retrieval | Broker-only |
| Policy | OPA decisions and approval verification | Mandatory |

## 3. Atomic tool examples

`workspace.read`, `workspace.search`, `workspace.write-patch`, `git.diff`, `git.status`, `command.run-allowlisted`, `python.resolve-profile`, `pytest.run`, `ruff.check`, `ruff.format`, `mypy.run`, `pyright.run`, `coverage.report`, `package.build`, `package.clean-install`, `database.schema`, `database.select-bounded`, `database.explain`, `openapi.validate`, `container.build`, `sbom.generate`, `pipeline.logs`, `observability.query`, `artifact.put`, `approval.request`.

## 4. Runtime plugins

Plugins should implement Bitbucket Cloud/Data Center differences, Jira/Confluence identity, virtual-environment creation, dependency-manager commands, framework detection, database dialects, container runners, CI providers, observability vendors, and secret managers. Plugins receive short-lived credentials inside the adapter process and return redacted results.

## 5. Community-server admission

Before enabling a third-party MCP server: pin source and release, verify license and provenance, review code and dependencies, enumerate tools and side effects, wrap with policy and schemas, disable unneeded tools, sandbox filesystem/network/process access, test prompt-injection and data-exfiltration resistance, and define an owner and update process.
