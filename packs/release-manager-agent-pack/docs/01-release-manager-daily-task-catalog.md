# Release Manager Agent — Daily and Periodic Task Catalog

Not every activity occurs every day. The supervisor selects tasks according to release type, risk, project, environment, delivery model, and governance requirements.

This catalog contains **240 release-management tasks**.

## 1. Release Intake and Request Qualification

1. Monitor approved release-request queues, Jira versions, change calendars, and deployment pipelines.
2. Open the release request and identify the requesting product, project, service, and accountable owners.
3. Classify the release as standard, normal, major, minor, patch, hotfix, emergency, infrastructure, database, configuration, or documentation-only.
4. Confirm the business objective, customer outcome, regulatory driver, defect rationale, or operational reason for the release.
5. Verify the requested target environments and intended production audience.
6. Confirm the requested release window, timezone, blackout period, and expected duration.
7. Identify whether the request belongs to PCC, SOP, DataBridge, BM Agent Foundry, or a shared platform.
8. Validate that the release request has an accountable Product Owner, Engineering Lead, QA owner, DevOps owner, and support owner.
9. Check whether the change is part of an existing release train or needs an independent release record.
10. Detect duplicate, overlapping, conflicting, superseded, or abandoned release requests.
11. Check whether the release contains customer-specific, tenant-specific, regional, or data-residency constraints.
12. Identify legal, security, privacy, financial, contractual, or compliance review requirements.
13. Confirm whether feature flags, phased rollout, canary release, blue-green deployment, or dark launch are planned.
14. Capture assumptions, missing information, unresolved decisions, and required approvals.
15. Reject or return incomplete requests with a precise readiness gap list.
16. Create a traceable release identifier and immutable source references.

## 2. Scope, Version, and Release Content Management

17. Build the proposed release scope from approved Jira stories, defects, technical tasks, database changes, infrastructure changes, and configuration items.
18. Verify that every scoped item has an approved target release or fix version.
19. Separate committed scope from stretch, optional, deferred, and explicitly excluded scope.
20. Detect scope additions after the agreed freeze point.
21. Identify orphaned commits, pull requests, migrations, artifacts, or configuration changes not linked to approved work items.
22. Identify Jira items marked complete whose code, database, infrastructure, or configuration change is not present in the release candidate.
23. Confirm application, API, database, container, package, and infrastructure version numbers.
24. Validate semantic-versioning rules or the organization’s approved versioning convention.
25. Confirm artifact naming, build numbers, commit hashes, image digests, and package coordinates.
26. Build a release bill of materials across frontend, backend, database, infrastructure, configuration, and documentation.
27. Compare the candidate release with the currently deployed baseline.
28. Produce a human-readable change summary and a machine-readable manifest.
29. Identify backward-incompatible changes and required consumer actions.
30. Identify deprecations, removals, feature retirements, and migration deadlines.
31. Validate that release notes accurately represent delivered scope rather than planned scope.
32. Freeze scope only after accountable owners approve the exact release payload.

## 3. Release Planning and Calendar Coordination

33. Create and maintain the integrated release plan.
34. Reserve approved deployment windows in the release calendar.
35. Check organizational blackout periods, financial close, peak business periods, holidays, maintenance windows, and regulatory freezes.
36. Coordinate release sequencing across PCC, SOP, DataBridge, shared services, and platform components.
37. Identify prerequisite releases and required minimum versions.
38. Identify downstream consumers that must deploy before, during, or after the release.
39. Coordinate shared-environment usage and prevent conflicting deployment activities.
40. Define planning milestones for scope lock, code freeze, test completion, change approval, go/no-go, deployment, validation, and closure.
41. Define the release command structure, communication cadence, and escalation path.
42. Plan rehearsal, dress rehearsal, migration dry run, or rollback exercise when risk warrants it.
43. Estimate operational duration using evidence from comparable releases.
44. Reserve contingency time without representing estimates as guarantees.
45. Maintain a calendar view for standard, planned, emergency, and business releases.
46. Communicate schedule changes to affected owners and stakeholders after approval.
47. Resolve calendar conflicts through accountable human decisions.
48. Maintain timezone-safe timestamps and a single authoritative release clock.

## 4. Dependency and Compatibility Management

