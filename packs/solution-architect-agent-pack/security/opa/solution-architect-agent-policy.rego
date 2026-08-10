package bm_agent_foundry.solution_architect

import rego.v1

default allow := false

# Read-only analysis is allowed only when scope, classification, and tool grants are explicit.
allow if {
  input.mode == "read"
  input.authorization.valid == true
  input.project_id in input.authorization.projects
  input.environment in input.authorization.environments
  input.tool_id in input.authorization.tools
  not denied_action
}

# Drafting inside the isolated artifact workspace is allowed.
allow if {
  input.mode == "draft"
  input.authorization.valid == true
  input.project_id in input.authorization.projects
  input.resource_type in {"architecture_artifact", "diagram", "analysis", "review_draft", "contract_draft"}
  not denied_action
}

# Approval-controlled publication is allowed only for the exact immutable payload.
allow if {
  input.mode == "write"
  input.authorization.valid == true
  input.project_id in input.authorization.projects
  input.environment in input.authorization.environments
  input.action in approval_controlled_actions
  valid_payload_approval
  not denied_action
}

approval_controlled_actions contains action if {
  some action in {
    "publish_adr",
    "supersede_adr",
    "publish_architecture_document",
    "publish_architecture_review",
    "publish_openapi",
    "publish_asyncapi",
    "publish_data_contract",
    "jira_write",
    "confluence_publish",
    "teams_post",
    "bitbucket_write",
    "create_pull_request",
    "provision_nonproduction_poc",
    "run_bounded_nonproduction_test",
    "publish_vendor_recommendation",
    "publish_tco_model",
    "request_production_change"
  }
}

valid_payload_approval if {
  input.approval.status == "approved"
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.expires_at_ns > time.now_ns()
  input.approval.independent_review_complete == true
}

denied_action if {
  input.action in prohibited_actions
}

prohibited_actions contains action if {
  some action in {
    "reveal_raw_secret",
    "export_secret",
    "use_universal_credential",
    "self_approve_architecture",
    "self_approve_exception",
    "accept_residual_risk",
    "make_vendor_commitment",
    "make_contractual_commitment",
    "make_budget_commitment",
    "force_push",
    "merge_pull_request",
    "bypass_quality_gate",
    "disable_security_control",
    "disable_audit",
    "production_deploy",
    "production_rollback",
    "production_database_ddl",
    "production_database_dml",
    "production_database_grant",
    "production_infrastructure_apply",
    "production_kubernetes_mutation",
    "production_iam_mutation",
    "production_network_mutation",
    "production_dns_mutation",
    "production_tls_mutation",
    "production_secret_mutation",
    "production_feature_flag_mutation",
    "delete_backup",
    "destroy_infrastructure",
    "unbounded_load_test",
    "contact_customer_without_approval"
  }
}

deny contains "raw secret values may not enter model context" if {
  input.contains_raw_secret == true
}

deny contains "universal or shared administrator credentials are prohibited" if {
  input.credential_scope == "universal"
}

deny contains "production mutation is prohibited for the free-form architecture agent" if {
  input.environment == "production"
  input.mode == "write"
  input.action != "request_production_change"
}

deny contains "the architecture author cannot approve its own high-risk decision" if {
  input.risk in {"high", "critical"}
  input.requester == input.approver
}

deny contains "residual risk acceptance belongs to the accountable human owner" if {
  input.action == "accept_residual_risk"
}

deny contains "commercial, contractual, pricing, date, or vendor commitments require accountable human owners" if {
  input.action in {"make_vendor_commitment", "make_contractual_commitment", "make_budget_commitment"}
}

deny contains "approval is missing, expired, action-mismatched, or not bound to the current payload" if {
  input.mode == "write"
  input.action in approval_controlled_actions
  not valid_payload_approval
}

deny contains "project is outside the authorized scope" if {
  not input.project_id in input.authorization.projects
}

deny contains "environment is outside the authorized scope" if {
  not input.environment in input.authorization.environments
}

deny contains "tool is outside the authorized capability set" if {
  input.tool_id
  not input.tool_id in input.authorization.tools
}

deny contains "restricted data requires a redacted or aggregate resource" if {
  input.data_classification == "restricted"
  input.resource_redacted != true
}

deny contains "high-risk decisions require independent review" if {
  input.risk in {"high", "critical"}
  input.independent_review_complete != true
}

deny contains "architecture output must cite evidence and declare assumptions" if {
  input.mode in {"draft", "write"}
  input.resource_type in {"architecture_artifact", "analysis", "review_draft", "contract_draft"}
  count(input.evidence_refs) == 0
}

deny contains "changed payload invalidates approval" if {
  input.approval.status == "approved"
  input.approval.payload_hash != input.payload_hash
}
