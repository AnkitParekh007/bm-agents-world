# Python Agent MVP Readiness

## Control plane
- [ ] Authenticated user and project selection
- [ ] Persisted run state and immutable audit
- [ ] Project, agent, skill, tool, and artifact registries
- [ ] Policy engine and payload-bound approval service

## Execution
- [ ] Disposable non-root Python workers
- [ ] Version/profile detection
- [ ] Path, command, network, CPU, memory, process, and time limits
- [ ] Formatter, linter, type checker, pytest, coverage, and package/build adapters
- [ ] Redacted artifact storage

## Integrations
- [ ] Jira/Confluence/Bitbucket read access
- [ ] Approved package index access
- [ ] Database schema and bounded diagnostic read access
- [ ] CI and observability read access
- [ ] Secret broker with no raw secrets in model context

## Safety
- [ ] External writes require approval
- [ ] Production mutations denied
- [ ] Force push, merge, secret retrieval, and policy disabling denied
- [ ] Prompt-injection and malicious-dependency tests pass
- [ ] Credential revocation and incident procedure tested

## Pilot
- [ ] One low-risk repository selected
- [ ] Golden tasks pass reproducibly
- [ ] Human review effort measured
- [ ] Stop criteria and rollback defined
