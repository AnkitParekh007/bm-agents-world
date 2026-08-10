# MCP Servers, Tools, and Plugins

## Separation of concerns

- **MCP servers** expose governed resources, prompts, or tools from external systems.
- **Tools/adapters** perform deterministic actions such as querying, calculating, rendering, redacting, or publishing.
- **Plugins** extend runtime behavior but do not automatically gain credentials.
- **Skills** describe reusable agent capability.

## Recommended MCP landscape

The registry includes Atlassian, CRM, Customer Success platform, Support, product analytics, bounded usage telemetry, entitlement metadata, feedback, calendar, email/collaboration, Teams, knowledge/documentation, release, incident observability, customer assurance, artifact storage, key-vault capability brokering, and policy/approval services.

Gainsight's current Customer Success platform publicly describes Customer 360, health scorecards, success plans, customer feedback, renewal/expansion signals, and an MCP capability. The pack treats Gainsight MCP as optional; organizations can use another CS platform or an internal adapter.

## Deterministic plugins

Health scores, adoption calculations, renewal windows, value measures, QBR assembly, redaction, evidence hashes, and approval payload binding should be deterministic wherever practical. LLM interpretation is useful for synthesis, but score math, dates, thresholds, permissions, and payload identity should not depend on free-form generation.

## Customer communication

Email and Teams integrations should support read/minimum-necessary context and draft creation. Sending customer communications requires account-scoped approval. Private mailboxes, unrelated conversations, and personal messages are out of scope.

## Production access

No MCP exposed directly to the model should provide arbitrary production write access. Production telemetry is read-only and bounded. Any required production change is delegated to the appropriate engineering, SRE, Support, Release, or commercial workflow.

See `config/mcp-registry.yaml` and `config/plugin-registry.yaml`.
