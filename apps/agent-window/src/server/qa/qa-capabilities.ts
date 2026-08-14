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
    id: "qa.jira.duplicate.search",
    system: "jira",
    action: "bug.duplicate.search",
    description: "Search recent unresolved Jira bugs for likely duplicates of an immutable bug-draft artifact.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-jira-defect-adapter",
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
    id: "qa.testplan.generate",
    system: "qa",
    action: "testplan.generate",
    description: "Persist an immutable, story-scoped QA test plan artifact (scope, test types, entry/exit criteria, and traceable cases) derived from the story and change-impact reads.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-testplan-adapter",
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
    adapterId: "qa-database-read-adapter",
  },
  {
    id: "qa.integration.trace",
    system: "qa",
    action: "integration.trace",
    description: "Correlate a run's test plan, execution result, and bug draft into an immutable traceability artifact with cross-step consistency checks.",
    riskLevel: "L0",
    approvalMode: "none",
    actionClass: "read",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-integration-trace-adapter",
  },
  {
    id: "qa.playwright.test.run",
    system: "playwright",
    action: "test.run",
    description: "Run an allowlisted isolated Chromium smoke test against a server-configured non-production target and persist evidence artifacts.",
    riskLevel: "L1",
    approvalMode: "standing-policy",
    actionClass: "test",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa"],
    adapterId: "qa-playwright-worker-adapter",
  },
  {
    id: "qa.api.contract.test",
    system: "api",
    action: "contract.test",
    description: "Run allowlisted read-only API contract checks (status, latency, and JSON field presence) against approved non-production endpoints.",
    riskLevel: "L1",
    approvalMode: "standing-policy",
    actionClass: "test",
    externalWrite: false,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa"],
    adapterId: "qa-api-contract-adapter",
  },
  {
    id: "qa.jira.bug.create",
    system: "jira",
    action: "bug.create",
    description: "Create a Jira bug from the exact immutable bug-draft artifact after payload-bound L3 human approval.",
    riskLevel: "L3",
    approvalMode: "human",
    actionClass: "external-write",
    externalWrite: true,
    productionMutation: false,
    allowedEnvironments: ["playground", "qa", "prod"],
    adapterId: "qa-jira-defect-adapter",
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
    adapterId: "qa-teams-adapter",
  },
];

/**
 * Capabilities hidden from the agent by default and shown only when their
 * environment flag is set. Database validation has a live adapter but depends on
 * heavier per-project infra (an approved read-only connection and an SQL
 * allowlist), so it stays off the default pilot surface until explicitly opted
 * in — and even then executes as an honest mock until that infra is configured.
 */
const OPT_IN_CAPABILITY_FLAGS: Record<string, string> = {
  "qa.database.validation.read": "QA_DATABASE_VALIDATION_ENABLED",
};

function capabilityEnabled(id: string): boolean {
  const flag = OPT_IN_CAPABILITY_FLAGS[id];
  if (!flag) return true;
  const raw = process.env[flag]?.trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/**
 * The capabilities the runtime should register and expose to the QA agent.
 * Mock-only capabilities are excluded unless explicitly opted in, so the agent
 * only ever sees capabilities it can actually execute.
 */
export function availableQaCapabilities(): CapabilityDefinition[] {
  return QA_CAPABILITIES.filter((capability) => capabilityEnabled(capability.id));
}

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
            note: "No browser was launched because Playwright live execution is not configured.",
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
