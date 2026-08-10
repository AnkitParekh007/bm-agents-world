# Skills Catalog

The registry contains **253 skills**. The YAML file is authoritative for machine use.

## Release management foundations

- Distinguish release management from deployment execution and change approval
- Classify standard, normal, major, minor, patch, hotfix, emergency, infrastructure, database, and configuration releases
- Apply product, service, project, environment, and customer boundaries
- Use release trains without forcing unrelated changes into one release
- Maintain a single authoritative release identifier
- Separate planning status from actual deployed state
- Preserve accountable human decision ownership
- Apply proportional governance based on risk
- Maintain end-to-end traceability from request to production evidence
- Use release criteria rather than ticket status alone
- Recognize release, deployment, change, incident, and problem relationships
- Apply continual improvement to release operations

## Release intake and scope

- Qualify release requests
- Identify accountable owners
- Validate requested environments and windows
- Detect duplicate and overlapping releases
- Build release scope from approved work items
- Separate committed, optional, deferred, and excluded scope
- Detect orphaned commits and artifacts
- Detect completed tickets missing from the candidate
- Control late scope additions
- Record assumptions and missing information
- Bind scope to immutable source references
- Create a release bill of materials
- Compare candidate scope with deployed baseline
- Prepare a scope freeze decision package
- Reject incomplete release requests safely

## Versioning and artifact identity

- Apply semantic versioning when approved
- Apply organization-specific version conventions
- Map application, API, database, image, package, and infrastructure versions
- Validate artifact names and build numbers
- Capture commit hashes and image digests
- Build a machine-readable artifact manifest
- Verify checksums and signatures
- Verify artifact provenance
- Detect mutable tags and floating versions
- Verify candidate immutability
- Map release versions to Jira fix versions
- Identify deprecations and removals
- Prepare compatibility and support matrices
- Validate release notes against delivered artifacts

## Release planning and calendars

- Create integrated release plans
- Define release milestones and gates
- Coordinate blackout and freeze windows
- Coordinate maintenance windows
- Coordinate multi-project release sequencing
- Use timezone-safe planning
- Plan rehearsals and dry runs
- Plan contingency without making guarantees
- Resolve calendar conflicts through human decisions
- Maintain a release train calendar
- Plan regional and ring-based rollouts
- Estimate duration from comparable evidence
- Coordinate vendor support windows
- Maintain one authoritative release clock
- Manage schedule changes and approved notifications

## Dependency and compatibility

- Build service dependency graphs
- Map API consumers and providers
- Map event producers and consumers
- Map database and data dependencies
- Map infrastructure and network dependencies
- Map identity and certificate dependencies
- Map vendor and third-party dependencies
- Validate backward compatibility
- Validate forward compatibility
- Validate mixed-version operation
- Validate consumer readiness
- Validate framework and runtime compatibility
- Track dependency owners and required-by dates
- Identify critical path dependencies
- Validate rollback compatibility

## Quality and acceptance readiness

- Map acceptance criteria to evidence
- Aggregate unit and component test evidence
- Aggregate integration and API test evidence
- Aggregate database and migration test evidence
- Aggregate end-to-end and regression evidence
- Aggregate accessibility evidence
- Aggregate performance and resilience evidence
- Aggregate security test evidence
- Evaluate skipped and waived tests
- Evaluate flaky and quarantined tests
- Assess open defect release impact
- Validate UAT and business acceptance
- Validate exact-candidate test provenance
- Prepare a quality readiness scorecard
- Identify quality evidence gaps
- Prevent status-only readiness claims

## Security and supply chain

- Aggregate SAST, DAST, dependency, container, infrastructure, and secret-scan results
- Assess unresolved vulnerability release impact
- Validate security exceptions and expiry
- Validate software bills of materials
- Validate artifact signatures and provenance
- Validate license policy results
- Detect unapproved binaries and packages
- Verify trusted pipeline origin
- Verify separation of duties
- Verify workload identity and vault references
- Protect signing keys from model context
- Assess certificate and key rotation dependencies
- Prepare security readiness summaries
- Escalate material security risk
- Require retrospective controls for emergency bypasses

## Environment and infrastructure readiness

- Validate target environment health
- Validate environment inventory
- Compare configuration across environments
- Detect configuration drift
- Validate feature-flag prerequisites
- Review infrastructure plans
- Review Kubernetes manifests and rollout configuration
- Review network, DNS, TLS, gateway, and load-balancer dependencies
- Validate capacity headroom
- Validate autoscaling readiness
- Validate monitoring and alerting readiness
- Validate backup and restore prerequisites
- Validate least-privilege deployment identity
- Validate platform support coverage
- Prepare environment readiness reports

