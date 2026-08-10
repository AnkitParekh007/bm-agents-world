# Technical Writer — Daily and Periodic Task Catalog

Not every task occurs every day. The supervisor selects tasks based on the request, audience, content type, release stage, project policy, and publication target.

## 1. Work intake and prioritization

1. Open assigned Jira stories, documentation requests, support issues, release items, and review tasks.
2. Read the request, business context, audience, deadline, priority, and publication target.
3. Identify whether the request is new content, an update, a correction, a migration, or a retirement.
4. Identify the accountable content owner and required subject-matter experts.
5. Identify the affected product, project, version, environment, and customer segment.
6. Check linked epics, designs, architecture decisions, pull requests, APIs, tests, and release records.
7. Check whether the request contains sufficient evidence to begin.
8. Detect duplicate or overlapping documentation requests.
9. Assess user impact, support impact, release dependency, and regulatory urgency.
10. Prioritize the documentation queue using agreed value and risk criteria.
11. Estimate writing, review, validation, and publication effort.
12. Identify dependencies on product, UX, engineering, QA, support, security, legal, or localization.
13. Record assumptions, unanswered questions, and decision owners.
14. Update the private work plan without publishing external changes.

## 2. Source discovery and fact gathering

15. Locate authoritative requirements, code, API contracts, configuration, tests, and operational evidence.
16. Read existing documentation and identify the current documented behavior.
17. Inspect relevant repository files and recent code changes.
18. Inspect approved OpenAPI and AsyncAPI descriptions.
19. Inspect UI designs, labels, flows, and states.
20. Inspect test cases to understand supported behavior and edge cases.
21. Inspect support trends and known issues using redacted summaries.
22. Inspect release manifests and candidate versions.
23. Interview or asynchronously consult subject-matter experts.
24. Record each factual claim with its source and version.
25. Distinguish verified facts, assumptions, proposals, and unknowns.
26. Identify conflicting sources and request an accountable decision.
27. Avoid treating comments or generated summaries as authoritative without validation.
28. Build a version-bound documentation context package.

## 3. Audience and task analysis

29. Identify the primary and secondary audiences.
30. Identify user roles, permissions, and technical skill levels.
31. Identify the user goal or job to be done.
32. Identify prerequisites, dependencies, and environmental constraints.
33. Identify common failure modes and reader pain points.
34. Identify whether readers are learning, completing a task, solving a problem, or looking up facts.
35. Identify accessibility and assistive-technology needs.
36. Identify localization and global-audience considerations.
37. Define successful task completion and verification evidence.
38. Define what the content should not cover.
39. Create an audience and task model.
40. Review the audience model with product, support, or research evidence.

## 4. Documentation planning and content strategy

41. Define documentation objectives and measurable outcomes.
42. Choose the correct content type: tutorial, how-to, concept, reference, troubleshooting, runbook, or release note.
43. Select the correct channel: repository docs, product help, developer portal, support knowledge base, or internal operations site.
44. Define scope, exclusions, owners, reviewers, and milestones.
45. Define source-of-truth relationships and reuse rules.
46. Define versioning and product applicability.
47. Define required diagrams, screenshots, code samples, and test environments.
48. Define accessibility, security, and localization requirements.
49. Define review and approval requirements.
50. Define publication, redirect, archival, and maintenance plans.
51. Create a documentation plan and content brief.
52. Get approval for high-impact or customer-facing plans.

## 5. Information architecture and findability

53. Place new content in the correct hierarchy.
54. Design navigation that matches reader tasks.
55. Create clear labels and page titles.
56. Apply the approved taxonomy and metadata.
57. Add related-content links and next actions.
58. Identify and merge fragmented content.
59. Identify orphan pages and missing landing pages.
60. Plan redirects for moved or renamed pages.
61. Avoid excessive navigation depth.
62. Use meaningful summaries for search and previews.
63. Add synonyms for approved search terms.
64. Review zero-result searches for content opportunities.
65. Validate that readers can find the content from likely entry points.

## 6. Tutorials and onboarding

