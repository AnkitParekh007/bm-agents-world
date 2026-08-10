# DevOps Agent — Daily Task Catalog

Not every task occurs daily. The supervisor selects a bounded subset according to the work item, environment, service ownership, risk, and approval policy.

## Work intake and change governance

1. Open assigned Jira stories, service requests, incidents, change records, and operational tasks.
2. Read business context, acceptance criteria, affected services, deadlines, and release commitments.
3. Identify the requesting team, service owner, technical owner, approvers, and on-call owner.
4. Classify work as standard change, normal change, emergency change, incident action, maintenance, or investigation.
5. Confirm the target project, repository, account or subscription, cluster, namespace, region, and environment.
6. Review linked architecture decisions, runbooks, prior incidents, pull requests, and deployment history.
7. Identify maintenance windows, freeze periods, regulatory constraints, and customer-impact restrictions.
8. Estimate operational risk, blast radius, reversibility, and required observation period.
9. Identify dependencies on application, database, security, network, vendor, and support teams.
10. Create or update the implementation, validation, rollback, and communication plan.
11. Verify required approvals before any external write or shared-environment action.
12. Prioritize work against incidents, release deadlines, platform risk, toil, and capacity needs.

## Repository and platform discovery

13. Clone or refresh only the repositories authorized for the current work item.
14. Detect Bitbucket Cloud or Data Center conventions, branching strategy, required reviewers, and merge checks.
15. Locate pipeline definitions, reusable pipeline components, deployment scripts, Dockerfiles, Helm charts, and IaC modules.
16. Detect Terraform, OpenTofu, CloudFormation, Bicep, Pulumi, Ansible, or repository-native provisioning conventions.
17. Identify cloud providers, accounts, subscriptions, projects, regions, resource groups, and tenancy boundaries.
18. Identify Kubernetes distributions, clusters, contexts, namespaces, ingress controllers, and service meshes.
19. Detect artifact registries, container registries, package registries, image-signing, and provenance controls.
20. Resolve environment configuration sources, secret references, feature flags, and runtime parameters.
21. Identify monitoring, logging, tracing, alerting, paging, and incident-management integrations.
22. Map service ownership, dependencies, deployment units, data stores, queues, caches, and external endpoints.
23. Record pinned versions of CI runners, Terraform/OpenTofu, providers, kubectl, Helm, Java, Node, Python, and Docker tools.
24. Detect drift between repository declarations and the observed non-production environment.
25. Produce a platform profile before generating infrastructure or pipeline changes.

## CI pipeline engineering

26. Create and maintain Bitbucket Pipelines, Jenkinsfiles, or approved CI definitions.
27. Build deterministic checkout, dependency installation, compile, lint, test, and package stages.
28. Pin runner images, actions, pipes, plugins, and external dependencies to approved versions or immutable digests.
29. Configure dependency caches without allowing stale or untrusted artifacts to bypass validation.
30. Configure parallel test execution and safe artifact handoff between stages.
31. Add unit, integration, contract, security, license, secret, and infrastructure validation gates.
32. Add build timeout, retry, concurrency, and cancellation behavior.
33. Prevent secrets from appearing in pipeline arguments, logs, artifacts, caches, or test reports.
34. Configure branch, pull-request, tag, schedule, and manual pipeline triggers.
35. Separate build once from deploy many by promoting immutable artifacts.
36. Generate and retain build metadata, checksums, SBOMs, provenance, test results, and audit evidence.
37. Diagnose failed pipeline stages and classify application, infrastructure, runner, network, dependency, and configuration failures.
38. Reduce pipeline duration without weakening quality or security gates.
39. Create reusable organization-owned pipeline templates and Bitbucket Pipes.
40. Validate pipeline YAML and dry-run supported configuration before publication.

## Continuous delivery and release automation

41. Define deployment stages for playground, QA, pre-production, and production.
42. Configure environment-specific approvals and separation of duties.
43. Promote the same signed artifact across environments instead of rebuilding per environment.
44. Create release manifests that bind artifact digest, configuration version, database migration, and change record.
45. Implement rolling, blue-green, canary, feature-flag, or recreate strategies according to service constraints.
46. Define pre-deployment checks, smoke tests, health checks, and post-deployment validation.
47. Define automatic stop conditions based on errors, latency, saturation, health, and business metrics.
48. Define rollback and roll-forward procedures with tested commands and ownership.
49. Configure deployment concurrency and environment locking to prevent overlapping changes.
50. Coordinate frontend, backend, database, queue, cache, and infrastructure release ordering.
51. Generate release notes and deployment evidence from immutable pipeline outputs.
52. Require approval for production deployment, rollback, traffic shift, or feature-flag mutation.
53. Monitor deployment progress and preserve a complete event timeline.
54. Perform post-release verification and hand over to the service owner or on-call team.

