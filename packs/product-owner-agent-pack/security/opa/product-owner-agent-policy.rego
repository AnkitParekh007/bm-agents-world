package bm_agent_foundry.product_owner

import rego.v1

default allow := false

default require_approval := false

default reason := "Denied by Product Owner Agent policy"

production_mutations := {
  "deploy", "rollback", "feature_flag_write", "experiment_launch", "database_write",
  "infrastructure_apply", "kubernetes_write", "iam_write", "dns_write", "tls_write",
  "secret_write", "production_config_write", "merge_pull_request", "force_push"
}

human_only_decisions := {
  "final_business_acceptance", "final_release_approval", "residual_risk_acceptance",
  "pricing_commitment", "contractual_commitment", "budget_commitment", "guaranteed_delivery_date",
  "legal_interpretation", "staffing_decision"
}

approval_actions := {
  "jira_create", "jira_update", "jira_transition", "backlog_reorder", "confluence_publish",
  "teams_post", "customer_contact", "survey_launch", "research_launch", "beta_launch",
  "official_product_goal_publish", "official_priority_publish", "uat_record_publish"
}

allow if {
  input.action == "read"
  input.scope.authorized == true
  input.data.minimum_necessary == true
  input.connector.mode == "read_only"
}

allow if {
  input.action == "draft"
  input.scope.authorized == true
  input.destination == "isolated_artifact_workspace"
  not input.side_effect
}

allow if {
  input.action in approval_actions
  valid_approval
  input.scope.authorized == true
  input.payload_hash == input.approval.payload_hash
}

require_approval if input.action in approval_actions

valid_approval if {
  input.approval.present == true
  input.approval.status == "approved"
  input.approval.actor != input.agent.id
  input.approval.project == input.scope.project
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.action in production_mutations
  msg := "Free-form Product Owner Agent cannot mutate production or engineering systems"
}

deny contains msg if {
  input.action in human_only_decisions
  msg := "Decision is reserved for an accountable human"
}

deny contains msg if {
  input.resource == "sprint_backlog"
  input.action in {"own", "assign", "commit", "direct_implementation"}
  msg := "Developers own the Sprint Backlog and implementation plan"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated customer, analytics, estimate, decision, or acceptance evidence is prohibited"
}
