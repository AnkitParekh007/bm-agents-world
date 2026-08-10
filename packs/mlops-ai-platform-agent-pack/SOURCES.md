# Sources and Research Baseline

Research snapshot: August 2026. These sources inform defaults and terminology; repository/platform compatibility remains authoritative.

1. MLflow releases archive / MLflow 3.14.0 — https://mlflow.org/releases/ and https://mlflow.org/releases/3.14.0/
   - MLflow 3.14.0 (June 17, 2026) focuses on agent onboarding, review queues, pytest evaluation integration and LLM playground workflows.
   - MLflow 3.13 added role-based access control and an official Helm chart.
2. Kubeflow Community Distribution 26.03.1 — https://blog.kubeflow.org/kubeflow-26.03-release/
   - Calendar-based release line; includes Kubeflow Pipelines, model-registry and serving integrations.
3. Kubeflow Pipelines installation — https://www.kubeflow.org/docs/components/pipelines/operator-guides/installation/
4. KServe 0.17 release — https://kserve.github.io/website/blog/kserve-0.17-release
   - Production-ready LLMInferenceService architecture for large-model serving.
5. Kubernetes 1.36 release — https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/
6. Kubernetes patch release information — https://kubernetes.io/releases/patch-releases/
7. Kubernetes workload-aware scheduling — https://kubernetes.io/blog/2026/05/13/kubernetes-v1-36-advancing-workload-aware-scheduling/
8. NVIDIA GPU Operator release notes / platform support — https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/release-notes.html and https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/platform-support.html
   - 26.3.x is the supported release line in the consulted August 2026 documentation.
9. OpenTelemetry semantic conventions 1.43.0 — https://opentelemetry.io/docs/specs/semconv/
10. OpenTelemetry GenAI observability — https://opentelemetry.io/blog/2026/genai-observability/
11. NIST AI Risk Management Framework — https://www.nist.gov/itl/ai-risk-management-framework
12. SLSA supply-chain framework — https://slsa.dev/
13. Sigstore / Cosign documentation — https://docs.sigstore.dev/
14. OCI Image and Distribution specifications — https://opencontainers.org/
15. CNCF OpenTelemetry — https://opentelemetry.io/

## Research rule

Do not auto-upgrade to these versions. First resolve the deployed platform, managed-service constraints, CRDs, Kubernetes compatibility, GPU driver/CUDA/runtime matrix, model-serving runtime, data migration requirements and rollback path.
