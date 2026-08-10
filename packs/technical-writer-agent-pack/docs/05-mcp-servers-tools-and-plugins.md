# MCP Servers, Tools, and Plugins

## Separation of concerns

- MCP servers expose governed resources, prompts, and tools.
- Deterministic plugins perform parsing, validation, linting, building, rendering, redaction, and diffing.
- Skills describe reusable agent capability.
- Artifacts are versioned outputs.

## MCP registry

| Server | Purpose | Mode |
|---|---|---|
| `atlassian-context-mcp` | Jira and Confluence read access plus approval-controlled documentation publication. | mixed |
| `bitbucket-docs-mcp` | Repository, pull request, branch, commit, and documentation-file access for Bitbucket projects. | mixed |
| `workspace-files-mcp` | Scoped read/write access to isolated documentation workspaces and generated artifacts. | mixed |
| `source-code-intelligence-mcp` | Read-only symbols, APIs, configuration, tests, comments, and dependency context from approved repositories. | read-only |
| `documentation-platform-mcp` | Documentation-site or CMS navigation, metadata, preview, and approval-controlled publication. | mixed |
| `openapi-contract-mcp` | Read, validate, diff, and render approved OpenAPI descriptions. | read-only |
| `asyncapi-contract-mcp` | Read, validate, diff, and render approved AsyncAPI descriptions. | read-only |
| `storybook-design-system-mcp` | Read component stories, props, states, accessibility notes, and usage examples. | read-only |
| `figma-design-context-mcp` | Read approved UI designs, labels, components, flows, annotations, and screenshots. | read-only |
| `browser-preview-mcp` | Render documentation and product flows in isolated Playwright browser workers. | isolated-execution |
| `support-and-feedback-mcp` | Read redacted support trends, known issues, FAQs, and feedback summaries. | read-only |
| `documentation-analytics-mcp` | Read privacy-safe search, page, feedback, and task-success analytics. | read-only |
| `localization-tms-mcp` | Read terminology and translation status; approval-controlled handoff to the translation system. | mixed |
| `terminology-and-glossary-mcp` | Read approved terms, product names, acronyms, banned terms, and definitions. | read-only |
| `diagram-rendering-mcp` | Render Mermaid, PlantUML, Graphviz, and approved image assets in an isolated worker. | isolated-execution |
| `artifact-and-evidence-mcp` | Store versioned drafts, previews, review reports, manifests, and immutable evidence bundles. | mixed |
| `vault-capability-mcp` | Provides short-lived connector capabilities to trusted adapters without exposing secrets to the model. | broker-only |
| `policy-and-approval-mcp` | Evaluates OPA policy and obtains payload-bound approval for protected publication actions. | control-plane |

## Deterministic plugins

| Plugin | Purpose |
|---|---|
| `repository-documentation-inventory` | Scans approved repositories for README, docs, ADR, API, runbook, changelog, and contribution content. |
| `content-structure-parser` | Parses Markdown, MDX, AsciiDoc, reStructuredText, HTML, and DITA metadata into a normalized model. |
| `markdown-and-markup-linter` | Checks markup syntax, heading structure, lists, tables, code fences, and front matter. |
| `vale-prose-linter` | Runs project-configured prose, terminology, voice, and inclusivity rules. |
| `spell-and-term-checker` | Checks spelling, approved terminology, product names, acronyms, and forbidden variants. |
| `readability-and-scanability-analyzer` | Calculates sentence, paragraph, heading, list, and cognitive-load indicators without replacing human judgment. |
| `link-and-anchor-checker` | Validates internal links, external links, anchors, redirects, and orphan pages. |
| `code-snippet-extractor` | Extracts version-bound examples from source, tests, OpenAPI, CLI help, and configuration. |
| `code-snippet-test-runner` | Executes approved snippets in isolated, version-pinned sandboxes. |
| `openapi-validator-and-differ` | Validates OpenAPI syntax and detects contract and documentation changes. |
| `asyncapi-validator-and-differ` | Validates AsyncAPI syntax and detects event-contract documentation changes. |
| `documentation-build-and-preview` | Builds the configured documentation site and produces isolated previews. |
| `screenshot-and-annotation-tool` | Captures approved non-sensitive screens and creates accessible annotations. |
| `diagram-renderer` | Renders Mermaid, PlantUML, Graphviz, and SVG outputs with source preservation. |
| `accessibility-content-checker` | Checks headings, links, alt text, captions, table headers, language, and keyboard-readable output. |
| `duplicate-and-overlap-detector` | Finds duplicate, conflicting, fragmented, and near-duplicate content. |
| `documentation-change-impact-analyzer` | Maps product, code, API, UI, config, and release changes to affected documentation. |
| `metadata-and-content-model-validator` | Validates owners, audience, content type, status, version, product, dates, and taxonomy fields. |
| `search-index-and-zero-result-analyzer` | Analyzes approved search queries, zero results, ranking, and synonym opportunities. |
| `localization-readiness-checker` | Flags idioms, ambiguous references, concatenated text, locale-specific assumptions, and hard-coded variables. |
| `pii-and-secret-redactor` | Detects and redacts personal data, credentials, tokens, internal hosts, and unsafe examples. |
| `documentation-diff-and-review-bundler` | Creates review-ready diffs, previews, validation results, evidence, and payload hashes. |

## Tool safety

All tool calls are project-, version-, collection-, and destination-bound. Protected writes require payload hashes and non-self approval. Browser and code execution occur in isolated workers with egress restrictions and synthetic data.
