# Project Access and Environment Model

## Access principles

The MLOps / AI Platform Agent operates through project-scoped capabilities. Every run resolves project, environment, tenant/workspace, cluster, namespace, model/agent candidate, data classification, and approval owner before any tool call.

## Environment tiers

- **Development / sandbox:** isolated experimentation, manifest generation, compilation, unit/evaluation tests, disposable serving and synthetic load tests.
- **QA / staging:** approved platform writes, candidate registration, end-to-end evaluation, serving tests and release rehearsals.
- **Production:** bounded redacted reads plus immutable approval requests. The free-form model does not receive cluster-admin, cloud-admin, model-provider, artifact-signing or database credentials.

## Isolation dimensions

Project, tenant/customer, environment, namespace/workspace, object-store prefix, registry namespace, model gateway route, feature/vector collection and observability scope must remain isolated unless an explicit cross-project service has been approved.

## Production execution

Production changes are executed by a deterministic pipeline, runbook engine, release system or authorized operator after policy evaluation and payload-bound approval. The agent prepares the exact payload and then verifies the result using read-only evidence.
