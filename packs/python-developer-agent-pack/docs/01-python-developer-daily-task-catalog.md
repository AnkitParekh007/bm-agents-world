# Python Developer Daily Task Catalog

This catalog covers Python API services, Django/Flask applications, automation and CLI tools, background workers, data pipelines/PySpark jobs, libraries, and MCP servers. Not every task is performed every day; the supervisor selects a bounded subset for the current Jira item and repository.

## Work intake and daily planning

1. Open assigned Jira stories, bugs, tasks, and operational requests
2. Read acceptance criteria, comments, linked epics, designs, API contracts, and architecture decisions
3. Identify target project, repository, branch, Python runtime, framework, and environment
4. Review dependencies, blockers, priorities, severity, sprint, and release scope
5. Check recent Jira, Bitbucket, pipeline, deployment, and incident activity
6. Estimate implementation, testing, migration, and review effort
7. Split work into independently verifiable subtasks
8. Identify missing information and post clarification questions
9. Prepare a daily implementation plan and risk summary
10. Update status and blockers during stand-up

## Repository and runtime discovery

11. Clone or open the authorized Bitbucket repository in an isolated workspace
12. Pin the base branch and commit SHA
13. Inspect pyproject.toml, requirements files, lockfiles, setup configuration, tox, nox, Makefile, and container files
14. Detect Python versions supported by source code and CI
15. Detect dependency manager such as pip, uv, Poetry, PDM, pip-tools, or Conda
16. Detect application framework such as FastAPI, Django, Flask, Litestar, or a custom service
17. Detect ORM and database libraries
18. Detect task queues, schedulers, event consumers, and background workers
19. Detect test framework, coverage policy, fixtures, markers, and test commands
20. Detect linting, formatting, typing, security, and packaging conventions
21. Map packages, modules, entry points, boundaries, and dependency direction
22. Identify generated code, migrations, vendored code, protected paths, and code-owner rules
23. Locate relevant domain models, services, endpoints, jobs, queries, tests, and documentation
24. Create a repository context artifact before editing

## Requirements and impact analysis

25. Translate business requirements into backend behavior
26. Identify domain rules, invariants, states, and transitions
27. Identify API, schema, database, queue, cache, filesystem, and external-service impact
28. Identify synchronous versus asynchronous execution requirements
29. Identify transactional boundaries and consistency expectations
30. Identify idempotency, retries, deduplication, and failure-handling requirements
31. Identify authentication, authorization, tenancy, privacy, and audit requirements
32. Identify performance, throughput, latency, memory, and concurrency expectations
33. Identify backward-compatibility and migration requirements
34. Identify observability requirements for logs, metrics, traces, and alerts
35. Identify feature flags, rollout, rollback, and data-repair requirements
36. Score change risk and recommend approval checkpoints
37. Create a change-impact report with affected components and evidence

## Architecture and design

38. Choose the smallest design consistent with repository architecture
39. Define module and package boundaries
40. Define interfaces, protocols, abstract base classes, and dependency injection points
41. Design domain entities, value objects, services, repositories, and adapters where appropriate
42. Define request, response, event, command, and persistence models
43. Design validation and error taxonomies
44. Design transaction, session, and connection lifecycles
45. Design asynchronous task and cancellation behavior
46. Design cache keys, expiration, invalidation, and stampede protection
47. Design retry, timeout, circuit-breaker, and fallback behavior
48. Design secure configuration and secret references
49. Create an implementation plan and rollback plan
50. Record material tradeoffs in an ADR when required

## Python implementation

51. Create or modify modules using the repository's supported Python syntax
52. Add precise type annotations without silently raising the minimum Python version
53. Use dataclasses, TypedDict, Protocol, enums, generics, or Pydantic models where appropriate
54. Implement clear functions and classes with bounded responsibilities
55. Preserve public APIs unless a breaking change is approved
56. Avoid mutable default arguments and hidden global state
57. Handle context managers and resource cleanup correctly
58. Use pathlib and standard-library capabilities where appropriate
59. Implement structured exception handling without swallowing failures
60. Maintain deterministic behavior and reproducible outputs
61. Write docstrings for public and complex behavior
62. Refactor duplicated or excessively complex logic
63. Remove dead code only when scope and evidence permit
64. Generate a code-change manifest for every patch

## API and web service development

65. Implement REST, RPC, webhook, or event-facing endpoints
66. Validate path, query, header, cookie, and body inputs
67. Define stable request and response schemas
68. Return consistent status codes and error bodies
69. Implement authentication and authorization dependencies
70. Enforce tenant and object-level access
71. Implement pagination, filtering, sorting, and search
72. Implement idempotency for retried writes
73. Apply request size, upload, and content-type limits
74. Add correlation IDs and structured request logging
75. Generate or update OpenAPI contracts
76. Maintain backward compatibility or version APIs explicitly
77. Add integration and contract tests
78. Review framework-specific production settings

