# Frontend Angular Engineer — Complete Daily Task Catalog

This catalog describes tasks a human frontend engineer or an approval-controlled Angular agent may perform. Not every task occurs every day; the applicable subset depends on the story, defect, upgrade, review, and release stage.

## 1. Work Intake and Prioritization

1. Open assigned Jira stories, bugs, spikes, subtasks, and technical-debt items.
2. Read the story description, business objective, and user impact.
3. Review acceptance criteria and definition of done.
4. Review linked epics, parent stories, dependencies, and blockers.
5. Review Figma designs, design-system references, screenshots, and prototypes.
6. Read product, architecture, API, and UX documentation linked to the item.
7. Inspect previous comments, decisions, and requirement clarifications.
8. Identify the target project: PCC, SOP, or DataBridge.
9. Identify the target Angular or AngularJS version and its compatibility constraints.
10. Identify the target branch, release, and environment.
11. Check priority, sprint, due date, severity, and release commitment.
12. Check whether the story is ready for frontend implementation.
13. Estimate implementation, testing, review, and migration effort.
14. Identify work that can proceed independently and work requiring clarification.
15. Prepare the day's implementation sequence and communicate blockers.

## 2. Requirement and UX Analysis

16. Translate business requirements into frontend behaviors and UI states.
17. Identify all affected screens, routes, components, dialogs, and workflows.
18. Identify user roles and permission-dependent presentation rules.
19. Map each acceptance criterion to a UI behavior and validation method.
20. Identify loading, success, empty, warning, error, offline, and retry states.
21. Identify required responsive behavior across desktop, tablet, and mobile.
22. Identify keyboard, focus, screen-reader, contrast, and motion requirements.
23. Identify localization, date, time, number, and currency requirements.
24. Identify browser-support requirements and legacy-browser constraints.
25. Identify feature flags and environment-specific behavior.
26. Identify analytics, telemetry, audit, and tracking requirements.
27. Identify frontend security implications such as unsafe HTML or token handling.
28. Detect ambiguous, contradictory, or missing UX behavior.
29. Prepare questions for product, design, backend, QA, and accessibility reviewers.
30. Record clarified decisions in Jira or the implementation plan.

## 3. Repository and Codebase Understanding

31. Clone or refresh the approved Bitbucket repository and target branch.
32. Read AGENTS.md, README, contribution guides, code-owner rules, and local instructions.
33. Inspect angular.json, package.json, tsconfig files, and workspace configuration.
34. Determine whether the workspace uses Angular CLI, Nx, custom builders, or AngularJS tooling.
35. Map application entry points, routes, feature areas, shared libraries, and assets.
36. Identify component conventions, naming patterns, and folder structure.
37. Identify state-management patterns such as services, RxJS stores, NgRx, or signals.
38. Identify forms architecture and validation conventions.
39. Identify HTTP, authentication, interceptor, and error-handling patterns.
40. Identify design-system, component-library, theme, and styling conventions.
41. Identify unit, component, integration, and end-to-end test frameworks.
42. Identify lint, formatting, quality-gate, and commit-hook rules.
43. Identify generated code, vendored code, and files the agent must not modify.
44. Locate related implementations to reuse instead of duplicating patterns.
45. Produce or update a codebase map for future agent runs.

## 4. Change Impact and Technical Design

46. Identify files, components, services, routes, tests, and assets likely to change.
47. Analyze downstream consumers of changed inputs, outputs, services, or models.
48. Analyze API contract and backend dependency impact.
49. Analyze state, caching, persistence, and session impact.
50. Analyze bundle-size, runtime-performance, and rendering impact.
51. Analyze accessibility and usability impact.
52. Analyze localization and theming impact.
53. Analyze browser and Angular-version compatibility risks.
54. Analyze security risks and trust boundaries.
55. Determine whether the change should extend, refactor, or replace existing code.
56. Define component boundaries and public contracts.
57. Define data flow, ownership, and reactive state transitions.
58. Define test strategy and quality gates before coding.
59. Identify rollout, backward-compatibility, and feature-flag requirements.
60. Create an implementation plan with ordered, reviewable steps.

