# MLOps / AI Platform Agent Pack

A governed agent pack for building and operating shared AI/ML lifecycle infrastructure: experiment tracking, registries, training/evaluation pipelines, LLM/agent platforms, RAG/vector infrastructure, model serving, GPU scheduling, observability, monitoring, security, FinOps and controlled production promotion.

## Core rule

**The AI/ML Engineer owns model behavior and experimentation. The MLOps / AI Platform Agent owns the platform, lifecycle automation and operational controls.** Production promotion and platform mutation remain behind deterministic execution and payload-bound approval.

## Pack structure

- `docs/` — operating model and architecture guidance
- `config/` — machine-readable registries and policy matrices
- `workflows/` — five executable orchestration definitions
- `schemas/` — JSON contracts for context, promotion, evaluation, capacity, readiness, change and incident outputs
- `security/opa/` — baseline policy-as-code
- `templates/` — reusable operational artifacts
- `checklists/` — onboarding and MVP-readiness controls

See `FILE-INVENTORY.md` for all 48 files.
