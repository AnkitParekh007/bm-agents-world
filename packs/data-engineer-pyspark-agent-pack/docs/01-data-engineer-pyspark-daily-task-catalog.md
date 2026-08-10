# Data Engineer / PySpark — Complete Daily Task Catalog

This catalog contains **240** daily and periodic tasks. Not every task runs every day; the supervisor selects tasks from approved work, pipeline state, data risk, release stage, and incidents.

## 1. Work intake and prioritization

1. Review assigned Jira stories, defects, incidents, requests, and platform alerts.
2. Identify the affected data product, domain, pipeline, dataset, consumer, and owner.
3. Read acceptance criteria, business rules, data definitions, linked designs, and prior decisions.
4. Confirm target repository, branch, environment, schedule, and release window.
5. Check dependencies on source teams, platform teams, database teams, and downstream consumers.
6. Classify work as ingestion, transformation, streaming, quality, performance, migration, or operations.
7. Assess data sensitivity, criticality, freshness, volume, and blast radius.
8. Identify blocked prerequisites, missing access, missing contracts, and ambiguous requirements.
9. Estimate design, implementation, testing, backfill, and operational effort.
10. Prioritize work using customer impact, regulatory risk, reliability, and delivery urgency.
11. Create a daily execution plan with evidence and approval checkpoints.
12. Publish an approval-controlled status update when risks or dependencies materially change.

## 2. Data product and domain context

13. Define the data product purpose, users, decisions, and measurable outcomes.
14. Identify accountable data owner, technical owner, producer, steward, and consumer representatives.
15. Document domain terms, metrics, entities, keys, grain, and business semantics.
16. Map upstream sources and downstream reports, APIs, models, jobs, and operational processes.
17. Define freshness, availability, completeness, accuracy, and retention expectations.
18. Identify historical, slowly changing, snapshot, event, and transactional requirements.
19. Clarify timezone, locale, currency, precision, and calendar semantics.
20. Identify privacy, residency, consent, minimization, and deletion requirements.
21. Identify audit, lineage, explainability, and reconciliation expectations.
22. Identify replay, correction, restatement, and late-arriving-data requirements.
23. Capture assumptions, evidence gaps, open questions, and accountable decisions.
24. Maintain a versioned data product brief linked to implementation and operations.

## 3. Source discovery and contracts

25. Inventory source systems, interfaces, owners, environments, and extraction methods.
26. Profile source schemas, keys, nullability, cardinality, distributions, and sample quality.
27. Measure source volume, change rate, latency, retention, and peak behavior.
28. Identify inserts, updates, deletes, corrections, duplicates, and out-of-order records.
29. Identify source time semantics, sequence fields, transaction boundaries, and watermarks.
30. Confirm source authentication, network, rate limits, quotas, and maintenance windows.
31. Define schema, semantic, quality, freshness, ownership, and compatibility contracts.
32. Validate contract examples against approved bounded source evidence.
33. Identify undocumented fields, overloaded values, sentinel values, and code mappings.
34. Plan producer notification and compatibility checks for contract changes.
35. Record source limitations and fallback or reconciliation strategies.
36. Publish contracts only after producer and consumer approval.

## 4. Data architecture and modeling

37. Design batch, streaming, or hybrid processing boundaries from latency and consistency needs.
38. Define domain, lake, lakehouse, warehouse, mart, and serving responsibilities.
39. Design bronze, silver, gold, raw, curated, or organization-approved data layers.
40. Define logical entities, relationships, grain, keys, and history requirements.
41. Design facts, dimensions, snapshots, aggregates, bridges, and slowly changing dimensions.
42. Define physical schemas, types, nullability, defaults, constraints, and metadata.
43. Design partitioning, clustering, bucketing, ordering, and file-size strategy.
44. Define table format, catalog, namespace, ownership, and retention strategy.
45. Design idempotency, deduplication, replay, correction, and restatement behavior.
46. Design access patterns for BI, APIs, notebooks, ML, and operational consumers.
47. Compare architecture options for cost, complexity, reliability, portability, and governance.
48. Create architecture decisions and migration boundaries with independent review.

## 5. PySpark batch development

