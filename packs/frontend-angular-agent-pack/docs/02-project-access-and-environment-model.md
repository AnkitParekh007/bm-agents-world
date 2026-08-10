# Project Access and Environment Model

## 1. Access boundary

The Angular agent is not a single account with access to every project. A run receives a scoped capability envelope containing:

- organization ID
- project ID
- repository ID
- target and working branch
- Jira issue ID
- optional Figma file or node IDs
- target environment
- requester identity and team
- permitted tools and action classes
- expiry time
- approval references

No tool may infer a broader project or environment from a URL supplied in untrusted story text.

## 2. Required project resources

Each onboarded project should register:

### Work management

- Jira project key
- issue types and workflow statuses
- required labels, components, and custom fields
- link conventions for stories, bugs, epics, and releases

### Source control

- Bitbucket deployment type
- workspace or project key
- frontend repository URL
- default branch
- permitted base branches
- branch naming policy
- code owners and required reviewers
- signed-commit policy
- merge checks and pipeline requirements

### Frontend toolchain

- Angular or AngularJS version
- Angular CLI or custom build tooling version
- Node.js and package-manager version
- TypeScript and RxJS version
- package registry and proxy configuration
- unit and end-to-end test frameworks
- linting, formatting, and static-analysis commands
- design-system and component-library locations

### Backend and contract context

The frontend agent normally requires read-only access to:

- OpenAPI specifications
- backend DTOs or generated clients
- API examples and error contracts
- authentication and authorization conventions
- feature-flag definitions

Direct database access is not a default frontend capability.

### Design and knowledge

- Figma team/project/file references
- design tokens
- Storybook or component documentation URL
- architecture decisions
- UX and accessibility standards
- product documentation

### Environments

For each environment register:

- application URL
- API base URL
- allowed origins
- feature-flag profile
- test identities
- browser-storage-state references
- observability source
- deployment metadata source

## 3. Environment policy

| Environment | Read | Browser interaction | Test data mutation | Code deployment |
|---|---:|---:|---:|---:|
| Local isolated workspace | Yes | Yes | Synthetic/local only | No |
| Playground | Yes | Approved workflows | Approved test identities | Trigger only with approval |
| QA | Yes | Approved workflows | Approval or standing policy | Trigger only with approval |
| Production | Explicit approval | Read-only smoke checks | Denied | Denied to agent |

## 4. Repository workspace model

Each run receives an ephemeral workspace:

`/workspaces/<run-id>/<project>/<repository>`

Controls:

- clone only the authorized repository and commit range
- verify the remote origin before any push
- create a new run-specific working branch
- deny modification outside workspace roots
- deny access to user home directories and unrelated repositories
- remove credentials before model-visible command output
- destroy the workspace after retention and audit requirements are satisfied

## 5. Version-aware execution profiles

### PCC — Angular 12

- preserve Angular 12, TypeScript, RxJS, builder, and test compatibility
- do not generate standalone components, native control flow, or signals
- use the repository's existing NgModule and testing patterns
- isolate upgrade recommendations from feature implementation

### SOP — Angular 15

- use APIs supported by Angular 15
- do not silently generate features introduced in later Angular versions
- inspect typed forms, standalone component adoption, and builder conventions before use

### DataBridge — AngularJS

- treat the framework as end-of-life and high risk
- prefer minimal behavior-preserving patches
- add characterization tests before refactoring
- avoid mixing Angular modernization into unrelated bug fixes
- produce a separate migration recommendation when relevant

## 6. Access onboarding checklist

Before enabling a project, confirm:

- repository read access works with a project-scoped identity
- branch writes use a separate approval-controlled identity
- private package restore works without exposing tokens
- build and test commands are deterministic
- environment URLs and allowed origins are registered
- Figma and Storybook access is scoped
- secrets resolve only inside tool adapters
- audit logs identify requester, run, tool, repository, branch, and commit
