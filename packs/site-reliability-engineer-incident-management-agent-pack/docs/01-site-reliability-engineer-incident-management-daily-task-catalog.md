# Site Reliability Engineer / Incident Management — Daily and Periodic Task Catalog

Not every task occurs every day. The supervisor selects tasks according to service tier, SLO state, alert load, incident conditions, release activity, operational risk, and human approvals.

## Service Ownership and Reliability Context

1. Review assigned services, owners, users, business criticality, and support tiers.
2. Confirm production, QA, playground, and disaster-recovery topology.
3. Map upstream and downstream service dependencies.
4. Review architecture decisions and known reliability constraints.
5. Identify critical user journeys and business transactions.
6. Verify service ownership, escalation paths, and operational contacts.
7. Review recent deployments, incidents, risks, and unresolved actions.
8. Inspect service configuration, feature states, and environment differences.
9. Confirm data stores, queues, caches, schedulers, and external providers.
10. Review support hours, on-call expectations, and regional coverage.
11. Classify service criticality and acceptable degradation modes.
12. Identify single points of failure and hidden operational dependencies.
13. Review maintenance windows, freeze periods, and change restrictions.
14. Maintain an evidence-backed reliability profile for each service.
15. Escalate missing ownership, telemetry, runbook, or recovery information.

## SLIs, SLOs, and Error Budgets

16. Define user-centered service level indicators.
17. Select availability, latency, correctness, freshness, durability, and throughput indicators.
18. Validate SLI data sources and measurement integrity.
19. Define SLO targets and rolling measurement windows.
20. Document exclusions and valid maintenance handling.
21. Calculate remaining error budget.
22. Analyze error-budget consumption and burn rate.
23. Create multi-window multi-burn-rate alert proposals.
24. Review low-traffic service measurement limitations.
25. Define error-budget policy and decision thresholds.
26. Connect SLOs to release and reliability decisions.
27. Review SLO suitability after architecture or traffic changes.
28. Identify services without meaningful user-centered objectives.
29. Prepare service-level reviews for Product and Engineering leadership.
30. Recommend target changes using evidence and human approval.

## Observability Engineering

31. Review metrics, logs, traces, profiles, events, and exemplars.
32. Validate telemetry coverage across critical user journeys.
33. Define consistent service and resource attributes.
34. Correlate logs, metrics, and traces using request and trace identifiers.
35. Design operational dashboards for symptoms and causes.
36. Validate telemetry retention, cardinality, sampling, and cost.
37. Detect missing instrumentation and blind spots.
38. Review distributed tracing propagation across service boundaries.
39. Validate redaction of secrets and sensitive customer data.
40. Review telemetry pipeline health and dropped-data indicators.
41. Define golden signals and service-specific diagnostic signals.
42. Create observability acceptance criteria for new features.
43. Compare telemetry across releases and environments.
44. Review dashboard ownership, freshness, and actionability.
45. Prepare instrumentation improvement proposals.

## Alerting and Event Management

46. Review firing alerts and current service impact.
47. Deduplicate and correlate related alerts.
48. Identify noisy, stale, flapping, or non-actionable alerts.
49. Validate alert ownership, severity, routing, and escalation.
50. Review alert thresholds against SLOs and user impact.
51. Define symptoms before causes for paging alerts.
52. Separate pages, tickets, notifications, and dashboard-only signals.
53. Evaluate false-positive and false-negative alert behavior.
54. Review alert inhibition, grouping, and maintenance handling.
55. Verify alert runbook links and responder context.
56. Analyze time to acknowledge and responder engagement.
57. Recommend alert consolidation or retirement.
58. Validate synthetic and black-box monitoring coverage.
59. Test alert delivery in approved non-production exercises.
60. Publish approval-controlled alert-quality reports.

## On-Call Readiness and Operations

61. Review on-call schedules, rotations, backups, and coverage gaps.
62. Prepare shift handoff summaries.
63. Review active incidents, risks, changes, and follow-up obligations.
64. Verify responder access through approved readiness checks.
65. Review runbook availability and applicability.
66. Validate incident channels, bridges, and contact paths.
67. Prepare service and dependency quick-reference material.
68. Review paging load and after-hours burden at team level.
69. Identify repeat pages and automation opportunities.
70. Coordinate training and incident simulations.
71. Review escalation delays and ownership confusion.
72. Maintain on-call readiness checklists.
73. Identify fatigue risks without evaluating individual performance.
74. Prepare bounded diagnostic queries for common incidents.
75. Escalate unsafe or unsupported operational expectations.

## Incident Detection and Declaration