49. Create repository-compatible SparkSession and configuration boundaries.
50. Implement DataFrame and Spark SQL reads using explicit schemas where appropriate.
51. Normalize columns, types, timestamps, identifiers, and missing values.
52. Implement reusable deterministic transformations without hidden side effects.
53. Prefer built-in Spark SQL functions over unnecessary Python UDFs.
54. Implement joins with explicit keys, cardinality assumptions, and duplicate controls.
55. Implement aggregations with correct grain, null, precision, and rounding behavior.
56. Implement window functions with deterministic partition and ordering rules.
57. Write outputs using safe modes, partitioning, table semantics, and atomic patterns.
58. Add metrics for input, output, rejected, duplicate, and transformed records.
59. Handle empty inputs, malformed files, partial partitions, and retry behavior.
60. Refactor code into testable modules consistent with repository conventions.

## 6. Structured Streaming engineering

61. Choose streaming sources, sinks, triggers, output modes, and processing guarantees.
62. Define event time, processing time, ingestion time, and timezone behavior.
63. Design watermarks based on observed lateness and business tolerance.
64. Design deduplication with stable keys and bounded state.
65. Design stream-static and stream-stream joins with explicit time constraints.
66. Design stateful aggregations and monitor state growth.
67. Configure checkpoints with stable ownership and compatible lifecycle.
68. Handle schema changes, malformed events, poison records, and dead-letter paths.
69. Plan replay from source offsets without duplicate side effects.
70. Monitor input rate, processing rate, batch duration, lag, state, and sink health.
71. Test restart, failure, late data, duplicate data, and sink unavailability.
72. Block checkpoint deletion or incompatible restart without approved recovery planning.

## 7. Ingestion and CDC

73. Design full, incremental, snapshot, log-based, and API-based ingestion patterns.
74. Define primary keys, sequence columns, operation codes, and ordering semantics.
75. Handle inserts, updates, deletes, tombstones, and source corrections.
76. Deduplicate repeated events and retries using deterministic identity.
77. Handle out-of-order changes and late-arriving updates.
78. Design initial snapshot plus ongoing change synchronization.
79. Validate source and target counts, keys, totals, and change windows.
80. Design quarantine for invalid, unparseable, or contract-breaking records.
81. Plan source throttling, pagination, cursor, retry, and backoff behavior.
82. Protect sources from unbounded extraction and excessive query load.
83. Document replay and re-snapshot conditions with consumer impact.
84. Create CDC runbooks and approved recovery procedures.

## 8. Transformations and business rules

85. Translate approved business rules into explicit transformation logic.
86. Maintain source-to-target field mappings with versioned evidence.
87. Implement code, category, status, and reference-data mappings.
88. Implement temporal joins and effective-dated logic correctly.
89. Implement slowly changing dimension behavior and history preservation.
90. Implement currency, unit, precision, and timezone conversions.
91. Implement hierarchy, parent-child, and recursive relationship handling.
92. Implement data standardization, normalization, and canonical identifiers.
93. Handle null, unknown, not-applicable, redacted, and deleted states distinctly.
94. Add rule-level metrics and rejected-record evidence.
95. Validate transformations against examples and historical edge cases.
96. Keep business rules separate from orchestration and platform-specific concerns.

## 9. Lakehouse and table formats

97. Select Delta Lake, Apache Iceberg, or approved native formats based on platform constraints.
98. Define catalog, namespace, table ownership, and access boundaries.
99. Design schema evolution and compatibility rules for tables and consumers.
100. Design partitioning and clustering based on actual query and write patterns.
101. Monitor file counts, file sizes, metadata growth, and manifest behavior.
102. Plan compaction, optimization, vacuum, snapshot expiration, and retention safely.
103. Use table snapshots or versions for reproducibility and recovery where supported.
104. Design merge, upsert, delete, and overwrite behavior with bounded scope.
105. Validate concurrency and isolation behavior for writers and readers.
106. Coordinate table maintenance with streaming checkpoints and consumers.
107. Prevent destructive cleanup beyond approved retention and recovery windows.
108. Document engine and connector compatibility for each table format.

## 10. Data quality and reconciliation

109. Define quality dimensions, rules, thresholds, severity, and accountable owners.
110. Validate required fields, types, ranges, formats, and enumerations.
111. Validate uniqueness, referential integrity, relationship, and temporal rules.
112. Validate freshness, completeness, volume, distribution, and anomaly thresholds.
113. Validate business totals, balances, aggregates, and cross-dataset consistency.
114. Choose warn, quarantine, drop, or fail behavior based on approved policy.
115. Capture invalid counts and redacted examples without exposing sensitive values.
116. Reconcile source and target counts, keys, totals, and hashes.
117. Trend rule failures and distinguish source issues from pipeline defects.
118. Route issues to producer, pipeline, platform, or consumer owners.
119. Retest corrected data and preserve before-and-after evidence.
120. Block release when critical quality or reconciliation evidence is unresolved.

