package bm_agent_foundry.application_security_devsecops

import rego.v1

default allow := false
default require_approval := false

production_mutations := {
  "deploy", "rollback", "restart_service", "execute_shell", "feature_flag_write",
  "production_config_write", "database_write", "database_ddl", "migration_execute",
  "infrastructure_apply", "kubernetes_write", "iam_write", "network_write", "dns_write",
  "tls_write", "secret_write", "credential_rotate", "credential_revoke", "artifact_delete",
  "artifact_sign", "merge_pull_request", "force_push", "disable_security_gate",
  "disable_logging", "disable_admission_policy", "disable_branch_protection"
}

prohibited_testing := {
  "unapproved_active_scan", "unapproved_exploit", "denial_of_service_test", "persistence_install",
  "credential_theft", "data_exfiltration", "destructive_payload", "scan_outside_allowlist"
}

restricted_decisions := {
  "residual_risk_acceptance", "security_exception_approval", "self_approval",
  "final_production_go_no_go", "public_disclosure_decision", "legal_commitment",
  "contractual_commitment", "sla_commitment", "guaranteed_release_date"
}

protected_actions := {
  "active_security_test", "jira_security_write", "confluence_security_publish",
  "pull_request_security_comment", "official_finding_disposition", "finding_suppression",
  "security_exception_publish", "release_security_gate_publish", "teams_security_post",
  "customer_security_communication", "vendor_disclosure", "production_security_action_request",
  "secret_rotation_request", "credential_revocation_request", "artifact_block_request"
}

allow if {
  input.action == "read"
  input.scope.authorized == true
  input.data.minimum_necessary == true
  input.scope.project_bound == true
  input.scope.environment_bound == true
  input.connector.mode == "read_only"
}

allow if {
  input.action == "draft"
  input.scope.authorized == true
  input.destination == "isolated_security_workspace"
  not input.side_effect
}

allow if {
  input.action == "scan"
  input.scope.authorized == true
  input.scope.target_allowlisted == true
  input.scope.environment in {"security-sandbox", "playground", "qa"}
  input.scanner.isolated == true
  input.scanner.method_approved == true
  input.scanner.within_rate_limits == true
}

allow if {
  input.action in protected_actions
  valid_approval
  input.scope.authorized == true
  input.payload_hash == input.approval.payload_hash
}

require_approval if input.action in protected_actions

valid_approval if {
  input.approval.present == true
  input.approval.status == "approved"
  input.approval.actor != input.agent.id
  input.approval.project == input.scope.project
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.target == input.scope.target
  input.approval.environment == input.scope.environment
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.action in production_mutations
  msg := "Free-form Application Security / DevSecOps Agent cannot mutate production or disable controls"
}

deny contains msg if {
  input.action in prohibited_testing
  msg := "Unapproved, destructive, out-of-scope, denial-of-service, persistence, credential-theft, and exfiltration testing is prohibited"
}

deny contains msg if {
  input.action in restricted_decisions
  msg := "Risk acceptance, exception approval, disclosure, self-approval, and final production decisions are human-owned"
}

deny contains msg if {
  input.resource in {"passwords", "tokens", "cookies", "private_keys", "signing_keys", "raw_vault_values", "unredacted_customer_records", "live_exploit_credentials"}
  msg := "Restricted secrets and sensitive records are outside model context"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.scope.target_allowlisted != true
  input.action in {"scan", "active_security_test"}
  msg := "Security testing target is not explicitly allowlisted"
}

deny contains msg if {
  input.scope.production == true
  input.action in {"scan", "active_security_test"}
  msg := "Active production testing is prohibited to the free-form agent"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated findings, tests, exploitability, affected scope, approvals, or evidence are prohibited"
}

deny contains msg if {
  input.finding.disposition in {"false_positive", "not_affected", "suppressed", "accepted"}
  input.finding.evidence_sufficient != true
  msg := "Risk-reducing dispositions require sufficient evidence"
}

deny contains msg if {
  input.action in protected_actions
  input.payload_hash != input.approval.payload_hash
  msg := "Approval does not match the final protected-action payload"
}

deny contains msg if {
  input.approval.actor == input.agent.id
  msg := "The security agent cannot approve its own protected action"
}
