# QA Agent Skills Catalog

A skill is a versioned procedural capability: instructions, required inputs, allowed tools, expected outputs, checks, and escalation rules. Skills are not credentials and are not external integrations.

## Story and planning skills

1. `qa.story.read-context` — Read a story, links, history, comments, attachments, and parent context.
2. `qa.story.acceptance-criteria-analysis` — Convert acceptance criteria into verifiable conditions.
3. `qa.story.gap-detection` — Find ambiguity, contradictions, missing states, missing roles, and missing failure behavior.
4. `qa.story.question-generation` — Draft concise clarification questions with impact.
5. `qa.risk.story-scoring` — Score business, technical, data, integration, security, and regression risk.
6. `qa.change.frontend-impact` — Map Angular/AngularJS changes to pages, components, routes, state, and selectors.
7. `qa.change.backend-impact` — Map Java changes to endpoints, services, events, and failure modes.
8. `qa.change.database-impact` — Interpret migrations, schema changes, and data compatibility.
9. `qa.plan.story-test-plan` — Produce scope, strategy, environments, data, evidence, and exit criteria.
10. `qa.plan.regression-selection` — Select suites from change impact and risk.

## Test design skills

11. `qa.design.functional-cases`
12. `qa.design.negative-cases`
13. `qa.design.boundary-analysis`
14. `qa.design.state-transition`
15. `qa.design.role-permission-matrix`
16. `qa.design.pairwise-combinations`
17. `qa.design.api-contract-cases`
18. `qa.design.database-validation-cases`
19. `qa.design.integration-cases`
20. `qa.design.accessibility-cases`
21. `qa.design.performance-cases`
22. `qa.design.security-abuse-cases`
23. `qa.design.recovery-and-resilience`
24. `qa.design.traceability-matrix`

## Execution skills

25. `qa.env.verify-deployment`
26. `qa.env.verify-dependencies`
27. `qa.data.create-synthetic-dataset`
28. `qa.data.reset-test-dataset`
29. `qa.browser.execute-scripted-case`
30. `qa.browser.exploratory-charter`
31. `qa.browser.capture-console-network`
32. `qa.browser.cross-browser-validation`
33. `qa.browser.responsive-validation`
34. `qa.browser.accessibility-check`
35. `qa.api.execute-contract-suite`
36. `qa.api.compare-ui-api`
37. `qa.db.execute-readonly-validation`
38. `qa.db.compare-api-database`
39. `qa.integration.trace-transaction`
40. `qa.ci.interpret-pipeline-failure`

## Defect and retest skills

41. `qa.defect.reproduce`
42. `qa.defect.duplicate-search`
43. `qa.defect.isolate-layer`
44. `qa.defect.severity-recommendation`
45. `qa.defect.draft-jira-bug`
46. `qa.defect.collect-evidence`
47. `qa.retest.verify-fix`
48. `qa.retest.targeted-regression`
49. `qa.defect.production-escape-analysis`

## Automation skills

50. `qa.automation.playwright-generate`
51. `qa.automation.page-object-refactor`
52. `qa.automation.locator-hardening`
53. `qa.automation.fixture-design`
54. `qa.automation.flake-triage`
55. `qa.automation.api-test-generate`
56. `qa.automation.review-test-patch`
57. `qa.automation.ci-integration`

## Reporting, governance, and safety skills

58. `qa.report.daily-summary`
59. `qa.report.story-result`
60. `qa.report.regression-result`
61. `qa.report.release-readiness`
62. `qa.report.teams-update-draft`
63. `qa.evidence.redact-sensitive-data`
64. `qa.evidence.build-manifest`
65. `qa.policy.classify-tool-risk`
66. `qa.policy.prepare-approval-request`
67. `qa.policy.verify-action-result`
68. `qa.security.prompt-injection-screening`
69. `qa.security.secret-leak-screening`
70. `qa.eval.score-agent-run`

## Skill package contract

Every skill implementation should declare:

```yaml
id: qa.defect.draft-jira-bug
version: 1.0.0
owner: qa-platform
inputs:
  - failed_test_result
  - evidence_manifest
allowed_tools:
  - jira.search_issues
  - artifact.read
outputs:
  - bug_draft
approval:
  required_for:
    - jira.create_issue
checks:
  - no_secret_values
  - evidence_references_resolve
  - reproduction_steps_are_deterministic
  - expected_and_actual_are_distinct
```

## Skill quality requirements

- Deterministic output schema where possible.
- Evidence-backed assertions.
- Explicit failure and blocked states.
- Idempotent retry behavior.
- Input and output size limits.
- Versioning, owner, tests, and evaluation set.
- Tool allowlist and environment constraints.
- Redaction and data-classification checks.
