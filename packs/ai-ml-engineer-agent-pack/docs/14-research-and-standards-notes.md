# Research and Standards Notes

## Current reference baseline (August 2026)
- NIST AI RMF 1.0 remains a foundational voluntary AI risk-management framework; NIST is working on revisions and additional profiles.
- NIST AI 600-1 provides the Generative AI Profile for AI RMF risk management.
- OWASP Top 10 for LLM Applications 2025 is used as a generative-AI application-security awareness baseline alongside normal application security.
- MLflow 3.x has expanded evaluation, tracing, review, registry, and agent-oriented capabilities; the organization should still use its approved experiment/model platform rather than hard-coding MLflow.
- scikit-learn 1.9.0 documentation is current in June 2026; repository-pinned versions always override.
- PyTorch stable documentation currently lists 2.9.0; repository and accelerator compatibility override latest-version assumptions.
- Hugging Face Transformers has moved into the v5 line; model and library revision pinning is mandatory.

## Principles
Treat model, data, prompt, retrieval, evaluation, and deployment versions as one system. Do not promote a candidate based only on a single benchmark. Evaluate task utility, security, human impact, operational behavior, cost, and rollback readiness.
