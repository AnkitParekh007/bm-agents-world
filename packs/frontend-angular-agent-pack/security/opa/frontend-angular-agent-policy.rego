package frontend.angular.agent

import rego.v1

default allow := false

deny contains "secret values may not be exposed" if input.action == "secret.read-value"
deny contains "database writes are not a frontend capability" if input.action == "database.write"
deny contains "force push is prohibited" if input.action == "git.force-push"
deny contains "agent may not merge pull requests" if input.action == "bitbucket.merge"
deny contains "agent may not publish packages" if input.action == "package.publish"
deny contains "production mutations are prohibited" if input.environment == "prod" and input.action_class == "mutation"
deny contains "path outside authorized workspace" if input.action == "workspace.write" and not path_allowed
deny contains "repository mismatch" if input.repository != input.authorization.repository
deny contains "project mismatch" if input.project != input.authorization.project

action_needs_approval if input.action in {
  "git.commit",
  "git.push",
  "bitbucket.pullrequest.create",
  "bitbucket.pullrequest.update",
  "jira.write",
  "teams.post",
  "pipeline.trigger",
  "dependency.lockfile.update",
  "figma.write"
}

approval_valid if {
  input.approval.granted == true
  input.approval.payload_hash == input.payload_hash
  input.approval.run_id == input.run_id
  input.approval.expires_at_ns > time.now_ns()
}

path_allowed if {
  some prefix in input.authorization.allowed_paths
  startswith(input.path, prefix)
}

base_scope_valid if {
  input.project == input.authorization.project
  input.repository == input.authorization.repository
  input.environment in input.authorization.environments
}

allow if {
  count(deny) == 0
  base_scope_valid
  not action_needs_approval
}

allow if {
  count(deny) == 0
  base_scope_valid
  action_needs_approval
  approval_valid
}
