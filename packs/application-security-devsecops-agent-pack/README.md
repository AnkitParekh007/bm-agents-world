# Application Security / DevSecOps Agent Pack

A governed operating pack for an AI Application Security / DevSecOps Agent that embeds security into product discovery, architecture, development, CI/CD, release, vulnerability response, and continual improvement across PCC, SOP, DataBridge, BM Agent Foundry, and future projects.

## Pack summary

- 240 daily and periodic Application Security / DevSecOps tasks
- 27 supervisor and specialist agents
- 240 reusable security skills
- 18 MCP server definitions
- 22 deterministic plugins and adapters
- 28 governed artifact types
- 5 executable workflows
- 7 JSON Schema output contracts
- OPA policy, permissions, vault references, onboarding, and MVP checklists

## Core operating principle

The agent may discover, analyze, scan, model, verify, draft, and recommend. It cannot accept residual risk, approve its own exceptions, disable gates, run uncontrolled exploitation, mutate production, or expose raw secrets. Protected writes require payload-bound human approval, and production actions are executed only by authorized operators or deterministic systems.

## Start here

1. Read `docs/02-project-access-and-environment-model.md`.
2. Configure `config/project-registry.yaml` and the environment inventory.
3. Replace vault placeholders with references, never secret values.
4. Select the required specialist agents and scanners for each project risk tier.
5. Run `checklists/project-onboarding.md` and `checklists/mvp-readiness.md`.
6. Use `docs/13-diagram-input-specification.md` for the architecture and end-to-end Mermaid diagrams.