## Database and data release readiness

- Inventory schema and data changes
- Validate migration ordering
- Validate expand-and-contract migration patterns
- Validate migration checksums
- Validate forward SQL previews
- Validate rollback or restore plans
- Assess locking and transaction risk
- Assess duration and data-volume risk
- Assess replication and log-growth impact
- Validate data backfill resumability
- Validate reconciliation queries
- Validate mixed-version database compatibility
- Bind migrations to immutable hashes
- Coordinate database monitoring
- Prepare database readiness assessments

## Change governance and approvals

- Create change-record drafts
- Classify release risk
- Validate implementation and validation plans
- Validate rollback and communication plans
- Validate required approvers
- Bind approval to payload hash
- Bind approval to environment and window
- Validate approval expiry
- Prevent approval replay
- Prevent self-approval
- Record conditions and dissent
- Manage emergency change authority
- Maintain immutable decision logs
- Escalate missing or conflicting approvals
- Close obsolete change records

## Deployment and rollback planning

- Create deterministic deployment runbooks
- Define prechecks and stop conditions
- Assign accountable operators
- Sequence application, database, infrastructure, and configuration changes
- Identify safe parallel steps
- Plan canary and phased rollout
- Plan blue-green rollout
- Plan rolling deployment
- Define promotion criteria
- Define observable rollback triggers
- Validate rollback artifact availability
- Validate rollback data safety
- Create fix-forward decision paths
- Plan cleanup and temporary-control removal
- Rehearse complex release procedures
- Freeze runbooks to approved payloads

## Communication and stakeholder coordination

- Build stakeholder and audience maps
- Draft internal release announcements
- Draft customer-safe release notes
- Draft maintenance notifications
- Draft release command updates
- Draft support handoffs
- Draft business-readiness summaries
- Use a single source of truth
- Distinguish release states accurately
- Avoid unsupported timing commitments
- Avoid unsupported root-cause claims
- Coordinate regional communications
- Track critical owner acknowledgements
- Correct inaccurate updates audibly
- Archive approved communications

## Go/no-go and release command

- Assemble go/no-go packs
- Summarize blockers and conditions
- Represent uncertainty and dissent
- Validate candidate unchanged since evidence collection
- Validate approvals for current payload
- Support go, conditional-go, delay, partial-release, and no-go options
- Record accountable human decisions
- Maintain release command logs
- Track deployment stages and timestamps
- Coordinate stage gates
- Coordinate escalation checkpoints
- Pause on stop conditions
- Request approved rollback execution
- Preserve immutable release timelines
- Prevent autonomous final release approval

## Hotfix and emergency release

- Validate emergency authority
- Minimize emergency scope
- Separate restoration from unrelated change
- Select proportionate expedited tests
- Validate emergency artifact identity
- Bind emergency approval to exact payload
- Coordinate incident and release command
- Track service and customer impact
- Validate restoration evidence
- Reconcile emergency changes to source control
- Create permanent remediation follow-up
- Schedule retrospective review
- Measure emergency release trends
- Prevent routine misuse of emergency classification
- Close emergency changes with evidence

## Post-release validation and closure

- Coordinate post-deployment smoke validation
- Verify deployed versions and digests
- Verify database migration state
- Verify configuration and feature state
- Monitor logs, metrics, traces, alerts, and SLOs
- Compare outcomes with baselines
- Monitor support and customer signals
- Verify regional and staged rollout completion
- Remove temporary access and controls
- Maintain rollback availability through observation window
- Create follow-up defects and actions
- Prepare closure evidence
- Close versions and change records after approval
- Publish final release notes after approval
- Schedule post-release reviews

## Release metrics and continual improvement

- Calculate change lead time
- Calculate deployment frequency
- Calculate failed deployment recovery time
- Calculate change failure percentage
- Calculate deployment rework rate
- Calculate release predictability responsibly
- Analyze scope churn
- Analyze release delays by cause
- Analyze manual-step concentration
- Analyze rollback and hotfix trends
- Analyze readiness false positives
- Identify release automation opportunities
- Design measurable improvement experiments
- Avoid individual performance scoring
- Share cross-team release learnings

## Evidence, audit, and privacy

- Create immutable release evidence bundles
- Capture evidence provenance
- Redact sensitive logs and payloads
- Apply minimum-necessary access
- Apply retention policies
- Validate audit completeness
- Track evidence hashes
- Track source timestamps
- Prevent cross-customer evidence mixing
- Prevent raw secrets entering model context
- Detect fabricated evidence
- Maintain release decision chronology
- Support audit retrieval
- Protect customer and employee data
- Record policy decisions and denials
