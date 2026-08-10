# Research and Standards Notes

This pack is version-aware. Organization repositories and managed-platform compatibility always override the newest upstream versions.

Research snapshot (August 2026):
- MLflow 3.14.0 (June 2026) includes agent onboarding, review queues, pytest integration and an LLM playground; 3.13 added RBAC and an official Helm chart.
- Kubeflow Community Distribution 26.03.1 uses calendar versioning and includes modern Pipelines, model-registry and serving integrations.
- KServe 0.17 introduced production-ready LLMInferenceService capabilities for large-model serving.
- Kubernetes 1.36 is an actively supported release line; AI/ML workload-aware scheduling continues to evolve.
- NVIDIA GPU Operator 26.3.x is the current supported release line in the consulted documentation.
- OpenTelemetry semantic conventions are versioned separately; GenAI conventions have moved to a dedicated repository and should be treated as evolving.

The pack intentionally avoids hard-coding any of those versions into project execution. A compatibility matrix must be resolved before upgrades or generated manifests are applied.
