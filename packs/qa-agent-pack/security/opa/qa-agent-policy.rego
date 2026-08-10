package qa_agent.authz

default allow := false
default requires_approval := false

read_actions := {
  "jira.read", "bitbucket.read", "docs.read", "artifact.read",
  "environment.read", "observability.read", "database.readonly",
  "api.read", "browser.read"
}

external_write_actions := {
  "jira.write", "bitbucket.write", "teams.post", "pipeline.retry"
}

allow if {
  input.project in input.principal.allowed_projects
  input.environment in input.principal.allowed_environments
  input.action in read_actions
  input.resource.classification in input.principal.allowed_classifications
  not production_restricted
}

allow if {
  input.project in input.principal.allowed_projects
  input.environment in input.principal.allowed_environments
  input.action in external_write_actions
  input.approval.valid == true
  input.approval.action_id == input.action_id
  input.approval.expires_at > input.now
  input.environment != "prod"
}

requires_approval if {
  input.action in external_write_actions
}

production_restricted if {
  input.environment == "prod"
  input.action != "browser.read"
  input.action != "api.read"
  input.action != "observability.read"
  input.action != "environment.read"
}

deny_reason := "database writes are not exposed to the QA agent" if {
  input.action == "database.write"
}

deny_reason := "production mutations are denied" if {
  input.environment == "prod"
  endswith(input.action, ".write")
}
