import assert from "node:assert/strict";
import test from "node:test";
import type { ExecutionContext } from "./capability-types.js";
import {
  canAccessExecutionContext,
  canAccessProject,
  canSelfApprove,
  localIdentity,
  type RequestIdentity,
} from "./request-identity.js";

function context(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    runId: "11111111-1111-4111-8111-111111111111",
    userId: "requester",
    agentId: "qa",
    packId: "qa-agent-pack",
    projectId: "PCC",
    environment: "qa",
    tenantId: "tenant-a",
    requestedAt: "2026-08-10T00:00:00.000Z",
    ...overrides,
  };
}

test("local identity is project scoped from environment configuration", () => {
  const previous = process.env.BM_LOCAL_PROJECT_IDS;
  process.env.BM_LOCAL_PROJECT_IDS = "PCC,SOP";
  try {
    const identity = localIdentity();
    assert.equal(canAccessProject(identity, "PCC"), true);
    assert.equal(canAccessProject(identity, "DataBridge"), false);
  } finally {
    if (previous === undefined) delete process.env.BM_LOCAL_PROJECT_IDS;
    else process.env.BM_LOCAL_PROJECT_IDS = previous;
  }
});

test("execution context access requires tenant and project membership", () => {
  const identity: RequestIdentity = {
    userId: "reviewer",
    tenantId: "tenant-a",
    projectIds: ["PCC"],
    source: "trusted-headers",
  };
  assert.equal(canAccessExecutionContext(identity, context()), true);
  assert.equal(canAccessExecutionContext(identity, context({ tenantId: "tenant-b" })), false);
  assert.equal(canAccessExecutionContext(identity, context({ projectId: "SOP" })), false);
});

test("trusted identities cannot self-approve protected actions", () => {
  const trusted: RequestIdentity = {
    userId: "requester",
    tenantId: "tenant-a",
    projectIds: ["PCC"],
    source: "trusted-headers",
  };
  assert.equal(canSelfApprove(trusted), false);
});