49. Build a dependency map covering services, APIs, events, databases, infrastructure, identity, networks, certificates, vendors, and client applications.
50. Validate compatible frontend, backend, database, and infrastructure combinations.
51. Check API and event schema compatibility.
52. Confirm consumer readiness for contract changes.
53. Identify shared libraries, packages, SDKs, and base images affected by the release.
54. Check runtime, JDK, Node.js, Python, Angular, framework, database, and operating-system compatibility.
55. Validate third-party service maintenance windows and vendor dependencies.
56. Identify certificate, secret, token, license, and entitlement dependencies without exposing secret values.
57. Check data migration dependencies and ordering constraints.
58. Identify configuration dependencies between environments.
59. Check feature-flag prerequisites and flag-state compatibility.
60. Identify cross-team handoffs that can block release readiness.
61. Track dependency owners, required-by dates, evidence, and status.
62. Escalate unresolved critical dependencies before the go/no-go decision.
63. Verify that rollback does not violate dependency or data compatibility constraints.
64. Maintain a tested compatibility matrix for supported deployment combinations.

## 5. Quality and Test Readiness

65. Confirm that acceptance criteria are covered by test evidence.
66. Confirm unit, component, integration, API, database, end-to-end, regression, accessibility, performance, security, and resilience testing as applicable.
67. Verify test execution against the exact candidate artifacts and configurations.
68. Review pass, fail, skipped, quarantined, flaky, and not-run test counts.
69. Require documented rationale for skipped or waived tests.
70. Review open defects by severity, customer impact, affected scope, and workaround availability.
71. Verify that release-blocking defects are closed or explicitly dispositioned by accountable owners.
72. Confirm regression scope covers changed and adjacent functionality.
73. Review environment stability and test-data validity.
74. Confirm nonfunctional test thresholds and evidence.
75. Check that test reports are immutable, attributable, and linked to the release candidate.
76. Confirm UAT or business-acceptance evidence where required.
77. Confirm known limitations are documented for release notes and support.
78. Identify quality evidence gaps and assign owners.
79. Prevent a release from being marked ready based solely on ticket status.
80. Produce a quality-readiness summary for go/no-go review.

## 6. Security, Compliance, and Supply-Chain Readiness

81. Confirm dependency, container, infrastructure, code, and secret scans completed for the candidate.
82. Review unresolved vulnerabilities by severity, exploitability, exposure, and compensating control.
83. Verify security exceptions are current, scoped, approved, and not self-approved by the release agent.
84. Validate artifact signatures, checksums, provenance, and immutable digests.
85. Validate the software bill of materials for required components.
86. Check license-policy results and restricted-component findings.
87. Confirm required privacy, data-protection, legal, and compliance reviews.
88. Verify that release artifacts came from approved repositories and trusted pipelines.
89. Confirm production secrets are referenced through workload identity or vault-backed adapters.
90. Check certificate and key-rotation dependencies without reading private keys.
91. Verify separation of duties between release preparation, approval, and execution.
92. Confirm audit evidence is complete before high-risk release approval.
93. Identify unapproved binaries, packages, images, scripts, or manual changes.
94. Validate that emergency releases do not silently bypass required retrospective controls.
95. Escalate material security or compliance risk to accountable specialists.
96. Produce a security and supply-chain readiness summary.

## 7. Environment, Infrastructure, and Configuration Readiness

97. Confirm target environment health and capacity before deployment.
98. Validate environment inventory, service ownership, regions, clusters, namespaces, accounts, subscriptions, and resource groups.
99. Compare production configuration with the approved candidate configuration.
100. Detect configuration drift between playground, QA, staging, and production.
101. Verify infrastructure plans were reviewed and approved.
102. Confirm container images, manifests, Helm charts, Kustomize overlays, and infrastructure modules reference approved versions.
103. Check network, DNS, TLS, firewall, gateway, load-balancer, and service-mesh dependencies.
104. Confirm monitoring, alerting, dashboards, logs, traces, and SLO views exist for changed services.
105. Validate deployment accounts and workload identities have least-privilege access.
106. Confirm production access is available only to approved operators or pipelines.
107. Check environment freeze, maintenance mode, and business readiness prerequisites.
108. Confirm capacity headroom and autoscaling configuration for expected load.
109. Verify backup, snapshot, restore, and disaster-recovery prerequisites where relevant.
110. Confirm platform and vendor support coverage during the release window.
111. Document environment-specific deviations and risks.
112. Produce an environment-readiness report.