66. Define a safe, achievable learning outcome.
67. Choose a supported environment and version.
68. Provide prerequisites and setup verification.
69. Use synthetic, non-sensitive example data.
70. Guide the reader through a complete working path.
71. Explain important concepts only when needed for progress.
72. Show expected intermediate and final results.
73. Include recovery guidance for common setup failures.
74. Avoid optional branches that obscure the main learning path.
75. Test the tutorial from a clean environment.
76. Provide cleanup instructions.
77. Link to deeper how-to and reference content.

## 7. How-to and procedural documentation

78. State a concrete task goal.
79. List prerequisites, permissions, and risks.
80. Use numbered steps for sequential actions.
81. Use exact UI labels and commands.
82. Keep one primary action per step where practical.
83. Explain variables and placeholders before use.
84. Add expected results after critical steps.
85. Add verification and success criteria.
86. Add stop conditions for risky operations.
87. Add rollback or recovery instructions where relevant.
88. Add troubleshooting branches without interrupting the main path.
89. Test the procedure end to end.
90. Record the tested version and environment.
91. Avoid destructive production instructions unless an approved runbook requires them.

## 8. Conceptual and reference documentation

92. Explain the purpose and mental model before implementation detail.
93. Define system boundaries and responsibilities.
94. Explain lifecycle states and transitions.
95. Explain architecture and integration relationships.
96. Explain tradeoffs, constraints, and non-goals.
97. Create scannable configuration references.
98. Document fields, types, defaults, limits, and examples.
99. Document commands, options, exit codes, and environment variables.
100. Document permissions, roles, and access requirements.
101. Document errors, causes, and recovery actions.
102. Document supported versions and compatibility.
103. Maintain glossary definitions and terminology ownership.
104. Separate explanatory concepts from task procedures.

## 9. API, SDK, and integration documentation

105. Document authentication and authorization requirements.
106. Document base URLs, environments, and version selection.
107. Document endpoints, operations, channels, events, and webhooks.
108. Document request parameters, headers, bodies, and schemas.
109. Document response schemas and status codes.
110. Document error models and troubleshooting guidance.
111. Document pagination, filtering, sorting, and rate limits.
112. Document idempotency, retries, ordering, and delivery semantics.
113. Document compatibility and deprecation policies.
114. Create realistic, secure request and response examples.
115. Validate examples against approved contracts or test environments.
116. Document SDK installation and usage.
117. Document integration prerequisites and test procedures.
118. Link contract references to conceptual and task content.

## 10. Code samples and command examples

119. Prefer examples derived from tested source or automated tests.
120. Use the repository-supported language and dependency versions.
121. Keep examples minimal while preserving safe error handling.
122. Use synthetic values and placeholders instead of credentials.
123. Explain required imports, setup, and configuration.
124. Explain expected output.
125. Test code samples in isolated environments.
126. Test shell commands for the documented operating system and shell.
127. Avoid commands that weaken security or bypass controls.
128. Use copyable formatting and complete code fences.
129. Version and maintain sample repositories.
130. Detect examples that no longer compile or run.
131. Link samples to the exact source version.

## 11. Diagrams, screenshots, and visual content

132. Choose a diagram type that matches the reader question.
133. Create context, component, sequence, workflow, data-flow, or deployment diagrams.
134. Keep diagrams focused on one main message.
135. Use approved names and consistent notation.
136. Preserve editable diagram source.
137. Write concise alt text and longer descriptions when needed.
138. Capture screenshots only from approved, non-sensitive environments.
139. Crop screenshots to the relevant area.
140. Annotate screenshots without relying only on color.
141. Avoid embedding credentials, customer data, internal hosts, or personal information.
142. Update visuals when the UI or architecture changes.
143. Validate diagrams and screenshots at multiple viewport sizes.

## 12. Style, terminology, accessibility, and localization

144. Apply project-specific style guidance before general guidance.
145. Use concise, direct, conversational language appropriate to the audience.
146. Use active voice and second person where appropriate.
147. Use sentence-case headings and descriptive titles.
148. Use parallel structure in lists and procedures.
149. Use approved product names and terminology.
150. Expand unfamiliar acronyms on first use.
151. Remove biased, exclusionary, violent, or unnecessarily ableist language.
152. Write descriptive link text.
153. Use correct heading hierarchy.
154. Provide alt text, captions, and table headers.
155. Avoid spatial, color-only, and sensory-only instructions.
156. Avoid idioms, puns, and culture-specific examples.
157. Use locale-neutral dates, times, names, addresses, and units.
158. Prepare terminology and context for translators.
159. Validate translated-content variables and placeholders.

