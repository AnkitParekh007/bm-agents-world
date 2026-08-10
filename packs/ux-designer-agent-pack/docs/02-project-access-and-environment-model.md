# Project Access and Environment Model

## Scope tuple

Every run is bound to:

`organization -> project -> product-area -> Jira item -> Figma project/file/branch -> design system -> repositories -> environment -> requester -> approved purpose -> participant-data class -> allowed tools -> approvals -> expiration`

## Required project access

The agent may need scoped read access to Jira and Confluence; Figma projects, files, libraries, variables, prototypes, and Dev Mode metadata; Bitbucket repositories and pull requests; Storybook or component catalogs; product analytics; support themes; research repositories; approved asset libraries; and playground/QA implementations.

Access is granted per project and purpose. PCC, SOP, and DataBridge remain isolated. Cross-project design-system access is read-only unless the run explicitly targets a shared system and the design-system owner approves it.

## Environment classes

| Environment | Autonomous access | Mutations |
|---|---|---|
| Design sandbox | Draft designs, prototypes, synthesis, test plans | Personal or isolated draft only |
| Playground | Read implementation, capture approved evidence, run design QA | No product mutation |
| QA | Read implementation and run approved validation | No product mutation; test data changes through approved adapters |
| Production | Privacy-safe analytics and approved redacted observation | No autonomous mutation; screenshots require approval and redaction |

## Figma boundaries

- Read only the selected project/file/branch and referenced libraries.
- Personal draft or isolated branch writes may be allowed by policy.
- Shared file edits, branch merges, component publishing, variable publishing, and library releases require payload-bound human approval.
- The model never receives Figma tokens; trusted adapters hold short-lived capabilities.

## Research-data boundaries

Raw recordings, contact details, consent records, incentives, and direct identifiers remain in approved research systems. The agent receives redacted notes, coded excerpts, and evidence references. Sensitive attributes are collected only when the research purpose and approval require them.

## Code and implementation access

Bitbucket and Storybook access is read-only for the UX agent. It may inspect component APIs, tokens, responsive behavior, accessibility results, PR diffs, and implementation history. It may draft Jira findings or handoff material, but it does not commit code, merge pull requests, or deploy applications.
