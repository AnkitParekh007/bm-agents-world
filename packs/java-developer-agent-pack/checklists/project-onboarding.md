# Java Project Onboarding Checklist

## Ownership and scope
- [ ] Project, repositories, modules and owners recorded
- [ ] Jira projects and Confluence spaces mapped
- [ ] Branch protections, code owners and bot identity agreed
- [ ] Allowed environments and actions approved

## Runtime and framework
- [ ] JDK vendor and supported versions recorded
- [ ] Source/target/release and bytecode compatibility recorded
- [ ] Spring/Jakarta/vendor framework and application-server versions recorded
- [ ] Packaging and deployment topology recorded

## Build and dependencies
- [ ] Maven/Gradle wrappers and canonical commands verified
- [ ] Parent POMs, BOMs, convention plugins and private repositories mapped
- [ ] Dependency verification, license and vulnerability policies recorded
- [ ] Artifact naming, publication and signing process documented

## Data and integration
- [ ] Databases, schemas, migration tools and read-only roles mapped
- [ ] APIs, OpenAPI documents and consumers mapped
- [ ] Kafka/JMS/RabbitMQ, schema registry, cache and schedulers mapped
- [ ] Sensitive data classifications and retention rules recorded

## Quality
- [ ] Unit, integration, contract and migration test commands verified
- [ ] Static-analysis, formatting, coverage and mutation thresholds recorded
- [ ] Testcontainers or approved integration environment available
- [ ] Representative green baseline captured

## Security and operations
- [ ] Vault references and workload identities configured
- [ ] Egress allowlist and sandbox limits approved
- [ ] Logs, metrics, traces, JFR, dashboards and runbooks mapped
- [ ] Kill switch and incident contacts tested

## Acceptance
- [ ] Read-only profile succeeds
- [ ] Isolated patch and build succeeds
- [ ] External write is denied without approval
- [ ] Production mutation is denied
- [ ] Audit and evidence are complete
