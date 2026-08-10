# Skills Catalog

The machine-readable registry is in `config/skill-registry.yaml`. A skill is a versioned instruction and validation package. It is not a credential and does not directly expose an external system.

## Skill package contract

Each skill should contain:

- identifier and semantic version
- supported Angular/AngularJS versions
- purpose and preconditions
- input and output schemas
- approved tools
- path and environment restrictions
- deterministic validation commands
- failure and rollback behavior
- examples and counterexamples
- evaluation cases

## Skill families

### Intake and planning

Story reading, acceptance-criteria decomposition, UX-state mapping, design extraction, risk scoring, codebase mapping, dependency mapping, implementation planning, and effort decomposition.

### Angular version intelligence

Compatibility checks for Angular, CLI, Node.js, TypeScript, and RxJS; unsupported-API detection; AngularJS maintenance; migration sequencing; update-report generation.

### Component and UI engineering

Components, directives, pipes, routes, forms, templates, styling, design tokens, responsive layout, theming, content projection, CDK primitives, and Storybook documentation.

### State and data flow

Signals, RxJS, services, NgRx or project-specific stores, cancellation, caching, optimistic updates, derived state, cleanup, and state-transition testing.

### API integration

OpenAPI reading, typed client generation, HttpClient services, interceptors, authentication headers, error mapping, pagination, cancellation, mocking, and contract validation.

### Quality

Formatting, linting, strict type checking, unit tests, component tests, browser tests, accessibility checks, visual checks, coverage, bundle budgets, performance profiling, SonarQube review, and dependency scanning.

### Maintenance and modernization

Defect reproduction, minimal fixes, characterization tests, refactoring, dead-code removal, dependency upgrades, build-system migrations, and AngularJS-to-Angular migration planning.

### Collaboration and release

Code review, Jira updates, pull-request drafting, release notes, rollout/rollback planning, documentation updates, Teams summaries, and evidence packaging.

### Governance

Tool-risk classification, approval preparation, prompt-injection screening, secret-leak screening, output redaction, artifact integrity, and run evaluation.

## Version routing rule

A skill must declare one of:

- `angular-modern`: APIs allowed only for registered supported versions
- `angular-legacy`: version-specific Angular 2+ behavior
- `angularjs-maintenance`: AngularJS 1.x maintenance only
- `version-neutral`: TypeScript, HTML, CSS, Git, planning, or governance behavior

The supervisor must reject a skill when its compatibility range does not include the project's pinned framework profile.

## Initial skill priority

Implement first:

1. story context and repository map
2. Angular version compatibility
3. change impact and implementation planning
4. component/form/API patch generation
5. lint, typecheck, unit test, build, and browser validation
6. accessibility and security review
7. change manifest and pull-request draft
8. approvals and audited repository writes
