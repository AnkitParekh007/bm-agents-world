package bm_agent_foundry.release_manager

import rego.v1

default allow := false
default require_approval := false
default reason := "Denied by Release Manager Agent policy"

production_mutations := {
  "deploy", "rollback", "restart_service", "execute_shell", "feature_flag_write",
  "production_config_write", "database_write", "database_ddl", "migration_execute",
  "infrastructure_apply", "kubernetes_write", "iam_write", "network_write", "dns_write",
  "tls_write", "secret_write", "queue_purge", "cache_flush", "artifact_delete",
  "artifact_sign", "merge_pull_request", "force_push"
}

restricted_decisions := {
  "final_go_no_go_decision", "self_approval", "security_risk_acceptance",
  "privacy_risk_acceptance", "legal_commitment", "contractual_commitment",
  "budget_commitment", "guaranteed_release_date", "sla_commitment"
}

approval_actions := {
  "jira_version_create", "jira_version_update", "jira_version_release", "change_record_create",
  "change_record_update", "confluence_publish", "teams_post", "email_send",
  "release_notes_publish", "artifact_promote", "nonproduction_deploy_request",
  "production_deploy_request", "production_rollback_request", "emergency_release_request",
  "feature_rollout_request", "database_migration_request", "release_status_publish"
}

allow if {
  input.action == "read"
  input.scope.authorized == true
  input.data.minimum_necessary == true
  input.connector.mode == "read_only"
  input.scope.release_bound == true
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
  input.approval.release == input.scope.release
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.candidate_hash == input.scope.candidate_hash
  input.approval.environment == input.scope.environment
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.action in production_mutations
  msg := "Free-form Release Manager Agent cannot mutate production or engineering systems"
}

deny contains msg if {
  input.action in restricted_decisions
  msg := "Final release approval, self-approval, risk acceptance, and business commitments are human-owned"
}

deny contains msg if {
  input.scope.candidate_hash != input.approval.candidate_hash
  input.action in approval_actions
  msg := "Approval does not match the current release candidate"
}

deny contains msg if {
  input.approval.actor == input.agent.id
  msg := "The release agent cannot approve its own protected action"
}

deny contains msg if {
  input.query.unbounded == true
  msg := "Unbounded production telemetry, database, log, or trace queries are prohibited"
}

deny contains msg if {
  input.resource in {"passwords", "tokens", "cookies", "private_keys", "signing_keys", "raw_vault_values", "unrestricted_customer_records"}
  msg := "Restricted secrets or sensitive records are outside model context"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated approvals, artifacts, tests, deployment states, customer impact, or evidence are prohibited"
}

deny contains msg if {
  input.scope.production == true
  input.connector.mode != "read_only"
  msg := "Production connectors available to the model must be read-only"
}
