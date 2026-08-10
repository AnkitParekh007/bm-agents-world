# AI/ML Engineer — Daily and Periodic Task Catalog

This catalog covers classical machine learning, deep learning, generative AI, LLM/RAG systems, evaluation, MLOps, and responsible AI. Not every task is daily; the supervisor selects tasks according to the use case, risk tier, lifecycle stage, and project authorization.

## Work Intake and Problem Framing

1. Read assigned Jira epics, stories, defects, research requests, and linked decisions.
2. Identify the business outcome, user population, decision to support, and measurable success condition.
3. Separate prediction, ranking, generation, retrieval, recommendation, forecasting, classification, anomaly detection, and optimization problems.
4. Challenge requests where deterministic software or analytics is more appropriate than ML.
5. Record assumptions, unknowns, constraints, and prohibited uses before experimentation.
6. Identify accountable product, engineering, data, security, and domain owners.
7. Define the unit of prediction or generation and the moment at which the system acts.
8. Identify expected latency, throughput, freshness, availability, and cost constraints.
9. Identify legal, privacy, contractual, data-residency, and model-use restrictions.
10. Identify baseline behavior and the minimum improvement needed to justify ML complexity.
11. Create a risk classification for the AI use case and route high-impact use cases for review.
12. Maintain a decision log linking product goals, data evidence, experiments, and model decisions.

## Data Discovery and Readiness

13. Locate approved datasets, feature sources, labels, documents, event streams, and metadata.
14. Verify dataset ownership, permitted purpose, retention, classification, and lineage.
15. Profile schema, volume, coverage, sparsity, duplicates, missingness, and outliers.
16. Check label definitions, label latency, annotation quality, inter-rater agreement, and leakage risk.
17. Detect train-serving skew and offline-online feature mismatches.
18. Identify sensitive attributes and determine whether they are permitted for training or evaluation.
19. Check temporal coverage and define event-time-aware train, validation, and test splits.
20. Detect duplicated entities or documents across evaluation splits.
21. Assess sampling bias, representation gaps, and selection effects.
22. Verify licensing and provenance for external datasets, models, embeddings, and corpora.
23. Create a reproducible data snapshot or immutable dataset reference.
24. Document data limitations that constrain claims about model performance.

## Feature Engineering and Representation

25. Define candidate features with business meaning and leakage analysis.
26. Build reproducible preprocessing and feature transformation pipelines.
27. Create categorical, numerical, temporal, textual, image, audio, graph, and geospatial representations as required.
28. Standardize train-time and inference-time feature logic.
29. Evaluate feature importance, redundancy, stability, and drift sensitivity.
30. Design feature-store usage when low-latency shared features are justified.
31. Version feature definitions and transformations with source revision references.
32. Validate null, unseen-category, extreme-value, and malformed-input behavior.
33. Measure feature freshness and availability at prediction time.
34. Remove features that encode prohibited proxies or unavailable future information.
35. Generate feature documentation and ownership metadata.
36. Test feature transformations deterministically.

## Classical Machine Learning

37. Establish simple statistical and heuristic baselines before complex models.
38. Train linear, tree-based, ensemble, nearest-neighbor, clustering, and anomaly-detection models when appropriate.
39. Tune hyperparameters using leakage-safe cross-validation or temporal validation.
40. Calibrate probabilistic models when decisions depend on probability quality.
41. Evaluate threshold tradeoffs for precision, recall, cost, and operational capacity.
42. Check class imbalance and choose appropriate weighting, sampling, or metrics.
43. Assess feature importance using multiple complementary methods where needed.
44. Run ablation studies to verify which signals drive performance.
45. Evaluate model robustness across cohorts, periods, and operating conditions.
46. Compare model complexity against accuracy, latency, interpretability, and maintenance cost.
47. Serialize approved models using safe, reproducible formats where possible.
48. Document reproducibility seeds, environment, data snapshot, and training configuration.

## Deep Learning and Foundation Models

49. Select architecture families appropriate to modality, scale, latency, and data constraints.
50. Use transfer learning or pretrained models before training from scratch when justified.
51. Configure mixed precision, gradient accumulation, clipping, checkpointing, and distributed training safely.
52. Track training and validation curves for overfitting, instability, and divergence.
53. Validate numerical behavior across accelerators and precision modes.
54. Run controlled learning-rate, batch-size, optimizer, and regularization experiments.
55. Evaluate checkpoint selection rules using predeclared metrics.
56. Measure inference latency, memory, throughput, and accelerator utilization.
57. Assess quantization, distillation, pruning, compilation, or smaller-model alternatives.
58. Test model serialization and loading in clean environments.
59. Record pretrained-model license, provenance, revision, and model-card references.
60. Prevent unreviewed model downloads or executable remote code in production workflows.