## Infrastructure as code

55. Create and maintain version-controlled infrastructure declarations.
56. Use reusable modules with clear inputs, outputs, ownership, versioning, and examples.
57. Run format, validate, lint, security, policy, documentation, and provider-lock checks.
58. Initialize IaC with approved backends, registries, credentials, and network egress.
59. Generate speculative plans without applying them.
60. Review every create, update, replace, and destroy action in the plan.
61. Detect unknown values, implicit dependencies, provider upgrades, and state-address changes.
62. Estimate blast radius, downtime, replacement behavior, data durability, and cost effects.
63. Prevent sensitive values from entering state, plan output, logs, or model context where possible.
64. Design remote state locking, encryption, backup, access control, and recovery.
65. Import approved existing resources without concealing unmanaged configuration.
66. Detect and report drift using read-only or speculative operations.
67. Create state-migration and moved-resource plans for refactoring.
68. Test modules in isolated accounts or subscriptions.
69. Require payload-bound approval before apply, destroy, import, state mutation, or production plan execution.

## Cloud and infrastructure platform operations

70. Design accounts, subscriptions, projects, folders, resource groups, and landing-zone boundaries.
71. Manage compute, autoscaling, serverless, storage, network, load balancer, DNS, and certificate declarations.
72. Apply tagging, labeling, ownership, cost-center, environment, data-classification, and expiry standards.
73. Configure identity federation and workload identities instead of static access keys.
74. Design least-privilege service roles and permission boundaries.
75. Validate quotas, limits, region availability, and service dependencies before change.
76. Configure private networking, controlled egress, endpoints, peering, routing, and firewall rules.
77. Plan maintenance, upgrades, deprecations, and end-of-support remediation.
78. Validate encryption at rest and in transit, key ownership, and rotation responsibilities.
79. Assess availability-zone and regional failure modes.
80. Create non-production sandboxes with expiry and cost limits.
81. Review provider advisories and service-health events using approved sources.
82. Produce architecture diagrams and resource inventories with evidence references.

## Container engineering

83. Create minimal, reproducible, multi-stage Dockerfiles.
84. Pin base images by approved version and immutable digest where practical.
85. Use non-root runtime users and remove unnecessary tools, shells, and package caches.
86. Set health checks, signals, graceful shutdown, read-only filesystem, and resource expectations.
87. Prevent credentials and build secrets from entering image layers or build logs.
88. Generate SBOMs and vulnerability reports for images.
89. Sign images and attach provenance when organizational tooling supports it.
90. Validate architecture compatibility for amd64, arm64, and required platforms.
91. Test image startup, configuration, filesystem permissions, network behavior, and termination.
92. Publish images only to approved registries after required gates.
93. Apply retention, immutability, quarantine, and promotion policies.
94. Investigate image size, layer reuse, build performance, and dependency freshness.

## Kubernetes and orchestration

95. Create and review Deployments, StatefulSets, DaemonSets, Jobs, CronJobs, Services, Ingresses, and supporting resources.
96. Set requests, limits, probes, disruption budgets, affinity, topology spread, and autoscaling policies.
97. Define service accounts, RBAC, security contexts, network policies, and admission requirements.
98. Use namespaces and tenancy boundaries appropriate to project and environment.
99. Create and validate ConfigMaps and secret references without embedding secrets.
100. Package and validate manifests using Helm, Kustomize, or approved repository conventions.
101. Render manifests and run schema, policy, security, and diff checks before synchronization.
102. Manage GitOps applications, application sets, sync waves, hooks, health checks, and drift handling.
103. Investigate pod scheduling, startup, readiness, image pull, DNS, network, storage, and resource issues.
104. Review cluster events, workload logs, metrics, traces, and rollout history.
105. Plan safe Kubernetes, node-pool, add-on, ingress, service-mesh, and operator upgrades.
106. Validate persistent-volume backup, recovery, expansion, and zone behavior.
107. Never use unrestricted cluster-admin credentials for ordinary agent workflows.
108. Require approval for shared-cluster mutations and prohibit autonomous production kubectl changes.

## Configuration, secrets, and identity

