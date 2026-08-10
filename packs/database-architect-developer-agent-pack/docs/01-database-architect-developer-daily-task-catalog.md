# Database Architect / Developer Daily Task Catalog

This catalog covers relational data architecture, schema and SQL development, migrations, performance, security, data quality, high availability, recovery, governance, and controlled database releases. The supervisor selects a bounded subset for the current Jira item, database scope, and environment.

## Work intake and planning

1. Open assigned Jira stories, defects, technical-debt items, incidents, access requests, and release tasks
2. Read acceptance criteria, comments, linked services, reports, jobs, API contracts, ADRs, and data policies
3. Identify project, repository, database engine, instance, database, schema, branch, environment, owner, and target date
4. Confirm whether the request is architecture, schema development, SQL development, performance, migration, recovery, or governance work
5. Identify affected applications, services, ORM mappings, pipelines, reports, events, and users
6. Classify data sensitivity, destructive risk, availability risk, lock risk, and regulatory impact
7. Identify required human approvers and separation-of-duties constraints
8. Estimate analysis, implementation, migration, test, review, and rollout effort
9. List missing information and block unsafe assumptions
10. Create the bounded work plan and traceability map

## Database estate discovery

11. Detect engine, version, edition, compatibility level, extensions, and managed-service type
12. Inspect repository migration folders, schema projects, SQL files, ORM models, and deployment scripts
13. Inventory schemas, tables, views, materialized views, routines, sequences, types, synonyms, triggers, and grants
14. Map object dependencies and external consumers
15. Map primary, replicas, clusters, shards, tenants, regions, and failover topology
16. Identify workload patterns such as OLTP, analytics, reporting, batch, and mixed use
17. Measure table sizes, row counts, growth, skew, and retention
18. Review migration history, drift, failed deployments, and manual changes
19. Identify database ownership, data stewardship, on-call, and approval responsibilities
20. Document unsupported versions, deprecated features, and platform constraints

## Data architecture and modeling

21. Create or update the business data glossary
22. Identify domains, entities, aggregates, ownership, lifecycle, and invariants
23. Create conceptual and logical data models
24. Define keys, identifiers, cardinality, optionality, and relationship semantics
25. Normalize structures and document justified denormalization
26. Define reference and master data ownership
27. Define temporal, audit, history, effective-date, and soft-delete behavior
28. Define tenant-isolation and data-residency requirements
29. Define canonical types, units, precision, scale, timezone, and nullability
30. Create or update ERDs and architecture decisions
31. Review data models with product, application, analytics, security, and operations stakeholders

## Physical schema design

32. Design tables, columns, data types, defaults, generated values, and comments
33. Design primary, foreign, unique, check, exclusion, and domain constraints
34. Design selective and maintainable indexes based on actual access patterns
35. Design partitioning and partition lifecycle
36. Design views and materialized or indexed views
37. Design sequences, identity columns, UUID strategies, and distributed identifiers
38. Design procedures, functions, packages, and stored-code boundaries
39. Review triggers for hidden coupling, recursion, ordering, and performance
40. Design storage, compression, tablespace, filegroup, and maintenance considerations where applicable
41. Design roles, grants, ownership, row security, masking, and auditing
42. Document engine-specific features and portability tradeoffs

## SQL development

43. Write parameterized, set-oriented SQL
44. Implement inserts, updates, deletes, merges, and upserts with bounded scope
45. Implement joins, aggregations, windows, pivots, recursive queries, and hierarchy handling
46. Implement views, procedures, functions, packages, and reusable SQL modules
47. Handle nulls, duplicates, collation, timezone, precision, and rounding explicitly
48. Create safe bulk operations with chunking, throttling, checkpoints, and retries
49. Review dynamic SQL for injection and execution-context risk
50. Add affected-row expectations and anomaly detection
51. Test error handling, transaction behavior, and retries
52. Format and lint SQL according to repository standards
53. Document non-obvious semantics and operational considerations

## Schema migrations and evolution

54. Create versioned Flyway, Liquibase, or repository-native migrations
55. Generate and inspect forward SQL previews
56. Generate and inspect rollback or roll-forward recovery SQL where supported
57. Validate migration naming, ordering, checksums, prerequisites, and history
58. Design expand-contract sequencing for rolling application releases
59. Design online or low-lock DDL based on engine capabilities
60. Estimate lock modes, lock duration, rewrite behavior, log growth, and storage requirements
61. Test upgrades from every supported baseline in disposable databases
62. Test interrupted, partially applied, and retried migrations
63. Detect schema drift across repository, playground, QA, and production metadata
64. Plan object deprecation and cleanup after consumer verification
65. Never alter applied migration history without approved incident and repair procedure

## Data backfill and transformation

66. Profile source data and identify quality exceptions
67. Define source-to-target mapping and transformation rules
68. Create resumable, idempotent, checkpointed backfill SQL or jobs
69. Choose chunk keys and chunk sizes that avoid long locks and excessive log growth
70. Throttle work based on latency, replication lag, resource, and maintenance thresholds
71. Create exception tables or durable failure records
72. Reconcile row counts, checksums, aggregates, samples, and business invariants
73. Verify downstream CDC, reports, search indexes, and caches
74. Create cleanup and decommission steps
75. Mask or synthesize sensitive data in non-production
76. Document lineage and evidence for each transformation

## Query performance engineering