76. Assess whether an alert or report represents an incident.
77. Confirm affected services, users, regions, tenants, and environments.
78. Classify incident severity using approved criteria.
79. Estimate impact with explicit confidence and evidence.
80. Declare incidents through approval-controlled workflows.
81. Assign or recommend incident-command roles.
82. Create the incident channel, bridge, and evidence workspace.
83. Establish communication cadence and stakeholder groups.
84. Define incident objectives and immediate priorities.
85. Start an immutable incident timeline.
86. Record hypotheses, decisions, actions, and owners.
87. Identify security, privacy, safety, or compliance escalation needs.
88. Detect duplicate or related incidents.
89. Link changes, releases, support tickets, and customer reports.
90. Escalate uncertainty rather than understate user impact.

## Incident Command and Coordination

91. Support the Incident Commander with concise situation summaries.
92. Maintain clear operational, communication, and investigation workstreams.
93. Track action owners, deadlines, and completion evidence.
94. Prevent conflicting or repeated remediation actions.
95. Coordinate specialists across application, database, infrastructure, and security teams.
96. Preserve decision authority and role separation.
97. Manage responder handoffs and continuity.
98. Maintain stakeholder and customer communication cadence.
99. Track unresolved risks and competing hypotheses.
100. Record exact production action requests and approvals.
101. Escalate stop conditions and safety concerns.
102. Identify when additional incident-command support is needed.
103. Coordinate vendors and external providers through approved channels.
104. Prepare executive summaries without unsupported claims.
105. Recommend de-escalation only after verified recovery.

## Diagnosis and Technical Investigation

106. Build evidence-driven diagnostic hypotheses.
107. Define bounded time windows and comparison baselines.
108. Correlate incident onset with deployments and configuration changes.
109. Analyze request rate, errors, latency, and saturation.
110. Trace failing requests across distributed dependencies.
111. Inspect bounded redacted logs for signatures and anomalies.
112. Analyze database latency, locks, connections, and replication lag.
113. Analyze queue depth, consumer lag, retries, and dead letters.
114. Analyze cache hit rate, eviction, and stampede indicators.
115. Analyze infrastructure capacity and resource pressure.
116. Compare healthy and unhealthy regions, tenants, or versions.
117. Validate hypotheses through safe read-only checks.
118. Separate contributing factors from evidence-supported causes.
119. Identify missing evidence and instrumentation gaps.
120. Prepare specialist escalation packages when investigation exceeds scope.

## Mitigation, Containment, and Recovery

121. Generate reversible mitigation options.
122. Compare rollback, roll-forward, traffic shift, scaling, throttling, and feature-disable options.
123. Assess blast radius, dependencies, and secondary effects.
124. Define exact preconditions and stop conditions.
125. Validate that a runbook applies to the current service and version.
126. Prepare immutable production action requests.
127. Confirm independent approval for non-routine actions.
128. Coordinate execution by an authorized operator or deterministic pipeline.
129. Monitor technical and business recovery signals.
130. Verify that error rates, latency, saturation, and user journeys recover.
131. Detect partial or temporary recovery.
132. Prevent repeated unsafe actions when evidence conflicts.
133. Plan restoration of temporarily disabled functionality.
134. Record all actions, approvals, outputs, and timestamps.
135. Recommend incident resolution only after sustained verification.

## Communication and Stakeholder Management

136. Draft internal incident acknowledgements.
137. Prepare customer-safe status updates.
138. State impact, scope, actions, and uncertainty accurately.
139. Avoid unsupported root-cause and restoration-time claims.
140. Tailor updates for responders, executives, support, and customers.
141. Maintain agreed communication cadence.
142. Track message approvals and publication evidence.
143. Coordinate status-page updates through approved workflows.
144. Prepare service-restoration and monitoring notices.
145. Document known limitations and workarounds.
146. Prepare cross-shift and cross-region handoffs.
147. Coordinate with Product, Support, Security, and Release Management.
148. Identify legal, regulatory, or contractual communication needs.
149. Maintain a consistent source of truth.
150. Close communication loops after recovery and review.

## Post-Incident Review and Learning

151. Determine whether a post-incident review is required.
152. Build a factual incident timeline from immutable evidence.
153. Document customer and business impact.
154. Separate triggers, contributing factors, and systemic conditions.
155. Describe detection, response, mitigation, and recovery performance.
156. Identify what went well, poorly, and where the organization was fortunate.
157. Facilitate blameless review practices.
158. Avoid personal judgments and unsupported certainty.
159. Identify reliability, process, documentation, and tooling gaps.
160. Create specific corrective actions with owners and success measures.
161. Prioritize actions by risk reduction and effort.
162. Link actions to Jira and reliability roadmaps.
163. Track action completion and effectiveness.
164. Share approved lessons across teams.
165. Update runbooks, alerts, tests, architecture, and training.

