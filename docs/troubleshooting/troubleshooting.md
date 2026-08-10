# Troubleshooting

## Readiness returns 503

Inspect the `checks` array from `/readyz`. In pilot mode, trusted identity, explicit persistent paths, writable storage, packs, model credentials, Jira, Bitbucket, Playwright, and optionally Jira write must be configured.

## An integration says `mock`

The required variables are absent or the feature is intentionally unimplemented. `/api/qa/integrations` explains sanitized modes. Database and Teams are always mock today.

## A request returns 403

The request tenant or project does not match the persisted execution context. Confirm gateway headers and `/api/session`. Do not widen access to `*` as a debugging shortcut in shared environments.

## Approval returns 409

Reload the action. It may already be decided, expired, have a mismatched payload hash, or be a self-approval attempt in trusted mode.

## Playwright will not run

Confirm it is enabled, the environment is `playground` or `qa`, the project has a server-configured target, suite/cases exist in the YAML catalog, and the referenced storage-state file is mounted and readable.

## Pack count is zero

Set `BM_AGENTS_REPO_ROOT` to the repository root and ensure `packs/*-agent-pack` contains valid manifests/registries. Restart after pack changes.

## Docs build but diagrams do not render

The custom portal loads Mermaid in the browser. Check network policy/content security policy and the browser console. The generated Markdown and fallback code remain readable without JavaScript.
