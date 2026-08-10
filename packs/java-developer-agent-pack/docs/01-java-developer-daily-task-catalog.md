# Java Developer Daily Task Catalog

This catalog covers Spring Boot services, Spring MVC monoliths, Jakarta EE applications, messaging integrations, batch jobs, shared libraries, CLI tools and Java MCP servers. Not every task is performed every day; the supervisor selects a bounded subset for the current Jira item and repository.

## Work intake and planning

1. Open assigned Jira stories, bugs, technical tasks and operational requests
2. Read acceptance criteria, comments, linked epics, designs, ADRs, incidents and API contracts
3. Identify project, repository, module, branch, environment and required delivery date
4. Confirm whether the work affects PCC, SOP, DataBridge or a shared service
5. Review dependencies, blockers, linked frontend work and downstream consumers
6. Check recent pull requests, deployments, incidents and known defects in the affected area
7. Estimate implementation, test, migration and review effort
8. Identify approvals required before code, data, pipeline or environment mutations
9. Prepare daily plan and communicate blockers

## Repository and runtime discovery

10. Detect Maven or Gradle and require the repository wrapper when available
11. Read parent POMs, BOMs, settings, convention plugins and multi-module layout
12. Resolve JDK vendor and version, source/target/release level and bytecode constraints
13. Inspect Spring Boot, Spring Framework, Jakarta EE or vendor framework versions
14. Detect application server, servlet container, packaging and deployment descriptors
15. Detect JPA provider, database driver, migration framework and connection-pool configuration
16. Detect messaging, cache, scheduler and external client libraries
17. Discover test frameworks, static-analysis tools, formatting rules and coverage thresholds
18. Read CONTRIBUTING, CODEOWNERS, branch rules and repository-specific agent instructions
19. Build symbol, module and dependency maps before editing

## Requirement and impact analysis

20. Translate acceptance criteria into implementation obligations
21. Trace affected controller, service, repository, event and database paths
22. Identify public APIs, events, schemas, configuration keys and operational behavior that may change
23. Assess backward compatibility for clients, consumers and rolling deployments
24. Identify transaction, concurrency, security, privacy and performance risks
25. Identify required database or event-schema migrations
26. Identify feature-flag, rollout, rollback and observability requirements
27. List ambiguities and obtain clarification before high-risk implementation
28. Produce architecture-impact and test-scope artifacts

## Domain and application development

29. Implement domain entities, aggregates, records, value objects and invariants
30. Implement application services and orchestration logic
31. Preserve layering and package boundaries
32. Apply repository-compatible Java language features only
33. Design immutable objects and defensive copies where needed
34. Handle nullability and Optional consistently
35. Design exceptions and error translation without leaking internals
36. Implement validation and authorization at trust boundaries
37. Refactor duplicated or overly coupled code within approved scope
38. Update configuration classes and safe defaults
39. Add Javadocs where public or non-obvious contracts require them

## API and integration development

40. Implement REST, GraphQL or RPC endpoints
41. Update request and response DTOs
42. Apply Bean Validation and domain validation
43. Implement pagination, filtering and sorting consistently
44. Return stable status codes and error contracts
45. Preserve backward compatibility and document deprecations
46. Update and validate OpenAPI contracts
47. Implement outbound HTTP clients with explicit timeouts
48. Handle retries, circuit breaking and fallback only where justified
49. Propagate correlation, authentication and trace context
50. Create contract tests for changed interfaces

## Database and persistence

51. Implement parameterized JDBC, JPA, Hibernate or Spring Data access
52. Review entity relationships, ownership, cascades and fetch strategies
53. Prevent N+1 query behavior
54. Define transaction boundaries, isolation and retry rules
55. Review query plans for new or changed queries
56. Create Flyway or Liquibase migration drafts
57. Design expand-and-contract migrations for zero-downtime releases
58. Validate constraints, indexes, defaults and data backfills
59. Create rollback or roll-forward plans
60. Test migrations against representative disposable databases
61. Protect sensitive data and audit fields
62. Avoid production writes and unrestricted database credentials

## Messaging, jobs and asynchronous processing

63. Implement Kafka, JMS or RabbitMQ producers and consumers
64. Version event schemas and evaluate consumer compatibility
65. Implement idempotency and duplicate handling
66. Configure retries, backoff and dead-letter behavior
67. Preserve ordering and partition-key semantics
68. Implement transactional outbox or inbox patterns when approved
69. Create Spring Batch jobs, steps, readers, processors and writers
70. Implement checkpoints, restartability and reconciliation
71. Implement scheduled jobs with safe locking
72. Handle graceful shutdown, cancellation and in-flight work
73. Add queue lag, failure and retry observability

## Concurrency and JVM correctness

