# MLOps / AI Platform Agent — Daily and Periodic Task Catalog

This catalog defines platform-engineering, lifecycle, governance, reliability, and operations work suitable for an MLOps / AI Platform Agent. Not every task is daily; the supervisor selects only tasks relevant to the authorized request.

**Critical boundary:** the platform agent prepares, validates, coordinates, and observes. Production promotion, traffic changes, destructive data/index operations, privileged infrastructure changes, and risk acceptance require approved deterministic execution or accountable human authorization.

## Platform Strategy & Intake

1. Review AI/ML platform requests, incidents, upgrades, and onboarding tickets.
2. Clarify workload type: training, batch inference, online inference, RAG, agent, evaluation, or data preparation.
3. Identify business criticality, latency, throughput, availability, privacy, and cost expectations.
4. Classify the request as platform change, tenant onboarding, model promotion, capacity request, incident, or governance work.
5. Identify affected environments, clusters, regions, workspaces, registries, model endpoints, and data stores.
6. Check whether the request belongs to AI/ML Engineering, Data Engineering, DevOps, SRE, Security, or the AI Platform team.
7. Capture assumptions, constraints, dependencies, decision owners, and approval owners.
8. Identify whether shared-platform changes could affect multiple teams or tenants.
9. Create a bounded execution scope with explicit production and customer-data constraints.
10. Maintain the AI platform backlog and operating priorities.

## Platform Architecture

11. Maintain the reference architecture for experimentation, training, evaluation, registry, serving, monitoring, and governance.
12. Define control-plane and data-plane boundaries.
13. Define tenancy, workspace, namespace, project, and environment isolation.
14. Review synchronous, asynchronous, batch, streaming, and agent-serving patterns.
15. Define model artifact, prompt, dataset, feature, evaluation-set, and configuration lineage.
16. Review managed-service versus self-hosted platform options.
17. Define portability and exit strategies for critical AI platform dependencies.
18. Maintain platform architecture decision records.
19. Review platform compatibility with organization networking, IAM, secrets, observability, and CI/CD standards.
20. Detect architectural drift from the approved AI platform baseline.

## Experiment Tracking & Reproducibility

21. Operate experiment tracking workspaces and access boundaries.
22. Define required experiment metadata, source revision, dataset snapshot, environment, parameters, metrics, and artifacts.
23. Enforce reproducible environment capture for training and evaluation runs.
24. Configure retention and archival rules for experiment runs and traces.
25. Identify orphaned or duplicate experiments and artifacts.
26. Validate that model candidates link back to immutable training and evaluation evidence.
27. Support distributed experiment tracking from notebooks, jobs, CI, and agents.
28. Standardize tags and naming for projects, teams, models, prompts, and experiments.
29. Troubleshoot missing metrics, artifacts, lineage, or trace data.
30. Maintain experiment-tracking reliability and backup procedures.

## Model & Prompt Registry

31. Operate model, prompt, scorer, and agent registries with governed namespaces.
32. Define candidate, staging, production, deprecated, and retired lifecycle states.
33. Enforce immutable candidate identity using digests and lineage metadata.
34. Validate registry permissions and role assignments.
35. Prevent unapproved overwrites of production aliases or champion pointers.
36. Manage metadata schemas for model cards, prompts, adapters, tokenizers, and runtime requirements.
37. Link registry entries to evaluation reports, security evidence, and approval records.
38. Detect stale, unowned, or unsupported registered artifacts.
39. Coordinate deprecation and retirement of obsolete models and prompts.
40. Maintain registry backup, restoration, and disaster-recovery procedures.

## Training & Pipeline Platform

41. Operate reusable training-pipeline templates and components.
42. Validate pipeline DAGs, parameters, cache settings, artifact paths, and retry behavior.
43. Manage training-job isolation, service accounts, quotas, and runtime classes.
44. Support distributed training patterns and checkpoint management.
45. Standardize dataset and feature references instead of embedding raw data in pipelines.
46. Enforce deterministic environment and dependency resolution where feasible.
47. Validate retry and resume behavior for long-running training jobs.
48. Monitor training queues, failed jobs, scheduling delays, and resource waste.
49. Maintain approved base images and training runtime templates.
50. Coordinate pipeline-engine upgrades and compatibility testing.

## Feature Store & Data Interface

