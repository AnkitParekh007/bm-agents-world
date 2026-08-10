# Key Vault, Identity, and Secrets

## 1. Non-negotiable rule

The language model must never receive raw repository tokens, OAuth refresh tokens, npm credentials, browser passwords, session cookies, signing keys, or vault values.

## 2. Identity flow

`Agent workload identity -> policy engine -> capability lease -> credential broker -> vault/secret manager -> tool adapter -> target system`

The adapter injects the credential directly into the protocol client or process environment. Tool output is scrubbed before reaching the model.

## 3. Recommended identities

Separate principals by capability:

- Jira/Confluence reader
- Jira writer
- Bitbucket reader
- Bitbucket branch writer
- pull-request creator
- private package reader
- Figma reader
- Storybook reader
- browser test user per project/environment
- SonarQube reader/analyzer
- environment/deployment reader
- pipeline trigger identity
- artifact writer
- Teams publisher

Do not reuse a developer's personal token as the agent's service identity.

## 4. Secret reference hierarchy

`frontend-agent/<org>/<project>/<environment>/<system>/<capability>`

Examples:

- `.../bitbucket/reader`
- `.../bitbucket/branch-writer`
- `.../npm/read-token`
- `.../figma/reader`
- `.../browser/test-user`

Configuration files store references and metadata only.

## 5. Credential lifetime

- prefer workload federation or managed identity
- use short-lived scoped access tokens
- use dynamic credentials where supported
- bind tokens to project, repository, environment, and action
- expire capability leases when the run or approval ends
- rotate non-dynamic credentials automatically

## 6. Browser credentials

- create dedicated non-human test identities
- use isolated storage-state files encrypted at rest
- never commit storage state to a repository
- create separate identities per project and environment
- disable or restrict production identities
- redact cookies, authorization headers, and sensitive DOM values from evidence

## 7. Private package registry

The package manager executes in a sandbox with a temporary user configuration file. The model can request an approved install command, but cannot read the registry token or resulting configuration. Package publication is denied.

## 8. Secret-leak prevention

Scan:

- prompts and retrieved documents
- repository files read into model context
- generated patches
- command output
- browser console and network evidence
- pull-request descriptions and Jira comments

On detection:

1. stop publication
2. quarantine the artifact
3. revoke or rotate exposed credentials when necessary
4. create a security audit event
5. require a privileged reviewer

## 9. Supported providers

The pack is provider-neutral and can be implemented with:

- Google Secret Manager and Workload Identity Federation
- Azure Key Vault and managed identities
- HashiCorp Vault dynamic credentials
- an existing enterprise vault behind the credential-broker interface
