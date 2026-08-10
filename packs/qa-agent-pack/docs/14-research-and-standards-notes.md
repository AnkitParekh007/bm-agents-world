# Research and Standards Notes

The pack uses these current platform facts and design implications:

- MCP servers can expose resources, prompts, and tools; the registries in this pack keep those concepts separate.
- Atlassian's Rovo MCP can provide Jira/Confluence and supported Atlassian context and actions using the user's existing permissions; high-impact writes still require local policy and approval controls.
- Bitbucket Cloud provides REST APIs and scoped authentication mechanisms; an organization-owned adapter is retained for Cloud/Data Center differences and for capabilities not exposed by the selected Atlassian MCP setup.
- Microsoft's Playwright MCP provides browser automation; it should run inside a restricted browser worker and not as a universal desktop/browser credential holder.
- Microsoft Graph channel-message posting has permission constraints; choose an approved delegated, bot, or workflow-based Teams publication path rather than assuming a general unattended application token can post normal messages.
- Secret systems should be accessed using workload identity or managed identity where available. Dynamic database credentials with leases are preferable for short-lived agent runs.
- Open Policy Agent is an appropriate technology-neutral policy decision point, and OpenTelemetry provides a vendor-neutral traces, metrics, and logs model.

See `SOURCES.md` for official references.
