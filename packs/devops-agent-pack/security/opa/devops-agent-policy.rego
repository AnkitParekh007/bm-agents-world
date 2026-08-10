package devops_agent

default allow := false

repository_write_actions := {"git_commit", "git_push", "pull_request_create", "jira_publish", "confluence_publish", "teams_publish"}
shared_mutation_actions := {"pipeline_trigger_side_effect", "iac_apply", "gitops_sync", "kubernetes_mutation", "registry_promote", "config_mutation"}
critical_actions := {"production_deploy", "production_rollback", "traffic_shift", "dns_mutation", "tls_mutation", "iam_mutation", "secret_rotation", "restore", "failover", "failback"}
prohibited_actions := {"force_push", "merge_bypass", "production_shell", "production_ssh", "cluster_admin_session", "raw_secret_read", "signing_key_export", "delete_backup", "disable_audit", "disable_policy", "destroy_production"}

allow if {
  input.action == "public_standard_read"
}

allow if {
  input.action in {"jira_read", "confluence_read", "repo_read", "pipeline_read", "inventory_read", "bounded_telemetry_read", "cost_read"}
  scope_ok
  input.minimum_necessary == true
}

allow if {
  input.action in {"isolated_workspace_write", "local_build", "iac_plan", "manifest_render", "security_scan", "artifact_write"}
  scope_ok
  input.isolated == true
  input.production_credentials_present == false
}

allow if {
  input.action in repository_write_actions
  scope_ok
  valid_approval
  input.payload_hash == input.approval.payload_hash
}

allow if {
  input.action in shared_mutation_actions
  scope_ok
  input.environment != "production"
  valid_approval
  input.payload_hash == input.approval.payload_hash
  input.rollback_defined == true
  input.verification_defined == true
}

allow if {
  input.action in critical_actions
  scope_ok
  input.executor in {"deterministic_pipeline", "authorized_human", "preauthorized_runbook"}
  valid_approval
  input.payload_hash == input.approval.payload_hash
  input.environment_lock == true
  input.rollback_defined == true
  input.observability_ready == true
}

deny_reason[msg] if {
  input.action in prohibited_actions
  msg := "action is prohibited for autonomous DevOps agent execution"
}

deny_reason[msg] if {
  input.raw_secret_requested == true
  msg := "raw credentials or signing keys may not be exposed to the model"
}

deny_reason[msg] if {
  input.action in shared_mutation_actions
  input.environment == "production"
  msg := "production mutation must use the critical-action governed executor path"
}

deny_reason[msg] if {
  input.action in repository_write_actions
  not valid_approval
  msg := "repository or collaboration write requires valid payload-bound approval"
}

deny_reason[msg] if {
  input.action in shared_mutation_actions
  not valid_approval
  msg := "shared-environment mutation requires valid payload-bound approval"
}

deny_reason[msg] if {
  input.action in critical_actions
  not valid_approval
  msg := "critical action requires valid payload-bound approval"
}

deny_reason[msg] if {
  input.unexpected_destroy == true
  msg := "unexpected destructive plan action requires re-plan and human review"
}

deny_reason[msg] if {
  input.public_exposure_increase == true
  input.security_approval != true
  msg := "public exposure increase requires explicit security approval"
}

deny_reason[msg] if {
  input.privilege_escalation == true
  input.security_approval != true
  msg := "privilege escalation requires explicit security approval"
}

scope_ok if {
  input.project == input.authorization.project
  input.environment == input.authorization.environment
  input.service == input.authorization.service
  input.target in input.authorization.targets
}

valid_approval if {
  input.approval.valid == true
  input.approval.run_id == input.run_id
  input.approval.project == input.project
  input.approval.environment == input.environment
  input.approval.action == input.action
  time.now_ns() < input.approval.expires_at_ns
}
