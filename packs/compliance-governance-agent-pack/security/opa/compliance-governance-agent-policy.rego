package compliance.governance

default allow := false

default reason := "denied by default"

# Read-only scoped operations are allowed when purpose and project are present.
allow if {
  input.scope.project != ""
  input.scope.purpose != ""
  input.operation in {"read", "analyze", "draft", "collect_bounded_evidence", "deterministic_control_test"}
  not input.requests_raw_secret
  not input.cross_tenant
}

# Official writes require an approval token bound to payload and scope.
allow if {
  input.operation in {"publish_policy", "write_grc", "post_jira", "post_confluence", "post_teams", "publish_customer_assurance"}
  input.approval.valid == true
  input.approval.payload_hash == input.payload_hash
  input.approval.project == input.scope.project
  input.approval.expires_at > input.now
}

# The agent may never accept risk, issue legal opinions, certify, notify regulators,
# change employment outcomes, or mutate production infrastructure/data.
deny_reason contains "human-only consequential decision" if {
  input.operation in {"accept_risk", "legal_interpretation", "certification_opinion", "regulatory_notification", "employment_decision"}
}

deny_reason contains "production mutation prohibited" if {
  input.environment == "production"
  input.operation in {"deploy", "rollback", "restart", "write_database", "change_iam", "change_network", "change_dns", "change_tls", "change_kubernetes", "change_secret", "change_feature_flag", "change_ai_traffic"}
}

deny_reason contains "raw secrets prohibited" if input.requests_raw_secret

deny_reason contains "cross-tenant evidence prohibited" if input.cross_tenant

deny_reason contains "self approval prohibited" if {
  input.approval.approver_id == input.agent_id
}