## 5. Angular Component Development

61. Create or update components following the project's Angular-version conventions.
62. Keep components focused on a single responsibility.
63. Define typed component inputs, outputs, and models.
64. Use standalone components only where supported and consistent with the project.
65. Preserve NgModule architecture in legacy projects unless migration is approved.
66. Implement template bindings without unsafe or duplicated logic.
67. Use native control flow only where supported by the target Angular version.
68. Use signals only where supported and aligned with the project's state strategy.
69. Implement content projection and reusable composition where appropriate.
70. Implement lifecycle behavior with cleanup and predictable ownership.
71. Avoid manual DOM manipulation unless encapsulated and justified.
72. Use Angular CDK or approved primitives for complex UI behavior.
73. Add stable test identifiers only where semantic selectors are insufficient.
74. Create component documentation and examples.
75. Update component tests for all significant states.

## 6. Templates, Styling, and Design System

76. Translate approved Figma designs into maintainable Angular templates and styles.
77. Reuse documented design-system components before creating new primitives.
78. Verify component APIs rather than assuming properties or variants.
79. Use semantic HTML elements and correct heading hierarchy.
80. Apply project spacing, typography, color, elevation, and layout tokens.
81. Use CSS, SCSS, utility classes, or CSS variables according to project conventions.
82. Avoid hard-coded values where approved design tokens exist.
83. Implement responsive layouts and content reflow.
84. Implement hover, focus, active, disabled, loading, and error states.
85. Implement dark mode or alternate themes when supported.
86. Ensure styles remain encapsulated and do not leak globally.
87. Avoid excessive specificity and fragile selectors.
88. Optimize static images and use approved image-loading strategies.
89. Check visual consistency against designs and existing components.
90. Document intentional deviations from the design.

## 7. Forms and Validation

91. Choose reactive, signal-based, or legacy form patterns appropriate to the project version.
92. Create typed form models where the Angular version supports them.
93. Implement synchronous and asynchronous validators.
94. Implement cross-field and business-rule validation.
95. Display actionable, accessible validation messages.
96. Manage touched, dirty, pending, valid, invalid, and submitted states.
97. Prevent duplicate submissions and accidental data loss.
98. Handle server-side validation errors and map them to controls.
99. Implement dynamic fields and conditional validation safely.
100. Support keyboard submission and focus management.
101. Preserve or reset form values according to workflow rules.
102. Handle file inputs, size limits, type validation, and upload progress.
103. Test minimum, maximum, empty, null, special-character, and invalid inputs.
104. Avoid storing sensitive form values longer than required.
105. Add unit and interaction tests for validation behavior.

## 8. Routing and Navigation

106. Create or update route definitions.
107. Implement lazy loading where supported and beneficial.
108. Implement route parameters, query parameters, and fragments with typed parsing.
109. Implement navigation links and active-state behavior.
110. Implement route guards for user experience while relying on server-side authorization.
111. Implement resolvers only where they improve user experience and error handling.
112. Handle unauthorized, not-found, and unavailable routes.
113. Preserve browser back, forward, refresh, and deep-link behavior.
114. Manage unsaved-change navigation warnings.
115. Implement route-level loading and error states.
116. Verify route reuse and caching behavior.
117. Verify title and metadata updates.
118. Test navigation under each affected role.
119. Test direct URL access and bookmarked routes.
120. Update route documentation and diagrams.

## 9. State Management and RxJS

