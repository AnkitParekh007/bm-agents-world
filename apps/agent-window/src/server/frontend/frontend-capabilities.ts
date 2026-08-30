import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";

/**
 * Governed capabilities for the frontend-angular pack (Phase 9).
 *
 * These are derived directly from the pack's `permission-matrix.csv`, and the
 * derivation runs in both directions:
 *
 * - What the matrix allows appears here at the risk level and in the
 *   environments it names — reads at L0 everywhere, quality gates at L1 outside
 *   production, remote writes at L3 with payload-bound human approval and never
 *   in production.
 * - What the matrix denies is *absent*. Package publish, pull-request merge,
 *   production deploy or config write, database write, and secret disclosure
 *   have no capability at all, so there is nothing for an agent to request and
 *   nothing for an approver to be socially engineered into approving. A denied
 *   action is not a capability that refuses; it is no capability.
 *
 * The workspace-write and dependency-install rows of the matrix are local-only
 * developer actions with no server-side adapter in this runtime, so they are
 * likewise absent rather than modelled as remote capabilities.
 */
export const FRONTEND_CAPABILITIES: CapabilityDefinition[] = [
  {
    id: "frontend.jira.story.read",
    system: "jira",
    action: "story.read",
    description: "Read a scoped Jira story, acceptance criteria, and linked UX notes for a frontend change.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "frontend-mock-adapter",
  },
  {
    id: "frontend.repository.context.read",
    system: "bitbucket",
    action: "repository.context.read",
    description: "Read authorized repository metadata for the workspace map: projects, build commands, conventions, and protected paths.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "frontend-mock-adapter",
  },
  {
    id: "frontend.design.tokens.read",
    system: "design",
    action: "tokens.read",
    description: "Read approved design-system tokens and component metadata for an allowlisted design file. Returns tokens and component names only, never file exports or credentials.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "frontend-mock-adapter",
  },
  {
    id: "frontend.plan.generate",
    system: "frontend",
    action: "plan.generate",
    description: "Persist an immutable, story-scoped implementation plan artifact (change boundary, affected components, rollout and rollback steps) derived from the story and repository reads.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "frontend-plan-adapter",
  },
  {
    id: "frontend.quality.gates.run",
    system: "frontend",
    action: "quality.gates.run",
    description: "Run the project's registered quality gates (format, lint, typecheck, unit tests, build) and return their aggregated results. Only named, pre-registered commands run; the model never supplies a command line.",
    riskLevel: "L1",
    approvalMode: "standing-policy",
    actionClass: "test",
    externalWrite: false,
    productionMutation: false,
    // The permission matrix denies quality-gate execution in production.
    allowedEnvironments: ["playground", "qa"],
    adapterId: "frontend-mock-adapter",
  },
  {
    id: "frontend.bitbucket.pullrequest.create",
    system: "bitbucket",
    action: "pullrequest.create",
    description: "Create a pull request from an approved, already-pushed branch using the exact immutable pull-request-draft artifact. The agent can neither approve nor merge the pull request.",
    riskLevel: "L3",
    approvalMode: "human",
    actionClass: "external-write",
    externalWrite: true,
    productionMutation: false,
    // The matrix denies branch/commit/push/PR operations in production.
    allowedEnvironments: ["playground", "qa"],
    adapterId: "frontend-mock-adapter",
  },
  {
    id: "frontend.jira.comment.post",
    system: "jira",
    action: "comment.post",
    description: "Post an implementation-status comment to the scoped Jira story from the exact approved draft artifact.",
    riskLevel: "L3",
    approvalMode: "human",
    actionClass: "external-write",
    externalWrite: true,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa"],
    adapterId: "frontend-mock-adapter",
  },
];

/**
 * Capabilities hidden unless their environment flag is set. Quality-gate
 * execution runs registered project commands on the server, which needs
 * per-project command registration and a workspace checkout, so it stays off the
 * default surface until a deployment opts in — and executes as an honest mock
 * even then, until that infrastructure is configured.
 */
const OPT_IN_CAPABILITY_FLAGS: Record<string, string> = {
  "frontend.quality.gates.run": "FRONTEND_QUALITY_GATES_ENABLED",
};

