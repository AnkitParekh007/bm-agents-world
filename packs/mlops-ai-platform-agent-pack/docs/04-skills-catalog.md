# MLOps / AI Platform Agent — Skills Catalog

The skill registry separates reusable reasoning/operational capabilities from MCP servers and deterministic plugins. Production-changing skills only prepare requests; they do not execute mutations.

## Platform Context

- **project-scope-resolution** — Project scope resolution.
- **environment-resolution** — Environment resolution.
- **tenant-isolation-analysis** — Tenant isolation analysis.
- **cluster-inventory-analysis** — Cluster inventory analysis.
- **service-catalog-analysis** — Service catalog analysis.
- **ownership-resolution** — Ownership resolution.
- **dependency-mapping** — Dependency mapping.
- **data-classification-resolution** — Data classification resolution.
- **approval-owner-resolution** — Approval owner resolution.
- **blast-radius-estimation** — Blast radius estimation.

## Platform Architecture

- **reference-architecture-design** — Reference architecture design.
- **control-plane-design** — Control plane design.
- **data-plane-design** — Data plane design.
- **multi-tenancy-design** — Multi tenancy design.
- **workspace-design** — Workspace design.
- **platform-adr-authoring** — Platform adr authoring.
- **managed-vs-self-hosted-analysis** — Managed vs self hosted analysis.
- **portability-analysis** — Portability analysis.
- **platform-drift-detection** — Platform drift detection.
- **architecture-conformance-review** — Architecture conformance review.

## Experiment Tracking

- **experiment-metadata-standardization** — Experiment metadata standardization.
- **run-lineage-validation** — Run lineage validation.
- **dataset-snapshot-linking** — Dataset snapshot linking.
- **environment-capture** — Environment capture.
- **artifact-lineage-analysis** — Artifact lineage analysis.
- **experiment-retention-planning** — Experiment retention planning.
- **experiment-rbac-review** — Experiment rbac review.
- **run-deduplication** — Run deduplication.
- **tracking-reliability-analysis** — Tracking reliability analysis.
- **experiment-backup-restore-planning** — Experiment backup restore planning.

## Registry

- **model-registration** — Model registration.
- **prompt-registration** — Prompt registration.
- **agent-registration** — Agent registration.
- **candidate-identity-validation** — Candidate identity validation.
- **alias-governance** — Alias governance.
- **lifecycle-state-management** — Lifecycle state management.
- **registry-rbac-review** — Registry rbac review.
- **registry-metadata-validation** — Registry metadata validation.
- **artifact-retirement-planning** — Artifact retirement planning.
- **registry-dr-planning** — Registry dr planning.

## Training Pipelines

- **pipeline-dag-design** — Pipeline dag design.
- **pipeline-parameterization** — Pipeline parameterization.
- **pipeline-component-design** — Pipeline component design.
- **checkpoint-strategy** — Checkpoint strategy.
- **distributed-training-orchestration** — Distributed training orchestration.
- **retry-resume-design** — Retry resume design.
- **training-image-standardization** — Training image standardization.
- **pipeline-cache-analysis** — Pipeline cache analysis.
- **pipeline-failure-analysis** — Pipeline failure analysis.
- **pipeline-compatibility-testing** — Pipeline compatibility testing.

## Feature Platform

- **feature-contract-design** — Feature contract design.
- **offline-online-consistency-check** — Offline online consistency check.
- **feature-freshness-analysis** — Feature freshness analysis.
- **feature-lineage-validation** — Feature lineage validation.
- **feature-materialization-planning** — Feature materialization planning.
- **feature-schema-evolution** — Feature schema evolution.
- **feature-rbac-review** — Feature rbac review.
- **training-serving-skew-analysis** — Training serving skew analysis.
- **feature-latency-analysis** — Feature latency analysis.
- **feature-incident-coordination** — Feature incident coordination.

## Evaluation

- **evaluation-set-versioning** — Evaluation set versioning.
- **quality-gate-design** — Quality gate design.
- **llm-evaluation-design** — Llm evaluation design.
- **rag-evaluation-design** — Rag evaluation design.
- **agent-evaluation-design** — Agent evaluation design.
- **human-review-queue-design** — Human review queue design.
- **judge-version-governance** — Judge version governance.
- **evaluation-regression-analysis** — Evaluation regression analysis.
- **evaluation-cost-analysis** — Evaluation cost analysis.
- **evaluation-evidence-packaging** — Evaluation evidence packaging.

## Llm Agent Platform

