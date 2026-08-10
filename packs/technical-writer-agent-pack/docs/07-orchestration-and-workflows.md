# Orchestration and Workflows

## Orchestration stages

1. Authorize request and data scope.
2. Retrieve version-bound context.
3. Analyze audience and user task.
4. Select content type and channel.
5. Create plan and content brief.
6. Author in an isolated workspace.
7. Run deterministic validation in parallel.
8. Obtain factual, accessibility, style, security, and owner review.
9. Create a publication bundle and payload hash.
10. Request approval for protected writes.
11. Publish through the approved connector.
12. Observe feedback and maintain the content.

## Workflow files

- `request-to-documentation-plan.yaml`
- `documentation-authoring-and-review.yaml`
- `api-and-developer-documentation.yaml`
- `release-documentation-and-publication.yaml`
- `content-audit-and-maintenance.yaml`

## Failure behavior

The workflow stops rather than inventing behavior when authoritative sources conflict, required reviewers are unavailable, examples cannot be tested, security-sensitive detail is unsafe, or publication approval does not match the current payload.