77. Identify high-latency, high-frequency, high-resource, and business-critical queries
78. Capture estimated plans safely
79. Capture actual plans only in approved environments and bounded conditions
80. Compare estimated and actual row counts
81. Review scans, seeks, joins, sorts, spills, lookups, parallelism, and memory grants
82. Review PostgreSQL statement statistics, SQL Server Query Store, Oracle workload evidence, or MySQL Performance Schema as approved
83. Check statistics freshness, histograms, skew, and parameter sensitivity
84. Review existing index usage, duplicate indexes, unused indexes, and write overhead
85. Create candidate indexes and query rewrites
86. Benchmark before and after using representative data and concurrency
87. Verify plan stability and regression risk
88. Remove speculative recommendations that lack measured benefit

## Transactions, locks and consistency

89. Define transaction boundaries and owning component
90. Choose isolation level based on tolerated anomalies
91. Review lock acquisition order and duration
92. Diagnose blocking chains, waits, deadlocks, and timeouts
93. Design optimistic or pessimistic concurrency controls
94. Design idempotency and duplicate prevention
95. Review retry behavior for deadlocks and transient failures
96. Design outbox, saga, reconciliation, or eventual-consistency patterns
97. Account for replica lag and stale reads
98. Test concurrent inserts, updates, deletes, and uniqueness races
99. Document consistency guarantees for consumers

## Database security and access

100. Inventory human, application, migration, reporting, monitoring, and break-glass identities
101. Design least-privilege roles and grants
102. Remove unused or excessive privileges through approved processes
103. Design row-level, column-level, view-based, label, or virtual private database access
104. Design masking, tokenization, pseudonymization, and synthetic-data controls
105. Verify transport and at-rest encryption configuration metadata
106. Design audit policies for authentication, privilege, DDL, and sensitive access
107. Review stored-code execution rights and ownership chains
108. Review SQL injection defenses and parameterization
109. Review sensitive data in logs, plans, samples, exports, and diagnostics
110. Create time-bound access and recertification evidence
111. Escalate privilege escalation and unauthorized access immediately

## Data quality and governance

112. Define completeness, uniqueness, validity, consistency, timeliness, and referential rules
113. Profile data distributions and anomalies
114. Create automated quality checks and thresholds
115. Create quarantine or exception-handling processes
116. Define ownership and remediation workflows
117. Verify data dictionary and glossary accuracy
118. Track lineage from source through transformation to destination
119. Implement retention, archival, purge, legal-hold, and deletion verification
120. Review duplicate and orphaned data
121. Reconcile database facts with application and reporting outputs
122. Publish approved quality summaries and trend reports

## Backup, recovery, HA and maintenance

123. Review backup schedules, retention, encryption, offsite copies, and failure alerts
124. Verify restore history and evidence
125. Run approved isolated restore tests
126. Verify point-in-time recovery prerequisites
127. Review replication health, lag, slots, logs, and topology
128. Review failover and fencing procedures
129. Validate RPO and RTO assumptions against measured evidence
130. Review vacuum, statistics, integrity, index maintenance, and storage cleanup
131. Plan maintenance windows and compatibility
132. Review patching and upgrade prerequisites
133. Update disaster-recovery and operational runbooks
134. Never execute production restore, failover, backup deletion, or configuration mutation autonomously

## Testing and validation

135. Test schema objects, types, constraints, defaults, comments, permissions, and dependencies
136. Test migrations from clean and supported historical baselines
137. Test forward compatibility with old and new application versions
138. Test rollback or roll-forward recovery
139. Test query results for boundaries, nulls, duplicates, ordering, timezone, and precision
140. Test invalid data rejection and valid data acceptance
141. Test row-level security, grants, masking, and denied actions
142. Test concurrency, locks, deadlocks, retries, and timeouts
143. Test representative performance and growth scenarios
144. Test data backfill checkpoints and reconciliation
145. Test backup restore and failover procedures in approved environments
146. Record deterministic evidence and hashes

## Repository, CI/CD and release work

147. Create SQL, migration, model, test, and documentation changes in an isolated branch workspace
148. Review the complete diff and generated SQL
149. Run SQL lint, migration validation, schema diff, tests, security checks, and policy gates
150. Prepare schema-change manifest and migration plan
151. Prepare pull-request description with risk and evidence
152. Request database owner, application owner, security, and operations reviews as required
153. Analyze pipeline failures and distinguish code, data, environment, and infrastructure causes
154. Rerun pipeline stages only after approval
155. Prepare release sequencing, maintenance, backup, monitoring, rollback, and validation steps
156. Require approval before commit, push, PR creation, shared-environment mutation, or migration execution
157. Validate post-deployment metadata and agreed smoke checks
158. Conduct post-change review and document actual impact

## Communication and continuous improvement

159. Attend stand-up and share progress, risks, blockers, and approvals
160. Draft Jira updates with implementation and validation evidence
161. Draft Teams updates for material database changes and incidents
162. Coordinate with frontend, Java, Python, QA, DevOps, analytics, security, and product teams
163. Participate in design reviews, defect triage, release readiness, and incident reviews
164. Document reusable SQL and migration patterns
165. Review escaped defects and add regression tests
166. Improve query diagnostics, database observability, and runbooks
167. Review schema debt, unsupported versions, and modernization opportunities
168. Maintain database standards, templates, ownership maps, and onboarding guides

## Agent suitability

Read-only discovery, modeling, SQL generation, disposable database testing, plan analysis, and artifact drafting can be automated. Repository publication, Jira/Teams writes, shared-environment migrations, grants, backfills, restore or failover actions, and pipeline triggers require policy checks and human approval. Production DDL/DML, superuser access, secret disclosure, backup deletion, and autonomous failover are prohibited.

Total catalog entries: 168.
