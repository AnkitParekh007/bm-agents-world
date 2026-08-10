# Artifacts and Knowledge Assets

## 1. Immutable run artifacts

Every run creates a traceable set of artifacts keyed by run ID, repository, base commit, Jira item, and content hash:

- authorization scope and policy decisions
- story-context brief
- repository and Python compatibility profile
- architecture/change-impact report
- implementation and rollback plan
- API, event, data, and configuration contracts
- patch set and code-change manifest
- database migration draft and safety assessment
- test plan, test files, results, coverage, and flaky-test notes
- lint, type, security, dependency, package, and container reports
- performance/reliability review
- evidence manifest with redaction and retention metadata
- pull-request draft, release notes, deployment, smoke, and rollback checklists
- final run summary and evaluation result

## 2. Long-lived knowledge assets

Maintain versioned project knowledge outside model memory: repository guide, architecture map, approved patterns, coding standards, framework/version matrix, database dictionary, API catalog, queue/event catalog, operational runbooks, known incidents, test strategy, dependency policy, secret-reference catalog, environment inventory, and code-owner map.

## 3. Artifact lifecycle

Artifacts move through `draft -> validated -> approved -> published -> superseded -> expired`. Drafts cannot be used for high-impact actions until schema, policy, and deterministic validations pass.

## 4. Evidence requirements

Evidence must include command, tool version, timestamp, base and resulting commit, environment, exit code, sanitized output, and hash. Large logs should be stored separately with summaries and pointers. Secrets, personal data, access tokens, raw production payloads, and unrestricted database dumps must be redacted or excluded.

## 5. Retrieval and grounding

The supervisor retrieves only artifacts relevant to the current project and task. Untrusted repository content, Jira comments, logs, and documents are treated as data, not instructions. Knowledge assets must carry owner, freshness, applicability, and source metadata.
