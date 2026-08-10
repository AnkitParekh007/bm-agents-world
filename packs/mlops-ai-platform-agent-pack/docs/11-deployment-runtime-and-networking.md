# Deployment, Runtime and Networking

The recommended runtime is containerized and identity-aware, with separate worker classes for metadata reads, pipeline/evaluation jobs, model serving, GPU jobs and policy-approved changes. Kubernetes is optional but well suited to shared AI infrastructure.

Network policy defaults to deny. Egress is allowed only to approved model providers, package/model registries, artifact stores, telemetry endpoints and project services. Model/agent sandboxes receive narrower egress than platform control services.

GPU worker pools are isolated from general workloads and governed by driver/runtime compatibility, quotas, scheduling policy and telemetry. Production serving should use immutable images and model artifacts with explicit rollback references.