- **model-gateway-governance** — Model gateway governance.
- **provider-routing-design** — Provider routing design.
- **model-catalog-governance** — Model catalog governance.
- **prompt-versioning** — Prompt versioning.
- **tool-contract-governance** — Tool contract governance.
- **agent-sandbox-design** — Agent sandbox design.
- **model-quota-design** — Model quota design.
- **fallback-circuit-breaker-design** — Fallback circuit breaker design.
- **token-cost-analysis** — Token cost analysis.
- **agent-runtime-compatibility** — Agent runtime compatibility.

## Rag Vector

- **vector-index-governance** — Vector index governance.
- **embedding-versioning** — Embedding versioning.
- **chunking-policy-versioning** — Chunking policy versioning.
- **document-authorization-design** — Document authorization design.
- **index-freshness-analysis** — Index freshness analysis.
- **reembedding-migration-planning** — Reembedding migration planning.
- **shadow-index-design** — Shadow index design.
- **retrieval-service-slo-design** — Retrieval service slo design.
- **vector-cost-analysis** — Vector cost analysis.
- **production-index-swap-planning** — Production index swap planning.

## Serving

- **inference-runtime-selection** — Inference runtime selection.
- **endpoint-slo-design** — Endpoint slo design.
- **autoscaling-design** — Autoscaling design.
- **batching-concurrency-tuning** — Batching concurrency tuning.
- **canary-deployment-design** — Canary deployment design.
- **shadow-deployment-design** — Shadow deployment design.
- **fallback-design** — Fallback design.
- **model-load-health-design** — Model load health design.
- **tail-latency-analysis** — Tail latency analysis.
- **serving-compatibility-testing** — Serving compatibility testing.

## Batch Inference

- **batch-inference-design** — Batch inference design.
- **async-inference-design** — Async inference design.
- **idempotency-design** — Idempotency design.
- **partitioning-strategy** — Partitioning strategy.
- **result-reconciliation** — Result reconciliation.
- **queue-retention-design** — Queue retention design.
- **batch-capacity-planning** — Batch capacity planning.
- **retry-deduplication-analysis** — Retry deduplication analysis.
- **large-rerun-planning** — Large rerun planning.
- **batch-observability-design** — Batch observability design.

## Gpu Platform

- **gpu-inventory-analysis** — Gpu inventory analysis.
- **gpu-operator-management** — Gpu operator management.
- **driver-cuda-compatibility** — Driver cuda compatibility.
- **mig-policy-design** — Mig policy design.
- **gpu-sharing-analysis** — Gpu sharing analysis.
- **gpu-telemetry-analysis** — Gpu telemetry analysis.
- **gpu-fragmentation-analysis** — Gpu fragmentation analysis.
- **gpu-capacity-planning** — Gpu capacity planning.
- **gpu-quota-design** — Gpu quota design.
- **accelerator-recovery-planning** — Accelerator recovery planning.

## Scheduling

- **workload-queue-design** — Workload queue design.
- **fair-share-design** — Fair share design.
- **priority-policy-design** — Priority policy design.
- **gang-scheduling-design** — Gang scheduling design.
- **topology-aware-placement** — Topology aware placement.
- **quota-analysis** — Quota analysis.
- **pending-time-analysis** — Pending time analysis.
- **preemption-analysis** — Preemption analysis.
- **resource-sizing-analysis** — Resource sizing analysis.
- **maintenance-scheduling** — Maintenance scheduling.

## Supply Chain

- **base-image-governance** — Base image governance.
- **container-build-reproducibility** — Container build reproducibility.
- **sbom-generation** — Sbom generation.
- **image-vulnerability-analysis** — Image vulnerability analysis.
- **artifact-signature-verification** — Artifact signature verification.
- **provenance-validation** — Provenance validation.
- **registry-immutability** — Registry immutability.
- **package-source-policy** — Package source policy.
- **model-source-policy** — Model source policy.
- **artifact-retention-analysis** — Artifact retention analysis.

## Cicd Promotion

- **ml-ci-design** — Ml ci design.
- **ml-cd-design** — Ml cd design.
- **candidate-manifest-generation** — Candidate manifest generation.
- **promotion-gate-design** — Promotion gate design.
- **payload-hash-generation** — Payload hash generation.
- **nonprod-auto-promotion** — Nonprod auto promotion.
- **production-approval-binding** — Production approval binding.
- **rollback-reference-validation** — Rollback reference validation.
- **post-promotion-verification** — Post promotion verification.
- **promotion-audit-analysis** — Promotion audit analysis.

## Observability

- **otel-instrumentation-design** — Otel instrumentation design.
- **genai-tracing-design** — Genai tracing design.
- **token-metric-design** — Token metric design.
- **cost-telemetry-design** — Cost telemetry design.
- **sensitive-content-telemetry-policy** — Sensitive content telemetry policy.
- **trace-correlation-design** — Trace correlation design.
- **cardinality-analysis** — Cardinality analysis.
- **sampling-design** — Sampling design.
- **dashboard-design** — Dashboard design.
- **alert-design** — Alert design.

