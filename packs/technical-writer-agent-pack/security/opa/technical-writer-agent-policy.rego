package bm_agent_foundry.technical_writer

import rego.v1

default allow := false
default require_approval := false

production_mutations := {
  "deploy", "rollback", "restart_service", "execute_shell", "feature_flag_write",
  "production_config_write", "database_write", "database_ddl", "migration_execute",
  "infrastructure_apply", "kubernetes_write", "iam_write", "network_write", "dns_write",
  "tls_write", "secret_write", "merge_pull_request", "force_push", "application_code_write"
}

protected_publications := {
  "bitbucket_docs_pr_create", "github_docs_pr_create", "confluence_publish", "cms_publish",
  "public_docs_publish", "support_kb_publish", "release_notes_publish", "known_issue_publish",
  "runbook_publish", "navigation_write", "redirect_write", "glossary_write", "teams_post",
  "localization_handoff", "screenshot_capture_shared_environment"
}

restricted_decisions := {
  "self_approval", "invent_product_behavior", "invent_test_result", "invent_customer_quote",
  "legal_commitment", "contractual_commitment", "sla_commitment", "guaranteed_release_date",
  "security_risk_acceptance", "privacy_risk_acceptance"
}

allow if {
  input.action == "read"
  input.scope.authorized == true
  input.data.minimum_necessary == true
  input.scope.project_bound == true
  input.scope.version_bound == true
}

allow if {
  input.action == "draft"
  input.scope.authorized == true
  input.destination == "isolated_documentation_workspace"
  not input.side_effect
}

allow if {
  input.action in protected_publications
  valid_approval
  input.scope.authorized == true
  input.payload_hash == input.approval.payload_hash
}

require_approval if input.action in protected_publications

valid_approval if {
  input.approval.present == true
  input.approval.status == "approved"
  input.approval.actor != input.agent.id
  input.approval.project == input.scope.project
  input.approval.collection == input.scope.collection
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.product_version == input.scope.product_version
  input.approval.source_revision == input.scope.source_revision
  input.approval.destination == input.destination
  input.approval.not_expired == true
  input.approval.not_replayed == true
}

deny contains msg if {
  input.action in production_mutations
  msg := "Technical Writer Agent cannot mutate production or application systems"
}

deny contains msg if {
  input.action in restricted_decisions
  msg := "Fabrication, self-approval, risk acceptance, and business commitments are prohibited"
}

deny contains msg if {
  input.resource in {"passwords", "tokens", "cookies", "private_keys", "raw_vault_values", "unredacted_customer_records", "private_support_conversations"}
  msg := "Restricted secrets and sensitive records are outside model context"
}

deny contains msg if {
  input.secret.raw_value_present == true
  msg := "Raw secrets must never enter model context"
}

deny contains msg if {
  input.evidence.fabricated == true
  msg := "Fabricated behavior, sources, tests, quotes, approvals, or evidence are prohibited"
}

deny contains msg if {
  input.content.contains_unredacted_sensitive_data == true
  msg := "Sensitive content must be redacted before authoring, review, or publication"
}

deny contains msg if {
  input.content.has_unsupported_material_claims == true
  msg := "Unsupported material claims block publication"
}

deny contains msg if {
  input.action in protected_publications
  input.payload_hash != input.approval.payload_hash
  msg := "Approval does not match the final publication payload"
}

deny contains msg if {
  input.scope.customer_facing == true
  input.approval.present != true
  msg := "Customer-facing publication requires accountable human approval"
}