## 8. Database, Data, and Migration Readiness

113. Identify all schema, data, reference-data, permission, stored-procedure, and database-configuration changes.
114. Validate migration ordering and compatibility with application deployment order.
115. Review forward migration, validation, rollback, restore, and fix-forward plans.
116. Confirm migrations were tested against representative data volume and supported database versions.
117. Review expected rows, duration, locking, transaction, log-growth, replication, and storage impact.
118. Confirm backup or snapshot prerequisites and restore validation.
119. Validate zero-downtime or expand-and-contract patterns where claimed.
120. Confirm backward and forward compatibility during mixed-version operation.
121. Review data backfill checkpoints, throttling, resumability, and stop conditions.
122. Validate data-quality and reconciliation queries.
123. Confirm production migration execution is assigned to an authorized operator or deterministic pipeline.
124. Verify that the free-form release agent cannot execute production DDL or DML.
125. Coordinate database monitoring during and after deployment.
126. Confirm recovery time and recovery point assumptions with accountable owners.
127. Capture migration hashes and exact scripts in the immutable release bundle.
128. Produce a database and data readiness assessment.

## 9. Change Governance and Approval Management

129. Create or link the required change record.
130. Classify the change according to the organization’s approved change model.
131. Confirm risk, impact, urgency, implementation, validation, rollback, communication, and ownership fields are complete.
132. Verify required technical, business, security, database, platform, and service-owner approvals.
133. Bind approvals to the exact payload hash, environment, window, and expiry.
134. Prevent approval reuse after scope or artifact changes.
135. Prevent the release preparer from self-approving protected actions.
136. Track approval status without fabricating consent.
137. Prepare go/no-go evidence for accountable decision-makers.
138. Record decisions, conditions, dissent, accepted risks, and owners.
139. Escalate expired, missing, ambiguous, or conflicting approvals.
140. Confirm emergency-change authority and retrospective review requirements.
141. Maintain an immutable audit trail of release decisions.
142. Ensure change governance is proportionate to risk and does not become a ceremonial checkbox.
143. Close or cancel obsolete change records after approval.
144. Produce an approval and governance summary.

## 10. Deployment and Rollback Planning

145. Create a step-by-step deployment runbook from approved automation and operator procedures.
146. Define prechecks, execution steps, validation checks, decision points, stop conditions, and escalation paths.
147. Define the exact artifact, environment, region, cluster, namespace, database, and feature scope for each step.
148. Assign accountable operators for each protected action.
149. Sequence application, database, infrastructure, configuration, and feature-flag changes safely.
150. Identify steps that can run in parallel and steps that must remain serial.
151. Define canary, phased, ring-based, blue-green, or rolling rollout controls where supported.
152. Define monitoring windows and promotion criteria between rollout stages.
153. Create a tested rollback or fix-forward decision tree.
154. Validate rollback artifact availability and compatibility.
155. Define rollback triggers using observable conditions rather than intuition alone.
156. Confirm rollback will not cause data loss or contract incompatibility.
157. Include cleanup and temporary-control removal steps.
158. Timebox risky manual steps and define stop-work criteria.
159. Rehearse complex releases in an approved non-production environment.
160. Freeze the deployment runbook only when it matches the approved payload.

## 11. Release Communication and Stakeholder Coordination

161. Build a stakeholder and audience map for the release.
162. Prepare internal release announcements with scope, timing, impact, responsibilities, and support routes.
163. Prepare customer-facing notes using approved language and confirmed functionality.
164. Prepare release-window status updates with facts, timestamps, progress, risks, and next checkpoints.
165. Coordinate communication across Product, Engineering, QA, DevOps, Database, Support, Security, Sales, and Customer Success.
166. Avoid unsupported promises about release time, restoration time, customer impact, or root cause.
167. Publish only after the designated owner approves the exact message.
168. Maintain a single source of truth for release status.
169. Ensure status updates distinguish planned, in progress, validated, rolled back, partially released, and closed states.
170. Prepare outage or maintenance notices where required.
171. Prepare support handoff with known issues, diagnostics, workarounds, and escalation contacts.
172. Prepare business-readiness confirmation for training, documentation, operations, and customer communication.
173. Track acknowledgements from critical operational owners.
174. Coordinate regional and timezone-specific communication.
175. Correct inaccurate status promptly with an auditable update.
176. Archive final communication artifacts with the release evidence.

