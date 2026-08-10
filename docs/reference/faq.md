# FAQ

## Is every agent pack executable?

Every valid pack becomes a named conversational agent. The QA pack has the deepest executable capability set; other roles primarily supply grounded pack knowledge today.

## Does the app use React Router or a global state store?

No. It uses component state, CopilotKit context, and direct fetch calls.

## Can agents mutate production?

No free-form production mutation is supported. Capability definitions explicitly constrain environments and side effects. Jira defect creation is an approved external write, not a target-system production mutation.

## Why one Kubernetes replica?

SQLite and local filesystem artifacts are authoritative. Multiple replicas would split state and evidence.

## Is an `executed` action always live?

No. Inspect `result.mode` and `externalSideEffect`. Mock adapters can execute governance paths without contacting an external system.

## Where are secrets stored?

They are supplied through server environment variables or mounted files. The repository includes templates, not real values.

## How do I add a docs page?

Create Markdown under `docs/`, add it to `SUMMARY.md`, link related pages, then run the docs build. See [Maintaining these docs](maintaining-docs.md).