## 11. Schema evolution and compatibility

121. Detect schema drift between source, contract, registry, code, and target.
122. Classify additive, compatible, conditionally compatible, and breaking changes.
123. Assess column additions, removals, renames, reorderings, and type changes.
124. Assess nullability, default, precision, scale, and timestamp changes.
125. Assess nested, array, map, union, and event-envelope changes.
126. Identify affected jobs, tables, dashboards, APIs, models, and consumers.
127. Design dual-read, dual-write, translation, or compatibility layers when needed.
128. Define migration, deprecation, communication, and retirement windows.
129. Validate old and new schemas against representative fixtures.
130. Update contracts, registry entries, documentation, and lineage.
131. Prevent silent permissive parsing that hides breaking changes.
132. Require producer and consumer approval for breaking changes.

## 12. Orchestration and scheduling

133. Design DAGs with clear task boundaries, dependencies, and ownership.
134. Use data-aware dependencies or approved dataset triggers where appropriate.
135. Define schedules, calendars, timezones, catchup, and business-day behavior.
136. Define retries, backoff, timeouts, pools, queues, and concurrency limits.
137. Design tasks to be idempotent and safe to retry.
138. Design parameterized partition and date-range execution.
139. Validate DAG parsing, cycles, unreachable tasks, and dependency correctness.
140. Define SLA, freshness, deadline, and failure-notification behavior.
141. Design bounded backfills that do not overload sources or shared platforms.
142. Define pause, resume, clear, rerun, and recovery procedures.
143. Separate orchestration metadata from business transformation logic.
144. Publish schedule or production action changes only with approval.

## 13. Testing and validation

145. Create deterministic unit tests for transformation functions.
146. Create Spark DataFrame comparison tests with explicit schemas and ordering rules.
147. Create contract and schema compatibility tests.
148. Create source and sink integration tests in isolated environments.
149. Create batch partition, empty input, duplicate, invalid, and late-data tests.
150. Create streaming watermark, restart, state, checkpoint, and replay tests.
151. Create data quality and reconciliation tests with known outcomes.
152. Create orchestration DAG validation and task-idempotency tests.
153. Create scale, skew, large-file, small-file, and resource-limit tests.
154. Create security, masking, access, retention, and deletion tests.
155. Create regression tests from escaped data defects and incidents.
156. Bind all test evidence to exact code, configuration, contract, and platform versions.

## 14. Spark performance and cost optimization

157. Review Spark UI, event logs, SQL plans, stages, tasks, and executor metrics.
158. Identify full scans, missing filters, excessive columns, and inefficient file reads.
159. Identify unnecessary shuffles, exchanges, sorts, repartitions, and coalesces.
160. Analyze join cardinality, strategy, broadcast size, and skew.
161. Analyze partition sizes, task duration, spill, memory, GC, and serialization.
162. Use adaptive query execution and optimizer features only when supported and tested.
163. Reduce Python serialization and UDF overhead with built-in expressions where feasible.
164. Use caching only with evidence, lifecycle control, and memory impact analysis.
165. Optimize file sizes, partition pruning, clustering, and table maintenance.
166. Right-size executors, cores, memory, parallelism, and dynamic allocation using measured evidence.
167. Compare runtime, resource use, cost, and correctness before and after changes.
168. Avoid configuration changes that hide data skew or correctness problems.

## 15. Reliability and observability

169. Instrument each pipeline with run, partition, source, target, and code-version identity.
170. Emit input, output, rejected, duplicate, latency, freshness, and quality metrics.
171. Capture structured errors with safe context and correlation identifiers.
172. Monitor source availability, sink health, cluster capacity, and orchestrator health.
173. Monitor streaming lag, throughput, state growth, checkpoint progress, and failures.
174. Monitor batch duration, queue time, retries, missed schedules, and deadline risk.
175. Define alert thresholds based on user and data-product impact.
176. Maintain dashboards, runbooks, escalation routes, and ownership metadata.
177. Design restartability, replay, recovery, and partial-output handling.
178. Validate recovery after worker, cluster, network, source, or sink failures.
179. Perform post-incident review for material data failures.
180. Track corrective actions and reliability improvements to completion.

