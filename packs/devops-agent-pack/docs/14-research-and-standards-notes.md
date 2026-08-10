# Research and Standards Notes

This pack is intentionally tool- and provider-aware but repository-controlled. Resolve the versions and standards actually used by each project before generating changes.

## Primary references

- Kubernetes documentation: https://kubernetes.io/docs/
- Helm documentation: https://helm.sh/docs/
- Argo CD documentation: https://argo-cd.readthedocs.io/en/stable/
- Terraform documentation: https://developer.hashicorp.com/terraform/docs
- OpenTofu documentation: https://opentofu.org/docs/
- Ansible documentation: https://docs.ansible.com/
- Docker documentation: https://docs.docker.com/
- Bitbucket Pipelines documentation: https://support.atlassian.com/bitbucket-cloud/docs/build-test-and-deploy-with-pipelines/
- OpenTelemetry documentation: https://opentelemetry.io/docs/
- Prometheus documentation: https://prometheus.io/docs/
- HashiCorp Vault documentation: https://developer.hashicorp.com/vault/docs
- Open Policy Agent documentation: https://www.openpolicyagent.org/docs/latest/
- SLSA specification: https://slsa.dev/spec/
- Sigstore documentation: https://docs.sigstore.dev/
- NIST Secure Software Development Framework: https://csrc.nist.gov/Projects/ssdf
- OWASP CI/CD Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html
- FinOps Framework: https://www.finops.org/framework/
- Google SRE books: https://sre.google/books/

## Interpretation rules

- Current public documentation is a research baseline, not permission to upgrade a repository.
- Repository lock files, provider locks, cluster versions, cloud policy, and architecture decisions control implementation.
- Community MCP servers and plugins require code review, sandboxing, allow-listed egress, pinned versions, and security approval before enterprise use.
- Vendor examples are not production runbooks; adapt them to ownership, data classification, topology, rollback, and policy.
