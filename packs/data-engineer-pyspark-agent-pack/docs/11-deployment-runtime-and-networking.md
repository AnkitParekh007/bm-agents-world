# Deployment, Runtime, and Networking

## Runtime zones

1. **Control plane:** gateway, workflow engine, policy, approval, registry, and evidence metadata.
2. **Reasoning plane:** isolated model sessions receiving minimized redacted context.
3. **Tool plane:** deterministic workers for code, tests, Spark plans, quality, and packaging.
4. **Data plane:** source, streaming, storage, catalog, and Spark platforms accessed only through trusted adapters.
5. **Execution plane:** deterministic CI/CD and production operators unavailable to the free-form model.

## Network controls

- Default-deny egress from model and workers.
- Allowlisted service endpoints and private network paths.
- No direct model-to-source or model-to-production connectivity.
- Separate project, environment, and tenant network identities.
- Bounded timeouts, rate limits, quotas, and result sizes.

## Runtime compatibility

Resolve repository and platform versions before code generation: Python, Spark, Java/JVM, connectors, Hadoop/cloud libraries, table format, orchestrator, catalog, and serialization libraries. Preserve legacy compatibility until an explicit migration is approved.

## Artifact promotion

Build once, hash, sign or attest where configured, and promote immutable candidates. Configuration and secret references are injected separately through trusted systems.