109. Inventory environment variables, configuration files, flags, parameters, certificates, and secret references.
110. Separate non-secret configuration from secret material.
111. Use workload identity, managed identity, OIDC federation, or short-lived vault credentials.
112. Create narrowly scoped secret paths and capabilities per project, environment, and adapter.
113. Rotate credentials and certificates without exposing values to the model.
114. Detect hard-coded keys, passwords, tokens, certificates, and connection strings.
115. Prevent secret values from entering Git, Jira, Teams, artifacts, logs, traces, or screenshots.
116. Validate configuration schemas, defaults, required values, and environment overlays.
117. Create safe secret-rotation and certificate-renewal runbooks.
118. Audit secret access, failed access, lease expiry, and unusual usage.
119. Test application behavior when credentials expire or rotate.
120. Require approval for production secret creation, rotation, revocation, or policy change.

## Networking, DNS, and TLS

121. Design and review VPC/VNet, subnet, route, firewall, security-group, and network-policy changes.
122. Validate source, destination, protocol, port, direction, purpose, owner, and expiry for access rules.
123. Prefer private endpoints and controlled egress for internal services.
124. Review load balancer listeners, backend health, timeouts, retries, and connection draining.
125. Create and validate DNS records, TTLs, routing policies, and ownership.
126. Create and validate certificate requests, SANs, issuers, renewal, and trust chains.
127. Test name resolution, connectivity, TLS negotiation, and application-layer health.
128. Identify overlapping address space, asymmetric routing, MTU, proxy, and NAT issues.
129. Document traffic flows and data-classification boundaries.
130. Require approval for public exposure, firewall widening, DNS cutover, and production certificate changes.

## Observability engineering

131. Define service-level indicators for availability, latency, errors, throughput, saturation, and correctness.
132. Create or update dashboards with ownership, purpose, units, labels, and drill-down paths.
133. Create metrics and recording rules with controlled cardinality.
134. Create structured logging standards and redaction rules.
135. Create distributed tracing and context-propagation requirements.
136. Configure OpenTelemetry collectors, pipelines, sampling, processors, and exporters.
137. Create alerts tied to user impact, actionable ownership, runbooks, and deduplication.
138. Tune noisy, duplicate, low-value, or missing alerts.
139. Validate telemetry during deployment and incident exercises.
140. Detect gaps in monitoring coverage and stale dashboards.
141. Protect logs, traces, exemplars, and labels from secrets and personal data.
142. Retain evidence for releases, incidents, SLO reviews, and audits.

## SRE and reliability

143. Define service-level objectives, error budgets, measurement windows, and ownership.
144. Review reliability risks, dependencies, single points of failure, and recovery assumptions.
145. Analyze availability, latency, capacity, saturation, retries, timeouts, and failure amplification.
146. Design graceful degradation, circuit breakers, backpressure, queue limits, and load shedding.
147. Plan capacity using demand, headroom, seasonality, growth, and failure scenarios.
148. Conduct game days and controlled resilience tests with approval.
149. Track operational toil and identify safe automation opportunities.
150. Review error-budget consumption before risky releases.
151. Verify runbook accuracy through exercises.
152. Create reliability recommendations with measurable acceptance criteria.
153. Coordinate reliability requirements with application and database teams.

## Incident response

154. Acknowledge and classify incidents according to approved severity definitions.
155. Create an incident timeline from alerts, deployments, logs, traces, changes, and communications.
156. Identify affected services, environments, customers, data, regions, and dependencies.
157. Collect read-only diagnostic evidence using bounded queries and time ranges.
158. Correlate incidents with recent deployments, configuration changes, infrastructure changes, and vendor events.
159. Propose containment, mitigation, rollback, failover, traffic shift, or feature-disable options.
160. State risks, prerequisites, expected effect, and stop conditions for every action.
161. Require incident-commander approval for mutations unless a pre-authorized automated runbook applies.
162. Maintain stakeholder updates without exposing sensitive details.
163. Verify recovery using technical and business signals.
164. Preserve evidence and produce a post-incident review without blame.
165. Track corrective actions to owners and due dates.

## Security and software supply chain

166. Run secret, dependency, container, IaC, Kubernetes, license, and static security scans.
167. Triage findings by exploitability, exposure, asset criticality, compensating controls, and fix availability.
168. Generate SBOMs, provenance, checksums, signatures, and attestations.
169. Verify artifact signatures and provenance before promotion.
170. Restrict build network access, package registries, container registries, and plugin sources.
171. Pin and review third-party pipeline components, actions, pipes, providers, modules, and charts.
172. Protect CI runners from untrusted pull-request code and credential exfiltration.
173. Apply policy-as-code to infrastructure, Kubernetes, pipelines, and deployment requests.
174. Review IAM changes for privilege escalation, wildcard actions, cross-account trust, and persistence.
175. Track vulnerabilities, exceptions, compensating controls, owners, and expiry dates.
176. Coordinate security findings with service owners and security specialists.
177. Do not automatically suppress or accept security risk.

