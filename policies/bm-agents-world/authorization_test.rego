package bm.agents.world_test

import rego.v1
import data.bm.agents.world

base_context := {
  "runId": "run-test",
  "userId": "qa@example.com",
  "agentId": "qa",
  "packId": "qa-agent-pack",
  "projectId": "PCC",
  "tenantId": "tenant-test",
  "requestedAt": "2026-08-10T00:00:00Z"
}

test_nonprod_l0_read_allowed if {
  decision := world.decision with input as {
    "context": object.union(base_context, {"environment": "qa"}),
    "definition": {
      "riskLevel": "L0",
      "approvalMode": "none",
      "actionClass": "read",
      "productionMutation": false
    }
  }
  decision.effect == "allow"
  decision.riskLevel == "L0"
}

test_nonprod_l3_external_write_requires_human if {
  decision := world.decision with input as {
    "context": object.union(base_context, {"environment": "qa"}),
    "definition": {
      "riskLevel": "L3",
      "approvalMode": "human",
      "actionClass": "external-write",
      "productionMutation": false
    }
  }
  decision.effect == "approval"
  decision.riskLevel == "L3"
  decision.approvalMode == "human"
}

test_prod_read_escalates_to_l4 if {
  decision := world.decision with input as {
    "context": object.union(base_context, {"environment": "prod"}),
    "definition": {
      "riskLevel": "L0",
      "approvalMode": "none",
      "actionClass": "read",
      "productionMutation": false
    }
  }
  decision.effect == "approval"
  decision.riskLevel == "L4"
  decision.approvalMode == "privileged-process"
}

test_prod_external_org_write_remains_l3_human if {
  decision := world.decision with input as {
    "context": object.union(base_context, {"environment": "prod"}),
    "definition": {
      "riskLevel": "L3",
      "approvalMode": "human",
      "actionClass": "external-write",
      "productionMutation": false
    }
  }
  decision.effect == "approval"
  decision.riskLevel == "L3"
  decision.approvalMode == "human"
}

test_prod_mutation_denied if {
  decision := world.decision with input as {
    "context": object.union(base_context, {"environment": "prod"}),
    "definition": {
      "riskLevel": "L4",
      "approvalMode": "privileged-process",
      "actionClass": "mutation",
      "productionMutation": true
    }
  }
  decision.effect == "deny"
  decision.riskLevel == "L4"
}
