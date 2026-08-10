# MCP Servers, Tools, and Plugins

## Terminology

- **Skill:** reusable reasoning and operating procedure.
- **Tool:** atomic deterministic operation such as reading a Figma component, checking contrast, or capturing a screenshot.
- **MCP server:** governed interface exposing resources, prompts, and tools.
- **Plugin/adapter:** runtime integration that implements or enriches a capability.
- **Agent:** orchestrated specialist that applies skills and tools.

## MCP registry

| Server | Purpose | Representative tools |
|---|---|---|
| `atlassian-rovo-mcp` | Jira and Confluence read access; approved Jira/Confluence publication. | jira_search, jira_read, confluence_search, confluence_read, draft_comment, publish_comment |
| `figma-mcp` | Structured Figma design context, variables, components, Dev Mode metadata, Code Connect, and approved canvas writes. | file_read, selection_read, variables_read, components_read, prototype_context, write_to_canvas |
| `design-repository-mcp` | Approved research repository, design briefs, decisions, studies, findings, and governance metadata. | search_studies, read_study, search_insights, read_decision, draft_entry |
| `bitbucket-design-code-mcp` | Read design-system code, frontend implementations, tokens, pull requests, commits, and change history. | repo_search, file_read, diff_read, pr_read, commit_read |
| `storybook-catalog-mcp` | Read implemented component stories, controls, states, documentation, accessibility results, and visual baselines. | story_search, story_read, component_props, a11y_results, visual_baseline |
| `browser-research-mcp` | Isolated Playwright browser for product walkthroughs, competitive analysis, screenshots, responsive checks, and approved prototype tests. | navigate, inspect, screenshot, record_flow, responsive_check, console_read |
| `accessibility-evaluation-mcp` | Deterministic WCAG/APG mapping, contrast, target-size, focus, and axe-assisted checks. | contrast_check, target_size_check, wcag_map, aria_pattern_lookup, axe_scan |
| `product-analytics-mcp` | Read-only funnels, events, feature adoption, cohorts, paths, and experiment results with privacy thresholds. | event_catalog, funnel_read, cohort_read, path_read, experiment_read |
| `user-feedback-mcp` | Read approved support themes, survey responses, app feedback, interview notes, and sanitized verbatims. | theme_search, feedback_search, survey_read, verbatim_read |
| `content-localization-mcp` | Read terminology, content standards, translation status, locale constraints, and approved copy. | term_search, content_standard_read, locale_read, translation_status |
| `asset-library-mcp` | Read approved icons, illustrations, images, fonts metadata, licenses, and brand assets. | asset_search, asset_metadata, license_read, brand_guideline_read |
| `experimentation-mcp` | Read experiment catalog and draft hypotheses or measurement plans; launches require human approval. | experiment_search, metric_read, draft_experiment, publish_experiment |
| `artifact-evidence-mcp` | Store and retrieve redacted, hashed design and research artifacts with provenance. | artifact_write, artifact_read, hash, redact, retention_tag |
| `collaboration-mcp` | Draft and approved publication to Microsoft Teams or organizational collaboration channels. | draft_message, publish_message, thread_read |
| `secret-capability-broker-mcp` | Issues short-lived adapter capabilities without exposing credentials to the model. | lease_request, lease_revoke, capability_status |
| `policy-approval-mcp` | Evaluates policy and manages payload-bound approvals. | policy_check, approval_request, approval_status, approval_consume |

## Plugin registry

| Plugin | Purpose |
|---|---|
| `figma-dev-mode` | Figma Dev Mode integration for structured specifications and implementation context. |
| `figma-code-connect` | Maps Figma components to production design-system code. |
| `figjam-collaboration` | Facilitates approved workshops, affinity maps, journeys, and service blueprints. |
| `storybook-review` | Surfaces implemented components and states for design-system and handoff review. |
| `axe-accessibility` | Runs deterministic accessibility checks and produces issue evidence. |
| `playwright-browser` | Runs isolated product walkthroughs, prototype validations, screenshots, and responsive checks. |
| `visual-diff` | Compares approved designs, baselines, and implementation screenshots. |
| `design-token-transformer` | Validates and transforms tokens between design and code formats. |
| `contrast-analyzer` | Checks color contrast and non-text contrast combinations. |
| `content-linter` | Checks clarity, terminology, tone, consistency, and localization readiness. |
| `localization-preview` | Previews text expansion, RTL, locale formats, and truncation risks. |
| `analytics-reader` | Provides privacy-thresholded read-only product analytics. |
| `research-recorder` | Captures approved sessions and generates redacted transcripts. |
| `research-repository` | Indexes studies, evidence, findings, and decisions. |
| `survey-adapter` | Drafts and reads approved survey instruments and responses. |
| `jira-confluence-adapter` | Reads work context and publishes approved design updates. |
| `teams-adapter` | Publishes approved critique, research, and handoff summaries. |
| `privacy-redactor` | Removes direct identifiers and sensitive content before model processing or retention. |
| `artifact-signer` | Hashes and signs immutable design decision and validation bundles. |
| `opa-policy-client` | Evaluates runtime scope, privacy, publication, and mutation policies. |

## Recommended implementation order

1. Atlassian read, Figma read, design repository, Bitbucket read, artifact/evidence, policy, and secret broker.
2. Browser, Storybook, accessibility, design-token, and content tools.
3. Analytics, feedback, research operations, localization, experiment, and collaboration publication.
4. Figma canvas writes and shared-library publication only after approval, audit, and rollback controls are proven.

## Tool safety

All writes are draft-by-default. Participant contact, recording, survey launch, experiment launch, shared Figma edits, library publication, Jira/Confluence/Teams publication, and production screenshots require explicit policy and approval. Raw credentials and direct participant identifiers never enter model context.