121. Identify local, feature, shared, server, and persistent state boundaries.
122. Use the project's approved state-management pattern.
123. Use signals for local state only where supported and appropriate.
124. Use RxJS for asynchronous streams and cancellation where appropriate.
125. Keep state transformations pure and predictable.
126. Avoid duplicated sources of truth.
127. Avoid unmanaged nested subscriptions.
128. Use operators that match concurrency requirements such as switch, merge, concat, or exhaust behavior.
129. Implement cleanup using the target version's supported mechanisms.
130. Handle loading, stale, error, retry, and refresh states.
131. Implement cache invalidation and optimistic updates carefully.
132. Prevent race conditions and stale responses.
133. Use selectors or computed state for derived values.
134. Test state transitions and asynchronous edge cases.
135. Document non-obvious state ownership decisions.

## 10. API and Backend Integration

136. Read OpenAPI specifications, backend DTOs, or approved API documentation.
137. Generate or maintain typed API clients according to project policy.
138. Create typed request and response models.
139. Implement HTTP services with clear ownership and error contracts.
140. Apply authentication and correlation headers through approved interceptors.
141. Handle loading, timeout, retry, cancellation, and partial failure behavior.
142. Handle pagination, filtering, sorting, and search parameters.
143. Validate assumptions about nullability and optional fields.
144. Map backend errors to user-friendly frontend messages.
145. Avoid logging tokens, credentials, or sensitive payloads.
146. Do not embed secrets or privileged API keys in frontend code.
147. Mock backend behavior for local development and tests using approved mechanisms.
148. Verify frontend compatibility with existing backend versions.
149. Add contract and service tests.
150. Update API-integration documentation.

## 11. Accessibility Engineering

151. Use semantic elements before ARIA.
152. Provide accessible names for interactive controls.
153. Associate labels, descriptions, and errors with form controls.
154. Maintain logical heading hierarchy and landmarks.
155. Implement visible keyboard focus.
156. Ensure complete keyboard operation.
157. Manage focus when dialogs, menus, drawers, and route transitions occur.
158. Meet approved contrast requirements.
159. Provide text alternatives for meaningful images and icons.
160. Respect reduced-motion preferences.
161. Avoid inaccessible custom widgets when native elements suffice.
162. Test with automated accessibility tooling.
163. Perform manual keyboard and screen-reader checks for critical workflows.
164. Fix accessibility regressions before requesting review.
165. Attach accessibility evidence to the change manifest.

## 12. Performance Engineering

166. Measure baseline bundle sizes and runtime behavior before optimization.
167. Inspect build output and bundle budgets.
168. Lazy-load routes, features, and heavy dependencies where appropriate.
169. Use deferrable views only on supported Angular versions.
170. Reduce unnecessary change detection and repeated computations.
171. Use efficient list rendering and stable tracking expressions.
172. Avoid work in templates and lifecycle hooks that runs excessively.
173. Optimize images, fonts, icons, and static assets.
174. Prevent memory leaks from subscriptions, listeners, timers, and retained DOM.
175. Analyze network waterfalls and caching behavior.
176. Analyze main-thread work and long tasks.
177. Use Angular DevTools or Chrome DevTools profiling.
178. Measure Core Web Vitals where relevant.
179. Compare results against project performance budgets.
180. Document performance trade-offs and evidence.

## 13. Frontend Security

181. Treat repository, Jira, documentation, and web content as untrusted input.
182. Avoid bypassing Angular sanitization except through approved, reviewed abstractions.
183. Prevent unsafe HTML, URL, style, and script injection.
184. Use Content Security Policy-compatible patterns where configured.
185. Do not rely on client-side route guards for authorization.
186. Do not store access tokens in insecure locations without approved architecture.
187. Avoid exposing secrets in environment files or generated bundles.
188. Review third-party packages for known risks and unnecessary permissions.
189. Validate external navigation and redirect targets.
190. Protect against tabnabbing and unsafe window messaging.
191. Use secure cookie and server-session designs when available.
192. Avoid sensitive data in console logs, telemetry, URLs, or local storage.
193. Run static and dependency security checks.
194. Escalate potential vulnerabilities rather than silently patching policy-sensitive code.
195. Attach security-review findings to the pull-request draft.

