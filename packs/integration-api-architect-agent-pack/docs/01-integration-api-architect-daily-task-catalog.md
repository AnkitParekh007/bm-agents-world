# Integration / API Architect — Daily and Periodic Task Catalog

This catalog defines 240 practical tasks for an AI-assisted Integration / API Architect. Not every task occurs daily; workflows select only the capabilities relevant to the request.

## Context

1. Jira and requirement context.
2. Consumer and stakeholder mapping.
3. Business process mapping.
4. Service level objective capture.
5. Regulatory and contractual constraint capture.
6. Integration use-case classification.
7. System-of-record identification.
8. Data sensitivity classification.
9. Success metric definition.
10. Scope and assumption baseline.

## Discovery

11. Api inventory discovery.
12. Event and topic inventory discovery.
13. Integration dependency graph.
14. Gateway route inventory.
15. Service ownership discovery.
16. Repository contract discovery.
17. Environment endpoint inventory.
18. Vendor integration inventory.
19. Data flow discovery.
20. Shadow and duplicate api detection.

## Domain

21. Bounded context mapping.
22. Service responsibility definition.
23. Source of truth mapping.
24. Domain vocabulary alignment.
25. Ownership matrix creation.
26. Anti corruption boundary design.
27. Shared service dependency analysis.
28. Orchestration versus choreography decision.
29. Domain event identification.
30. Cross domain coupling analysis.

## Api Strategy

31. Api style selection.
32. Api lifecycle state model.
33. Naming convention governance.
34. Resource and operation convention.
35. Api catalog taxonomy.
36. Api ownership policy.
37. Design first governance.
38. Api review gate design.
39. Api standard exception process.
40. Api maturity assessment.

## Rest

41. Openapi contract design.
42. Resource modeling.
43. Http method semantics.
44. Status code design.
45. Rfc9457 problem details.
46. Pagination filtering sorting.
47. Idempotency key design.
48. Conditional request and etag design.
49. Cache control design.
50. Multipart and large payload design.

## Graphql

51. Graphql schema modeling.
52. Query mutation subscription design.
53. Resolver boundary design.
54. Connection pagination design.
55. Graphql authorization model.
56. Query complexity control.
57. N plus one mitigation.
58. Schema federation boundary.
59. Graphql evolution policy.
60. Persisted query strategy.

## Grpc

61. Protobuf message design.
62. Grpc service design.
63. Field numbering governance.
64. Backward compatible proto evolution.
65. Deadline propagation.
66. Retry policy design.
67. Grpc health checking.
68. Grpc reflection governance.
69. Streaming rpc design.
70. Generated client governance.

## Events

71. Asyncapi contract design.
72. Event versus command classification.
73. Topic and channel naming.
74. Cloudevents envelope design.
75. Delivery semantics selection.
76. Ordering and partition key design.
77. Consumer group strategy.
78. Dead letter and retry design.
79. Replay and retention design.
80. Event schema evolution.

## Gateway

81. Gateway route design.
82. Rate limit policy.
83. Quota policy.
84. Request response transformation.
85. Api key policy.
86. Waf and bot boundary.
87. Cors policy design.
88. Edge caching policy.
89. Canary routing design.
90. Gateway policy as code.

## Identity

91. Oauth flow selection.
92. Oidc profile design.
93. Scope model design.
94. Claim model design.
95. Token audience design.
96. Workload identity design.
97. Mtls sender constraint design.
98. Dpop assessment.
99. Service account boundary.
100. Delegation and impersonation control.

## Security

101. Owasp api threat modeling.
102. Object authorization review.
103. Function authorization review.
104. Mass assignment prevention.
105. Resource consumption abuse control.
106. Ssrf boundary review.
107. Input schema validation.
108. Sensitive data exposure review.
109. Inventory and shadow api risk.
110. Unsafe third party consumption review.

## Schemas

111. Json schema design.
112. Canonical payload model.
113. Schema registry policy.
114. Semantic field definition.
115. Nullability and optionality policy.
116. Identifier and timestamp convention.
117. Money and precision convention.
118. Pii classification mapping.
119. Payload example governance.
120. Schema ownership and stewardship.

