package bm.agents.world

import rego.v1

risk_rank := {"L0": 0, "L1": 1, "L2": 2, "L3": 3, "L4": 4}

# The application admits only centrally registered connectors before calling OPA.
# OPA remains authoritative for environment/risk/approval policy.
default decision := {
  "effect": "deny",
  "riskLevel": "L4",
  "approvalMode": "privileged-process",
  "reason": "No policy rule allowed this action."
}

decision := {
  "effect": "deny",
  "riskLevel": "L4",
  "approvalMode": "privileged-process",
  "reason": "Production mutation is denied by centralized policy."
} if {
  input.context.environment == "prod"
  input.definition.actionClass in {"mutation", "external-write"}
  input.definition.productionMutation == true
}

decision := {
  "effect": "approval",
  "riskLevel": "L4",
  "approvalMode": "privileged-process",
  "reason": "Production reads require privileged approval."
} if {
  input.context.environment == "prod"
  input.definition.actionClass == "read"
}

decision := {
  "effect": "approval",
  "riskLevel": risk,
  "approvalMode": mode,
  "reason": sprintf("%s requires centralized governed approval.", [risk])
} if {
  input.context.environment != "prod"
  risk := input.definition.riskLevel
  risk_rank[risk] >= risk_rank.L2
  mode := approval_mode(risk)
}

decision := {
  "effect": "allow",
  "riskLevel": risk,
  "approvalMode": input.definition.approvalMode,
  "reason": sprintf("%s is allowed by centralized standing policy.", [risk])
} if {
  input.context.environment != "prod"
  risk := input.definition.riskLevel
  risk_rank[risk] < risk_rank.L2
}

approval_mode(risk) := "privileged-process" if risk == "L4"
approval_mode(risk) := "human" if risk != "L4"