51. Operate approved feature-store integrations and access boundaries.
52. Define offline/online feature consistency checks.
53. Validate feature freshness, ownership, lineage, and data contracts.
54. Prevent training-serving skew caused by inconsistent transformations.
55. Review feature materialization schedules and capacity.
56. Detect stale or unused features and feature views.
57. Coordinate feature schema evolution with model consumers.
58. Enforce least-privilege access to feature data.
59. Monitor online feature latency and availability.
60. Coordinate feature-store incidents with Data Engineering and Database teams.

## Evaluation Platform

61. Operate reusable evaluation datasets, scorers, judge configurations, and deterministic test suites.
62. Define quality gates for conventional ML, LLM, RAG, multimodal, and agentic systems.
63. Separate offline evaluation from online outcome monitoring.
64. Version evaluation sets and protect them from training contamination.
65. Configure regression thresholds, guardrail thresholds, and release-blocking policies.
66. Support human review queues and adjudication workflows.
67. Track evaluator and judge-model versions used for decisions.
68. Monitor evaluation cost, latency, variance, and reliability.
69. Detect metric gaming, leakage, and unrepresentative evaluation samples.
70. Maintain evaluation evidence required for promotion decisions.

## LLM & Agent Platform

71. Operate model gateways, provider routes, endpoint policies, quotas, and approved model catalogs.
72. Manage prompt, tool, agent, and workflow versioning.
73. Define agent sandboxing, tool allowlists, network egress boundaries, and execution timeouts.
74. Operate evaluation and tracing support for agentic workflows.
75. Enforce per-project and per-tenant model-provider credentials through trusted adapters.
76. Support model routing, fallback, and circuit-breaking policies.
77. Track token use, model cost, tool-call cost, latency, retries, and context growth.
78. Govern retrieval connections, vector-store access, and tenant isolation.
79. Detect unsafe or unsupported model/provider changes.
80. Coordinate agent-runtime upgrades with application and security teams.

## RAG & Vector Infrastructure

81. Operate approved vector databases, indexes, embedding pipelines, and retrieval services.
82. Version embedding models, chunking policies, indexes, and retrieval configurations.
83. Enforce document-level authorization during indexing and retrieval.
84. Validate index freshness and source-to-index completeness.
85. Plan safe re-embedding and index migration procedures.
86. Measure retrieval latency, recall proxies, index size, and serving cost.
87. Detect orphaned vectors, duplicate documents, and stale indexes.
88. Coordinate schema and metadata-filter changes.
89. Prepare shadow indexes before production index replacement.
90. Require explicit approval for production index swaps or destructive reindexing.

## Online Model Serving

91. Operate standardized real-time inference deployment patterns.
92. Define endpoint SLOs for availability, latency, error rate, and saturation.
93. Validate model runtime, tokenizer, accelerator, memory, and concurrency requirements.
94. Configure readiness, liveness, startup, and model-load health checks.
95. Support autoscaling based on requests, concurrency, tokens, queue depth, or accelerator utilization.
96. Plan canary, blue-green, shadow, and champion/challenger deployments.
97. Validate fallback behavior and graceful degradation.
98. Monitor cold starts, model loading, queueing, batching, and tail latency.
99. Maintain serving templates for classical ML and large-model inference.
100. Coordinate serving-runtime upgrades and compatibility testing.

## Batch & Async Inference

101. Operate governed batch-inference and asynchronous inference patterns.
102. Validate partitioning, retries, idempotency, output paths, and reconciliation.
103. Define queue, job, and result-store retention.
104. Plan capacity for bursty and scheduled inference workloads.
105. Prevent duplicate processing during retries.
106. Monitor job delay, throughput, failures, and output completeness.
107. Coordinate large backfills with Data Engineering and platform capacity owners.
108. Validate result schemas and downstream data contracts.
109. Use bounded samples for production troubleshooting.
110. Require approval for production-wide reruns or destructive output replacement.

## GPU & Accelerator Platform

111. Maintain GPU and accelerator inventory by cluster, node pool, SKU, memory, and capability.
112. Operate device plugins, GPU operators, drivers, container runtimes, and accelerator telemetry.
113. Define GPU sharing, MIG, time-slicing, and dedicated-device policies where supported.
114. Track GPU utilization, memory, power, temperature, errors, and fragmentation.
115. Detect underutilized or stranded accelerator capacity.
116. Plan accelerator capacity for training and inference demand.
117. Define priority, quota, preemption, and fairness policies for scarce accelerators.
118. Coordinate driver, CUDA, runtime, and firmware compatibility upgrades.
119. Test accelerator recovery and node replacement behavior.
120. Maintain fallback and capacity-degradation plans for accelerator shortages.