## NLP, Vision, Audio and Multimodal

61. Define modality-specific preprocessing and augmentation policies.
62. Evaluate tokenization, truncation, context-window, image resolution, audio sampling, and multimodal alignment behavior.
63. Create task-specific evaluation sets for NLP, vision, audio, and multimodal use cases.
64. Measure robustness to formatting, compression, noise, blur, accents, language, and domain shifts where relevant.
65. Check OCR, document-layout, and table-extraction failure modes for document AI.
66. Evaluate hallucinated visual or textual claims in multimodal generation.
67. Test multilingual coverage and localization effects.
68. Assess modality-specific fairness and representation limitations.
69. Benchmark preprocessing and postprocessing latency.
70. Version prompts, processors, tokenizers, labels, class mappings, and decoding settings.
71. Validate outputs against business constraints rather than modality metrics alone.
72. Document unsupported modalities, languages, classes, and contexts.

## LLM and Generative AI Engineering

73. Choose prompt-only, retrieval, tool-use, fine-tuning, or conventional software approaches based on evidence.
74. Create versioned system prompts, templates, structured-output schemas, and tool contracts.
75. Design model-provider abstraction only where operationally justified.
76. Build deterministic validation around model-generated structured outputs.
77. Measure task success rather than relying only on generic benchmark scores.
78. Evaluate hallucination, refusal, instruction-following, format adherence, and citation behavior.
79. Test prompt injection, data exfiltration, tool misuse, excessive agency, and unsafe output paths.
80. Implement bounded retries, timeouts, token budgets, and fallback behavior.
81. Evaluate smaller or cheaper models against quality and latency requirements.
82. Track prompt, model, tool, retrieval, and policy versions for every evaluation and production run.
83. Implement human-review checkpoints for high-impact generated content or actions.
84. Document known limitations, unsupported tasks, and conditions requiring escalation.

## RAG and Knowledge Systems

85. Identify authoritative knowledge sources and document ownership.
86. Design ingestion, parsing, chunking, metadata, embedding, and indexing strategies.
87. Separate retrieval quality evaluation from generation quality evaluation.
88. Build golden queries with expected evidence and failure cases.
89. Measure recall, precision, ranking quality, answer faithfulness, citation correctness, and abstention behavior.
90. Test document freshness, access control, deletion, and re-indexing behavior.
91. Enforce source-level and document-level authorization during retrieval.
92. Detect duplicate, conflicting, stale, and low-quality knowledge sources.
93. Evaluate hybrid lexical/vector retrieval, reranking, filters, and query rewriting.
94. Test malicious or poisoned documents and prompt-injection content in retrieved context.
95. Version embeddings, chunking logic, retrievers, rerankers, indexes, and source snapshots.
96. Define fallback behavior when reliable evidence is absent.

## Fine-tuning and Adaptation

97. Determine whether fine-tuning is justified versus prompting, retrieval, or rules.
98. Create approved training datasets with provenance and permitted-use checks.
99. De-duplicate training and evaluation data to prevent contamination.
100. Prepare supervised fine-tuning, preference, adapter, or task-specific datasets as appropriate.
101. Define frozen evaluation sets before training.
102. Track base-model revision, tokenizer, adapters, hyperparameters, and checkpoints.
103. Evaluate catastrophic forgetting and regression on general capabilities relevant to the product.
104. Measure safety and policy regressions after adaptation.
105. Compare full fine-tuning with parameter-efficient approaches and smaller-model alternatives.
106. Store checkpoints in approved registries with access controls and lineage.
107. Document data removal and retraining implications.
108. Require review before adapting models on confidential or customer-derived data.

## Experimentation and Reproducibility

109. Define experiment hypothesis, primary metric, guardrails, baseline, and stopping conditions.
110. Version datasets, code, configuration, environment, model, seed, and hardware context.
111. Track experiment runs and artifacts in the approved experiment system.
112. Separate exploratory metrics from predeclared decision metrics.
113. Run repeated trials when randomness materially affects conclusions.
114. Use statistical uncertainty or confidence intervals where appropriate.
115. Avoid tuning repeatedly against the final holdout set.
116. Compare candidates using equivalent data and evaluation conditions.
117. Record failed experiments and negative results to reduce repeated work.
118. Create reproducible notebooks or scripts that can be rerun outside an interactive session.
119. Archive experiment summaries and decision rationale.
120. Prevent production promotion from untracked local experiments.

