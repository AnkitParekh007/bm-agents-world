# MLOps / AI Platform Agent — Supervisor and Sub-Agent Architecture

The supervisor delegates specialized analysis while retaining scope, policy, evidence, and decision-pack ownership. Specialists never receive broader permissions than the parent run.

## Agent registry

### MLOps / AI Platform Supervisor
Owns scope, orchestration, policy, evidence, delegation, and final platform recommendations.
- ID: `mlops-ai-platform-supervisor`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Platform Context Agent
Builds authorized project, environment, tenant, cluster, registry, data, and service context.
- ID: `platform-context-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Platform Architecture Agent
Maintains reference architecture, tenancy, control-plane/data-plane boundaries, and platform ADRs.
- ID: `platform-architecture-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Experiment Tracking Agent
Operates tracking, run metadata, lineage, retention, and reproducibility controls.
- ID: `experiment-tracking-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Model & Prompt Registry Agent
Governs models, prompts, agents, scorers, aliases, lifecycle states, and immutable identities.
- ID: `model-registry-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Training Pipeline Agent
Designs and validates reusable training and evaluation pipelines.
- ID: `training-pipeline-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Feature Platform Agent
Coordinates feature-store interfaces, freshness, consistency, schemas, and access.
- ID: `feature-platform-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Evaluation Platform Agent
Operates evaluation datasets, scorers, regression gates, judges, and review queues.
- ID: `evaluation-platform-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### LLM & Agent Platform Agent
Operates model gateways, provider routing, prompt/tool lifecycle, agent sandboxes, and quotas.
- ID: `llm-agent-platform-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### RAG & Vector Platform Agent
Governs vector infrastructure, embeddings, index lifecycle, authorization, freshness, and migrations.
- ID: `rag-vector-platform-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Model Serving Agent
Designs and validates real-time inference, autoscaling, canary, fallback, and endpoint health.
- ID: `model-serving-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Batch & Async Inference Agent
Governs batch, queue-based, scheduled, and asynchronous inference execution patterns.
- ID: `batch-inference-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### GPU & Accelerator Platform Agent
Manages accelerator inventory, GPU operator/driver compatibility, telemetry, sharing, and capacity.
- ID: `gpu-platform-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Workload Scheduling Agent
Manages queues, quotas, priority, gang scheduling, topology, and resource fairness.
- ID: `workload-scheduling-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Supply Chain Agent
Governs containers, SBOMs, provenance, signatures, package/model sources, and artifact immutability.
- ID: `supply-chain-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### ML CI/CD & Promotion Agent
Builds deterministic promotion pipelines and exact candidate release manifests.
- ID: `ml-cicd-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Observability Agent
Operates traces, metrics, logs, token/cost telemetry, dashboards, alerting, and schema governance.
- ID: `ai-observability-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Model Monitoring & Drift Agent
Coordinates drift, production quality signals, delayed labels, model-health reviews, and retraining recommendations.
- ID: `model-monitoring-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Platform Security Agent
Enforces workload identity, network boundaries, secrets, tenant isolation, provenance, and secure runtime controls.
- ID: `ai-platform-security-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Responsible AI Platform Agent
Enforces governance metadata, risk-tier gates, evidence, human decision ownership, and exception expiry.
- ID: `responsible-ai-platform-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI FinOps Agent
Analyzes GPU, model-provider, training, inference, vector, storage, and observability cost.
- ID: `ai-finops-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Platform Reliability Agent
Defines SLOs, recovery, backups, provider fallback, and disaster-recovery readiness.
- ID: `platform-reliability-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Platform Incident Agent
Coordinates evidence, blast radius, diagnostics, mitigation proposals, recovery verification, and post-incident learning.
- ID: `ai-platform-incident-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Platform Developer Experience Agent
Maintains self-service golden paths, SDKs, templates, onboarding, and platform usability.
- ID: `developer-experience-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### AI Platform Upgrade Agent
Tracks compatibility, deprecations, security advisories, upgrade testing, and migration plans.
- ID: `platform-upgrade-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Independent Platform Review Agent
Independently reviews high-risk platform changes, model promotions, and production-action bundles.
- ID: `independent-platform-review-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited

### Policy & Evidence Agent
Enforces approval policy, evidence completeness, audit trails, and denial of prohibited actions.
- ID: `policy-evidence-agent`
- Raw secrets: prohibited
- Production free-form mutation: prohibited
