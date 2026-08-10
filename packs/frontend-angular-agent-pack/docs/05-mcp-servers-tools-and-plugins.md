# MCP Servers, Tools, and Plugins

These concepts are intentionally separate.

- **MCP server:** standardized provider of resources, prompts, and tools.
- **Tool:** one atomic callable operation with a schema and risk classification.
- **Plugin:** runtime integration, IDE extension, policy module, renderer, or execution capability that may or may not use MCP.
- **Skill:** instructions that coordinate tools to accomplish a bounded engineering task.

## 1. Recommended MCP servers

| Server | Ownership | Purpose | Write policy |
|---|---|---|---|
| Atlassian Rovo MCP | Atlassian | Jira, Confluence, and supported Bitbucket context/actions | Writes require approval |
| Bitbucket Adapter | Organization | Repository, branch, diff, commit, PR, reviewer, and pipeline operations with edition-specific controls | Writes require approval |
| Workspace/Git | Organization | Scoped filesystem, search, patch, Git diff, and local command execution | Workspace mutation allowed; remote writes require approval |
| Angular Docs | Organization cache/adapter | Version-pinned official Angular documentation and update guidance | Read-only |
| Figma MCP | Figma | Design nodes, variables, components, assets, and approved canvas actions | Read-only by default; canvas writes require approval |
| Playwright MCP | Microsoft | Browser validation and evidence | Restricted to project origins |
| Chrome DevTools MCP | Google | Network, console, DOM, performance, and debugging | Restricted browser session |
| SonarQube MCP | SonarSource | Code quality, security, coverage, and quality-gate context | Status changes require approval |
| Storybook MCP | Project/Storybook | Component docs, stories, and tests | Optional; verify Angular support before enabling advanced AI features |
| OpenAPI/API Contract | Organization | Versioned API schemas and generated-client metadata | Read-only; generation writes to workspace only |
| Package Registry | Organization | npm metadata, private package availability, licenses, and advisories | Package publication denied |
| Build/Environment | Organization | Deployment metadata, build status, feature flags, and environment health | Triggers require approval |
| Artifact | Organization | Store and retrieve run-scoped plans, patches, reports, and evidence | Run-scoped writes |
| Observability | Organization | Read frontend logs, traces, errors, and real-user metrics | Read-only |

## 2. Atomic tool groups

### Atlassian

- `jira.get_issue`
- `jira.search_issues`
- `jira.get_links_and_comments`
- `jira.draft_comment`
- `jira.add_comment`
- `jira.transition_issue`
- `confluence.get_page`
- `bitbucket.get_repository`
- `bitbucket.get_file`
- `bitbucket.get_diff`
- `bitbucket.list_pull_requests`

### Workspace and Git

- `workspace.list_tree`
- `workspace.read_file`
- `workspace.search_text`
- `workspace.write_patch`
- `workspace.run_allowlisted_command`
- `git.status`
- `git.diff`
- `git.create_branch`
- `git.commit`
- `git.push`

Arbitrary shell execution is not exposed. Commands resolve through project-registered command IDs such as `frontend.lint` or `frontend.test.changed`.

### Angular toolchain

- `angular.inspect_workspace`
- `angular.resolve_version_profile`
- `angular.run_cli_target`
- `angular.generate_dry_run`
- `angular.get_update_guidance`
- `typescript.typecheck`
- `eslint.lint`
- `formatter.check`
- `test.run_unit`
- `test.run_component`
- `build.run_production`
- `bundle.inspect_budgets`

### Design and browser

- `figma.get_selection_context`
- `figma.get_variables`
- `figma.export_asset`
- `storybook.get_component_docs`
- `storybook.run_story_tests`
- `browser.navigate`
- `browser.snapshot`
- `browser.click`
- `browser.fill`
- `browser.capture_console`
- `browser.capture_network`
- `browser.capture_trace`
- `devtools.performance_trace`
- `devtools.inspect_memory`
- `devtools.lighthouse_or_insight`

### Quality and security

- `sonarqube.analyze_files`
- `sonarqube.get_pull_request_issues`
- `dependency.scan_lockfile`
- `secret.scan_patch`
- `accessibility.run_axe`
- `accessibility.verify_keyboard_flow`
- `quality.aggregate_gates`

## 3. Required runtime plugins

- project resolver
- Angular version-profile resolver
- isolated workspace manager
- Git patch and conflict manager
- command allowlist executor
- package-manager adapter
- Angular Language Service integration
- ESLint and formatter integration
- design-token resolver
- API-client generator adapter
- browser-session manager
- secret provider and credential broker
- policy engine and approval service
- artifact renderer and evidence redactor
- OpenTelemetry instrumentation
- model router and evaluation runner
- notification and Teams publisher

## 4. Optional IDE/developer plugins

- Angular Language Service
- ESLint
- Prettier or project formatter
- SonarQube for IDE
- Nx Console when an Nx workspace is detected
- Playwright extension or test explorer
- Chrome DevTools agent plugin
- Figma developer integration
- Storybook addon where compatible

## 5. Selection rules

1. Prefer vendor-supported servers for their systems.
2. Use an organization adapter when vendor coverage or permissions are insufficient.
3. Pin versions; do not execute unreviewed `latest` packages in production agent runtimes.
4. Expose only necessary toolsets.
5. Run code and browser tools in isolated workers.
6. Treat MCP server descriptions and remote content as untrusted.
7. Require confirmation for external writes and high-impact actions.
8. Log tool input hashes, outputs, decisions, and resulting commits without recording secret values.