## Scheduling & Workload Management

121. Operate workload queues, quotas, priorities, and fair-sharing policies.
122. Support gang scheduling and distributed workload placement where required.
123. Define topology-aware placement for multi-GPU and distributed jobs.
124. Track pending time, preemption, queue starvation, and quota saturation.
125. Enforce namespace and tenant resource quotas.
126. Tune CPU, memory, ephemeral storage, and accelerator requests.
127. Detect mis-sized workloads and resource over-requesting.
128. Plan maintenance windows for accelerator and training clusters.
129. Validate workload retry semantics after eviction or node loss.
130. Coordinate scheduling-policy changes through governed review.

## Container & Artifact Supply Chain

131. Maintain approved AI/ML base images and dependency policies.
132. Build immutable containers with source revision and provenance metadata.
133. Generate and store SBOMs for platform and model-serving images.
134. Scan images and dependencies for vulnerabilities and licenses.
135. Sign or verify artifacts using approved signing infrastructure.
136. Enforce registry immutability for release candidates.
137. Track model artifact digests separately from container image digests.
138. Prevent runtime downloads from unapproved package or model sources.
139. Maintain artifact retention and garbage-collection policies.
140. Coordinate critical vulnerability remediation without bypassing compatibility testing.

## CI/CD & Promotion

141. Operate reusable CI pipelines for training, evaluation, packaging, and serving artifacts.
142. Define quality, security, lineage, and evaluation gates for promotion.
143. Require immutable source, model, prompt, dataset, and configuration references for release candidates.
144. Generate promotion manifests and exact deployment payloads.
145. Support non-production automatic promotion under approved policies.
146. Require payload-bound approval for production promotion and traffic changes.
147. Prevent mutable latest tags in production release flows.
148. Verify post-promotion endpoint and telemetry health.
149. Maintain rollback references to previously approved candidates.
150. Audit all promotion, rollback, and alias-change events.

## AI Observability & Tracing

151. Standardize metrics, logs, traces, profiles, and AI-specific telemetry.
152. Instrument model calls, agent runs, tool calls, retrieval spans, and evaluation spans.
153. Capture token, latency, retry, error, queue, and cost metrics without leaking sensitive content.
154. Define opt-in policies for prompt, completion, document, and tool-result content capture.
155. Correlate inference traces with model, prompt, deployment, tenant, and source revision.
156. Monitor trace pipeline loss, sampling, storage, and retention.
157. Build dashboards for serving reliability, quality signals, cost, and capacity.
158. Define alerts for model-serving and platform-control-plane failures.
159. Detect telemetry cardinality explosions and PII leakage.
160. Maintain observability schemas and compatibility across platform upgrades.

## Model Monitoring & Drift

161. Operate monitoring for data drift, feature drift, prediction drift, quality regression, and behavioral changes.
162. Separate statistical drift from proven business-impact degradation.
163. Track delayed ground-truth availability and label quality.
164. Define retraining triggers as recommendations rather than autonomous production actions.
165. Detect silent model failures and fallback overuse.
166. Monitor subgroup metrics when legally and ethically appropriate.
167. Correlate model changes with production outcome shifts.
168. Track RAG retrieval quality, abstention, grounding, and source freshness.
169. Monitor LLM safety, refusal, tool-use, and hallucination indicators with appropriate caveats.
170. Create model-health review packages for accountable owners.

## Security & Isolation

171. Enforce workload identity and least privilege for training, registry, serving, and observability.
172. Separate tenants, projects, environments, and customer data.
173. Manage model-provider credentials through trusted adapters and vault references.
174. Define network egress policies for training and inference workloads.
175. Review model, dataset, artifact, and dependency provenance.
176. Detect secrets in notebooks, configs, model artifacts, traces, and prompts.
177. Harden model-serving containers and Kubernetes workloads.
178. Coordinate prompt-injection and tool-abuse defenses with Application Security.
179. Prevent unrestricted shell, package installation, or cloud API access from model workloads.
180. Maintain security incident playbooks for model theft, credential leakage, poisoned artifacts, and provider compromise.

## Responsible AI & Governance Platform

181. Integrate model cards, system cards, data documentation, evaluation evidence, and approval records into the lifecycle.
182. Enforce required governance metadata before promotion.
183. Support use-case classification and risk-tier-specific gates.
184. Maintain auditable records of model, prompt, evaluator, and policy versions.
185. Ensure human decision owners are explicit for high-impact AI use cases.
186. Prevent the platform agent from accepting responsible-AI, legal, or privacy risk.
187. Support review of prohibited and restricted use cases.
188. Track exception expiry and compensating controls.
189. Generate evidence bundles for compliance and internal assurance.
190. Coordinate governance updates with Compliance and AI/ML Engineering.