## Versioning

121. Breaking change detection.
122. Additive change assessment.
123. Api versioning strategy.
124. Event compatibility policy.
125. Consumer impact analysis.
126. Deprecation policy.
127. Sunset plan design.
128. Parallel version coexistence.
129. Migration guide creation.
130. Compatibility matrix maintenance.

## Consumer

131. Developer onboarding flow.
132. Api reference requirements.
133. Quickstart design.
134. Sdk generation strategy.
135. Sdk versioning policy.
136. Sandbox and mock strategy.
137. Sample application design.
138. Error troubleshooting guidance.
139. Developer portal taxonomy.
140. Consumer feedback loop.

## Resiliency

141. Timeout budget design.
142. Retry backoff policy.
143. Circuit breaker policy.
144. Bulkhead isolation.
145. Idempotent consumer design.
146. Deduplication strategy.
147. Outbox inbox pattern.
148. Saga compensation design.
149. Graceful degradation plan.
150. Dependency failure mode analysis.

## Performance

151. Latency budget allocation.
152. Throughput modeling.
153. Payload size budget.
154. Concurrency limit design.
155. Connection pool sizing.
156. Compression policy.
157. Batch versus chatty call analysis.
158. Streaming capacity analysis.
159. Rate limit capacity model.
160. Load test target definition.

## Observability

161. Trace context propagation.
162. Http semantic convention mapping.
163. Rpc semantic convention mapping.
164. Messaging semantic convention mapping.
165. Correlation id policy.
166. Api metric specification.
167. Integration slo definition.
168. Dashboard and alert specification.
169. Log redaction policy.
170. Runbook diagnostic design.

## Testing

171. Provider contract test plan.
172. Consumer driven contract test.
173. Schema conformance test.
174. Negative api test design.
175. Authorization test matrix.
176. Fault injection test plan.
177. Virtual service strategy.
178. Mock and stub governance.
179. Compatibility certification.
180. Release contract evidence.

## Legacy

181. Soap to rest assessment.
182. Esb decomposition analysis.
183. Strangler integration plan.
184. Facade api design.
185. Protocol bridge design.
186. Legacy canonical model review.
187. Anti corruption layer plan.
188. Parallel run strategy.
189. Cutover rollback plan.
190. Legacy endpoint retirement.

## Partner

191. Partner capability assessment.
192. Partner contract review.
193. Partner authentication design.
194. Certificate rotation plan.
195. Partner sandbox plan.
196. Sla and timeout mapping.
197. External dependency risk.
198. Vendor quota and limit mapping.
199. Data sharing boundary.
200. Vendor exit and substitution plan.

## Platform

201. Api template golden path.
202. Contract lint rule design.
203. Code generation governance.
204. Api catalog integration.
205. Schema registry integration.
206. Gateway automation pattern.
207. Self service onboarding.
208. Policy as code integration.
209. Portal publishing workflow.
210. Api platform maturity plan.

## Governance

211. Integration cost model.
212. Gateway cost analysis.
213. Broker retention cost analysis.
214. Network egress assessment.
215. Consumer quota economics.
216. Vendor api cost model.
217. Unit cost definition.
218. Capacity cost tradeoff.
219. Cost anomaly guardrail.
220. Architecture exception register.

## Review

221. Independent contract review.
222. Independent security review.
223. Independent compatibility review.
224. Independent reliability review.
225. Independent performance review.
226. Consumer impact review.
227. Evidence completeness review.
228. Architecture decision quality review.
229. Production readiness review.
230. Exception and residual risk review.

## Handoff

231. Frontend integration handoff.
232. Java service handoff.
233. Python service handoff.
234. Database integration handoff.
235. Qa contract test handoff.
236. Devops gateway handoff.
237. Sre observability handoff.
238. Support troubleshooting handoff.
239. Technical writer documentation handoff.
240. Implementation conformance review.
