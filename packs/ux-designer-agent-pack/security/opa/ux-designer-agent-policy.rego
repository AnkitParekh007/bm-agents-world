package ux_designer_agent

default allow := false

shared_publication_actions := {
  "figma_shared_write", "figma_branch_merge", "publish_component", "publish_variables",
  "publish_library", "jira_publish", "confluence_publish", "teams_publish"
}

participant_actions := {
  "recruit_participant", "contact_participant", "record_session", "launch_survey",
  "launch_unmoderated_test", "issue_incentive"
}

allow if {
  input.action == "public_standard_read"
}

allow if {
  input.action in {"jira_read", "confluence_read", "figma_read", "repo_read", "storybook_read"}
  scope_ok
}

allow if {
  input.action == "research_redacted_read"
  scope_ok
  input.consent_allows_use == true
  input.pii_redacted == true
  input.purpose_bound == true
}

allow if {
  input.action == "analytics_aggregate_read"
  scope_ok
  input.read_only == true
  input.privacy_threshold_met == true
}

allow if {
  input.action in {"isolated_design_write", "prototype_write", "artifact_write"}
  scope_ok
  input.isolated == true
  input.shared_library == false
  input.contains_raw_pii == false
}

allow if {
  input.action in shared_publication_actions
  scope_ok
  valid_approval
  input.payload_hash == input.approval.payload_hash
}

allow if {
  input.action in participant_actions
  scope_ok
  valid_approval
  input.study_id == input.approval.study_id
  input.consent_process_configured == true
}

allow if {
  input.action == "production_screenshot"
  scope_ok
  valid_approval
  input.redaction_enabled == true
  input.minimum_necessary == true
}

deny_reason[msg] if {
  input.raw_secret_requested == true
  msg := "raw credentials may not be exposed to the model"
}

deny_reason[msg] if {
  input.contains_raw_pii == true
  msg := "raw participant or production-user identifiers may not enter model context"
}

deny_reason[msg] if {
  input.action == "invent_research_evidence"
  msg := "fabricated participants, quotes, analytics, or findings are prohibited"
}

deny_reason[msg] if {
  input.action in {"production_app_mutation", "production_data_mutation", "feature_flag_mutation", "experiment_launch_unapproved"}
  msg := "UX agent may not autonomously mutate production applications, data, flags, or experiments"
}

deny_reason[msg] if {
  input.action in shared_publication_actions
  not valid_approval
  msg := "shared design or collaboration publication requires payload-bound approval"
}

deny_reason[msg] if {
  input.action in participant_actions
  not valid_approval
  msg := "participant-facing action requires study-specific approval"
}

scope_ok if {
  input.project == input.authorization.project
  input.product_area == input.authorization.product_area
  input.environment == input.authorization.environment
}

valid_approval if {
  input.approval.valid == true
  input.approval.run_id == input.run_id
  input.approval.project == input.project
  input.approval.action == input.action
  time.now_ns() < input.approval.expires_at_ns
}
