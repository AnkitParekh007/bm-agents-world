# Deployment, Runtime and Networking

## Control plane

The control plane hosts gateway, identity, policy, workflow state, approvals, registries, audit and artifact metadata. It does not execute untrusted repository builds.

## Execution plane

Each run uses an ephemeral worker or container with a read-only base image, approved JDKs, Maven/Gradle wrappers, resource limits, non-root user, isolated filesystem and default-deny network. Nested containers for Testcontainers are provided through an approved isolated runtime, not an unrestricted host Docker socket.

## Network segmentation

Separate connectors for source control, Atlassian, database metadata, messaging metadata, observability, package repositories and environments. Egress is allowlisted by domain/service and recorded. Production networks expose only approved read-only observability or diagnostic endpoints.

## Build images

Maintain signed tool images for supported JDKs and legacy profiles. Images should include only necessary tools, receive regular vulnerability updates and be referenced by digest. Repository wrappers still determine Maven/Gradle behavior.

## Caching

Dependency caches are read-through, content-addressed and partitioned by trust domain. A build cannot inject artifacts into a cache used by other projects without verification. Sensitive settings files are mounted transiently and excluded from cache and evidence.

## High availability and recovery

Workflow state and approvals are durable. Workers are disposable. Retried steps reuse immutable inputs and idempotency keys. Audit and evidence stores have retention, backup and access controls appropriate to organizational requirements.

## Deployment model options

- Managed Kubernetes with isolated job pods
- Cloud-runner jobs with workload identity
- Enterprise VM runners with hardened ephemeral workspaces
- On-premises workers near Bitbucket Data Center or protected databases

Select the model based on data residency, network reachability and existing platform capabilities.
