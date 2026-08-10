package bm_agent_foundry.scrum_master

import rego.v1

default allow := false

default require_approval := false

default reason := "Denied by Scrum Master Agent policy"

production_mutations := {
  "deploy", "rollback", "feature_flag_write", "experiment_launch", "database_write",
  "infrastructure_apply", "kubernetes_write", "iam_write", "dns_write", "tls_write",
  "secret_write", "production_config_write", "merge_pull_request", "force_push",
  "repository_write", "pipeline_execute"
}

employment_decisions := {
  "performance_rating", "promotion_decision", "compensation_decision", "disciplinary_decision",
  "termination_decision", "hiring_decision", "candidate_rejection", "individual_productivity_score"
}

scrum_accountability_violations := {
  "assign_sprint_work", "own_sprint_backlog", "estimate_for_developers", "commit_for_developers",
  "order_product_backlog", "approve_product_scope", "approve_release", "accept_residual_risk"
}

approval_actions := {
  "calendar_write", "jira_create", "jira_update", "jira_transition", "confluence_publish",
  "teams_post", "impediment_escalate", "survey_launch", "retrospective_publish",
  "team_health_publish", "working_agreement_publish", "workflow_policy_change"
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
  input.approval.team == input.scope.team
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.action in production_mutations
  msg := "Free-form Scrum Master Agent cannot mutate production or engineering systems"
}

deny contains msg if {
  input.action in employment_decisions
  msg := "Employment and individual performance decisions are prohibited"
}

deny contains msg if {
  input.action in scrum_accountability_violations
  msg := "Action would violate Product Owner, Developers, or accountable human ownership"
}

deny contains msg if {
  input.metrics.individual_level == true
  msg := "Individual-level productivity or collaboration scoring is prohibited"
}

deny contains msg if {
  input.resource in {"private_messages", "compensation", "medical_data", "disciplinary_records", "protected_attributes"}
  msg := "Sensitive people data is outside Scrum Master Agent scope"
}

deny contains msg if {
  input.resource == "retrospective_evidence"
  input.data.redacted != true
  msg := "Retrospective evidence must be redacted before model use or broad publication"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated team feedback, metrics, decisions, impediments, or Scrum evidence is prohibited"
}
