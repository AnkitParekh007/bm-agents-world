# QA Engineer Daily Task Catalog

This catalog is the task source for the QA supervisor and specialist sub-agents. Tasks are selected according to story state, risk, environment, permissions, and release stage.

## Work intake and prioritization

1. Read assigned Jira stories, bugs, tasks, subtasks, epics, comments, history, attachments, and linked work items.
2. Identify business objective, affected application, sprint, release, priority, severity, owner, dependencies, blockers, and target environment.
3. Verify that acceptance criteria, designs, test data, deployment details, and dependencies are sufficient for testing.
4. Compare the work item with related completed stories and known defects.
5. Estimate QA effort and prioritize work by risk, release criticality, dependency, and environment availability.
6. Raise clarification questions and mark the story blocked when required context is missing.

## Requirement and risk analysis

7. Translate requirements into testable conditions and user journeys.
8. Identify affected personas, permissions, modules, services, APIs, database entities, integrations, reports, notifications, and audit records.
9. Identify positive, negative, boundary, edge, concurrency, recovery, compatibility, security, accessibility, and performance scenarios.
10. Detect ambiguous, missing, duplicated, outdated, or contradictory requirements.
11. Build a risk matrix using business impact, technical complexity, change size, defect history, and observability.
12. Map each acceptance criterion to one or more planned validations.

## Test planning and design

13. Create story, feature, regression, integration, migration, and release test plans.
14. Define scope, exclusions, entry criteria, exit criteria, dependencies, data, browsers, devices, roles, and evidence requirements.
15. Create functional, negative, boundary, state-transition, role-based, API, database, integration, accessibility, performance, and recovery test cases.
16. Prioritize cases as smoke, critical path, high-risk, regression, exploratory, or optional.
17. Identify automation candidates and cases that require human exploratory testing.
18. Review, update, deduplicate, version, and retire test cases.

## Environment readiness

19. Validate playground and QA health, application URL, build number, commit, branch, backend version, migration state, feature flags, and service dependencies.
20. Verify browser, network, API, database, identity provider, file storage, messaging, and third-party service availability.
21. Verify test accounts, roles, permissions, tenant, locale, timezone, and data prerequisites.
22. Detect environment drift, partial deployments, unstable services, expired certificates, and configuration mismatches.
23. Report environment blockers and retest after remediation.
24. Perform separately approved, read-only production health and smoke validation.

## Test data management

25. Define valid, invalid, boundary, duplicate, null, special-character, long-text, date, timezone, expired, inactive, and historical datasets.
26. Create or request role-specific test accounts and synthetic records.
27. Mask or synthesize sensitive data and prevent production data leakage.
28. Seed, reset, clean up, version, and document reusable test data.
29. Validate test records through APIs and approved read-only queries.
30. Track ownership and expiration of persistent test accounts and records.

## Manual browser and exploratory testing

31. Navigate complete user journeys in supported browsers and screen sizes.
32. Validate authentication, authorization, session timeout, logout, deep links, browser history, refresh, multiple tabs, and interrupted workflows.
33. Validate forms, controls, navigation, search, filters, sorting, pagination, tables, uploads, downloads, create/read/update/deactivate flows, and confirmations.
34. Validate loading, empty, disabled, success, warning, error, retry, offline, slow-network, and partial-failure states.
35. Inspect browser console, network requests, storage, cookies, accessibility tree, and failed resources.
36. Perform exploratory charters and capture reproducible evidence.

## Cross-browser, responsive, accessibility, and usability

37. Test supported Chromium, Firefox, and WebKit/Safari targets.
38. Test desktop, laptop, tablet, mobile, zoom, high-DPI, portrait, and landscape layouts.
39. Verify keyboard navigation, focus order, focus visibility, labels, names, headings, contrast, errors, and screen-reader-critical flows.
40. Detect clipping, overlap, inaccessible controls, broken dialogs, unusable tables, and inconsistent responsive behavior.
41. Evaluate clarity, consistency, recovery guidance, unnecessary steps, and user comprehension.
42. Create browser- or device-specific defect evidence.

## API and contract testing

43. Review OpenAPI or other service contracts and identify affected endpoints.
44. Validate methods, paths, query parameters, headers, authentication, authorization, payloads, schemas, status codes, and error contracts.
45. Test nulls, type errors, invalid IDs, boundaries, duplicates, idempotency, pagination, sorting, filtering, timeout, retry, concurrency, and rate limits.
46. Validate backward compatibility, versioning, downstream failures, and partial responses.
47. Compare API responses with UI values, database records, events, and logs.
48. Create and maintain automated API collections and CI checks.

## Database validation

