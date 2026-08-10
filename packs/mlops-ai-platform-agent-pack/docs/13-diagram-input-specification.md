# Diagram Input Specification

Use this file as the source for the future Mermaid architecture and complete flow diagrams.

## Architecture layers

1. **Users & role packs:** AI/ML Engineer, Data Engineer, developers, Product, QA, Security, SRE, DevOps, Compliance.
2. **MLOps / AI Platform Supervisor:** scope, orchestration, evidence, policy and approvals.
3. **Specialist agents:** tracking, registry, pipelines, evaluation, LLM/agents, RAG/vector, serving, GPU, scheduling, observability, monitoring, security, governance, FinOps, reliability and upgrades.
4. **Policy & identity plane:** OPA, approval service, capability broker, workload identity, vault.
5. **Platform services:** MLflow, Kubeflow/Pipelines, KServe, feature store, vector DB, model gateway, artifact registry, object storage, Kubernetes, GPU Operator, telemetry.
6. **Environments:** sandbox/development, QA/staging, production.
7. **External systems:** Bitbucket/Jira, model providers, cloud services, data platforms and observability backends.

## Main lifecycle flow

Request → Scope → Context → Build/Experiment → Track → Evaluate → Register → Package → Security/Governance Review → Promotion Request → Approval → Deterministic Deploy → Observe → Verify → Monitor → Rollback/Retrain/Retire decision.

## Production mutation boundary

Show a red/critical boundary between the free-form agent and the deterministic production executor. The agent produces an immutable request; it does not directly mutate production.