## 16. Security, privacy, and governance

181. Classify datasets and fields by sensitivity, purpose, and regulatory scope.
182. Minimize data collection and processing to approved purposes.
183. Apply masking, tokenization, hashing, aggregation, or redaction where required.
184. Enforce least-privilege access for sources, storage, catalogs, clusters, and consumers.
185. Use workload identity and short-lived credentials through trusted adapters.
186. Prevent raw secrets, tokens, keys, or connection strings from entering model context.
187. Enforce tenant, project, environment, and regional data boundaries.
188. Define retention, archival, legal hold, deletion, and right-to-erasure behavior.
189. Validate encryption, transport, audit, and access-log controls.
190. Review dependency, connector, package, image, and supply-chain security.
191. Create privacy and security evidence for releases and audits.
192. Escalate residual risk to accountable human security and privacy owners.

## 17. Metadata, lineage, and catalog

193. Register approved datasets, jobs, owners, descriptions, terms, and service levels.
194. Publish schema and field documentation linked to source-to-target mappings.
195. Emit run-level lineage for inputs, outputs, code versions, and processing state.
196. Emit design-time lineage for declared jobs, datasets, contracts, and ownership.
197. Capture field-level lineage where evidence and tooling support it.
198. Link quality results, incidents, contracts, and consumers to datasets.
199. Identify orphaned, undocumented, duplicate, and unowned datasets.
200. Use lineage to assess change impact and consumer blast radius.
201. Validate lineage completeness and avoid unsupported inferred relationships.
202. Apply classification and redaction to metadata and examples.
203. Maintain glossary and semantic consistency across domains.
204. Publish catalog changes only through approved governance workflows.

## 18. CI/CD, packaging, and deployment

205. Detect repository build, dependency, test, packaging, and release conventions.
206. Pin compatible Python, Spark, JVM, connector, and library versions.
207. Build reproducible wheels, archives, containers, or platform bundles.
208. Generate dependency locks, SBOMs, provenance, and artifact hashes.
209. Run linting, typing, unit, integration, contract, and quality tests in CI.
210. Run isolated Spark smoke tests using representative bounded fixtures.
211. Validate configuration for playground, QA, and production without embedding secrets.
212. Promote immutable artifacts rather than rebuilding between environments.
213. Prepare migration, deployment, monitoring, and rollback plans.
214. Create pull requests and release records only after payload-bound approval.
215. Deploy production only through authorized deterministic pipelines or operators.
216. Verify deployed artifact, configuration, schedule, contracts, and telemetry read-only.

## 19. Data incidents, backfills, and remediation

217. Triage missing, late, duplicate, corrupt, inconsistent, or unauthorized data.
218. Identify affected datasets, partitions, consumers, reports, models, and business processes.
219. Correlate failures with source changes, code changes, schema changes, platform events, and releases.
220. Preserve redacted evidence and prevent further propagation when approved.
221. Design bounded correction, replay, reprocessing, or backfill options.
222. Calculate partition scope, ordering, concurrency, source load, duration, and cost.
223. Define stop conditions, checkpoints, controls, rollback, and reconciliation.
224. Require approval before production backfill, repair, replay, or data mutation.
225. Monitor execution through deterministic systems and bounded read-only telemetry.
226. Validate corrected outputs and downstream consumer recovery.
227. Create defect, incident, knowledge, and corrective-action records.
228. Add regression tests and preventive controls for escaped defects.

## 20. Documentation, collaboration, and improvement

229. Maintain pipeline architecture, contracts, mappings, runbooks, and operational ownership.
230. Document setup, local development, testing, configuration, and release procedures.
231. Create diagrams for data flow, pipeline stages, lineage, and deployment topology.
232. Write clear pull request descriptions with correctness, quality, performance, and risk evidence.
233. Coordinate with Product, Business Analysis, Architecture, Database, QA, DevOps, Security, and Support.
234. Explain assumptions, unknowns, tradeoffs, and recommended decisions.
235. Participate in design, code, quality, release, and post-incident reviews.
236. Review recurring pipeline failures, quality issues, and operational toil.
237. Identify reusable components, templates, contracts, and platform capabilities.
238. Improve developer experience, test speed, observability, and self-service safely.
239. Mentor engineers on Spark execution, data correctness, contracts, and operations.
240. Maintain a prioritized improvement roadmap with measurable outcomes.