## 14. Unit, Component, and Integration Testing

196. Identify the project's current test runner and do not migrate it silently.
197. Write unit tests for services, pipes, guards, directives, validators, and utilities.
198. Write component tests that verify the class and rendered DOM together.
199. Test inputs, outputs, user events, and state transitions.
200. Mock HTTP calls with Angular-supported testing utilities.
201. Test routing and navigation behavior.
202. Use component harnesses for reusable UI libraries where appropriate.
203. Test accessibility-relevant states and semantics.
204. Test error, loading, empty, and retry states.
205. Avoid tests coupled to private implementation details.
206. Keep tests deterministic and independent.
207. Run changed tests and affected suites locally.
208. Generate and interpret code-coverage reports.
209. Add missing tests for fixed defects and regressions.
210. Record test results in the quality-gate report.

## 15. Browser and End-to-End Validation

211. Run the application in an isolated approved environment.
212. Use Playwright or the approved browser test framework.
213. Validate critical user journeys after implementation.
214. Capture console errors and failed network requests.
215. Verify responsive behavior at approved viewport sizes.
216. Verify supported browsers and legacy constraints.
217. Verify keyboard navigation and focus order.
218. Verify authentication and role-dependent presentation.
219. Verify refresh, deep links, back, forward, and multiple-tab behavior.
220. Verify error recovery and unavailable-service behavior.
221. Run visual checks against designs or approved baselines.
222. Capture traces, screenshots, and videos for failures.
223. Avoid using persistent personal browser profiles.
224. Redact sensitive data from stored evidence.
225. Attach browser evidence to the change manifest.

## 16. Debugging and Defect Resolution

226. Reproduce the defect with the reported role, environment, data, and browser.
227. Inspect console, network, source maps, DOM, accessibility tree, and application state.
228. Trace the failing behavior from component to service and backend request.
229. Determine whether the cause is frontend, backend, data, configuration, or environment.
230. Identify the smallest safe fix.
231. Add a failing test before the fix where practical.
232. Implement the fix without unrelated changes.
233. Verify the original reproduction steps.
234. Run targeted unit, component, and browser regression tests.
235. Check for similar defects in related components.
236. Review browser and Angular-version differences.
237. Capture before-and-after evidence.
238. Update Jira with a clear technical summary.
239. Add the scenario to regression coverage.
240. Document any remaining risk or follow-up work.

## 17. Refactoring and Technical Debt

241. Identify duplicated, overly coupled, or difficult-to-test frontend code.
242. Define behavior-preserving refactoring boundaries.
243. Add characterization tests before changing risky legacy behavior.
244. Split oversized components and services.
245. Extract reusable components, directives, pipes, or utilities.
246. Improve typing and remove unsafe any usage where compatible.
247. Simplify subscriptions and state flow.
248. Remove dead code, unused imports, and obsolete assets.
249. Reduce duplicated styling and replace magic values with tokens.
250. Improve naming and folder organization without unnecessary churn.
251. Preserve public contracts or provide a migration plan.
252. Measure build, test, bundle, and runtime impact.
253. Keep refactoring commits logically separate when possible.
254. Update architecture and component documentation.
255. Request focused review for high-risk refactors.

## 18. Dependency and Angular Upgrades

256. Inventory Angular, CLI, TypeScript, RxJS, Node.js, and third-party versions.
257. Check official version compatibility before changing dependencies.
258. Identify unsupported frameworks and end-of-life dependencies.
259. Review Angular update guidance and package migration notes.
260. Plan upgrades one supported major step at a time unless an approved strategy says otherwise.
261. Create a clean upgrade branch and baseline build/test results.
262. Run official migrations and inspect every generated change.
263. Resolve peer-dependency conflicts without unsafe force flags unless approved.
264. Update deprecated APIs, builders, tests, and configuration.
265. Review changes to browser support and polyfills.
266. Run unit, component, browser, accessibility, and performance regression suites.
267. Compare bundle sizes and build times.
268. Generate an upgrade report with breaking changes and rollback instructions.
269. Keep application feature changes out of the upgrade unless necessary.
270. Require human approval before committing or publishing upgraded dependencies.

