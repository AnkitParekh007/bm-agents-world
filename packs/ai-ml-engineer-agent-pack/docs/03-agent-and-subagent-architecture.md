# Agent and Sub-Agent Architecture

## Control plane
The **AI/ML Engineer Supervisor** owns plan construction, scope, delegation, checkpointing, evidence synthesis, and escalation. Specialist agents are stateless workers with narrow responsibilities. Deterministic plugins perform tests and computations; MCP adapters isolate external systems and credentials.

## Specialist agents
| ID | Agent | Responsibility |
|---|---|---|
| `ai-ml-supervisor` | AI/ML Engineer Supervisor | Coordinates the end-to-end AI/ML lifecycle, authorization, specialist delegation, evidence synthesis, and approvals. |
| `work-context-agent` | Work and Product Context Agent | Resolves business objective, use case, stakeholders, constraints, and acceptance outcomes. |
| `data-readiness-agent` | Data Readiness Agent | Assesses data sources, labels, quality, provenance, leakage, privacy, and split strategy. |
| `feature-engineering-agent` | Feature Engineering Agent | Designs reproducible features and train-serving-consistent transformations. |
| `classical-ml-agent` | Classical ML Agent | Builds and evaluates statistical, tree-based, ensemble, clustering, and anomaly models. |
| `deep-learning-agent` | Deep Learning Agent | Designs and trains neural models with accelerator-aware reproducibility and optimization. |
| `multimodal-agent` | NLP / Vision / Audio / Multimodal Agent | Handles modality-specific preprocessing, modeling, evaluation, and robustness. |
| `llm-genai-agent` | LLM and Generative AI Agent | Designs prompts, structured generation, model routing, guardrails, and generative workflows. |
| `rag-knowledge-agent` | RAG and Knowledge Systems Agent | Owns ingestion, retrieval, reranking, authorization, grounding, and RAG evaluation. |
| `fine-tuning-agent` | Fine-Tuning and Adaptation Agent | Evaluates and implements supervised, preference, adapter, and task-specific adaptation. |
| `experiment-agent` | Experimentation and Reproducibility Agent | Tracks hypotheses, runs, configurations, uncertainty, baselines, and reproducibility. |
| `evaluation-agent` | Model Evaluation Agent | Builds task, safety, regression, robustness, and human/model-judge evaluation suites. |
| `responsible-ai-agent` | Responsible AI Agent | Assesses harms, fairness, explainability, oversight, uncertainty, and system limitations. |
| `ai-security-agent` | AI Security and Red-Team Coordination Agent | Threat-models AI surfaces and coordinates authorized adversarial testing with security specialists. |
| `model-registry-agent` | Model Registry and Artifact Agent | Manages immutable model identity, lineage, cards, provenance, and promotion evidence. |
| `serving-agent` | Inference and Serving Agent | Designs model-serving contracts, performance, scaling, health checks, and rollback. |
| `mlops-agent` | MLOps Pipeline Agent | Builds reproducible training, validation, packaging, promotion, and deployment automation. |
| `monitoring-agent` | Model Monitoring and Drift Agent | Monitors model quality, drift, task success, inputs, costs, and delayed ground truth. |
| `performance-cost-agent` | Performance and Cost Agent | Optimizes training/inference efficiency, accelerator use, latency, throughput, and cost. |
| `data-governance-agent` | Data Governance and Privacy Agent | Enforces purpose limitation, minimization, lineage, retention, and governed AI data access. |
| `integration-agent` | AI Integration Agent | Defines application, API, event, tool, feature, and downstream integration contracts. |
| `testing-agent` | ML Testing Agent | Implements deterministic unit, data, model, contract, integration, and regression tests. |
| `documentation-agent` | AI/ML Documentation Agent | Maintains model cards, dataset cards, runbooks, architecture, experiment, and support docs. |
| `release-agent` | AI/ML Release Readiness Agent | Assembles candidate-bound release evidence and staged rollout recommendations. |
| `independent-review-agent` | Independent AI/ML Review Agent | Challenges assumptions, leakage, metric validity, safety, reproducibility, and release claims. |
| `evidence-agent` | Evidence and Audit Agent | Builds immutable evidence bundles with hashes, provenance, approvals, and decision records. |
| `policy-agent` | Policy Enforcement Agent | Applies scope, environment, data, model, security, and production-action guardrails. |

## Orchestration rules
- Resolve authorization, project, environment, risk tier, and data boundaries before specialist execution.
- Parallelize independent reviews such as security, responsible AI, quality, and performance.
- Require independent review when the same workflow created and evaluates a high-risk candidate.
- Bind every claim to dataset, model, prompt, retrieval, code, and environment versions.
- Keep final high-impact model release, risk acceptance, and production change authority with accountable humans.
