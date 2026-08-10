# Orchestration and Workflows

The supervisor builds a stateful plan, runs deterministic gates, delegates specialist analysis, and converges through independent review and approval.

## Story to AI/ML Solution Design

**Trigger:** approved work item

**Flow:**
1. `authorize-scope` — `policy-agent` — `ai-ml.governance.project-scope-enforcement`, `ai-ml.governance.environment-scope-enforcement`
2. `frame-problem` — `work-context-agent` — `ai-ml.problem-framing.ml-suitability-assessment`, `ai-ml.problem-framing.business-metric-definition`
3. `assess-data` — `data-readiness-agent` — `ai-ml.data-readiness.dataset-discovery`, `ai-ml.data-readiness.data-leakage-detection`
4. `parallel-design` — `ai-ml-supervisor` — `ai-ml.classical-ml.model-interpretation`, `ai-ml.llm-genai.prompt-engineering`, `ai-ml.rag.retrieval-evaluation`
5. `risk-review` — `responsible-ai-agent` — `ai-ml.responsible-ai.harm-analysis`, `ai-ml.responsible-ai.human-oversight-design`
6. `independent-review` — `independent-review-agent` — `ai-ml.governance.independent-review-routing`
7. `produce-artifacts` — `evidence-agent` — `ai-ml.governance.audit-evidence-hashing`

**Outputs:** `ai-use-case-brief`, `data-readiness-report`, `experiment-plan`, `evaluation-plan`

## Model Experiment and Evaluation

**Trigger:** approved experiment plan

**Flow:**
1. `freeze-data` — `data-readiness-agent` — `ai-ml.data-readiness.dataset-snapshotting`
2. `train-candidates` — `experiment-agent` — `ai-ml.experimentation.experiment-tracking`, `ai-ml.experimentation.holdout-governance`
3. `evaluate` — `evaluation-agent` — `ai-ml.evaluation.regression-suite-design`, `ai-ml.evaluation.promotion-gate-design`
4. `responsible-ai` — `responsible-ai-agent` — `ai-ml.responsible-ai.fairness-assessment`, `ai-ml.responsible-ai.abstention-policy`
5. `security` — `ai-security-agent` — `ai-ml.ai-security.ai-threat-modeling`, `ai-ml.ai-security.model-provenance-verification`
6. `performance` — `performance-cost-agent` — `ai-ml.performance-cost.quality-cost-frontier`
7. `independent-review` — `independent-review-agent` — `ai-ml.governance.independent-review-routing`

**Outputs:** `experiment-report`, `evaluation-report`, `responsible-ai-assessment`, `security-review`, `performance-cost-report`

## LLM / RAG System Implementation

**Trigger:** approved generative AI design

**Flow:**
1. `source-governance` — `data-governance-agent` — `ai-ml.data-governance.purpose-limitation`, `ai-ml.data-governance.dataset-access-control`
2. `rag-design` — `rag-knowledge-agent` — `ai-ml.rag.document-ingestion`, `ai-ml.rag.retrieval-access-control`
3. `prompt-tool-design` — `llm-genai-agent` — `ai-ml.llm-genai.system-prompt-versioning`, `ai-ml.llm-genai.tool-contract-design`
4. `integration` — `integration-agent` — `ai-ml.integration.tool-api-contracts`, `ai-ml.integration.timeout-retry-design`
5. `evaluate` — `evaluation-agent` — `ai-ml.evaluation.llm-rubric-design`, `ai-ml.evaluation.judge-calibration`
6. `security` — `ai-security-agent` — `ai-ml.ai-security.prompt-injection-testing`, `ai-ml.ai-security.retrieval-poisoning-analysis`
7. `independent-review` — `independent-review-agent` — `ai-ml.governance.independent-review-routing`

**Outputs:** `rag-design`, `prompt-specification`, `rag-evaluation-report`, `threat-model`, `evaluation-report`

## Fine-Tuning and Model Adaptation

**Trigger:** approved fine-tuning proposal

**Flow:**
1. `justify-adaptation` — `fine-tuning-agent` — `ai-ml.fine-tuning.fine-tune-suitability`
2. `govern-data` — `data-governance-agent` — `ai-ml.fine-tuning.training-data-governance`, `ai-ml.data-governance.license-compliance`
3. `train` — `fine-tuning-agent` — `ai-ml.fine-tuning.sft-dataset-design`, `ai-ml.fine-tuning.checkpoint-lineage`
4. `evaluate-regressions` — `evaluation-agent` — `ai-ml.fine-tuning.catastrophic-forgetting-eval`, `ai-ml.fine-tuning.safety-regression-eval`
5. `register` — `model-registry-agent` — `ai-ml.model-registry.model-registration`, `ai-ml.model-registry.artifact-digesting`
6. `independent-review` — `independent-review-agent` — `ai-ml.governance.independent-review-routing`

**Outputs:** `fine-tuning-plan`, `training-runbook`, `experiment-report`, `evaluation-report`, `model-registry-record`

## Model Release and Monitoring

**Trigger:** approved candidate

**Flow:**
1. `verify-candidate` — `release-agent` — `ai-ml.release.candidate-identity-verification`, `ai-ml.release.release-readiness-review`
2. `serving-readiness` — `serving-agent` — `ai-ml.serving.canary-design`, `ai-ml.serving.rollback-design`
3. `mlops-readiness` — `mlops-agent` — `ai-ml.mlops.model-promotion-gates`, `ai-ml.mlops.release-bundle-generation`
4. `independent-review` — `independent-review-agent` — `ai-ml.governance.independent-review-routing`
5. `human-approval` — `policy-agent` — `ai-ml.governance.approval-binding`
6. `authorized-execution` — `release-agent` — `ai-ml.governance.production-readonly-enforcement`
7. `observe` — `monitoring-agent` — `ai-ml.monitoring.llm-task-success-monitoring`, `ai-ml.monitoring.alert-design`
8. `evidence` — `evidence-agent` — `ai-ml.governance.audit-evidence-hashing`

**Outputs:** `release-readiness-report`, `production-action-request`, `rollback-plan`, `model-monitoring-plan`, `post-release-review`, `evidence-bundle`

## Execution policy
A workflow may automatically continue only while all actions remain within the authorized project/environment/data scope. External writes, high-impact decisions, active security testing, and production actions pause for payload-bound authorization.
