# Diagram Input Specification

Use this file as the source for future Mermaid architecture and execution-flow diagrams.

## Architecture layers
1. **Human control:** AI/ML Engineer, Product Owner/Manager, Data Owner, Security, Architecture, Release/Operations approvers.
2. **AI/ML control plane:** Supervisor, Policy Agent, Evidence Agent, Independent Review Agent.
3. **Specialist plane:** Data, Feature, Classical ML, Deep Learning, Multimodal, LLM, RAG, Fine-Tuning, Experiment, Evaluation, Responsible AI, Security, Serving, MLOps, Monitoring, Cost.
4. **MCP/adapters:** Jira/Confluence, Bitbucket, Data Catalog, Warehouse, Object Storage, Experiment Tracker, Model Registry, Feature Store, Compute, Model Provider, Vector Search, Evaluation, Observability, Security, Vault, Policy/Approval.
5. **Artifact plane:** datasets, features, experiments, prompts, models, evaluations, model cards, security reviews, release bundles, monitoring reviews.
6. **Environment plane:** local -> playground -> QA/validation -> approved production deployment.

## Main flow
`Work item -> authorize -> frame problem -> assess data -> choose approach -> experiment -> evaluate -> responsible-AI/security review -> independent review -> register candidate -> release readiness -> human approval -> deterministic deployment -> monitor -> feedback/retrain/retire`

## Mandatory decision diamonds
- Is ML justified?
- Is data permitted and sufficient?
- Is this a high-impact use case?
- Does candidate beat baseline?
- Do safety/security/responsible-AI gates pass?
- Is production approval present and payload-matched?
- Are stop conditions triggered after rollout?
