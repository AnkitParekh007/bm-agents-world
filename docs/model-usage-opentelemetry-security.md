# Telemetry security boundary

Telemetry records operational identifiers and measured counters only. Do not add prompts, chat content, Jira descriptions, tool payloads, credentials, Playwright storage state, cookies, API tokens, or raw evidence bodies as trace attributes.

Tenant/project authorization continues to be enforced by the existing QA observability APIs. Trace export is a server-side operational channel and must target an organization-approved collector/backend with appropriate network and retention controls.
