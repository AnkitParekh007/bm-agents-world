# Observability, Audit, and Evaluation

## Three evidence planes
1. **Software/service:** latency, availability, errors, saturation, resource usage, and cost.
2. **Model/system behavior:** task metrics, calibration, robustness, safety, abstention, citations, tool success, retrieval performance, and human feedback.
3. **Governance:** model/data/prompt versions, approvals, risk tier, policy decisions, exceptions, and evidence hashes.

Evaluation datasets and metrics are versioned artifacts. Model-based judges require calibration against human-reviewed examples and may not be treated as ground truth by default. Production monitoring must distinguish actionable degradation from harmless statistical drift.