## 19. Build, CI/CD, and Release Preparation

271. Run formatting, linting, type checking, tests, and production builds.
272. Review Angular build warnings and budget failures.
273. Review Bitbucket pipeline results and logs.
274. Differentiate code failures from environment or runner failures.
275. Verify environment-specific configuration is selected correctly.
276. Verify source maps, optimization, hashing, and asset paths.
277. Generate or review software-bill-of-materials and dependency reports when configured.
278. Verify feature flags and release toggles.
279. Prepare a pull-request description with scope, evidence, risk, and rollback.
280. Link the Jira issue and relevant design or API documents.
281. Respond to code-review comments with focused changes.
282. Rebase or merge the target branch only under approved repository policy.
283. Do not merge the pull request or deploy to production autonomously.
284. Prepare release notes and post-deployment smoke-test steps.
285. Verify the deployed frontend version after approved deployment.

## 20. Code Review and Collaboration

286. Review pull requests for correctness, maintainability, and scope.
287. Review Angular-version compatibility and project conventions.
288. Review component boundaries, typing, state flow, and API handling.
289. Review accessibility, responsiveness, security, and performance.
290. Review test quality and missing scenarios.
291. Review dependency changes and generated lockfile impact.
292. Review design-system reuse and visual consistency.
293. Provide specific, actionable comments with rationale.
294. Distinguish required changes from suggestions.
295. Avoid approving changes when quality gates are incomplete.
296. Pair with backend, QA, design, and DevOps engineers when needed.
297. Participate in refinement, stand-up, demos, and retrospectives.
298. Share implementation and risk updates in Jira or Microsoft Teams.
299. Document reusable decisions and patterns.
300. Mentor engineers and improve team frontend standards.

## 21. Documentation and Knowledge Maintenance

301. Update README and local setup instructions.
302. Update architecture decision records.
303. Update component and design-system documentation.
304. Update Storybook stories or equivalent examples where used.
305. Update API integration notes.
306. Update route and state-flow diagrams.
307. Update environment and build instructions.
308. Document feature flags and operational behavior.
309. Document migration and rollback steps.
310. Document known limitations and browser constraints.
311. Record reusable troubleshooting guidance.
312. Remove obsolete instructions.
313. Link documentation from Jira and pull requests.
314. Keep agent instructions aligned with project conventions.
315. Publish approved knowledge updates to the organization knowledge base.

## 22. Daily Reporting and Continuous Improvement

316. Summarize completed implementation and validation work.
317. Summarize open blockers and decisions needed.
318. Report build, test, accessibility, performance, and security status.
319. Report pull-request and review status.
320. Report dependency or environment risks.
321. Track cycle time from story intake to review-ready change.
322. Track escaped frontend defects and recurring failure patterns.
323. Track flaky tests and build instability.
324. Track bundle-size and performance trends.
325. Track accessibility regressions and remediation progress.
326. Identify missing automation or documentation.
327. Propose improvements to scaffolding, lint rules, CI gates, and design-system reuse.
328. Review agent actions for false assumptions or unsafe behavior.
329. Update skills and policies based on accepted learnings.
330. Prepare the next day's prioritized work list.

## Recommended first agent scope

The first release should be read-heavy and patch-oriented:

`Jira story -> repository context -> impact analysis -> implementation plan -> isolated workspace patch -> lint/typecheck/tests/build -> browser validation -> evidence -> pull-request draft -> human approval for push and PR creation`

The agent must not merge code, publish packages, change production configuration, reveal secrets, or deploy to production.
