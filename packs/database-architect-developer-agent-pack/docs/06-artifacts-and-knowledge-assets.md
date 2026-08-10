# Artifacts and Knowledge Assets

Artifacts are immutable, typed outputs with run ID, project, database scope, branch/base commit, engine profile, sensitivity, creator, timestamp, content hash, source references, and retention class.

| Artifact | Contents |
|---|---|
| `work-context` | Normalized requirement, policies, dependencies, owners, and open questions |
| `database-estate-profile` | Engine, version, edition, topology, schemas, workloads, tools, and constraints |
| `data-domain-model` | Business entities, ownership, lifecycle, glossary, and invariants |
| `logical-data-model` | Engine-neutral entities, keys, relationships, optionality, and temporal rules |
| `physical-schema-design` | Engine-specific objects, types, constraints, indexes, partitions, storage, and grants |
| `erd` | Versioned entity-relationship diagram source and rendered representation |
| `data-dictionary` | Objects, columns, semantics, classification, ownership, quality, and retention |
| `architecture-decision` | Database choice, alternatives, tradeoffs, consequences, and review date |
| `schema-change-manifest` | Objects, SQL, dependencies, consumers, permissions, compatibility, and risk |
| `migration-plan` | Preconditions, SQL previews, sequencing, validation, rollback/roll-forward, and approvals |
| `data-movement-plan` | Mapping, chunks, checkpoints, throttles, reconciliation, exception handling, and cleanup |
| `query-performance-report` | Plans, statistics, waits, indexes, baselines, recommendations, and measured results |
| `security-design` | Identities, roles, grants, RLS/masking, encryption, auditing, and residual risk |
| `data-quality-report` | Profiling, rules, violations, reconciliation, lineage, and disposition |
| `test-plan` | Schema, migration, query, constraint, security, concurrency, performance, and recovery coverage |
| `test-results` | Structured disposable-environment and approved target validation evidence |
| `quality-gate-report` | Lint, drift, migration, test, security, performance, backup, and policy results |
| `backup-recovery-plan` | Backup, restore, replication, RPO/RTO, failover, and evidence requirements |
| `release-readiness` | Lock/duration/resource risk, compatibility, backup, rollback, monitoring, and approvals |
| `pull-request-draft` | Traceable database change PR with SQL previews and reviewer guidance |
| `operational-runbook` | Deployment, validation, monitoring, incident, failover, recovery, and ownership actions |
| `daily-summary` | Completed work, blockers, approvals, evidence, risks, and next actions |
| `audit-record` | Immutable run, identity, policy, query, tool, approval, artifact, and decision history |

## Knowledge hierarchy

1. Organization policy and approved database standards.
2. Project architecture, ownership, data classification, and operational runbooks.
3. Repository migration and SQL conventions.
4. Engine/version/edition documentation.
5. Current schema metadata, migration history, telemetry, and incidents.
6. Generated artifacts for the active run.

Newer context does not automatically override a higher-governance source. Conflicts are surfaced explicitly.

## Artifact storage

- SQL previews, plans, samples, and logs are redacted before storage.
- Artifacts are content-addressed and linked to Jira and PR records.
- Approval records bind to exact artifact hashes and expire on material changes.
- Production evidence uses stricter retention and access-control classes.
- ERD images are derivatives; diagram source is the authoritative artifact.
