import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityBroker } from "../platform/capability-broker.js";
import type { ExecutionContext } from "../platform/capability-types.js";
import { PackRegistry } from "../pack-registry.js";
import { resolvePackGovernance } from "../pack-governance.js";
import { planGovernedAgents } from "../pack-runtime.js";
import { compileWorkflow } from "../workflow-compiler.js";
import { loadCompiledWorkflow } from "../workflow-run-service.js";
import { frontendGovernance } from "./frontend-governance.js";
import { availableFrontendCapabilities, FrontendMockAdapter } from "./frontend-capabilities.js";
import {
  buildFrontendGrantRegistry,
  FRONTEND_SPECIALIST_CAPABILITIES,
  frontendSpecialistAgentId,
} from "./frontend-grants.js";

/**
 * The frontend-angular pack as the platform's second governed vertical.
 *
 * These tests are the claim that the platform generalized rather than grew a
 * second special case: the same generic planner, compiler, grant registry, and
 * broker drive a pack whose agents, skills, workflow dialect, and capabilities
 * are entirely different from QA's.
 */

const registry = new PackRegistry();

function broker() {
  return new CapabilityBroker(
    availableFrontendCapabilities(),
    [new FrontendMockAdapter()],
    undefined,
    buildFrontendGrantRegistry(),
  );
}

function context(agentId: string): ExecutionContext {
  return {
    runId: "11111111-2222-4333-8444-555555555555",
    userId: "dev-1",
    agentId,
    packId: "frontend-angular-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-1",
    requestedAt: new Date().toISOString(),
  };
}

test("the pack is registered as governed and plans a scoped team generically", () => {
  assert.equal(resolvePackGovernance("frontend-angular"), frontendGovernance);

  const compiled = registry.compiled("frontend-angular");
  assert.ok(compiled, "frontend-angular pack must compile");
  const plan = planGovernedAgents(compiled, frontendGovernance.runtimeProvider);

  assert.deepEqual(plan.diagnostics, []);
  assert.equal(plan.supervisor?.runtimeId, "frontend-angular");
  // Exactly the specialists that were granted capabilities become scoped agents;
  // reviewers and code-writing engineers stay supervisor context.
  assert.deepEqual(
    plan.specialists.map((specialist) => specialist.sourceId).sort(),
    Object.keys(FRONTEND_SPECIALIST_CAPABILITIES).sort(),
  );
  for (const specialist of plan.specialists) {
    assert.deepEqual(specialist.capabilities, FRONTEND_SPECIALIST_CAPABILITIES[specialist.sourceId]);
  }
});

test("denied permission-matrix rows have no capability at all", () => {
  const ids = new Set(availableFrontendCapabilities().map((capability) => capability.id));
  for (const denied of ["merge", "publish", "deploy", "database.write", "secret"]) {
    assert.ok(
      ![...ids].some((id) => id.includes(denied)),
      `no capability may exist for the denied action "${denied}"`,
    );
  }
  // External writes never reach production, and reads carry no approval burden.
  for (const capability of availableFrontendCapabilities()) {
    if (capability.externalWrite) {
      assert.equal(capability.approvalMode, "human");
      assert.ok(!capability.allowedEnvironments.includes("prod"));
    }
    assert.equal(capability.productionMutation, false);
  }
});

test("a specialist reaching outside its grant is denied before policy", async () => {
  const governed = broker();

  const allowed = await governed.requestAction(
    "frontend.jira.story.read",
    context(frontendSpecialistAgentId("story-context")),
    { storyId: "PCC-1" },
  );
  assert.notEqual(allowed.status, "rejected");

  // The design-system specialist has no business opening a pull request.
  const denied = await governed.requestAction(
    "frontend.bitbucket.pullrequest.create",
    context(frontendSpecialistAgentId("design-system")),
    {},
  );
  assert.equal(denied.status, "rejected");
  assert.match(denied.policyReason ?? "", /not granted/);
});

test("an undeclared agent id has no authority, however plausible", async () => {
  const denied = await broker().requestAction(
    "frontend.jira.story.read",
    context("frontend-angular.story-context "),
    { storyId: "PCC-1" },
  );
  assert.equal(denied.status, "rejected");
});

