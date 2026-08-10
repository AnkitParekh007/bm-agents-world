# MCP Servers, Tools, and Plugins

## MCP servers

- **atlassian-rovo** — Jira/Confluence context and approved publication. Target: Jira, Confluence. Access: read-mostly.
- **bitbucket-enterprise** — Repository, pull request and contract-file access. Target: Bitbucket. Access: read-mostly.
- **api-catalog** — API catalog and service ownership metadata. Target: Backstage or enterprise API catalog. Access: read-write-approved.
- **openapi-registry** — OpenAPI contract search, validation and publication. Target: OpenAPI registry. Access: read-write-approved.
- **asyncapi-registry** — AsyncAPI contract search, validation and publication. Target: AsyncAPI registry. Access: read-write-approved.
- **schema-registry** — JSON/Avro/Protobuf schema lookup and compatibility checks. Target: Schema Registry. Access: read-write-approved.
- **graphql-registry** — GraphQL schema, graph, federation and change checks. Target: GraphQL registry. Access: read-write-approved.
- **protobuf-registry** — Proto packages, descriptors and generated client metadata. Target: Proto registry. Access: read-write-approved.
- **api-gateway-management** — Gateway routes, products, quotas and policy metadata. Target: Kong/Apigee/Azure API Management/AWS API Gateway. Access: production-readonly.
- **event-platform** — Topics, consumer groups, ACL metadata and broker health. Target: Kafka/Pulsar/event platform. Access: production-readonly.
- **identity-provider** — OAuth/OIDC clients, scopes, claims and service identities. Target: Enterprise IdP. Access: production-readonly.
- **observability** — Bounded traces, metrics, logs and API analytics. Target: OpenTelemetry/APM. Access: production-readonly.
- **database-metadata** — Read-only schemas, ownership and integration metadata. Target: Database catalogs. Access: production-readonly.
- **environment-runtime** — Service endpoints, versions, health and deployment metadata. Target: Runtime/platform catalog. Access: production-readonly.
- **security-assurance** — API security findings, threat models and exceptions. Target: AppSec platform. Access: read-mostly.
- **partner-integration** — Approved partner/vendor integration metadata and limits. Target: Vendor integration catalog. Access: read-mostly.
- **artifact-store** — Immutable architecture evidence and review artifacts. Target: Artifact repository. Access: read-write-approved.
- **policy-approval-vault** — Policy decisions, approval tokens and secret references. Target: OPA + approval + vault broker. Access: controlled.

## Deterministic plugins

- **spectral-openapi-linter** — Lint OpenAPI contracts against enterprise rules.
- **oasdiff-breaking-change** — Detect OpenAPI breaking and compatibility changes.
- **openapi-generator** — Generate review-only client/server stubs and SDK previews.
- **asyncapi-parser-validator** — Parse and validate AsyncAPI contracts.
- **asyncapi-generator** — Generate documentation and code previews from AsyncAPI.
- **json-schema-validator** — Validate JSON Schema Draft 2020-12 payload schemas.
- **buf-protobuf** — Lint, build and breaking-check protobuf contracts.
- **graphql-schema-validator** — Validate GraphQL schemas and operations.
- **graphql-inspector** — Detect GraphQL schema changes and consumer impact.
- **pact-contract-tests** — Run consumer-driven contract tests.
- **schemathesis-api-tests** — Generate property-based tests from OpenAPI.
- **wiremock-virtualization** — Create bounded virtual services and mocks.
- **grpcurl-smoke** — Perform approved gRPC discovery and smoke calls.
- **k6-api-load** — Execute approved non-production API performance scenarios.
- **oauth-oidc-profile-checker** — Validate OAuth/OIDC profile configuration and token expectations.
- **jwt-structure-verifier** — Inspect JWT structure and claims without exposing secrets.
- **cloud-events-validator** — Validate CloudEvents envelopes and bindings.
- **api-style-guide-checker** — Apply naming, pagination, errors and lifecycle rules.
- **contract-catalog-indexer** — Index APIs/events/schemas into an architecture catalog.
- **mermaid-diagram-renderer** — Render architecture, sequence and flow diagrams.
- **secret-redaction-filter** — Redact credentials and sensitive payload fields from evidence.
- **policy-evaluation-client** — Evaluate OPA-compatible policy and payload-bound approval requirements.

## Design rule

MCP servers expose bounded resources/tools; plugins perform deterministic local checks. Raw credentials stay inside trusted adapters. Production mutation tools are not exposed to the free-form model.
