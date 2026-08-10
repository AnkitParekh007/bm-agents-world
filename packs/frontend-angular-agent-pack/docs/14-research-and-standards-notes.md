# Research and Standards Notes

Checked: 2026-08-06

## Angular versions and compatibility

The official Angular compatibility table lists Angular 22, 21, and 20 as actively supported at the time of this pack. It also records the required Node.js, TypeScript, and RxJS ranges for each Angular release. Angular 12 and Angular 15 are listed among unsupported versions, so PCC and SOP require pinned legacy toolchains and should not receive code generated for the newest Angular APIs.

Sources:

- https://angular.dev/reference/versions
- https://angular.dev/update-guide

## AngularJS

Official AngularJS documentation states that support ended in January 2022. DataBridge therefore uses a maintenance profile with minimal changes, characterization tests, stronger security review, and a separate modernization plan.

Source:

- https://docs.angularjs.org/misc/version-support-status

## Official Angular AI guidance

Angular publishes AI-oriented instructions that emphasize strict TypeScript, avoiding `any`, version-current standalone components, signals, lazy routes, accessible UI, simple templates, and modern input/output APIs. These recommendations must be filtered through the target project's version profile; many are not valid for Angular 12, Angular 15, or AngularJS.

Source:

- https://angular.dev/ai/develop-with-ai

## Testing

Current Angular CLI projects use Vitest by default, while Karma remains supported and migration guidance is available. The agent must inspect each repository and must not replace its test framework silently.

Sources:

- https://angular.dev/guide/testing
- https://angular.dev/guide/testing/migrating-to-vitest
- https://angular.dev/guide/testing/karma

## Security and accessibility

Angular documents built-in XSS protections and warns that client-side route guards are not an authorization boundary. Angular also provides accessibility practices. The pack requires server-side authorization, safe template practices, semantic HTML, keyboard/focus validation, and explicit security review.

Sources:

- https://angular.dev/best-practices/security
- https://angular.dev/guide/routing/route-guards
- https://angular.dev/best-practices/a11y

## MCP and browser tooling

MCP separates resources, prompts, and tools and emphasizes user consent, data privacy, access control, and confirmation for sensitive tool calls. Microsoft provides Playwright MCP for browser automation. Google provides Chrome DevTools for agents with MCP, CLI, and skills for inspection and performance debugging.

Sources:

- https://modelcontextprotocol.io/specification/2025-11-25
- https://github.com/microsoft/playwright-mcp
- https://developer.chrome.com/docs/devtools/agents/get-started

## Atlassian and Bitbucket

Atlassian Rovo MCP provides access to Jira, Confluence, Bitbucket, and other Atlassian products using the connected user's permissions. The pack therefore applies least privilege and approval to writes. An organization-owned Bitbucket adapter remains useful for Cloud/Data Center differences and strict branch-write controls.

Sources:

- https://support.atlassian.com/atlassian-ai-gateway/docs/use-atlassian-rovo-mcp-server/
- https://developer.atlassian.com/cloud/bitbucket/rest/

## Design, component, and quality integrations

Figma provides an MCP server for design context and canvas operations. SonarQube provides an MCP server for code quality and security. Storybook documents an MCP server, but its AI capabilities are currently preview and its documentation states that the preview is React-only; do not mark it as a required Angular capability until the project confirms compatible support. Standard Storybook usage without the preview MCP may still be valuable for Angular component documentation.

Sources:

- https://developers.figma.com/docs/figma-mcp-server/
- https://docs.sonarsource.com/sonarqube-mcp-server
- https://storybook.js.org/docs/ai/mcp/overview

## Implementation conclusion

The pack uses vendor servers when mature, organization adapters for missing controls, version-pinned worker images, deterministic build/test tools, explicit human approval for external writes, and no model-visible secrets.