## Database and persistence

79. Read schema definitions, migrations, constraints, and indexes
80. Implement repository or data-access functions
81. Use parameterized statements and safe ORM query construction
82. Define transaction boundaries
83. Prevent N+1 queries and unnecessary round trips
84. Apply eager or lazy loading intentionally
85. Add indexes only with an evidence-backed migration
86. Create forward and rollback migration plans
87. Validate nullability, uniqueness, foreign keys, check constraints, and cascade behavior
88. Handle optimistic locking or version conflicts where needed
89. Use pagination or streaming for large result sets
90. Test rollback, partial failure, and concurrent updates
91. Run approved read-only diagnostic queries
92. Never perform autonomous production writes

## Async, concurrency, workers, and scheduling

93. Determine whether async code provides value for the workload
94. Avoid blocking calls inside event loops
95. Implement task cancellation and cleanup
96. Bound concurrency and queue sizes
97. Use timeouts for network and long-running operations
98. Avoid sharing unsafe sessions or clients across tasks
99. Implement background jobs with explicit retry policies
100. Make jobs idempotent and deduplicate deliveries
101. Handle poison messages and dead-letter paths
102. Implement graceful shutdown and in-flight task draining
103. Test race conditions and ordering assumptions
104. Verify cron, scheduler, timezone, and daylight-saving behavior
105. Add worker health and backlog observability

## Data engineering and PySpark

106. Read source and target data contracts
107. Profile data quality and schema drift
108. Implement batch or streaming transformations
109. Define partitioning, checkpointing, and watermark behavior
110. Avoid driver-side collection of large datasets
111. Use deterministic transformations and stable keys
112. Handle late, duplicate, malformed, and missing records
113. Implement incremental and restart-safe processing
114. Validate row counts, aggregates, reconciliation, and lineage
115. Optimize joins, shuffles, partition sizes, and file layouts
116. Test transformations with representative small datasets
117. Create data-quality and operational runbooks
118. Protect personally identifiable and confidential data

## Automation, CLI, and scripting

119. Create safe command-line interfaces
120. Validate arguments and configuration
121. Provide dry-run mode for destructive operations
122. Return meaningful exit codes
123. Support non-interactive execution in CI
124. Use structured logs instead of print statements for operational tools
125. Make scripts idempotent and restartable
126. Add confirmation gates for high-impact commands
127. Handle partial progress and resumability
128. Package reusable automation as modules rather than one-off scripts
129. Add shell-independent tests where possible
130. Document examples and failure recovery

## Testing and quality engineering

131. Create unit tests for business logic
132. Create integration tests for databases, queues, filesystems, and external adapters
133. Create API and contract tests
134. Create async tests where required
135. Create regression tests for every fixed defect
136. Use fixtures with clear scope and cleanup
137. Parametrize meaningful input combinations
138. Use test doubles at architectural boundaries rather than mocking internals
139. Use property-based testing for suitable invariants
140. Test negative, boundary, timeout, retry, and concurrency behavior
141. Test migrations and rollback behavior
142. Measure branch and line coverage without treating coverage as correctness
143. Run tests in deterministic isolated environments
144. Quarantine and fix flaky tests rather than repeatedly rerunning them
145. Capture failing seeds, logs, traces, and database state
146. Produce a quality-gate report

## Static analysis and code quality

147. Run the repository formatter
148. Run lint rules and import sorting
149. Run static type checking at the configured strictness
150. Run dead-code and complexity checks when configured
151. Run security-oriented static analysis
152. Run dependency vulnerability and license checks
153. Run secret scanning
154. Review suppressions, ignores, and noqa comments
155. Prevent generated code from masking quality failures
156. Compare quality results with the pinned baseline
157. Fix root causes instead of weakening gates
158. Document accepted exceptions with owners and expiry

## Security engineering

159. Perform threat-focused review for changed trust boundaries
160. Validate all untrusted inputs
161. Prevent injection in SQL, shell, template, path, and expression contexts
162. Avoid unsafe deserialization and dynamic execution
163. Restrict file uploads, archives, and path traversal
164. Use secure randomness and approved cryptography
165. Never log credentials, tokens, personal data, or raw secrets
166. Use constant-time comparison for secret material where appropriate
167. Apply least-privilege database and service accounts
168. Review SSRF, redirect, webhook, and callback risks
169. Review authentication, authorization, session, and token handling
170. Review dependency provenance and malicious-package risks
171. Add security tests and compensating controls
172. Escalate vulnerabilities for human security review

