package bm_agents.ai_ml_engineer

default allow := false

# Read-only operations are allowed only when project and environment scope match.
allow if {
  input.action_class == "read"
  input.project_authorized == true
  input.environment_authorized == true
}

# Non-production deterministic execution is allowed inside approved bounds.
allow if {
  input.action_class == "nonprod_execute"
  input.project_authorized == true
  input.environment != "production"
  input.data_authorized == true
  input.compute_within_budget == true
  not input.raw_secret_requested
}

# External writes require a payload-bound approval.
allow if {
  input.action_class == "external_write"
  input.project_authorized == true
  input.approval.valid == true
  input.approval.payload_hash == input.payload_hash
  input.approval.not_expired == true
}

# Production mutations are never performed by the free-form agent.
deny_reason contains "free-form production mutation denied" if {
  input.environment == "production"
  input.action_class == "mutation"
}

deny_reason contains "raw secrets denied" if input.raw_secret_requested

deny_reason contains "self approval denied" if input.approval.approver_id == input.agent_id

deny_reason contains "risk acceptance is human owned" if input.action in {"accept-risk", "waive-safety-gate", "waive-fairness-gate", "waive-security-gate"}

deny_reason contains "high impact AI decision requires accountable human" if {
  input.risk_tier in {"high", "restricted"}
  input.action in {"approve-model", "release-model", "change-decision-policy"}
}

deny_reason contains "sensitive training data not authorized" if {
  input.action in {"train", "fine-tune"}
  input.data_sensitive == true
  input.data_owner_approval != true
}

deny_reason contains "active security testing not authorized" if {
  input.action_class == "active_security_test"
  input.security_scope_approval != true
}
