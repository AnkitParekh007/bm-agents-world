package database_agent

default allow := false

destructive_actions := {
  "drop_database", "truncate", "migration_clean", "migration_history_repair",
  "backup_delete", "force_failover", "disable_audit", "grant_superuser"
}

production_mutations := {
  "ddl", "dml", "grant", "revoke", "migration", "backfill", "restore",
  "failover", "config_mutation", "backup_delete"
}

allow if {
  input.action == "public_documentation_read"
}

allow if {
  input.action == "repository_read"
  scope_ok
}

allow if {
  input.action == "database_metadata_read"
  scope_ok
  input.credential_class in {"catalog_reader", "production_verifier", "monitoring"}
}

allow if {
  input.action == "bounded_diagnostic_read"
  scope_ok
  input.limits.rows <= 1000
  input.limits.seconds <= 30
  input.redaction_enabled == true
  input.read_only_transaction == true
}

allow if {
  input.environment == "sandbox"
  input.action in {"ddl", "dml", "migration", "backfill", "grant"}
  scope_ok
  input.ephemeral == true
  input.contains_production_data == false
  not destructive
}

allow if {
  input.environment in {"playground", "qa"}
  input.action in {"ddl", "dml", "migration", "backfill", "grant", "revoke"}
  scope_ok
  valid_approval
  input.expected_rows <= input.approval.expected_rows
  input.max_duration_seconds <= input.approval.max_duration_seconds
  input.normalized_sql_hash == input.approval.normalized_sql_hash
  not destructive
}

allow if {
  input.action in {"commit", "push", "create_pr", "jira_publish", "teams_publish"}
  scope_ok
  valid_approval
  input.payload_hash == input.approval.payload_hash
}

deny_reason[msg] if {
  destructive
  msg := "destructive database action is denied by default"
}

deny_reason[msg] if {
  input.environment == "production"
  input.action in production_mutations
  msg := "autonomous production database mutation is prohibited"
}

deny_reason[msg] if {
  input.raw_secret_requested == true
  msg := "raw database secrets may not be exposed to the model"
}

deny_reason[msg] if {
  input.credential_class in {"superuser", "sysdba", "sa", "root"}
  msg := "privileged universal database identities are prohibited"
}

deny_reason[msg] if {
  input.action in {"update", "delete", "dml", "backfill"}
  input.has_bounded_predicate != true
  msg := "unbounded data mutation is prohibited"
}

scope_ok if {
  input.project == input.authorization.project
  input.database == input.authorization.database
  input.schema == input.authorization.schema
  input.environment == input.authorization.environment
}

valid_approval if {
  input.approval.valid == true
  input.approval.run_id == input.run_id
  input.approval.environment == input.environment
  input.approval.target_hash == input.target_hash
  time.now_ns() < input.approval.expires_at_ns
}

destructive if {
  input.action in destructive_actions
}