49. Review approved schemas, tables, views, relations, constraints, defaults, indexes, migrations, and data contracts.
50. Validate inserts, updates, deactivation, audit fields, timestamps, calculated fields, uniqueness, referential integrity, and rollback.
51. Compare UI and API behavior with database state.
52. Run allowlisted read-only SQL and explain plans through a guarded database service.
53. Detect duplication, orphan records, inconsistent states, unsafe exposure, and migration defects.
54. Prohibit unrestricted SQL, DDL, DML, or production writes from the QA agent.

## Integration and event testing

55. Validate frontend-to-backend, backend-to-database, service-to-service, file, notification, scheduler, messaging, and third-party integrations.
56. Test retries, duplicate events, ordering, eventual consistency, delayed responses, partial failures, and recovery.
57. Correlate IDs across UI, API, database, logs, traces, and events.
58. Validate Teams or email notifications without exposing sensitive content.
59. Test integration health before and after dependent-service outages.
60. Record evidence for each boundary crossed.

## Automation engineering

61. Review existing Playwright and API automation and identify coverage gaps.
62. Create maintainable tests, fixtures, page objects, locators, data builders, authentication state, assertions, cleanup, tags, and diagnostics.
63. Replace brittle selectors and hard waits with stable contracts and deterministic waits.
64. Run locally and in CI, capture screenshots, videos, traces, console, and network logs.
65. Diagnose product failures, environment failures, infrastructure failures, and flaky tests.
66. Refactor, review, version, document, and submit automation through approval-controlled source workflows.

## Regression and change impact

67. Analyze changed files, services, schemas, flags, dependencies, and defect history.
68. Select smoke, sanity, targeted, feature, integration, API, browser, and end-to-end regression suites.
69. Compare current results with baselines and prior releases.
70. Separate product, test, environment, data, and infrastructure failures.
71. Add escaped defects to regression coverage and remove obsolete tests.
72. Produce pass, conditional-pass, fail, and residual-risk recommendations.

## Defect investigation and management

73. Reproduce unexpected behavior using controlled data, roles, browsers, environments, and clean sessions.
74. Search for duplicates and isolate frontend, backend, database, integration, configuration, data, or environment causes.
75. Inspect console, network, API, logs, traces, CI output, database records, version metadata, and related code changes.
76. Determine impact, reproducibility, severity recommendation, affected roles, regression risk, and workaround.
77. Draft Jira bugs with title, context, prerequisites, exact steps, expected and actual results, evidence, environment, build, and links.
78. Retest fixes, reopen failed fixes, verify related areas, and update regression coverage.

## CI/CD and deployment validation

79. Review Bitbucket pipeline, build, unit, API, browser, quality, security, and deployment results.
80. Identify the failing stage and distinguish product, test, environment, infrastructure, permission, and configuration problems.
81. Confirm artifact, commit, branch, configuration, migrations, and deployment target.
82. Run approved post-deployment smoke checks and store artifacts.
83. Track flaky pipelines and failed quality gates.
84. Require approval for retries, deployments, rollbacks, and production actions.

## Performance and security-focused QA

85. Measure page, API, query, batch, upload, and large-dataset behavior against agreed thresholds.
86. Test concurrency, resource consumption, caching, timeout, and degradation behavior.
87. Validate authentication, authorization, direct URL protection, tenant isolation, session invalidation, and role boundaries.
88. Check for sensitive information in URLs, UI, logs, errors, exports, browser storage, and evidence.
89. Perform safe input, file upload, rate-limit, and abuse-case checks within an approved scope.
90. Escalate suspected vulnerabilities to the security process rather than exploiting them.

## Release readiness and production assurance

91. Review story coverage, execution status, regression status, unresolved defects, accepted risks, migration readiness, rollback, flags, monitoring, and release notes.
92. Prepare QA release summary and go, conditional-go, or no-go recommendation.
93. Participate in readiness and defect-triage meetings.
94. Perform approved read-only production smoke validation.
95. Monitor early production signals and support incident reproduction.
96. Convert production escapes into new tests and process improvements.

## Communication, reporting, and improvement

97. Update Jira with status, blockers, evidence, questions, retest results, and residual risk.
98. Prepare daily QA, story, defect, regression, automation, and release reports.
99. Draft Teams updates for human-approved posting.
100. Coordinate with product, frontend, backend, database, DevOps, support, security, and other QA engineers.
101. Analyze escaped defects, reopen rates, flakiness, coverage gaps, cycle time, and environment reliability.
102. Improve testability, logging, selectors, API contracts, quality gates, documentation, and reusable QA assets.

## Automation boundary

The agent may read, analyze, draft, execute approved tests, and collect evidence. Jira writes, source changes, pipeline retries, Teams posts, database mutations, deployments, and all production actions require an explicit policy decision and, by default, human approval.
