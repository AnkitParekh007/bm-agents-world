package customer_success_agent

default allow := false

publish_actions := {
  "crm_publish", "cs_platform_publish", "health_override_publish", "risk_status_publish",
  "qbr_publish", "renewal_signal_publish", "expansion_signal_publish", "teams_publish"
}

customer_contact_actions := {
  "send_customer_email", "schedule_customer_meeting", "send_customer_message",
  "launch_customer_survey", "request_reference", "request_advocacy"
}

allow if {
  input.action in {"jira_read", "confluence_read", "crm_read", "cs_platform_read", "support_read", "release_status_read", "documentation_read"}
  scope_ok
  input.read_only == true
  input.minimum_necessary == true
}

allow if {
  input.action in {"usage_aggregate_read", "health_input_read", "customer_feedback_read", "incident_status_read"}
  scope_ok
  input.read_only == true
  input.tenant_isolated == true
  input.minimum_necessary == true
}

allow if {
  input.action in {"isolated_draft_write", "artifact_write", "health_calculation", "value_calculation", "scenario_calculation"}
  scope_ok
  input.isolated == true
  input.externally_published == false
  input.contains_raw_secret == false
  input.contains_cross_customer_data == false
}

allow if {
  input.action in publish_actions
  scope_ok
  valid_approval
  input.payload_hash == input.approval.payload_hash
}

allow if {
  input.action in customer_contact_actions
  scope_ok
  valid_approval
  input.customer_id == input.approval.customer_id
  input.payload_hash == input.approval.payload_hash
  input.communication_preference_ok == true
}

deny_reason[msg] if {
  input.raw_secret_requested == true
  msg := "raw credentials may not be exposed to the model"
}

deny_reason[msg] if {
  input.contains_cross_customer_data == true
  msg := "cross-customer or cross-tenant data mixing is prohibited"
}

deny_reason[msg] if {
  input.contains_unbounded_customer_export == true
  msg := "unbounded customer/contact/support/usage exports are prohibited"
}

deny_reason[msg] if {
  input.uses_protected_or_sensitive_personal_attribute_for_scoring == true
  msg := "protected or inappropriate sensitive personal attributes may not be used for customer health, risk, or growth scoring"
}

deny_reason[msg] if {
  input.action in {"make_pricing_commitment", "make_discount_commitment", "negotiate_contract", "approve_renewal", "approve_expansion", "grant_credit", "issue_refund", "change_entitlement", "make_sla_commitment", "make_legal_commitment"}
  msg := "commercial, contractual, billing, and legal decisions remain human-owned"
}

deny_reason[msg] if {
  input.action in {"production_deploy", "production_data_mutation", "production_config_mutation", "production_feature_flag_mutation", "iam_mutation", "network_mutation", "kubernetes_mutation", "secret_mutation"}
  msg := "Customer Success Agent may not autonomously mutate production systems"
}

deny_reason[msg] if {
  input.action == "fabricate_customer_evidence"
  msg := "fabricated customer quotes, usage, outcomes, commitments, incident facts, or approvals are prohibited"
}

deny_reason[msg] if {
  input.action in publish_actions
  not valid_approval
  msg := "official customer-success publication requires payload-bound approval"
}

deny_reason[msg] if {
  input.action in customer_contact_actions
  not valid_approval
  msg := "customer contact requires account-scoped payload-bound approval"
}

scope_ok if {
  input.project == input.authorization.project
  input.customer_id == input.authorization.customer_id
  input.environment == input.authorization.environment
  input.purpose == input.authorization.purpose
}

valid_approval if {
  input.approval.valid == true
  input.approval.run_id == input.run_id
  input.approval.project == input.project
  input.approval.customer_id == input.customer_id
  input.approval.action == input.action
  time.now_ns() < input.approval.expires_at_ns
}