74. Review thread safety and shared mutable state
75. Configure bounded executors and rejection policies
76. Use virtual threads only on compatible JDK and libraries
77. Review CompletableFuture exception and cancellation behavior
78. Review Reactor backpressure and scheduler usage
79. Apply time budgets across downstream calls
80. Avoid deadlocks, lock contention and blocking on event loops
81. Test race conditions and concurrency boundaries
82. Ensure safe startup and graceful shutdown

## Unit and integration testing

83. Create JUnit tests for domain and service behavior
84. Create parameterized tests for boundary combinations
85. Use Mockito at stable boundaries without over-mocking
86. Create Spring slice tests where appropriate
87. Create full-context tests only when needed
88. Use Testcontainers for real database, broker or service compatibility
89. Test migrations, constraints and transactions
90. Test error, timeout, retry and partial-failure paths
91. Create API and event contract tests
92. Add regression tests for fixed defects
93. Run mutation testing when configured
94. Diagnose and stabilize flaky tests
95. Maintain deterministic fixtures and cleanup

## Build, dependency and packaging work

96. Run repository-approved compile and package commands
97. Maintain Maven POMs or Gradle build scripts
98. Use wrappers and pinned plugin versions
99. Review dependency trees and convergence
100. Resolve classpath, module-path and shading conflicts
101. Use approved BOMs and repositories
102. Assess dependency vulnerabilities and reachable impact
103. Review licenses before adding libraries
104. Build JAR, WAR or EAR artifacts as required
105. Generate SBOM, checksums and provenance
106. Build and scan container images in isolation
107. Verify clean-environment reproducibility

## Security engineering

108. Validate authentication and authorization behavior
109. Prevent SQL, expression, command and template injection
110. Restrict unsafe deserialization and polymorphic binding
111. Protect against SSRF and unapproved egress
112. Validate file upload, archive and path handling
113. Use approved cryptographic APIs and key references
114. Prevent secrets, tokens and personal data in logs
115. Run static, dependency and secret scans
116. Review security headers and CORS where applicable
117. Produce threat notes for high-risk changes
118. Escalate unresolved critical findings

## Performance, reliability and observability

119. Measure affected endpoint or job performance
120. Review object allocation, heap pressure and garbage collection
121. Inspect connection-pool and HTTP-client pool behavior
122. Review cache keys, expiry and invalidation
123. Run bounded load or soak tests in approved environments
124. Capture Java Flight Recorder evidence when authorized
125. Implement structured logs and correlation identifiers
126. Add Micrometer/OpenTelemetry metrics and traces
127. Implement accurate liveness and readiness checks
128. Update dashboards, alerts and operational runbooks
129. Verify failure modes and recovery behavior

## Code review and pull requests

130. Review diffs for correctness and unintended changes
131. Review architecture, naming, complexity and maintainability
132. Verify tests assert behavior rather than implementation details
133. Verify API, event and schema compatibility
134. Verify migrations and rollout sequencing
135. Verify security, logging and data handling
136. Verify build files and dependency changes
137. Prepare change manifest and pull-request description
138. Link Jira items and evidence
139. Request appropriate code owners and specialists
140. Address review comments without broadening scope
141. Require approval before commit, push or pull-request creation

## CI/CD and environment validation

142. Review pipeline definitions and quality gates
143. Analyze failed compile, test, scan or packaging stages
144. Differentiate product, test, environment and infrastructure failures
145. Rerun approved pipeline stages only after authorization
146. Verify artifact version, digest and provenance
147. Validate configuration for playground and QA
148. Perform approved non-destructive smoke checks
149. Review deployment and rollback plans
150. Never autonomously deploy or mutate production
151. Attach pipeline evidence to the Jira item and pull request

## Upgrade and modernization

152. Assess JDK upgrade compatibility
153. Assess Spring Boot or Spring Framework upgrade compatibility
154. Plan javax-to-jakarta namespace migrations
155. Review removed, deprecated and behavior-changing APIs
156. Update Maven/Gradle plugins and toolchains in controlled steps
157. Run multi-JDK and multi-version test matrices
158. Review application-server compatibility
159. Create dependency and framework upgrade runbooks
160. Separate mechanical migration from behavior changes
161. Benchmark and observe upgrades before rollout

## Communication and continuous improvement

162. Attend daily stand-up and share progress, plan and blockers
163. Update Jira with approved technical summaries
164. Draft Teams updates for important changes and risks
165. Coordinate with Angular, QA, database, DevOps and product roles
166. Participate in design, refinement and incident reviews
167. Document reusable patterns and failure lessons
168. Improve build speed, test reliability and diagnostics
169. Review escaped defects and add regression coverage
170. Propose technical-debt and modernization work with evidence
171. Maintain team Java standards and onboarding material

## Agent suitability

Tasks that only read, analyze, generate patches, run sandboxed builds, or draft artifacts can usually be automated. External writes, environment mutations, migrations, pipeline triggers, repository publication and collaboration messages require policy checks and human approval. Production deployment, merge, raw secret access and production data mutations remain human-led or prohibited.

Total catalog entries: 171.