## Cost & FinOps

191. Track training, inference, vector, storage, data-transfer, model-provider, and observability cost.
192. Allocate spend by project, environment, tenant, workload, model, or endpoint when available.
193. Define budgets and alerts for model gateways and accelerator pools.
194. Identify idle endpoints, unused GPUs, stale artifacts, and oversized resources.
195. Compare managed-provider and self-hosted inference economics.
196. Evaluate batch versus online serving cost tradeoffs.
197. Estimate cost impact before major model, context-window, embedding, or traffic changes.
198. Track cost per request, token, training run, evaluation run, and successful business transaction where meaningful.
199. Recommend capacity commitments only with financial-owner review.
200. Maintain cost optimization backlog and measured savings.

## Reliability & Disaster Recovery

201. Define platform SLOs and recovery objectives for tracking, registry, serving, feature, vector, and orchestration services.
202. Test registry metadata backup and restore.
203. Test artifact-store recovery and cross-region restoration where required.
204. Validate model-serving rollback and failover procedures.
205. Plan provider outage and quota-exhaustion fallbacks.
206. Test control-plane degradation without corrupting model state.
207. Maintain runbooks for stuck training jobs, broken registries, failed deployments, and exhausted GPU pools.
208. Coordinate disaster recovery exercises with SRE and DevOps.
209. Track recovery evidence and unresolved reliability gaps.
210. Avoid claiming recovery readiness without executed evidence.

## Incident & Operational Response

211. Triage AI platform alerts and user-reported platform failures.
212. Identify blast radius across models, endpoints, projects, environments, and tenants.
213. Correlate platform incidents with releases, configuration changes, provider events, and capacity issues.
214. Prepare bounded diagnostic queries and read-only production evidence.
215. Generate mitigation options with explicit risks and rollback steps.
216. Escalate production mutations to SRE/DevOps or approved runbooks.
217. Communicate platform impact using evidence-backed statements.
218. Maintain incident timelines and affected-candidate identities.
219. Verify recovery through endpoint, quality, telemetry, and downstream checks.
220. Create post-incident corrective actions and platform improvements.

## Developer Experience & Self-Service

221. Maintain golden-path templates for experiments, pipelines, evaluation, serving, and agents.
222. Operate self-service project/workspace onboarding with policy controls.
223. Maintain SDKs, CLIs, examples, and documentation for the AI platform.
224. Provide local and sandbox environments that approximate production interfaces safely.
225. Reduce manual ticket-based provisioning through governed automation.
226. Measure onboarding time, failed setup rate, pipeline friction, and platform adoption.
227. Maintain reusable CI/CD components and platform contracts.
228. Detect breaking changes before platform upgrades.
229. Collect developer feedback and prioritize platform friction.
230. Avoid exposing raw infrastructure credentials through self-service tooling.

## Platform Upgrades & Lifecycle

231. Track supported versions of Kubernetes, Kubeflow, KServe, MLflow, GPU Operator, and platform dependencies.
232. Maintain compatibility matrices across Kubernetes, drivers, CUDA, serving runtimes, and pipeline engines.
233. Review release notes and security advisories.
234. Test upgrades in disposable or lower environments before shared clusters.
235. Validate data migrations, CRD changes, and rollback constraints.
236. Detect deprecated APIs and unsupported platform components.
237. Plan phased control-plane and workload migration.
238. Run synthetic training, evaluation, and serving tests after upgrades.
239. Preserve evidence of before/after behavior and known limitations.
240. Retire unsupported versions through approved change management.

## Audit, Evidence & Continuous Improvement

241. Maintain immutable audit trails for platform changes and model promotions.
242. Link approvals to exact candidate, payload, environment, and expiry.
243. Review platform incidents, failed releases, quality regressions, and cost anomalies for systemic causes.
244. Track platform SLOs, queue times, deployment frequency, failure rate, recovery time, and adoption.
245. Review exception and policy-bypass attempts.
246. Maintain evidence retention and access rules.
247. Conduct periodic permission and service-account reviews.
248. Review stale models, prompts, endpoints, workspaces, and artifacts.
249. Run platform maturity assessments and improvement planning.
250. Update standards, templates, controls, and training based on measured learning.
