# Diagram Input Specification

This file is the source brief for the future Mermaid architecture diagram and the complete Business Analyst Agent execution-flow diagram.

## Architecture diagram nodes

Human requester; Business/Product Owner; Business Analyst Supervisor; policy engine; approval service; evidence service; traceability graph; key vault/capability broker; specialist agents; Jira/Confluence; Bitbucket; Figma; BPMN/diagram service; data catalog/database read; API/integration catalog; analytics/research; Teams; artifact repository; existing role-agent packs.

## Architecture diagram clusters

1. Human governance. 2. Agent orchestration. 3. Business-analysis specialists. 4. Security and control plane. 5. Enterprise systems and evidence. 6. Artifacts and traceability. 7. Coordinated role packs.

## Mandatory edges

Requester submits scoped work; supervisor requests policy; policy authorizes capabilities; specialists retrieve evidence through MCP gateway; outputs flow to traceability and evidence; independent reviewer challenges; approval service binds decisions to payload; deterministic adapters publish; other role packs receive approved handoffs.

## Execution flow

Start → intake → authorization → scope and need → stakeholder mapping → analysis plan → elicitation → current-state discovery → parallel requirements/rules/data/integration/NFR analysis → process/future-state design → stories and acceptance → traceability → impact/readiness → independent review → human decision → publication → delivery support → UAT → human acceptance → solution evaluation → learning.

## Decision branches

Unauthorized scope; insufficient evidence; conflicting stakeholders; missing decision owner; high-risk or regulated change; failed quality checks; stale baseline; payload changed after approval; UAT blocked; conditional acceptance; outcome not realized.

## Visual style

Use a professional enterprise palette, clear subgraphs, solid arrows for data/work, dashed arrows for approvals and control, red boundaries for prohibited production mutation, and numbered stages for the end-to-end flow.
