# Authenticated project-specific QA execution

This slice evolves `qa.playwright.test.run` from generic page smoke into project-aware, story-scoped QA execution.

## Safety model

- Production remains unsupported by `qa.playwright.test.run`.
- Target URLs come only from server configuration/project registry.
- Test cases come only from `apps/agent-window/config/qa-project-tests.yaml` (or a trusted server-side override).
- The model cannot submit JavaScript, Playwright test files, selectors, credentials, storage-state JSON, or arbitrary URLs.
- Browser authentication uses an optional server-side storage-state file reference.
- The model can see only the `SecretReference` metadata (`provider`, `name`, `purpose`, configured/not configured), never the file path value or contents.
- Failed tests produce a `bug-draft` artifact. Jira creation remains a separate L3 capability and is still mock-only.

## Configure project tests

Edit `apps/agent-window/config/qa-project-tests.yaml`.

Every case contains:

- `id`
- `title`
- `baseline`: always run for the suite
- `pathPrefixes`: changed-file prefixes that select the case
- declarative `steps`

Supported steps in this milestone:

- `goto` — same-origin path only
- `expectVisible`
- `expectText`
- `expectUrlContains`

The catalog deliberately does not support arbitrary script execution, dynamic imports, shell commands, raw HTTP requests, or model-provided selectors.

Example:

```yaml
projects:
  PCC:
    identity:
      storageStateEnv: QA_PCC_PLAYWRIGHT_STORAGE_STATE
    suites:
      story-smoke:
        cases:
          - id: supplier-search-page
            title: Supplier search page loads
            baseline: false
            pathPrefixes:
              - src/app/supplier/
            steps:
              - { type: goto, path: "/suppliers" }
              - { type: expectVisible, selector: "app-supplier-search" }
```

## Configure authenticated state

Generate a Playwright storage-state file using a trusted setup process and keep it outside git, then set only its server-side path:

```bash
QA_PCC_PLAYWRIGHT_STORAGE_STATE=/secure/runtime/playwright-auth/pcc-user.json
```

Equivalent variables exist for SOP and DataBridge. The repository ignores `playwright/.auth/` and `apps/agent-window/.playwright-auth/` as additional safeguards.

## Story-scoped selection

The workbench instructs the QA agent to:

1. Read Bitbucket change impact for the Jira story.
2. Extract exact changed file paths from returned evidence.
3. Request `qa.playwright.test.run` with `suite=story-smoke`, `storyId`, and those paths.
4. The server always includes baseline cases and adds only catalog cases whose `pathPrefixes` match changed files.

This lets code impact influence test scope without making the LLM the authority over executable test content.

## Artifacts

A successful or failed live run produces:

- `test-execution-result`
- screenshot evidence
- Playwright trace
- bounded/redacted network evidence
- `evidence-manifest`

When one or more selected cases fail, the worker also produces a `bug-draft` matching the QA pack contract with parent issue, environment, build, reproduction steps, expected/actual results, severity recommendation, and evidence IDs.

The draft is evidence for human triage; it is not a Jira write.

## Next hardening before production use

- Replace environment-backed auth-state references with the BM Capability Broker/Vault.
- Protect artifact endpoints with authenticated project/run authorization.
- Add lifecycle/expiry checks for auth-state material.
- Add per-project test accounts and concurrency controls for state-mutating QA suites.
- Add schema validation at artifact write time.
- Add richer project cases only after their actions are classified by risk.
