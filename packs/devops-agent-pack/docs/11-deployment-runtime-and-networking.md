# Deployment, Runtime, and Networking

## Runtime components

- agent gateway and user/session authorization
- workflow engine and durable state store
- policy decision point and approval service
- capability broker and vault integration
- isolated code, IaC, container, and manifest workers
- connector/adapters for Bitbucket, cloud, Kubernetes, GitOps, observability, incidents, and Teams
- immutable artifact and audit store
- evaluation and red-team harness

## Isolation

- Ephemeral worker per run or high-risk step.
- Read-only source mount plus writable isolated worktree.
- No host socket, Docker daemon, cloud metadata, or inherited credentials by default.
- Allow-listed egress to approved registries, APIs, and documentation.
- Resource, runtime, output-size, and network limits.
- Mandatory cleanup and short retention for scratch data.

## Deployment topology

Run the control plane in a protected management environment. Place adapters close to target systems, but keep credentials inside adapters. Separate non-production and production adapter identities and network paths.

## Production execution

The agent emits an immutable change bundle. A governed CI/CD or GitOps system validates the approval, artifact digests, source revision, environment lock, and policy decision before executing. The agent observes with read-only access and writes evidence.

## High availability

- Durable workflow checkpoints
- Idempotent adapter calls
- distributed locks for environment changes
- retry with bounded backoff
- dead-letter and manual recovery queues
- immutable audit replication
- tested backup and restore of control-plane metadata
