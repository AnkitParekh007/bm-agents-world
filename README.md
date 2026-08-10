# BM Agents World

BM Agents World is the incubation repository for turning the organization agent packs under `packs/` into runnable, governed AI coworkers. The implementation is intentionally being stabilized here before it is merged into BM Agent Foundry.

## Current milestone: CopilotKit foundation

The first implementation slice lives in `apps/agent-window` and uses CopilotKit + AG-UI as the agent experience layer.

What is working in this milestone:

- Repository-driven agent pack discovery.
- Parsing of pack manifests, agent registries, task catalogs, skills, MCPs, plugins, artifacts, workflows, projects, environments, and default policies.
- Automatic compilation of every discovered pack into a named CopilotKit `BuiltInAgent`.
- A global `default` BM Agents World supervisor agent for pack discovery.
- Read-only server tools for pack overview, sub-agent discovery, and task lookup.
- A React agent workspace using CopilotKit v2.
- Role/agent selection from the packs already committed to the repository.
- Programmatic daily-task launching using `agent.addMessage(...)` + `copilotkit.runAgent(...)`.
- A Copilot chat surface for each role.
- Explicit foundation guardrails: no production mutation and no claims of external execution before real integrations are wired.
- GitHub CI for TypeScript and production builds.

## Architecture

```text
packs/*
   │
   ▼
PackRegistry
   │
   ├── manifest
   ├── sub-agents
   ├── tasks
   ├── skills
   ├── MCP definitions
   ├── plugins
   ├── artifacts
   ├── workflows
   └── policy metadata
   │
   ▼
Pack compiler
   │
   ├── default world supervisor
   └── one CopilotKit agent per pack
   │
   ▼
CopilotRuntime (AG-UI)
   │
   ▼
Agent Window
   ├── role selector
   ├── pack metrics
   ├── daily task launcher
   └── CopilotChat
```

The pack files remain the source material. The app must not hard-code separate implementations for QA, Java, Product, SRE, and every other role.

## Run locally

Prerequisites:

- Node.js 20.18+ (Node 22 recommended)
- An API key for the model provider selected in `AI_MODEL`

```bash
cp apps/agent-window/.env.example apps/agent-window/.env
npm install
npm run dev
```

The UI runs at `http://localhost:5173` and proxies API calls to the runtime on `http://localhost:4000`.

For OpenAI, set for example:

```bash
AI_MODEL=openai:gpt-5.4-mini
OPENAI_API_KEY=...
```

CopilotKit supports provider/model selection on the server, so the platform is not intended to be locked to one model provider.

## Foundation security boundary

This milestone exposes pack metadata and read-only pack introspection only. Jira, Bitbucket, databases, browsers, cloud systems, Teams, deployment systems, and vaults are **not yet connected**.

Future integrations must go through:

```text
User identity
   ↓
BM Agent Gateway
   ↓
RBAC / ABAC + OPA policy
   ↓
Approval engine
   ↓
Capability broker
   ↓
Workload identity / vault
   ↓
Trusted MCP or native adapter
   ↓
Target system
```

Raw secrets must not be inserted into model context.

## Next implementation milestones

1. Add the BM capability registry and approval contract.
2. Wire the QA vertical slice first: Jira read, Bitbucket read, Playwright execution, read-only database validation, evidence artifact, and approved Jira bug creation.
3. Add artifact persistence and run/audit records.
4. Add project/environment scoping and user-to-agent RBAC.
5. Add OPA policy evaluation before every external capability invocation.
6. Add MCP connection management with organization-approved servers only.
7. Add durable threads and run state.
8. Expand the same runtime to Angular, Java, DB, DevOps, Product, SRE, Security, AI/ML, MLOps, and the remaining packs without changing the core architecture.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run build
npm run dev:agent-window:api
npm run dev:agent-window:ui
```