## Model Evaluation and Testing

121. Define offline evaluation datasets that represent expected and difficult operating conditions.
122. Establish task-specific metrics, business metrics, safety metrics, and operational metrics.
123. Create regression suites for model behavior and data-processing code.
124. Evaluate performance across cohorts without using protected attributes for prohibited decisions.
125. Test calibration, threshold stability, robustness, adversarial inputs, and out-of-distribution behavior where relevant.
126. Create LLM evaluation rubrics, reference answers, judge calibration, and human-review samples.
127. Measure evaluator agreement and detect judge-model bias when using model-based evaluation.
128. Use deterministic validators for schemas, citations, tool arguments, and policy constraints.
129. Compare against non-ML baselines and previous production models.
130. Define minimum promotion gates and explicit waiver paths.
131. Generate evaluation reports linked to immutable candidate identifiers.
132. Block promotion when evidence is stale, mismatched, or incomplete.

## Responsible AI, Fairness and Explainability

133. Classify potential harms to users, organizations, and affected third parties.
134. Identify whether decisions are advisory, automated, reversible, or high impact.
135. Define appropriate human oversight and contestability mechanisms.
136. Assess subgroup performance where legally and ethically permitted and statistically meaningful.
137. Test proxy discrimination and unintended disparate behavior.
138. Choose explanation methods appropriate to model type and user need.
139. Document explanation limitations and avoid presenting approximations as causal truth.
140. Evaluate uncertainty and communicate confidence appropriately.
141. Define abstention, escalation, and fallback for uncertain or unsafe cases.
142. Create model cards or system cards describing intended use, limitations, evaluation, and risks.
143. Review datasets and models for representational and historical bias.
144. Route legal, privacy, employment, health, credit, or other consequential uses to accountable specialists.

## AI Security and Red Teaming

145. Threat-model model, data, prompt, retrieval, tool, serving, and supply-chain surfaces.
146. Scan repositories, dependencies, model artifacts, containers, and infrastructure for vulnerabilities.
147. Test prompt injection and indirect prompt injection in approved sandboxes.
148. Test data leakage, model inversion, membership inference, or extraction only when explicitly authorized.
149. Validate tenant and user authorization at retrieval and tool boundaries.
150. Protect system prompts, secrets, credentials, and confidential context from model-visible exposure.
151. Verify model and dataset provenance, signatures, hashes, and approved sources.
152. Reject untrusted serialized model formats or arbitrary remote code where safer alternatives exist.
153. Implement output filtering and deterministic policy checks for sensitive actions.
154. Coordinate active security testing with the Application Security / DevSecOps pack.
155. Create security findings with evidence, impact, and remediation proposals.
156. Require human approval for penetration testing, adversarial actions, or production security changes.

## Model Registry and Artifact Management

157. Register model candidates with immutable artifact digests.
158. Attach dataset, code, experiment, evaluation, license, and owner lineage.
159. Track stage, status, approvals, deprecation, and rollback relationships.
160. Store model cards, evaluation reports, signatures, SBOMs, and provenance.
161. Prevent mutable tags from being the sole production identity.
162. Verify artifact integrity before promotion or deployment.
163. Define retention and archival policies for experiments and checkpoints.
164. Record runtime dependencies and accelerator requirements.
165. Maintain compatibility metadata for preprocessing, tokenizer, features, and postprocessing.
166. Enforce project and environment separation in registries.
167. Create deprecation and replacement plans for obsolete models.
168. Audit registry access and promotion history.

## Serving and Inference Engineering

169. Select batch, online, streaming, edge, or asynchronous inference patterns.
170. Define latency, throughput, concurrency, availability, and cost objectives.
171. Package preprocessing, model, postprocessing, and policy checks as one versioned serving contract.
172. Implement bounded request sizes, timeouts, retries, circuit breakers, and overload behavior.
173. Benchmark CPU, GPU, accelerator, and quantized deployment options.
174. Design autoscaling using meaningful serving signals.
175. Implement caching only when privacy, freshness, and correctness allow it.
176. Validate online feature freshness and model-input schemas.
177. Implement safe model warmup, health checks, and readiness checks.
178. Test canary, shadow, champion-challenger, or staged rollout strategies.
179. Define rollback to a known-good model and compatible preprocessing stack.
180. Prevent the free-form agent from directly changing production endpoints or traffic.

## MLOps and CI/CD

