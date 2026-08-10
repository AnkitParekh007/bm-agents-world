# Agent and Sub-Agent Architecture

## 1. Supervisor pattern

`frontend-angular-supervisor` owns the workflow state. It does not directly edit code or call high-impact tools. It:

- validates run scope
- loads project and version profiles
- delegates bounded tasks
- resolves dependencies among specialists
- requests approvals
- verifies artifacts and quality gates
- stops on policy violations
- produces the final run summary

## 2. Specialist agents

| Agent | Responsibility | Typical outputs |
|---|---|---|
| Story Context | Read Jira, Confluence, designs, and decisions | Story context brief |
| Repository Context | Map workspace, conventions, dependencies, and commands | Codebase map |
| Architecture Analyzer | Determine boundaries, dependencies, and technical risks | Change-impact report |
| Angular Version Specialist | Enforce target-version compatibility and migration rules | Compatibility assessment |
| UI Implementation | Create components, templates, styles, routes, and forms | Patch set |
| State and RxJS | Design reactive state and asynchronous behavior | State-flow specification and patch |
| API Integration | Implement typed HTTP clients and error handling | API integration manifest |
| Design System | Reuse tokens and components; compare with Figma | Component/design report |
| Accessibility | Review semantics, keyboard, focus, ARIA, and contrast | Accessibility report |
| Performance | Review bundles, rendering, network, and runtime behavior | Performance report |
| Security | Screen code, dependencies, and generated output | Security findings |
| Test Engineer | Generate and run unit, component, and browser tests | Quality-gate report |
| Dependency Upgrade | Plan and implement approved upgrades | Upgrade report and patch |
| Code Review | Review patch quality and scope | Review report |
| Build and Pipeline | Run local gates and interpret CI output | Build result |
| Documentation | Update README, ADR, component, and release documentation | Documentation patch |
| PR and Release | Draft PR, release notes, and rollout/rollback steps | Pull-request draft |
| Evidence Curator | Redact, hash, index, and retain evidence | Evidence manifest |
| Policy Guard | Evaluate every capability request | Decision record |

## 3. Delegation contract

Every delegation includes:

- run ID
- project and repository
- target branch and pinned base commit
- Angular execution profile
- allowed paths
- permitted skills
- permitted tools
- environment and network allowlist
- input artifact IDs
- expected output schema
- time, token, and command budget
- approval references

A sub-agent cannot widen its own scope or delegate new permissions.

## 4. Recommended task topology

### Planning stage

Story Context, Repository Context, Architecture Analyzer, Angular Version Specialist, and Design System may run in parallel after authorization.

### Implementation stage

UI Implementation coordinates with State and RxJS and API Integration. Only one patch owner writes a given file at a time. Specialists return proposed hunks or file-level plans to avoid conflicting edits.

### Quality stage

Test Engineer, Accessibility, Performance, Security, and Code Review run after a coherent patch exists. They may run in parallel in separate read-only workspace snapshots.

### Publication stage

PR and Release consumes validated artifacts. The supervisor requests approval before commit, push, Jira update, PR creation, pipeline rerun, or collaboration publication.

## 5. Conflict resolution

- File ownership is leased to one writer at a time.
- Specialists communicate through immutable artifacts, not hidden shared memory.
- Conflicting recommendations are surfaced with evidence.
- Target project conventions win over generic modern Angular preferences.
- Security, secret, and production policies cannot be overridden by a specialist.
- A failed quality gate returns control to the patch owner with precise findings.

## 6. Model routing

Use separate routing profiles:

- high-reasoning model for architecture, migration, and code review
- code-focused model for bounded patches
- lower-cost model for indexing, summarization, and report formatting
- deterministic tooling for formatting, linting, tests, builds, and policy checks

No model judgment substitutes for compiler, linter, test, accessibility, security, or build evidence.
