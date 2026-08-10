package engineering_manager_technical_lead_agent

import rego.v1

default allow := false

deny contains reason if { prohibited_action; reason := sprintf("prohibited action: %s", [input.action]) }

allow if {
  input.mode == "read"
  input.authorization.valid == true
  input.project_id in input.authorization.projects
  input.tool_id in input.authorization.tools
  not prohibited_action
  not restricted_people_violation
}

allow if {
  input.mode == "draft"
  input.authorization.valid == true
  input.project_id in input.authorization.projects
  input.resource_type in {"leadership_artifact", "analysis", "review_draft", "plan_draft", "people_safe_draft"}
  not prohibited_action
  not restricted_people_violation
}

allow if {
  input.mode == "write"
  input.authorization.valid == true
  input.project_id in input.authorization.projects
  input.environment in input.authorization.environments
  input.action in approval_controlled_actions
  valid_payload_approval
  not prohibited_action
  not restricted_people_violation
}

approval_controlled_actions contains action if {
  some action in {
    "jira_write", "confluence_publish", "teams_post", "bitbucket_write", "create_pull_request",
    "retry_pipeline", "incident_update", "publish_technical_decision", "publish_release_recommendation",
    "request_production_change", "run_bounded_nonproduction_test", "provision_nonproduction_workspace",
    "publish_one_on_one_artifact", "publish_growth_plan", "publish_team_health_summary",
    "publish_candidate_summary", "schedule_interview", "advance_candidate"
  }
}

valid_payload_approval if {
  input.approval.status == "approved"
  input.approval.action == input.action
  input.approval.payload_hash == input.payload_hash
  input.approval.expires_at_ns > time.now_ns()
  input.approval.independent_review_complete == true
}

prohibited_action if { input.action in prohibited_actions }

prohibited_actions contains action if {
  some action in {
    "reveal_raw_secret", "export_secret", "use_universal_credential", "force_push", "merge_pull_request",
    "bypass_quality_gate", "disable_security_control", "disable_audit", "production_deploy",
    "production_rollback", "production_database_ddl", "production_database_dml",
    "production_infrastructure_apply", "production_kubernetes_mutation", "production_iam_mutation",
    "production_network_mutation", "production_dns_mutation", "production_tls_mutation",
    "production_secret_mutation", "delete_backup", "destroy_infrastructure",
    "performance_rating", "promotion_decision", "compensation_decision", "hiring_decision",
    "candidate_rejection_decision", "disciplinary_action", "termination_decision",
    "medical_or_wellbeing_diagnosis", "protected_characteristic_inference", "individual_productivity_score",
    "make_staffing_commitment", "make_budget_commitment", "make_vendor_commitment",
    "make_contractual_commitment", "make_delivery_date_commitment", "accept_residual_risk"
  }
}

restricted_people_violation if {
  input.data_domain in {"employee", "candidate", "one_on_one", "team_health"}
  input.authorization.people_purpose == ""
}

restricted_people_violation if {
  input.data_domain in {"employee", "candidate", "one_on_one", "team_health"}
  input.minimum_necessary != true
}

restricted_people_violation if {
  input.data_domain in {"employee", "candidate", "one_on_one", "team_health"}
  input.human_manager_initiated != true
}

deny contains "raw secret values may not enter model context" if { input.contains_raw_secret == true }
deny contains "production mutation is prohibited for the free-form agent" if { input.environment == "production"; input.mode == "write"; input.action != "request_production_change" }
deny contains "consequential employment decisions are human-only" if { input.action in {"performance_rating", "promotion_decision", "compensation_decision", "hiring_decision", "candidate_rejection_decision", "disciplinary_action", "termination_decision"} }
deny contains "individual activity metrics may not become a performance score" if { input.action == "individual_productivity_score" }
deny contains "people data requires purpose, minimum necessity, and human-manager initiation" if { restricted_people_violation }
deny contains "approval is missing, expired, mismatched, or not bound to the current payload" if { input.mode == "write"; input.action in approval_controlled_actions; not valid_payload_approval }
deny contains "project is outside the authorized scope" if { not input.project_id in input.authorization.projects }
deny contains "environment is outside the authorized scope" if { not input.environment in input.authorization.environments }
deny contains "tool is outside the authorized capability set" if { input.tool_id; not input.tool_id in input.authorization.tools }
deny contains "restricted data requires redaction" if { input.data_classification == "restricted"; input.resource_redacted != true }
deny contains "high-risk recommendations require independent review" if { input.risk in {"high", "critical"}; input.independent_review_complete != true }
deny contains "changed payload invalidates approval" if { input.approval.status == "approved"; input.approval.payload_hash != input.payload_hash }