## Reliability Engineering and Risk Reduction

166. Review service architecture for reliability risks.
167. Analyze failure domains and fault containment.
168. Evaluate redundancy and graceful degradation.
169. Review retry, timeout, circuit-breaker, and backpressure behavior.
170. Analyze dependency criticality and fallback strategies.
171. Review data durability, consistency, and recovery requirements.
172. Identify cascading-failure and retry-storm risks.
173. Assess load shedding and admission control.
174. Review multi-region or multi-zone reliability assumptions.
175. Recommend reliability acceptance criteria.
176. Create reliability risk registers.
177. Evaluate new designs against quality attributes.
178. Track recurring failure modes.
179. Coordinate reliability improvements with architecture and engineering teams.
180. Measure whether reliability changes reduce user risk.

## Capacity, Performance, and Scalability

181. Review traffic, throughput, latency, and resource trends.
182. Forecast capacity using approved demand assumptions.
183. Identify saturation and resource-exhaustion risks.
184. Analyze headroom by service and dependency.
185. Review autoscaling thresholds and stabilization behavior.
186. Analyze connection pools, thread pools, queues, and worker capacity.
187. Review database and storage growth.
188. Identify hot partitions, tenants, keys, or workloads.
189. Plan safe load and stress tests in approved environments.
190. Validate performance regressions against baselines.
191. Define capacity thresholds and operational actions.
192. Prepare peak-event readiness plans.
193. Review third-party quota and rate-limit constraints.
194. Coordinate cost and capacity tradeoffs.
195. Publish evidence-backed capacity recommendations.

## Resilience, Disaster Recovery, and Continuity

196. Review recovery time and recovery point objectives.
197. Map critical dependencies and recovery order.
198. Validate backup coverage, freshness, and restore evidence.
199. Review failover, failback, and degraded-mode runbooks.
200. Plan game days and resilience exercises.
201. Define safe fault-injection scope and stop conditions.
202. Coordinate disaster-recovery simulations.
203. Measure detection, decision, recovery, and verification times.
204. Validate data reconciliation after recovery.
205. Identify manual dependencies and access gaps.
206. Review regional, provider, and network failure scenarios.
207. Track exercise findings and corrective actions.
208. Maintain recovery architecture and contact information.
209. Prepare continuity evidence for audits and leadership.
210. Require human approval for production resilience tests and failovers.

## Change, Release, and Operational Readiness

211. Review release candidates for reliability risk.
212. Validate monitoring, alerts, runbooks, rollback, and ownership before release.
213. Review database, infrastructure, and configuration dependencies.
214. Confirm SLO and error-budget implications.
215. Assess progressive-delivery and canary strategies.
216. Define release health signals and abort conditions.
217. Review freeze-window and high-risk change requirements.
218. Correlate incidents with recent changes.
219. Participate in go/no-go decision support.
220. Verify post-deployment health using read-only evidence.
221. Recommend rollback or pause when objective conditions are met.
222. Review emergency and hotfix operational risk.
223. Maintain operational-readiness checklists.
224. Track change failure and recovery trends.
225. Feed release learnings into reliability standards.

## Toil Reduction, Automation, and Continuous Improvement

226. Identify repetitive manual operational work.
227. Measure toil volume, interruption, and reliability impact at team level.
228. Prioritize automation by risk, frequency, and effort.
229. Convert safe repetitive checks into deterministic tools.
230. Create bounded diagnostic and verification automation.
231. Improve runbook clarity and executability.
232. Automate evidence collection and correlation.
233. Reduce alert noise and duplicate notifications.
234. Standardize service templates and reliability controls.
235. Improve developer self-service for operational readiness.
236. Track automation effectiveness and failure modes.
237. Retire obsolete scripts and dashboards.
238. Document ownership and maintenance for operational automation.
239. Create reliability improvement roadmaps.
240. Review whether SRE effort is reducing operational load and user risk.

## Recommended Initial SRE Agent MVP

`Service context → SLI/SLO baseline → observability and alert review → bounded production diagnostics → incident coordination → immutable action request → human/operator execution → recovery verification → post-incident learning`

The first version should remain read-only in production. Enable communication writes, non-production exercises, and deterministic production runbooks only after historical evaluation, red-team testing, and accountable human approval.