function capabilityEnabled(id: string): boolean {
  const flag = OPT_IN_CAPABILITY_FLAGS[id];
  if (!flag) return true;
  const raw = process.env[flag]?.trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/**
 * The frontend capabilities the runtime registers. Capabilities the deployment
 * cannot execute are excluded, so the agent only ever sees what it can run.
 */
export function availableFrontendCapabilities(): CapabilityDefinition[] {
  return FRONTEND_CAPABILITIES.filter((capability) => capabilityEnabled(capability.id));
}

function storyFixture(projectId: string, storyId: string) {
  return {
    key: storyId,
    projectId,
    title: `Sample ${projectId} frontend story loaded through the capability adapter`,
    status: "Ready for development",
    acceptanceCriteria: [
      "The new view renders the specified states: loading, empty, error, and populated.",
      "All interactive controls are reachable and operable by keyboard.",
      "Existing routes and their guards continue to behave as before.",
    ],
    uxNotes: ["Reuse the existing design-system table and pagination components."],
    source: "mock-adapter",
    note: "Configure approved server-side Jira credentials to enable the live read adapter.",
  };
}

/**
 * Honest mock for every frontend capability without a live adapter yet. It never
 * claims an external side effect: results carry `mode: "mock"` and
 * `externalSideEffect: false`, so an approved L3 write reports plainly that
 * nothing was published.
 */
export class FrontendMockAdapter implements CapabilityAdapter {
  readonly id = "frontend-mock-adapter";

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    const base = { ok: true as const, mode: "mock" as const, externalSideEffect: false };

    switch (definition.id) {
      case "frontend.jira.story.read": {
        const storyId = String(payload.storyId ?? `${context.projectId}-DEMO-1`);
        return { ...base, data: storyFixture(context.projectId, storyId) };
      }
      case "frontend.repository.context.read":
        return {
          ...base,
          data: {
            projectId: context.projectId,
            storyId: payload.storyId,
            framework: { angular: "17.3", typescript: "5.4", node: "20.11", rxjs: "7.8" },
            workspaceProjects: ["web-app", "shared-ui"],
            registeredCommands: ["format", "lint", "typecheck", "test", "build"],
            protectedPaths: ["src/app/core/auth", "src/app/core/interceptors"],
            source: "mock-adapter",
            note: "Configure approved server-side Bitbucket credentials to enable the live read adapter.",
          },
        };
      case "frontend.design.tokens.read":
        return {
          ...base,
          data: {
            designFile: payload.designFileId ?? "approved-design-system",
            tokens: { "color.surface": "var(--surface)", "space.4": "16px", "radius.md": "8px" },
            components: ["DataTable", "Pagination", "EmptyState"],
            source: "mock-adapter",
            note: "Configure an approved design-system connector to enable live token reads.",
          },
        };
      case "frontend.quality.gates.run":
        return {
          ...base,
          data: {
            project: context.projectId,
            gates: [
              { id: "lint", status: "passed", findings: 0 },
              { id: "typecheck", status: "passed", findings: 0 },
              { id: "test", status: "failed", failed: 1, total: 42 },
              { id: "build", status: "passed" },
            ],
            aggregate: "failed",
            note: "No commands were executed because registered project quality gates are not configured.",
          },
        };
      case "frontend.bitbucket.pullrequest.create":
        return {
          ...base,
          data: {
            simulated: true,
            pullRequestDraftArtifactId: payload.pullRequestDraftArtifactId,
            note: "Human approval was verified, but no pull request was created because the live adapter is not connected.",
          },
        };
      case "frontend.jira.comment.post":
        return {
          ...base,
          data: {
            simulated: true,
            storyId: payload.storyId,
            commentDraftArtifactId: payload.commentDraftArtifactId,
            note: "Human approval was verified, but no Jira comment was posted because the live adapter is not connected.",
          },
        };
      default:
        return {
          ok: false,
          mode: "mock",
          externalSideEffect: false,
          error: `Mock frontend adapter does not implement ${definition.id}`,
        };
    }
  }
}