181. Create reproducible training, evaluation, packaging, and deployment pipelines.
182. Run unit, data, model, integration, security, and packaging gates in CI.
183. Pin and verify Python, CUDA, driver, framework, and library compatibility.
184. Build containers with minimal approved bases and immutable digests.
185. Generate SBOM and provenance for production artifacts.
186. Validate model registry promotion rules in deterministic automation.
187. Separate development, validation, staging, and production identities.
188. Use workload identity instead of long-lived credentials.
189. Implement environment-specific configuration without embedding secrets.
190. Create rollback and redeployment runbooks.
191. Require approval for production model promotion and traffic changes.
192. Coordinate shared platform changes with DevOps and MLOps/Platform owners.

## Monitoring and Drift

193. Monitor service availability, latency, errors, saturation, and cost.
194. Monitor input schema, missingness, distribution, and feature freshness.
195. Monitor prediction or generation distributions for unexpected changes.
196. Measure data drift and concept drift using context-appropriate methods.
197. Track delayed ground-truth performance when labels become available.
198. Monitor LLM task success, refusal, citation, tool, token, and safety metrics.
199. Detect model-serving or retrieval regressions after upstream changes.
200. Set alerts based on actionable thresholds rather than noisy statistical changes alone.
201. Link monitoring to model, dataset, prompt, retriever, and deployment versions.
202. Define retraining or reevaluation triggers with human-owned policy.
203. Investigate incidents using bounded, redacted production evidence.
204. Generate periodic model-health and risk reviews.

## Performance, Cost and Sustainability

205. Measure training duration, accelerator utilization, memory, I/O, and communication overhead.
206. Profile inference latency, throughput, token rate, batch efficiency, and queue time.
207. Compare quality-per-cost across candidate models and serving configurations.
208. Estimate experiment, training, storage, embedding, retrieval, and inference cost.
209. Use early stopping, smaller models, efficient architectures, and caching where appropriate.
210. Evaluate quantization, distillation, compilation, and batching tradeoffs.
211. Right-size accelerator requests and avoid idle reserved capacity.
212. Track cost by project, model, environment, and use case.
213. Define budget alerts for expensive training or inference workloads.
214. Avoid automatic scale-up without cost and capacity bounds.
215. Document performance and cost assumptions in deployment reviews.
216. Coordinate large-capacity requests with DevOps, SRE, and FinOps owners.

## Documentation and Knowledge Transfer

217. Maintain README and development instructions for ML repositories.
218. Create dataset cards and data-source documentation.
219. Create model cards or system cards for promoted candidates.
220. Document training, evaluation, and inference commands.
221. Document reproducibility requirements and environment setup.
222. Document API, feature, prompt, retrieval, and output contracts.
223. Maintain operational runbooks and troubleshooting guides.
224. Create architecture, data-flow, evaluation, and deployment diagrams.
225. Document limitations, known failure modes, and escalation conditions.
226. Record experiment decisions and rejected alternatives.
227. Update Jira and Confluence through approved publication workflows.
228. Handoff model behavior and support constraints to QA, SRE, Support, and Product teams.

## Collaboration and Review

229. Review pull requests for ML correctness, reproducibility, leakage, and maintainability.
230. Review data changes with Data Engineers and Database Architects.
231. Review architecture and interfaces with Solution Architects and Technical Leads.
232. Review threat models and release gates with Application Security.
233. Review production readiness with DevOps, SRE, and Release Management.
234. Review acceptance metrics with Product Managers, Product Owners, and Business Analysts.
235. Review user impacts and human factors with UX Designers.
236. Coordinate model testing and regression with QA Engineers.
237. Request domain-expert review when labels or success criteria require specialized knowledge.
238. Separate model-author and independent-evaluator responsibilities for high-risk releases.
239. Capture review findings and resolutions as immutable evidence.
240. Escalate unresolved technical, product, safety, or data risks to accountable humans.

## Production Release and Lifecycle

241. Prepare immutable model-release bundles tied to source, data, model, and evaluation hashes.
242. Verify production candidate identity and compatible preprocessing or retrieval artifacts.
243. Confirm security, quality, responsible-AI, latency, capacity, and rollback gates.
244. Create staged rollout and observation plans.
245. Request human approval for production model promotion or traffic changes.
246. Verify rollout through bounded read-only telemetry.
247. Compare candidate behavior against baseline during observation windows.
248. Trigger approved rollback procedures when declared stop conditions are met.
249. Record release evidence, decisions, and deployed versions.
250. Schedule post-release outcome and drift reviews.
251. Deprecate superseded models only after consumers and rollback needs are addressed.
252. Retire data, indexes, endpoints, and artifacts according to approved lifecycle policy.
