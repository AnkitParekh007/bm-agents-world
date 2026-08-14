import assert from "node:assert/strict";
import test from "node:test";
import { availableQaCapabilities, QA_CAPABILITIES } from "./qa-capabilities.js";

const MOCK_ONLY = ["qa.database.validation.read"];
const ENV_KEYS = ["QA_DATABASE_VALIDATION_ENABLED"] as const;

function snapshotEnv() {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function ids(capabilities: { id: string }[]) {
  return capabilities.map((capability) => capability.id);
}

test("mock-only capabilities are hidden from the agent by default", () => {
  const before = snapshotEnv();
  try {
    for (const key of ENV_KEYS) delete process.env[key];
    const available = ids(availableQaCapabilities());
    for (const id of MOCK_ONLY) {
      assert.equal(available.includes(id), false, `${id} should be hidden by default`);
    }
    // The real-adapter capabilities remain available even without the opt-in flags.
    assert.equal(available.includes("qa.jira.story.read"), true);
    assert.equal(available.includes("qa.playwright.test.run"), true);
    assert.equal(available.includes("qa.jira.bug.create"), true);
    assert.equal(available.includes("qa.testplan.generate"), true);
    // Teams and API contract checks have real adapters, so they are always available (live-or-mock).
    assert.equal(available.includes("qa.teams.status.post"), true);
    assert.equal(available.includes("qa.api.contract.test"), true);
  } finally {
    restoreEnv(before);
  }
});

test("mock-only capabilities appear only when explicitly opted in", () => {
  const before = snapshotEnv();
  try {
    process.env.QA_DATABASE_VALIDATION_ENABLED = "true";
    const available = ids(availableQaCapabilities());
    assert.equal(available.includes("qa.database.validation.read"), true);
  } finally {
    restoreEnv(before);
  }
});

test("the full catalog is never mutated by the availability filter", () => {
  const before = snapshotEnv();
  try {
    for (const key of ENV_KEYS) delete process.env[key];
    availableQaCapabilities();
    assert.equal(QA_CAPABILITIES.length, 10);
    for (const id of MOCK_ONLY) {
      assert.ok(QA_CAPABILITIES.some((capability) => capability.id === id));
    }
  } finally {
    restoreEnv(before);
  }
});
