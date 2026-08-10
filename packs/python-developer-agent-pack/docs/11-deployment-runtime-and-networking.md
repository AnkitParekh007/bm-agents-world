# Deployment, Runtime, and Networking

## 1. Control and execution planes

The control plane stores orchestration state, policy, project metadata, approvals, artifact indexes, and audit. The execution plane runs disposable workers for repository analysis, code modification, tests, builds, and scans. High-trust credential adapters are isolated from model workers.

## 2. Worker profiles

- lightweight context/index worker
- Python code and test worker with version-specific runtime
- database integration worker with ephemeral test database
- container build worker without host daemon exposure
- PySpark/data worker with bounded memory, CPU, storage, and sample datasets
- browser/API validation worker when end-to-end validation is required

## 3. Base images and runtime matrix

Maintain approved, signed worker images for supported Python versions and required OS libraries. Pin image digests, patch regularly, generate SBOMs, scan images, and retain the exact image identity in evidence. Repository configuration decides which profile is used.

## 4. Network zones

Separate control, sandbox, credential-adapter, artifact, and target-system zones. Workers receive per-run DNS/egress policies. Block cloud metadata endpoints, host networks, unrestricted package downloads, inbound listeners, peer-to-peer access, and arbitrary callbacks.

## 5. Resource and process controls

Use non-root users, read-only root filesystem, ephemeral volumes, CPU/memory/PID/time limits, seccomp/AppArmor or equivalent, no privileged mode, no host mounts, and no Docker socket. Terminate descendant processes and revoke leases on cancellation.

## 6. Data and artifact handling

Use synthetic or masked data for tests. Encrypt artifacts in transit and at rest, apply retention by classification, and isolate customer/project data. Do not retain virtual environments, package caches containing credentials, database snapshots, or raw production payloads.

## 7. Availability

Persist workflow state outside workers, use idempotent steps, checksum artifacts, support safe resume, and provide circuit breakers for failing integrations. Policy and credential services fail closed.