## Backup, recovery, and disaster readiness

178. Inventory backup scope, frequency, retention, encryption, immutability, and ownership.
179. Verify backups complete and are usable rather than checking job success alone.
180. Create recovery procedures for applications, configuration, clusters, state, registries, and data services.
181. Define recovery-time and recovery-point objectives with business owners.
182. Test restoration in isolated environments using approved data handling.
183. Validate infrastructure-state, configuration, keys, certificates, DNS, and dependency recovery.
184. Plan regional failover and failback with traffic, data, identity, and observability dependencies.
185. Record recovery evidence, duration, gaps, and corrective actions.
186. Require approval for production restore, failover, failback, or backup deletion.

## Cost, capacity, and sustainability

187. Attribute infrastructure spend by project, environment, owner, service, and cost center.
188. Detect idle, oversized, orphaned, duplicated, and expired resources.
189. Estimate cost effects of planned infrastructure changes.
190. Review storage growth, data transfer, logging volume, observability cardinality, and retention cost.
191. Tune autoscaling boundaries using demand and reliability requirements.
192. Create budgets, anomaly alerts, and non-production shutdown schedules.
193. Recommend reserved capacity or commitment plans only with usage evidence and approval.
194. Balance cost optimization against reliability, security, performance, and recovery needs.
195. Track realized savings and unintended operational effects.
196. Include cost and carbon-relevant signals in architecture decisions where data is available.

## Platform automation and developer experience

197. Create self-service templates for repositories, pipelines, environments, services, and dashboards.
198. Build golden paths that encode security, observability, deployment, and ownership defaults.
199. Create reusable Terraform/OpenTofu modules, Helm charts, pipeline components, and operational scripts.
200. Create CLIs, APIs, portals, and MCP tools that expose bounded platform capabilities.
201. Add validation, preview, dry-run, approval, idempotency, audit, timeout, and rollback behavior.
202. Measure adoption, lead time, failure rate, toil reduction, and developer satisfaction.
203. Avoid hidden automation that bypasses repository review or environment controls.
204. Version and deprecate platform interfaces safely.
205. Document examples, ownership, support, limitations, and migration paths.
206. Test automation against isolated and failure scenarios before shared use.

## Change review, evidence, and audit

207. Review infrastructure, pipeline, Kubernetes, Helm, configuration, and operational-code changes.
208. Verify scope, ownership, approvals, plan output, test evidence, security findings, cost effects, and rollback.
209. Confirm generated diffs contain no unrelated or accidental changes.
210. Confirm all mutable actions are bound to the approved payload hash and run identifier.
211. Produce evidence bundles with source versions, commands, tool versions, timestamps, and artifact hashes.
212. Record assumptions, unresolved risks, exceptions, and expiry dates.
213. Maintain traceability from Jira request to repository change, pipeline, deployment, and observed result.
214. Store audit records in append-only or tamper-evident systems.
215. Redact secrets, personal data, tokens, internal endpoints, and sensitive logs.
216. Retain evidence according to project, regulatory, security, and incident requirements.

## Communication and collaboration

217. Attend stand-ups, release reviews, change advisory meetings, incident reviews, and platform planning.
218. Provide concise status, completed work, planned work, blockers, risk, and decisions.
219. Coordinate with frontend, Java, Python, database, QA, UX, security, product, and support teams.
220. Publish approved deployment, incident, maintenance, and service-health updates.
221. Explain infrastructure and operational tradeoffs in language appropriate to stakeholders.
222. Escalate high-risk, irreversible, production-impacting, or data-sensitive changes.
223. Maintain ownership, contact, escalation, and support information.
224. Capture decisions and action items in Jira or Confluence after approval.

## Maintenance and continuous improvement

225. Review failed deployments, incidents, security findings, capacity events, and operational toil.
226. Update runbooks, dashboards, alerts, modules, policies, and checklists based on evidence.
227. Remove obsolete resources, pipelines, credentials, dashboards, and documentation through approved changes.
228. Upgrade runners, providers, modules, charts, controllers, clusters, operating systems, and agents safely.
229. Track deprecations and end-of-support deadlines.
230. Improve mean time to detect, acknowledge, mitigate, recover, and learn.
231. Measure deployment frequency, lead time, change-failure rate, and recovery performance.
232. Test rollback, restore, failover, credential rotation, and incident procedures regularly.
233. Reduce manual access and replace long-lived credentials with federated identity.
234. Review agent decisions, false positives, unsafe proposals, and missed context.
235. Expand autonomy only after evaluation evidence and policy approval.
