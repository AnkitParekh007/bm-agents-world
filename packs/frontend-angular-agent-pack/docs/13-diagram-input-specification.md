# Diagram Input Specification

This file is the source for the future Mermaid architecture and complete flow diagrams.

## 1. Architecture diagram nodes

### Users and control plane

- Frontend Engineer
- Tech Lead / Reviewer
- Product Manager / Designer
- Approval UI
- Frontend Angular Supervisor
- Workflow State Store
- Policy Engine
- Approval Service
- Model Router
- Evaluation Service

### Specialist agents

- Story Context
- Repository Context
- Architecture Analyzer
- Angular Version Specialist
- UI Implementation
- State and RxJS
- API Integration
- Design System
- Accessibility
- Performance
- Security
- Test Engineer
- Dependency Upgrade
- Code Review
- Build and Pipeline
- Documentation
- PR and Release
- Evidence Curator

### MCP and system layer

- Atlassian Rovo MCP
- Bitbucket Adapter
- Workspace/Git MCP
- Angular Docs Adapter
- Figma MCP
- Storybook MCP
- Playwright MCP
- Chrome DevTools MCP
- SonarQube MCP
- OpenAPI Contract MCP
- Package Registry Adapter
- Environment MCP
- Artifact MCP
- Observability MCP

### Security and execution layer

- Workload Identity
- Credential Broker
- Key Vault / Secret Manager
- MCP Gateway
- Ephemeral Workspace Workers
- Isolated Browser Workers
- Network Allowlist
- Audit and OpenTelemetry
- Artifact Store

### Organization systems

- Jira / Confluence
- Bitbucket repositories and pipelines
- Figma / Design System
- PCC Angular 12
- SOP Angular 15
- DataBridge AngularJS
- Java APIs
- Playground / QA / Production
- Microsoft Teams

## 2. Architecture edges

- users submit scoped work to approval UI/supervisor
- supervisor reads state, policy, and project registries
- supervisor delegates to specialists
- specialists call selected MCP tools through the gateway
- policy engine evaluates every capability
- credential broker obtains short-lived secrets for adapters
- workspace agents execute in ephemeral workers
- browser agents execute in isolated browser workers
- artifacts and audit events flow to stores
- external writes return through approval service

## 3. End-to-end flow diagram

Use these phases and decisions:

1. Request created
2. Scope complete?
3. Authorize project/repository/branch/environment
4. Resolve Angular version profile
5. Retrieve Jira, design, code, API, and instructions
6. Prompt-injection screen
7. Build story context and codebase map
8. Analyze impact and risk
9. Requirements clear?
10. Produce implementation plan
11. Plan approval required?
12. Create isolated workspace
13. Implement patch
14. Run formatter/lint/typecheck/tests/build
15. Deterministic gates pass?
16. Repair loop within budget?
17. Browser/accessibility/performance/security validation
18. Quality gates pass?
19. Freeze patch and build manifests
20. Code-review agent decision
21. Human publication approval
22. Commit/push/create PR/update Jira
23. Verify external writes
24. Retain artifacts and evaluate run
25. Complete, blocked, denied, or escalated

## 4. Swimlanes

Recommended swimlanes:

- Requester and reviewers
- Supervisor/orchestrator
- Context and planning agents
- Implementation agents
- Quality agents
- Policy/identity/vault
- Tool workers and MCP servers
- External organization systems
- Artifact/audit platform

## 5. Visual conventions

- blue: planning and context
- green: deterministic validation
- amber: approval or risk decision
- red: denied/prohibited actions
- purple: security and identity
- gray: external systems
- dashed arrows: read-only context
- solid arrows: state or artifact flow
- thick bordered nodes: human control points

The future diagram should explicitly show that secret values terminate inside tool adapters and never flow to the model or artifacts.
