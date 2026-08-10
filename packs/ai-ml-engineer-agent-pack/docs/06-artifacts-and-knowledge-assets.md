# Artifacts and Knowledge Assets

Artifacts make AI/ML work reproducible, reviewable, and auditable. Every material model claim must be traceable to immutable evidence.

| ID | Artifact | Purpose |
|---|---|---|
| `ai-use-case-brief` | AI Use Case Brief | Business problem, expected outcome, baseline, risk tier, constraints, owners, and success metrics. |
| `dataset-card` | Dataset Card | Provenance, schema, scope, quality, classification, permitted use, limitations, and lineage. |
| `data-readiness-report` | Data Readiness Report | Profiling, leakage, split, label, bias, provenance, and readiness findings. |
| `feature-specification` | Feature Specification | Feature definitions, transformations, freshness, ownership, and train-serving contract. |
| `experiment-plan` | Experiment Plan | Hypothesis, baseline, metrics, guardrails, datasets, configuration, and stopping rules. |
| `experiment-report` | Experiment Report | Run comparison, uncertainty, artifacts, results, limitations, and decision rationale. |
| `model-card` | Model Card / System Card | Intended use, model/data lineage, metrics, limitations, risks, oversight, and deployment context. |
| `evaluation-plan` | Evaluation Plan | Golden sets, metrics, cohorts, robustness, safety, human evaluation, and promotion gates. |
| `evaluation-report` | Evaluation Report | Candidate-bound task, quality, safety, robustness, fairness, and operational evidence. |
| `responsible-ai-assessment` | Responsible AI Assessment | Harms, fairness, explainability, uncertainty, oversight, and contestability analysis. |
| `threat-model` | AI Threat Model | Assets, trust boundaries, threats, abuse cases, mitigations, and security-test requirements. |
| `rag-design` | RAG Design | Knowledge sources, ingestion, chunking, embeddings, retrieval, reranking, authorization, and freshness. |
| `rag-evaluation-report` | RAG Evaluation Report | Retrieval recall/precision, ranking, grounding, citations, injection resistance, and failure analysis. |
| `prompt-specification` | Prompt and Tool Specification | Versioned prompts, schemas, tool contracts, model settings, and validation rules. |
| `fine-tuning-plan` | Fine-Tuning Plan | Base model, data, adaptation method, evaluation, safety, compute, and rollback strategy. |
| `training-runbook` | Training Runbook | Environment, datasets, commands, compute, checkpoints, recovery, and reproducibility. |
| `model-registry-record` | Model Registry Record | Immutable model identity, hashes, lineage, stage, approvals, and compatibility metadata. |
| `serving-design` | Inference Serving Design | Serving pattern, schema, SLOs, scaling, caching, guardrails, health checks, and rollback. |
| `ml-pipeline-design` | ML Pipeline Design | Training, evaluation, packaging, registry, promotion, and deployment stages. |
| `model-monitoring-plan` | Model Monitoring Plan | Service, input, drift, quality, cost, safety, and ground-truth monitoring. |
| `drift-review` | Drift and Model Health Review | Current drift, task success, incident, cost, and retraining evidence. |
| `performance-cost-report` | Performance and Cost Report | Latency, throughput, memory, accelerator use, cost, and quality-cost frontier. |
| `security-review` | AI/ML Security Review | Security scan and threat-model findings, severity, remediation, and verification. |
| `release-readiness-report` | AI/ML Release Readiness Report | Candidate identity, gates, risks, rollback, observation, and approval evidence. |
| `production-action-request` | Production Model Action Request | Payload-bound request for model promotion, traffic, endpoint, index, or monitored action. |
| `rollback-plan` | Model Rollback Plan | Known-good candidate, compatible dependencies, triggers, steps, and verification. |
| `post-release-review` | Post-Release Model Review | Outcome, reliability, drift, cost, support, safety, and follow-up actions. |
| `evidence-bundle` | AI/ML Evidence Bundle | Immutable hashes and references for data, code, model, evaluation, policy, approvals, and release evidence. |

## Evidence binding
Production candidate artifacts should bind: source revision, environment lock/containers, dataset snapshots, feature code, base-model revision, prompt/retrieval versions, model digest, evaluation datasets, evaluation results, security review, responsible-AI review, runtime benchmarks, approvals, and rollback candidate.
