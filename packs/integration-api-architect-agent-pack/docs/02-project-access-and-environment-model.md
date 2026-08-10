# Project Access and Environment Model

## Principle

The Integration / API Architect works across systems but never receives universal credentials. Every run is bound to one or more explicit projects, consumers, providers, environments, and contract versions.

## Required project context

- Jira epic/story/change reference
- owning domain and service owner
- provider and consumer repositories
- current API, event, RPC, GraphQL, or schema contracts
- gateway, broker, schema registry, and identity metadata
- environment topology and approved endpoints
- data classification and residency constraints
- current SLAs/SLOs, rate limits, quotas, and partner limits
- release train and deprecation windows

## Environment tiers

**Playground** permits broad read access and approved isolated experiments. **QA** permits bounded conformance, resilience, and performance testing. **Production** is read-only to the free-form agent. Production changes are emitted as immutable requests for authorized operators or deterministic pipelines.

## Project isolation

A run for PCC cannot automatically read SOP, DataBridge, BM Agent Foundry, or unrelated customer integrations. Cross-project architecture requires explicit scope and separate evidence references.

## Contract identity

Every contract is identified by project, provider, interface name, protocol/style, semantic version or lifecycle state, repository revision, artifact digest, environment, and publication status.
