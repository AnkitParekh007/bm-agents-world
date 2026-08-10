package business_analyst_agent

default allow := false

default require_approval := false

default deny_reason := "action is not authorized"

production_mutations := {
  "production.write", "database.write", "database.ddl", "database.dml",
  "deployment.execute", "feature_flag.change", "iam.change", "secret.read_value",
  "bitbucket.commit", "bitbucket.merge", "infrastructure.change"
}

human_only_decisions := {
  "business_policy.approve", "scope.commit", "priority.decide", "uat.signoff",
  "requirement.waiver", "legal.interpret", "commercial.commit", "budget.commit",
  "release.approve", "customer.promise"
}

approval_actions := {
  "jira.create", "jira.update", "confluence.publish", "requirements.baseline",
  "business_rule.publish", "teams.send", "customer.contact", "survey.launch",
  "restricted_data.read"
}

allow if {
  input.identity.authenticated
  input.scope.organization != ""
  input.scope.project != ""
  input.scope.purpose != ""
  not input.action in production_mutations
  not input.action in human_only_decisions
  input.action in input.capability.allowed_actions
  input.environment in input.capability.allowed_environments
  input.data.classification in input.capability.allowed_classifications
  not input.action in approval_actions
}

allow if {
  input.identity.authenticated
  input.action in approval_actions
  valid_approval
  input.action in input.capability.allowed_actions
  input.environment in input.capability.allowed_environments
}

valid_approval if {
  input.approval.present
  input.approval.payload_hash == input.payload.hash
  input.approval.action == input.action
  input.approval.project == input.scope.project
  input.approval.expires_at > input.now
  not input.approval.used
}

require_approval if input.action in approval_actions

deny_reason := "production and engineering mutations are prohibited" if input.action in production_mutations

deny_reason := "business, acceptance, legal, commercial, budget, priority, and release decisions are human-owned" if input.action in human_only_decisions

deny_reason := "payload-bound approval is required" if {
  input.action in approval_actions
  not valid_approval
}
