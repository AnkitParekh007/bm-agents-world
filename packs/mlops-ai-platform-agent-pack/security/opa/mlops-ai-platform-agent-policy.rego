package mlops_ai_platform

default allow := false

default require_approval := false

production_mutations := {
  "model.promote", "model.alias.update", "prompt.alias.update", "agent.promote",
  "serving.traffic.shift", "serving.deploy", "serving.rollback", "vector.index.swap",
  "vector.reembed.replace", "kubernetes.apply", "kubernetes.delete", "kubernetes.exec",
  "terraform.apply", "gpu.operator.upgrade", "gpu.driver.change", "model_gateway.route.update",
  "feature_store.write", "production.training.run", "production.batch_inference.rerun"
}

prohibited := {
  "risk.accept", "legal.interpretation.approve", "privacy.risk.accept", "responsible_ai.risk.accept",
  "secrets.read_raw", "artifact.signing_key.read", "branch.force_push", "security_gate.disable",
  "evaluation_gate.disable", "tenant.cross_data_mix", "production.shell.unrestricted"
}

allow if {
  input.action in {"metadata.read", "telemetry.read_bounded", "manifest.render", "pipeline.compile", "evaluation.run_nonprod", "sandbox.execute", "artifact.hash", "policy.evaluate", "draft.create"}
  input.authorized_project == true
  input.scope_bounded == true
}

require_approval if input.action in production_mutations

allow if {
  input.action in production_mutations
  input.executor == "deterministic_approved_executor"
  input.approval.valid == true
  input.approval.payload_hash == input.payload_hash
  input.approval.environment == input.environment
  input.stop_conditions_defined == true
  input.rollback_defined == true
}

deny_reason[msg] if {
  input.action in prohibited
  msg := "Action is prohibited for the MLOps / AI Platform Agent and remains human-owned or unavailable."
}

deny_reason[msg] if {
  input.environment == "production"
  input.free_form_model_execution == true
  input.action in production_mutations
  msg := "Production mutations cannot be executed by the free-form model."
}

deny_reason[msg] if {
  input.raw_secret_exposure == true
  msg := "Raw secret exposure is prohibited."
}

deny_reason[msg] if {
  input.cross_tenant_data == true
  msg := "Cross-tenant/customer data mixing is prohibited."
}