## Performance and reliability

173. Establish a baseline before optimization
174. Profile CPU, memory, allocations, I/O, database queries, and network calls
175. Identify hot paths and high-cardinality operations
176. Avoid premature micro-optimization
177. Use caching only with an invalidation design
178. Batch operations where it preserves correctness
179. Stream large files and responses
180. Prevent unbounded memory growth
181. Define timeout, retry, and backoff budgets
182. Implement health, readiness, and liveness behavior
183. Test degraded dependencies and partial outages
184. Run load or benchmark tests when risk justifies them
185. Document capacity assumptions and observed results

## Dependencies, packaging, and environments

186. Resolve the repository's supported Python and platform matrix
187. Add dependencies only after assessing maintenance, security, license, and transitive impact
188. Pin or constrain dependencies according to project policy
189. Update lockfiles with reproducible tooling
190. Use pyproject.toml and project-approved build configuration
191. Separate runtime, development, test, and optional dependencies
192. Build wheels and source distributions when publishing libraries
193. Verify package metadata, entry points, included files, and license data
194. Test installation in a clean virtual environment
195. Test multiple supported Python versions
196. Prepare dependency upgrade plans and rollback instructions
197. Avoid publishing packages without explicit approval

## Containers and deployment preparation

198. Review Dockerfile and container build context
199. Use approved base images and pinned digests where policy requires
200. Avoid secrets in build arguments, layers, or images
201. Run as a non-root user where supported
202. Minimize runtime dependencies and image size
203. Configure ASGI, WSGI, worker, thread, and timeout settings
204. Implement graceful termination
205. Generate software-bill-of-materials and scan images when configured
206. Validate environment variables and secret references
207. Run smoke tests against built images
208. Prepare deployment, migration, rollback, and verification steps
209. Never deploy to production autonomously

## Code review and Bitbucket workflow

210. Review diffs for correctness, scope, readability, typing, tests, security, performance, and compatibility
211. Check that generated changes do not overwrite unrelated work
212. Confirm base commit has not drifted
213. Prepare focused commits
214. Draft a clear pull-request title and description
215. Link Jira items and architecture decisions
216. Include risk, test evidence, migration, rollout, and rollback sections
217. Identify required reviewers and code owners
218. Respond to review comments with evidence
219. Update patches and rerun affected gates
220. Never force-push or merge without authorized human action

## CI/CD and release readiness

221. Read Bitbucket pipeline configuration
222. Run equivalent local checks when possible
223. Interpret build, test, typing, lint, security, packaging, and container failures
224. Separate code failures from environment and infrastructure failures
225. Request approval before rerunning costly or write-capable pipelines
226. Confirm artifacts correspond to the approved commit
227. Validate configuration and migration ordering
228. Prepare release notes
229. Prepare smoke-test and rollback checklists
230. Review unresolved defects and operational risks
231. Provide go, conditional-go, or no-go evidence while leaving the final decision to humans

## Observability and incident support

232. Add structured logs with stable event names
233. Add metrics for business and technical behavior
234. Add traces across external calls and database operations
235. Avoid high-cardinality labels and sensitive values
236. Create dashboards and alert recommendations
237. Inspect logs, metrics, traces, and incidents for assigned issues
238. Correlate failures to releases and code changes
239. Reproduce incidents in safe environments
240. Prepare diagnosis and remediation plans
241. Create post-incident regression tests
242. Update runbooks and known-error documentation

## Documentation and collaboration

243. Update README, setup, architecture, API, operations, and troubleshooting documentation
244. Create or update ADRs
245. Document environment variables without secret values
246. Document database migrations and recovery
247. Document command examples and expected outputs
248. Prepare daily summaries and stand-up updates
249. Post Jira and Teams updates only after required approval
250. Share implementation and review evidence
251. Mentor developers through explainable recommendations
252. Capture reusable patterns as skills and templates

## Continuous improvement

253. Review escaped defects and recurring incidents
254. Analyze flaky tests and slow pipelines
255. Reduce technical debt with evidence-backed refactors
256. Improve typing coverage incrementally
257. Improve testability, observability, and dependency boundaries
258. Standardize project templates and quality gates
259. Track lead time, review time, defect leakage, rollback rate, and change failure rate
260. Evaluate agent output quality and false-positive rates
261. Retire unsafe or low-value skills
262. Update the pack when Python, frameworks, or organizational policies change

## Recommended autonomous boundary

The agent may read authorized context, create an isolated patch, run deterministic local quality gates, and draft artifacts. Human approval is required before commits, pushes, pull-request creation, Jira or Teams writes, pipeline triggers, database mutations, package publication, deployment actions, or changes to secrets and infrastructure.

Total cataloged tasks: 262.