## Model Monitoring

- **data-drift-analysis** — Data drift analysis.
- **feature-drift-analysis** — Feature drift analysis.
- **prediction-drift-analysis** — Prediction drift analysis.
- **quality-regression-analysis** — Quality regression analysis.
- **delayed-label-analysis** — Delayed label analysis.
- **fallback-overuse-analysis** — Fallback overuse analysis.
- **rag-quality-monitoring** — Rag quality monitoring.
- **llm-safety-monitoring** — Llm safety monitoring.
- **retraining-trigger-design** — Retraining trigger design.
- **model-health-review** — Model health review.

## Security

- **workload-identity-design** — Workload identity design.
- **least-privilege-review** — Least privilege review.
- **tenant-isolation-review** — Tenant isolation review.
- **network-egress-policy** — Network egress policy.
- **secret-reference-design** — Secret reference design.
- **model-provenance-review** — Model provenance review.
- **artifact-poisoning-analysis** — Artifact poisoning analysis.
- **serving-hardening** — Serving hardening.
- **agent-tool-security** — Agent tool security.
- **ai-platform-incident-security** — Ai platform incident security.

## Governance

- **model-card-gate** — Model card gate.
- **system-card-gate** — System card gate.
- **risk-tier-classification** — Risk tier classification.
- **approval-workflow-design** — Approval workflow design.
- **governance-evidence-linking** — Governance evidence linking.
- **exception-expiry-management** — Exception expiry management.
- **prohibited-use-check** — Prohibited use check.
- **human-oversight-check** — Human oversight check.
- **audit-evidence-packaging** — Audit evidence packaging.
- **policy-version-governance** — Policy version governance.

## Finops

- **gpu-cost-allocation** — Gpu cost allocation.
- **inference-cost-allocation** — Inference cost allocation.
- **provider-cost-analysis** — Provider cost analysis.
- **vector-cost-analysis** — Vector cost analysis.
- **storage-cost-analysis** — Storage cost analysis.
- **idle-resource-detection** — Idle resource detection.
- **rightsizing-analysis** — Rightsizing analysis.
- **budget-alert-design** — Budget alert design.
- **cost-per-request-analysis** — Cost per request analysis.
- **managed-vs-self-hosted-tco** — Managed vs self hosted tco.

## Reliability

- **platform-slo-design** — Platform slo design.
- **registry-backup-design** — Registry backup design.
- **artifact-store-dr** — Artifact store dr.
- **serving-failover-design** — Serving failover design.
- **provider-outage-fallback** — Provider outage fallback.
- **control-plane-degradation-analysis** — Control plane degradation analysis.
- **recovery-test-design** — Recovery test design.
- **dr-exercise-planning** — Dr exercise planning.
- **reliability-gap-tracking** — Reliability gap tracking.
- **recovery-evidence-validation** — Recovery evidence validation.

## Incidents

- **incident-triage** — Incident triage.
- **blast-radius-analysis** — Blast radius analysis.
- **release-correlation** — Release correlation.
- **bounded-production-diagnostics** — Bounded production diagnostics.
- **mitigation-option-analysis** — Mitigation option analysis.
- **rollback-readiness-analysis** — Rollback readiness analysis.
- **recovery-verification** — Recovery verification.
- **incident-timeline-authoring** — Incident timeline authoring.
- **stakeholder-update-drafting** — Stakeholder update drafting.
- **post-incident-action-design** — Post incident action design.

## Developer Experience

- **golden-path-design** — Golden path design.
- **self-service-onboarding** — Self service onboarding.
- **sdk-governance** — Sdk governance.
- **cli-governance** — Cli governance.
- **sandbox-design** — Sandbox design.
- **platform-doc-design** — Platform doc design.
- **developer-friction-analysis** — Developer friction analysis.
- **template-versioning** — Template versioning.
- **breaking-change-analysis** — Breaking change analysis.
- **platform-adoption-analysis** — Platform adoption analysis.

## Upgrades Audit

- **compatibility-matrix-management** — Compatibility matrix management.
- **platform-release-note-analysis** — Platform release note analysis.
- **deprecation-detection** — Deprecation detection.
- **upgrade-test-planning** — Upgrade test planning.
- **crd-migration-analysis** — Crd migration analysis.
- **control-plane-upgrade-planning** — Control plane upgrade planning.
- **synthetic-platform-validation** — Synthetic platform validation.
- **permission-review** — Permission review.
- **stale-resource-review** — Stale resource review.
- **platform-maturity-assessment** — Platform maturity assessment.
