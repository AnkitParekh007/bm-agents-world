package product_manager_agent

default allow := false

publish_actions := {
  "jira_publish", "jpd_publish", "roadmap_publish", "confluence_publish",
  "teams_publish", "metric_definition_publish", "release_communication_publish"
}

customer_actions := {
  "contact_customer", "contact_prospect", "launch_survey", "launch_beta",
  "launch_research", "send_customer_communication"
}

experiment_actions := {
  "create_experiment", "launch_experiment", "ramp_experiment"
}

allow if {
  input.action == "public_market_read"
}

allow if {
  input.action in {"jira_read", "confluence_read", "jpd_read", "roadmap_read", "repo_read", "figma_read", "release_status_read"}
  scope_ok
}

allow if {
  input.action == "analytics_aggregate_read"
  scope_ok
  input.read_only == true
  input.privacy_threshold_met == true
  input.metric_approved == true
}

allow if {
  input.action == "customer_evidence_read"
  scope_ok
  input.minimum_necessary == true
  input.identifiers_redacted == true
  input.purpose_bound == true
}

allow if {
  input.action in {"isolated_draft_write", "score_calculation", "scenario_calculation", "artifact_write"}
  scope_ok
  input.isolated == true
  input.externally_published == false
  input.contains_raw_customer_data == false
}

allow if {
  input.action in publish_actions
  scope_ok
  valid_approval
  input.payload_hash == input.approval.payload_hash
}

allow if {
  input.action in customer_actions
  scope_ok
  valid_approval
  input.customer_or_study_scope == input.approval.customer_or_study_scope
  input.consent_or_account_process_configured == true
}

allow if {
  input.action in experiment_actions
  scope_ok
  valid_approval
  input.experiment_id == input.approval.experiment_id
  input.production_mutation_performed_by_authorized_adapter == true
}

deny_reason[msg] if {
  input.raw_secret_requested == true
  msg := "raw credentials may not be exposed to the model"
}

deny_reason[msg] if {
  input.contains_raw_customer_data == true
  msg := "raw customer, participant, sales, support, or commercial records may not enter model context"
}

deny_reason[msg] if {
  input.action == "fabricate_evidence"
  msg := "fabricated customer quotes, analytics, market facts, or experiment results are prohibited"
}

deny_reason[msg] if {
  input.action in {"production_deploy", "production_flag_mutation", "production_data_mutation", "billing_mutation", "entitlement_mutation"}
  msg := "Product Manager Agent may not autonomously mutate production systems"
}

deny_reason[msg] if {
  input.action in {"approve_release", "make_contractual_commitment", "make_pricing_commitment", "make_roadmap_guarantee", "make_legal_commitment"}
  msg := "human authority is required for release, commercial, legal, and roadmap commitments"
}

deny_reason[msg] if {
  input.action in publish_actions
  not valid_approval
  msg := "official publication requires payload-bound approval"
}

deny_reason[msg] if {
  input.action in customer_actions
  not valid_approval
  msg := "customer-facing action requires scoped approval"
}

scope_ok if {
  input.project == input.authorization.project
  input.product_area == input.authorization.product_area
  input.environment == input.authorization.environment
  input.purpose == input.authorization.purpose
}

valid_approval if {
  input.approval.valid == true
  input.approval.run_id == input.run_id
  input.approval.project == input.project
  input.approval.product_area == input.product_area
  input.approval.action == input.action
  time.now_ns() < input.approval.expires_at_ns
}
