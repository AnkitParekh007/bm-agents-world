package bm_agent_foundry.data_engineer_pyspark

import rego.v1

default allow := false
default require_approval := false
default reason := "Denied by Data Engineer / PySpark Agent policy"

production_mutations := {
  "pipeline_execute", "pipeline_retry", "pipeline_clear", "pipeline_pause", "pipeline_resume",
  "schedule_write", "source_write", "stream_write", "schema_registry_write", "catalog_write",
  "table_write", "table_ddl", "table_delete", "table_overwrite", "table_vacuum",
  "snapshot_expire", "checkpoint_delete", "checkpoint_move", "backfill_execute", "replay_execute",
  "repair_execute", "migration_execute", "database_write", "database_ddl", "cluster_write",
  "infrastructure_apply", "kubernetes_write", "iam_write", "network_write", "secret_write",
  "merge_pull_request", "force_push"
}

restricted_decisions := {
  "residual_risk_acceptance", "privacy_risk_acceptance", "security_risk_acceptance",
  "data_loss_acceptance", "source_of_truth_override", "retention_override", "self_approval",
  "unsupported_quality_waiver", "breaking_contract_approval"
}

approval_actions := {
  "jira_create", "jira_update", "confluence_publish", "teams_post", "contract_publish",
  "schema_publish", "catalog_publish", "lineage_publish", "commit_create", "pull_request_create",
  "nonproduction_pipeline_execute", "nonproduction_data_write", "nonproduction_stream_write",
  "quality_threshold_change", "production_action_request"
}

allow if {
  input.action == "read"
  input.scope.authorized == true
  input.scope.project_bound == true
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
  input.approval.environment == input.scope.environment
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.scope.environment == "production"
  input.action in production_mutations
  msg := "Free-form Data Engineer Agent cannot mutate production pipelines, data, schemas, checkpoints, clusters, or infrastructure"
}

deny contains msg if {
  input.action in restricted_decisions
  msg := "Risk acceptance, source-of-truth overrides, destructive exceptions, and self-approval are human-owned"
}

deny contains msg if {
  input.scope.cross_project == true
  msg := "Cross-project data access requires separately approved portfolio scope"
}

deny contains msg if {
  input.scope.cross_tenant == true
  msg := "Cross-tenant or cross-customer evidence mixing is prohibited"
}

deny contains msg if {
  input.query.unbounded == true
  msg := "Unbounded source, dataset, log, streaming, or telemetry queries are prohibited"
}

deny contains msg if {
  input.data.raw_records == true
  input.data.minimum_necessary != true
  msg := "Raw records require explicit minimum-necessary approval and redaction"
}

deny contains msg if {
  input.resource in {"passwords", "tokens", "cookies", "private_keys", "raw_vault_values", "connection_strings", "cloud_admin_credentials", "unrestricted_customer_records"}
  msg := "Restricted secrets and unrestricted sensitive records are outside model context"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.evidence.redacted != true
  input.resource in {"source_rows", "target_rows", "stream_events", "logs", "api_payloads", "customer_data"}
  msg := "Sensitive evidence must be redacted before model use"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated schemas, quality, reconciliation, performance, lineage, approvals, or evidence are prohibited"
}

deny contains msg if {
  input.stop_condition.triggered == true
  input.action_attempted_again == true
  msg := "Actions cannot be repeated after a stop condition without new independent authorization"
}
