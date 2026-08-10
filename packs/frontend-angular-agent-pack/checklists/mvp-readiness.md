# Frontend Angular Agent MVP Readiness

## Required capability

- [ ] Scoped Jira and repository read access
- [ ] Project and Angular version-profile resolution
- [ ] Repository map and implementation-plan artifacts
- [ ] Ephemeral workspace and allowed-path enforcement
- [ ] Patch generation without remote writes
- [ ] Registered install, format, lint, typecheck, unit-test, and build commands
- [ ] Secret scanning and evidence redaction
- [ ] Quality-gate report and pull-request draft
- [ ] Approval service for commit, push, Jira, and PR actions
- [ ] Complete audit trail

## Safety gates

- [ ] Model cannot read raw secrets
- [ ] Agent cannot access unrelated repositories
- [ ] Agent cannot execute arbitrary shell commands
- [ ] Agent cannot force push, merge, publish packages, or deploy production
- [ ] Production browser access is disabled or privileged read-only
- [ ] Tool outputs are size-limited and sanitized
- [ ] Workspace and browser workers are isolated
- [ ] Network egress is allowlisted

## Quality gates

- [ ] Angular 12 fixture compiles without modern unsupported APIs
- [ ] Angular 15 fixture compiles with repository-compatible APIs
- [ ] AngularJS fixture receives minimal, characterized changes
- [ ] Generated tests are deterministic
- [ ] Accessibility and security checks report actionable results
- [ ] Diff scope matches the approved plan
- [ ] Human reviewers accept at least 80% of pilot patches without major redesign

## Operational gates

- [ ] Cancellation and kill switch tested
- [ ] Failed runs preserve sanitized partial artifacts
- [ ] External writes are idempotent
- [ ] Credentials expire after the run
- [ ] Metrics and alerts are configured
- [ ] Incident and rollback procedures are documented
