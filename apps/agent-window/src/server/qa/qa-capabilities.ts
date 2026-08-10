import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";

export const QA_CAPABILITIES: CapabilityDefinition[] = [
  {
    id: "qa.jira.story.read",
    system: "jira",
    action: "story.read",
    description: "Read a scoped Jira story and acceptance criteria.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-jira-read-adapter",
  },
  {
    id: "qa.bitbucket.change-impact.read",
    system: "bitbucket",
    action: "change-impact.read",
    description: "Inspect repository metadata and prepare a change-impact summary.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-bitbucket-read-adapter",
  },
  {
    id: "qa.database.validation.read",
    system: "database",
    action: "validation.read",
    description: "Run a bounded read-only QA validation against an approved view.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-mock-adapter",
  },
  {
    id: "qa.playwright.test.run",
    system: "playwright",
    action: "test.run",
    description: "Run an allowlisted browser test against a non-production QA target.",
    riskLevel: "L1",
    approvalMode: "standing-policy",
    actionClass: "test",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa"],
    adapterId: "qa-mock-adapter",
  },
  {
    id: "qa.jira.bug.create",
    system: "jira",
    action: "bug.create",
    description: "Create a Jira bug from a reviewed defect draft.",
    riskLevel: "L3",
    approvalMode: "human",
    actionClass: "external-write",
    externalWrite: true,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-mock-adapter",
  },
  {
    id: "qa.teams.status.post",
    system: "teams",
    action: "status.post",
    description: "Post a QA status message to an approved Teams channel.",
    riskLevel: "L3",
    approvalMode: "human",
    actionClass: "external-write",
    externalWrite: true,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-mock-adapter",
  },
];

function storyFixture(projectId: string, storyId: string) {
  return {
    key: storyId,
    projectId,
    title: `Sample ${projectId} story loaded through the QA capability adapter`,
    status: "Ready for QA",
    acceptanceCriteria: [
      "Primary happy path behaves as specified.",
      "Validation errors are clear and recoverable.",
      "Existing related behavior remains backward compatible.",
    ],
    source: "mock-adapter",
    note: "Configure approved server-side Jira credentials to enable the live read adapter.",
  };
}

export class QaMockAdapter implements CapabilityAdapter {
  readonly id = "qa-mock-adapter";

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    switch (definition.id) {
      case "qa.jira.story.read": {
        const storyId = String(payload.storyId ?? `${context.projectId}-DEMO-1`);
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: storyFixture(context.projectId, storyId),
        };
      }
      case "qa.bitbucket.change-impact.read":
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: {
            projectId: context.projectId,
            storyId: payload.storyId,
            impactedAreas: ["frontend", "backend-api", "regression-suite"],
            repositoryProvider: "bitbucket",
            source: "mock-adapter",
            note: "Configure approved server-side Bitbucket credentials and project repositories to enable the live read adapter.",
          },
        };
      case "qa.database.validation.read":
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: {
            validation: payload.validation ?? "row-count-and-key-integrity",
            rowsInspected: 25,
            issuesFound: 0,
            bounded: true,
            readOnly: true,
          },
        };
      case "qa.playwright.test.run":
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: {
            target: context.environment,
            suite: payload.suite ?? "story-smoke",
            passed: 8,
            failed: 1,
            skipped: 0,
            evidence: ["mock://screenshot/failure-1", "mock://trace/run-1"],
            note: "No browser was launched; this is a contract-level simulation until Playwright MCP is connected.",
          },
        };
      case "qa.jira.bug.create":
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: {
            simulated: true,
            wouldCreate: {
              projectId: context.projectId,
              summary: payload.summary,
              severity: payload.severity,
              storyId: payload.storyId,
            },
            note: "Human approval was verified, but no Jira write occurred because the live Jira write adapter is not connected.",
          },
        };
      case "qa.teams.status.post":
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: {
            simulated: true,
            channel: payload.channel ?? "Teams-activities",
            message: payload.message,
            note: "Human approval was verified, but no Teams message was sent because the live adapter is not connected.",
          },
        };
      default:
        return {
          ok: false,
          mode: "mock",
          externalSideEffect: false,
          error: `Mock QA adapter does not implement ${definition.id}`,
        };
    }
  }
}
