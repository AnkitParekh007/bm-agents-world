
package bm_agent_foundry.sre_incident_management

import rego.v1

default allow := false
default require_approval := false
default reason := "Denied by Site Reliability Engineer / Incident Management Agent policy"

production_mutations := {
  "deploy", "rollback", "restart_service", "execute_shell", "scale_write", "traffic_shift",
  "feature_flag_write", "production_config_write", "database_write", "database_ddl",
  "migration_execute", "infrastructure_apply", "kubernetes_write", "iam_write", "network_write",
  "dns_write", "tls_write", "secret_write", "queue_purge", "cache_flush", "failover_execute",
  "restore_execute", "backup_delete", "merge_pull_request", "force_push"
}

restricted_decisions := {
  "residual_risk_acceptance", "security_risk_acceptance", "privacy_risk_acceptance",
  "legal_commitment", "contractual_commitment", "sla_commitment", "guaranteed_restoration_time",
  "unsupported_root_cause_declaration", "self_approval"
}

approval_actions := {
  "incident_declare", "incident_severity_publish", "jira_create", "jira_update", "confluence_publish",
  "teams_post", "email_send", "status_page_publish", "slo_publish", "error_budget_policy_publish",
  "alert_rule_change", "oncall_schedule_change", "dashboard_publish", "runbook_publish",
  "nonproduction_synthetic_execute", "nonproduction_load_execute", "nonproduction_chaos_execute",
  "dr_exercise_execute", "production_action_request", "post_incident_review_publish"
}

allow if {
  input.action == "read"
  input.scope.authorized == true
  input.scope.service_bound == true
  input.connector.mode == "read_only"
  input.data.minimum_necessary == true
  input.query.bounded == true
  input.evidence.redacted == true
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
  input.approval.service == input.scope.service
  input.approval.environment == input.scope.environment
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.action in production_mutations
  msg := "Free-form SRE Agent cannot mutate production or engineering systems"
}

deny contains msg if {
  input.action in restricted_decisions
  msg := "Risk acceptance, commitments, unsupported root cause, and self-approval are human-owned"
}

deny contains msg if {
  input.scope.cross_customer == true
  msg := "Cross-customer or cross-tenant evidence mixing is prohibited"
}

deny contains msg if {
  input.scope.cross_project == true
  msg := "Cross-project evidence access requires a separately approved portfolio scope"
}

deny contains msg if {
  input.query.unbounded == true
  msg := "Unbounded telemetry, platform, API, or database queries are prohibited"
}

deny contains msg if {
  input.database.read_only != true
  input.resource == "database"
  msg := "Database diagnostics must be parameterized, bounded, and read-only"
}

deny contains msg if {
  input.resource in {"passwords", "tokens", "cookies", "private_keys", "raw_vault_values", "kubeconfig", "cloud_admin_credentials", "unrestricted_customer_records"}
  msg := "Restricted secrets or sensitive credentials are outside model context"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.evidence.redacted != true
  input.resource in {"logs", "traces", "profiles", "database_rows", "api_payloads", "customer_data"}
  msg := "Sensitive evidence must be redacted before model use"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated telemetry, impact, cause, recovery, approval, or evidence is prohibited"
}

deny contains msg if {
  input.stop_condition.triggered == true
  input.action_attempted_again == true
  msg := "Actions cannot be repeated after a declared stop condition without new independent authorization"
}