## 12. Go/No-Go and Release Command

177. Assemble the go/no-go decision pack.
178. Summarize scope, evidence, unresolved risks, deviations, conditions, and rollback readiness.
179. Confirm required decision-makers are present or have delegated authority.
180. Present readiness by domain without hiding uncertainty or dissent.
181. Distinguish blocker, conditional go, accepted risk, monitor-only issue, and follow-up action.
182. Verify the release candidate has not changed since evidence collection.
183. Confirm approvals are valid for the current payload and window.
184. Record the accountable human go, conditional-go, delay, partial-release, or no-go decision.
185. Prevent the agent from making the final production release decision.
186. Open and maintain the release command log during execution.
187. Track each deployment stage, timestamp, owner, outcome, and evidence reference.
188. Coordinate cross-team checkpoints and escalation.
189. Pause execution when stop conditions are met.
190. Initiate the approved rollback or fix-forward process through authorized operators.
191. Keep stakeholders informed at the approved cadence.
192. Preserve an immutable release timeline.

## 13. Hotfix and Emergency Release Management

193. Validate the emergency condition and authorized decision-maker.
194. Define the smallest safe change that restores service or mitigates material risk.
195. Separate emergency restoration from unrelated scope.
196. Confirm expedited testing appropriate to the change and time available.
197. Verify the exact patch artifact, commit, migration, and configuration delta.
198. Require explicit risk, rollback, monitoring, and communication plans.
199. Prevent emergency classification from becoming a routine bypass mechanism.
200. Coordinate incident command, Support, Engineering, QA, DevOps, Database, Security, and Product owners.
201. Bind emergency approval to the exact payload and expiration.
202. Track customer and service impact throughout the emergency release.
203. Verify restoration and regression evidence after deployment.
204. Create follow-up work for permanent remediation and missing controls.
205. Schedule mandatory retrospective review.
206. Reconcile emergency changes back into source control, manifests, environments, and documentation.
207. Measure emergency-release frequency and causes without blaming individuals.
208. Close the emergency change only after evidence and follow-up ownership are complete.

## 14. Post-Release Validation and Closure

209. Run or coordinate approved post-deployment smoke and business validation.
210. Verify deployment status, artifact versions, database migrations, configuration, and feature-flag states.
211. Monitor logs, metrics, traces, alerts, SLOs, error rates, latency, saturation, and customer signals.
212. Compare observed behavior with release success criteria and baseline.
213. Check support tickets, incidents, customer feedback, and operational anomalies.
214. Confirm all rollout stages and regions reached the intended state.
215. Verify temporary maintenance controls and elevated access are removed.
216. Validate that rollback resources remain available through the agreed observation window.
217. Record defects, incidents, follow-up work, and known limitations.
218. Confirm support and operations handoff is complete.
219. Prepare release closure evidence.
220. Close or transition Jira versions and change records after approval.
221. Publish final release notes and status after approval.
222. Archive immutable artifacts, decisions, logs, and evidence references.
223. Schedule post-release review based on risk and outcome.
224. Confirm the release is closed only after agreed success criteria are met.

## 15. Metrics, Audit, and Continual Improvement

225. Measure release lead time, deployment frequency, failed deployment recovery time, change failure percentage, and deployment rework rate where definitions are governed.
226. Measure release predictability without turning estimates into individual performance scores.
227. Track delays by evidence gap, dependency, approval, environment, quality, or operational cause.
228. Track rollback, fix-forward, hotfix, and emergency-release trends.
229. Analyze scope churn and late additions.
230. Analyze release-window duration and manual-step concentration.
231. Analyze readiness false positives and false negatives.
232. Review recurring approval bottlenecks and unnecessary handoffs.
233. Review escaped defects and operational incidents without assigning blame through simplistic metrics.
234. Identify automation candidates for repeatable release checks.
235. Improve release templates, runbooks, policies, and dashboards.
236. Maintain evidence retention and audit-searchability.
237. Verify release records meet internal and regulatory audit requirements.
238. Conduct periodic access and separation-of-duties reviews.
239. Create measurable improvement experiments and track outcomes.
240. Share team-level release learnings with affected packs and platform owners.
