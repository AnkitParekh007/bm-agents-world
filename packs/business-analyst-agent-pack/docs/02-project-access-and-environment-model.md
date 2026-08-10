# Project Access and Environment Model

The Business Analyst Agent uses a project-scoped access envelope. A run cannot inherit universal access merely because the same organization owns multiple repositories, databases, documents, products, or environments.

## Scope envelope

Every run is bound to `organization → project → product/process area → request → requester → decision owner → purpose → evidence sources → environment → tools → artifacts → approvals → expiration`. The policy engine rejects missing or conflicting dimensions.

## Project profiles

PCC uses a legacy-compatible profile for Angular 12 and Java. SOP uses a version-aware profile for Angular 15 and Java. DataBridge uses a conservative-change profile for AngularJS, Java, and integration-heavy workflows. BM Agent Foundry uses a platform-product profile for agent configuration, Supabase, runtime, and GKE concerns.

## Access layers

The agent may read approved Jira, Confluence, process, design, repository, contract, metadata, and aggregate analytics sources. Database access is metadata-first and limited to parameterized, bounded, read-only queries. Production is read-only and evidence-oriented. Code, database, infrastructure, policy, and production mutations are outside this role.

## Environment behavior

Playground supports safe discovery and approved validation. QA supports controlled UAT and evidence collection. Production provides approved read-only operational evidence; it does not permit test data creation, configuration changes, or unrestricted log and data export.

## Data classification

Public, internal, confidential, restricted, customer, employee, regulated, and secret classes must be resolved before retrieval. Restricted sources require an approved purpose, minimum-necessary fields, redaction, short retention, and complete audit.

## Onboarding requirements

A project must register owners, systems, processes, source repositories, document spaces, data sources, interface catalogs, business glossary, environments, decision rights, approval routes, retention, and known constraints before activation.