## 13. Docs-as-code authoring

160. Create an isolated documentation branch or workspace.
161. Follow repository contribution and ownership rules.
162. Edit the configured source format.
163. Preserve front matter, metadata, and content-model constraints.
164. Run the documentation build locally or in an isolated worker.
165. Run Markdown or markup linting.
166. Run Vale or the configured prose linter.
167. Run spelling and terminology checks.
168. Run internal and external link checks.
169. Run code-sample and contract validation.
170. Generate a preview for reviewers.
171. Prepare a focused documentation diff.
172. Create a draft pull request only after approval where required.
173. Respond to review comments and preserve decision history.

## 14. Review and quality assurance

174. Fact-check every material claim against an authoritative source.
175. Verify product, API, configuration, and version accuracy.
176. Verify that procedures reach the stated outcome.
177. Verify prerequisites, permissions, and warnings.
178. Verify code samples and commands.
179. Verify links, anchors, redirects, and downloads.
180. Verify screenshots and diagrams.
181. Verify accessibility and localization readiness.
182. Verify terminology, style, grammar, and formatting.
183. Check for duplicate or contradictory guidance.
184. Check for unsupported claims and fabricated examples.
185. Assign severity and ownership to findings.
186. Resolve factual disputes with accountable SMEs.
187. Create an independent publication recommendation.

## 15. Release documentation

188. Analyze the exact release candidate and change manifest.
189. Map stories, defects, pull requests, APIs, migrations, and configuration changes to documentation.
190. Draft audience-specific release notes.
191. Describe new features and changed behavior accurately.
192. Describe fixed defects without exposing sensitive security details.
193. Document known issues and practical workarounds.
194. Document upgrade prerequisites and compatibility.
195. Document breaking changes, migrations, and rollback considerations.
196. Document deprecations and replacement paths.
197. Link to detailed task and reference documentation.
198. Bind release documentation to the candidate version or artifact hash.
199. Obtain Product, Engineering, QA, Support, Security, and Release review as needed.
200. Publish only after release and communication approval.

## 16. Runbooks and support knowledge

201. Document symptoms, scope, impact, and prerequisites.
202. Document safe diagnostic queries and commands.
203. Document expected evidence and interpretation.
204. Document escalation criteria and ownership.
205. Document stop conditions and safety boundaries.
206. Document mitigation, rollback, recovery, and verification.
207. Use redacted examples and bounded production queries.
208. Link runbooks to alerts, services, dashboards, and known issues.
209. Test runbooks in approved non-production or simulation environments.
210. Coordinate with Support, SRE, DevOps, Database, and Security owners.
211. Record last-tested dates and responsible owners.
212. Retire unsafe or obsolete runbooks.

## 17. Content audit and maintenance

213. Inventory content, owners, audiences, products, versions, and status.
214. Check freshness and last-verified dates.
215. Check source and product-version alignment.
216. Identify stale, inaccurate, duplicate, orphaned, and low-value content.
217. Identify missing documentation from support, search, release, and product signals.
218. Prioritize remediation by user impact and risk.
219. Update or consolidate content.
220. Create redirects before deleting public pages.
221. Archive obsolete internal content according to retention rules.
222. Update metadata and ownership.
223. Schedule recurring review for high-risk content.
224. Track documentation debt to closure.
225. Measure improvement after remediation.

## 18. Analytics, feedback, and communication

226. Review privacy-safe page feedback and search analytics.
227. Review support-ticket themes and documentation references.
228. Review task-success and usability-study evidence.
229. Investigate zero-result and high-refinement searches.
230. Identify confusing pages and abandonment points.
231. Distinguish content problems from product problems.
232. Create evidence-backed improvement proposals.
233. Draft documentation status updates.
234. Communicate blockers, decisions, and review needs.
235. Coordinate publication and localization handoffs.
236. Report coverage, freshness, quality, and feedback trends.
237. Avoid claiming support deflection or business impact without valid measurement.
238. Record decisions and accepted documentation risk.
