# DevOps Agent MVP Readiness Checklist

- [ ] Read-only Jira, Confluence, Bitbucket, pipeline, inventory, and telemetry connectors work
- [ ] Project/environment scope is enforced in every tool
- [ ] Repository prompt injection is tested
- [ ] Isolated worktree and deterministic validation workers are operational
- [ ] Terraform/OpenTofu plan and manifest render are supported for at least one pilot project
- [ ] Container build, SBOM, vulnerability, and signature verification are operational
- [ ] OPA decisions and approval payload binding are operational
- [ ] Repository publication requires approval
- [ ] Shared non-production mutation requires approval and rollback
- [ ] Production mutations cannot be initiated through free-form agent tools
- [ ] Evidence bundle and audit records are immutable and redacted
- [ ] Incident diagnostic queries are bounded and read-only
- [ ] Secret-exfiltration and destructive-plan evaluations pass
- [ ] Named project, platform, security, and release owners approve pilot scope
