# Frontend Project Onboarding Checklist

## Ownership and scope

- [ ] Project owner and frontend tech lead identified
- [ ] Jira project and issue conventions recorded
- [ ] Bitbucket deployment type confirmed
- [ ] Frontend repository and default branch registered
- [ ] Code owners, reviewers, and merge checks recorded

## Toolchain

- [ ] Angular or AngularJS version confirmed from repository
- [ ] Angular CLI/build tooling version confirmed
- [ ] Node.js and package manager pinned
- [ ] TypeScript and RxJS versions recorded
- [ ] Private package registry and proxy configured
- [ ] Install, format, lint, typecheck, test, build, and e2e commands validated
- [ ] Toolchain worker image passes a clean build

## Architecture and design

- [ ] Repository instructions and protected paths recorded
- [ ] Component, route, state, form, and API conventions mapped
- [ ] Figma/design-system references registered
- [ ] Storybook/component documentation registered where used
- [ ] OpenAPI or backend contract sources registered

## Environments

- [ ] Local, playground, QA, and production URLs registered
- [ ] Allowed origins defined
- [ ] Test identities created per environment
- [ ] Feature-flag and deployment metadata sources configured
- [ ] Production mode confirmed read-only

## Security and governance

- [ ] Read and write service identities separated
- [ ] Secret references created without values in configuration
- [ ] Branch writes, PR creation, Jira, Teams, and pipeline approvals tested
- [ ] Force push, merge, package publish, database write, and production deploy denied
- [ ] Prompt-injection and secret-leak tests pass
- [ ] Audit records can reconstruct a run

## Evaluation

- [ ] Ten representative stories prepared
- [ ] Five defect scenarios prepared
- [ ] Accessibility and security scenarios included
- [ ] Unsupported Angular API tests included
- [ ] Shadow-mode review completed by frontend engineers
