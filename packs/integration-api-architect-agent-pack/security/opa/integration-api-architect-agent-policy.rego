package integration_api_architect

default allow := false

# Bounded read operations are allowed when project and environment scope match.
allow if {
  input.action == "read"
  input.project_authorized == true
  input.resource_authorized == true
}

# Local/offline generation and deterministic validation are allowed.
allow if {
  input.action == "draft_or_validate"
  input.project_authorized == true
  input.production_mutation == false
}

# External writes require payload-bound approval.
allow if {
  input.action == "external_write"
  input.project_authorized == true
  input.approval.valid == true
  input.approval.payload_sha256 == input.payload_sha256
  input.self_approval == false
  input.production_mutation == false
}

# Production requests may be prepared, never executed by the free-form agent.
allow if {
  input.action == "prepare_production_request"
  input.project_authorized == true
  input.production_mutation == false
  input.request_is_immutable == true
}

deny_reason contains "raw secrets are never available to the model" if input.raw_secret_access == true
deny_reason contains "production gateway/broker/identity mutation requires an authorized operator or deterministic pipeline" if input.production_mutation == true
deny_reason contains "breaking contract publication requires consumer impact and independent approval" if { input.breaking_change == true; not input.independent_approval }
deny_reason contains "self approval is prohibited" if input.self_approval == true
deny_reason contains "residual risk acceptance is human-owned" if input.accept_residual_risk == true
deny_reason contains "cross-project or cross-tenant access is prohibited without explicit scope" if input.cross_scope_access == true