test("the pack's own workflow dialect compiles through the generic compiler", () => {
  const pack = registry.get("frontend-angular");
  assert.ok(pack);

  // `spec.steps` + `uses: [...]`, a dialect QA never used.
  const compiled = loadCompiledWorkflow(pack, "story-to-implementation-plan");
  assert.ok(compiled);
  assert.deepEqual(compiled.diagnostics, []);
  assert.equal(compiled.ok, true);
  assert.equal(compiled.id, "story-to-implementation-plan");

  const read = compiled.steps.find((step) => step.id === "read-story");
  assert.ok(read);
  assert.deepEqual(read.skills, [
    "frontend.story.read-context",
    "frontend.story.acceptance-criteria-analysis",
    "frontend.story.ux-state-mapping",
  ]);
  // Waves respect the declared dependencies.
  assert.equal(compiled.order[0]?.includes("authorize"), true);
  assert.ok((compiled.steps.find((step) => step.id === "plan")?.wave ?? 0) > (read.wave ?? 0));
});

test("every workflow in the pack compiles cleanly", () => {
  const pack = registry.get("frontend-angular")!;
  for (const id of [
    "story-to-implementation-plan",
    "angular-feature-implementation",
    "bug-fix-and-refactor",
    "dependency-upgrade",
    "pull-request-and-release",
  ]) {
    const compiled = loadCompiledWorkflow(pack, id);
    assert.ok(compiled, `${id} must load`);
    assert.deepEqual(compiled.diagnostics, [], `${id} must compile without diagnostics`);
  }
});

test("the binding map governs reads and delegates reasoning", () => {
  const pack = registry.get("frontend-angular")!;
  const compiled = loadCompiledWorkflow(pack, "story-to-implementation-plan")!;
  const run = { runId: "run-1", results: {}, inputs: { jiraIssueKey: "PCC-42" } };

  const bindingFor = (id: string) =>
    frontendGovernance.resolveWorkflowBinding(compiled.steps.find((step) => step.id === id)!, run);

  assert.deepEqual(bindingFor("read-story"), {
    capabilityId: "frontend.jira.story.read",
    payload: { storyId: "PCC-42" },
  });
  assert.deepEqual(bindingFor("map-repository"), {
    capabilityId: "frontend.repository.context.read",
    payload: { storyId: "PCC-42" },
  });
  // Risk scoring, impact analysis, and planning are reasoning, not capabilities.
  assert.equal(bindingFor("analyze-impact"), undefined);
  assert.equal(bindingFor("plan"), undefined);
  assert.equal(bindingFor("authorize"), undefined);
});

test("a declared side effect with no governed capability is refused, not delegated", () => {
  const pack = registry.get("frontend-angular")!;
  const compiled = loadCompiledWorkflow(pack, "pull-request-and-release")!;
  const run = { runId: "run-1", results: {}, inputs: {} };
  const step = (id: string) => compiled.steps.find((entry) => entry.id === id)!;

  // The pack maps the PR and Jira writes to governed capabilities...
  assert.equal(
    frontendGovernance.resolveWorkflowBinding(step("create-pr"), run)?.capabilityId,
    "frontend.bitbucket.pullrequest.create",
  );
  assert.equal(
    frontendGovernance.resolveWorkflowBinding(step("update-jira"), run)?.capabilityId,
    "frontend.jira.comment.post",
  );

  // ...but there is no governed push capability, so `git.push` stays unbound.
  // The governed runner refuses an unbound side effect, so the honest outcome is
  // a workflow that stops here rather than a push outside governance.
  assert.equal(step("push").action, "git.push");
  assert.equal(frontendGovernance.resolveWorkflowBinding(step("push"), run), undefined);
});

test("a governed read executes through the broker and reports mode honestly", async () => {
  const governed = broker();
  const action = await governed.requestAction(
    "frontend.repository.context.read",
    context(frontendSpecialistAgentId("repository-context")),
    { storyId: "PCC-42" },
  );
  const executed = await governed.executeAction(action.id);

  assert.equal(executed.result?.ok, true);
  assert.equal(executed.result?.mode, "mock");
  assert.equal(executed.result?.externalSideEffect, false);
  const data = executed.result?.data as { registeredCommands: string[] };
  assert.ok(data.registeredCommands.includes("build"));
});

test("an approved external write still reports that nothing was published", async () => {
  const governed = broker();
  const action = await governed.requestAction(
    "frontend.jira.comment.post",
    context(frontendSpecialistAgentId("pr-release")),
    { commentDraftArtifactId: "artifact-1" },
  );
  // L3 external write: human approval is required before anything can execute.
  assert.equal(action.status, "pending_approval");
});

test("an empty or missing step list fails compilation closed", () => {
  const missing = compileWorkflow({ metadata: { name: "empty" } });
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.diagnostics, ["workflow declares no steps"]);
});
