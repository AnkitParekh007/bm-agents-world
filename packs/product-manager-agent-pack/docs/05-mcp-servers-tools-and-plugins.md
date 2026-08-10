# MCP Servers, Tools, and Plugins

## Definitions

- **Skill:** reusable product-management reasoning or workflow capability.
- **Tool:** deterministic operation such as reading a Jira item, querying a metric, calculating a score, or creating an artifact.
- **MCP server:** governed boundary exposing resources, prompts, and tools.
- **Plugin/adapter:** runtime integration with a product or deterministic library.
- **Artifact:** durable product output with provenance and approval state.

## MCP registry

| Server | Purpose | Example tools |
|---|---|---|
| `atlassian-rovo-mcp` | Jira and Confluence context, links, comments, plans, and approval-controlled publication. | jira_search, jira_read, confluence_search, confluence_read |
| `jira-product-discovery-mcp` | Ideas, insights, fields, scores, views, roadmaps, and approved idea or roadmap updates. | idea_search, idea_read, insight_read, score_read |
| `product-management-platform-mcp` | Optional Productboard or equivalent adapter for customer insights, objectives, features, prioritization, and roadmaps. | insight_search, feature_read, objective_read, prioritization_read |
| `bitbucket-product-context-mcp` | Read repositories, pull requests, commits, release branches, changelogs, and delivery history. | repo_search, file_read, diff_read, pr_read |
| `figma-design-context-mcp` | Read design files, prototypes, components, variables, annotations, and approved design status. | file_read, prototype_read, component_read, annotation_read |
| `customer-feedback-mcp` | Read approved support, survey, community, interview, NPS/CSAT, and feedback themes with redaction. | feedback_search, theme_read, survey_read, verbatim_read |
| `crm-sales-insights-mcp` | Read approved CRM opportunity themes, win-loss notes, segments, and commercial context with data minimization. | account_theme_search, win_loss_read, segment_summary, opportunity_pattern_read |
| `product-analytics-mcp` | Read-only funnels, retention, cohorts, journeys, adoption, dashboards, and event definitions with privacy thresholds. | event_catalog, metric_read, funnel_read, retention_read |
| `experimentation-feature-management-mcp` | Read flags and experiments; draft hypotheses and rollout plans; launches and production mutations require approval. | flag_read, experiment_read, metric_read, draft_experiment |
| `data-warehouse-insights-mcp` | Runs approved read-only aggregate queries against curated product marts and semantic models. | dataset_catalog, semantic_metric_read, aggregate_query, data_quality_read |
| `market-research-browser-mcp` | Isolated browser and public-source retrieval for competitors, regulations, pricing pages, and market evidence. | search, navigate, capture, source_metadata |
| `roadmap-portfolio-mcp` | Reads objectives, initiatives, capacity assumptions, dependencies, and portfolio views; writes require approval. | objective_read, initiative_read, capacity_read, dependency_read |
| `release-delivery-mcp` | Reads CI/CD, environments, feature status, release candidates, incidents, and quality gates. | pipeline_read, deployment_read, environment_read, quality_gate_read |
| `calendar-meeting-mcp` | Reads approved meetings and creates decision-ready agendas or follow-up drafts. | calendar_read, meeting_context, agenda_draft, followup_draft |
| `collaboration-mcp` | Drafts and publishes approved updates to Microsoft Teams or organizational collaboration channels. | thread_read, draft_message, publish_message |
| `artifact-evidence-mcp` | Stores and retrieves redacted, hashed product artifacts, evidence, decisions, and approvals. | artifact_write, artifact_read, hash, redact |
| `secret-capability-broker-mcp` | Issues short-lived adapter capabilities without exposing credentials to the language model. | lease_request, lease_status, lease_revoke |
| `policy-approval-mcp` | Evaluates policy and manages payload-bound approvals for publication, customer contact, experiments, and external commitments. | policy_check, approval_request, approval_status, approval_consume |

## Runtime plugins

| Plugin | Purpose |
|---|---|
| `jira-product-discovery-adapter` | Connects ideas, insights, prioritization fields, views, and roadmaps. |
| `productboard-adapter` | Optional adapter for Productboard insights, features, objectives, and roadmaps. |
| `atlassian-jira-confluence-adapter` | Reads delivery context and publishes approved product updates. |
| `bitbucket-read-adapter` | Reads code and delivery history for feasibility and release context. |
| `figma-context-adapter` | Reads approved UX artifacts, prototypes, components, and design decisions. |
| `amplitude-analytics-adapter` | Reads privacy-thresholded product analytics and experiment results. |
| `mixpanel-analytics-adapter` | Optional read-only product analytics integration where used by the organization. |
| `launchdarkly-adapter` | Reads feature flags and experiments; mutations require approved deterministic action. |
| `optimizely-adapter` | Optional experiment catalog and results integration. |
| `crm-insights-adapter` | Provides minimized CRM and win-loss themes without broad customer-record exposure. |
| `support-feedback-adapter` | Aggregates approved support cases, feature requests, and customer pain themes. |
| `survey-research-adapter` | Drafts approved surveys and reads sanitized aggregate responses. |
| `data-warehouse-reader` | Executes bounded read-only queries against curated product datasets. |
| `market-research-browser` | Captures public competitive and regulatory evidence with source provenance. |
| `prioritization-calculator` | Calculates RICE, WSJF, value-effort, cost-of-delay, and configurable scoring models. |
| `roadmap-renderer` | Produces outcome, theme, now-next-later, scenario, and stakeholder roadmap views. |
| `experiment-statistics-reviewer` | Checks metric definitions, exposure, sample assumptions, guardrails, and readout quality. |
| `meeting-decision-capture` | Extracts decisions, owners, dates, open questions, and actions from approved meeting artifacts. |
| `teams-publisher` | Publishes approved stakeholder, roadmap, release, and outcome updates. |
| `privacy-redactor` | Removes direct identifiers and sensitive commercial or customer data before model processing. |
| `artifact-signer` | Hashes and signs immutable product decision and release evidence bundles. |
| `opa-policy-client` | Evaluates scope, data use, publication, experiment, and commitment policies. |

## Tool safety classes

| Class | Examples | Default |
|---|---|---|
| Read | Jira read, analytics aggregate, roadmap read | Allowed in scope |
| Compute | scoring, scenario analysis, metric calculation | Allowed with declared inputs |
| Draft | product brief, roadmap draft, Jira draft | Allowed in isolated workspace |
| Publish | Jira/JPD update, roadmap publication, Teams message | Human approval |
| Customer-facing | interview invitation, survey, beta, communication | Study/account approval |
| Production mutation | flags, deployment, entitlement, billing, data | Prohibited for autonomous PM agent |

Adapters must perform authentication, redaction, rate limiting, tenancy checks, idempotency, preview, approval verification, and audit logging outside the language model.
