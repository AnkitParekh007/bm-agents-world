import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityGrantRegistry } from "./capability-grants.js";

test("a scoped agent may request only its granted capabilities", () => {
  const grants = new CapabilityGrantRegistry({
    "qa.browser-qa": ["qa.playwright.test.run"],
  });
  assert.equal(grants.isScoped("qa.browser-qa"), true);
  assert.equal(grants.allows("qa.browser-qa", "qa.playwright.test.run"), true);
  assert.equal(grants.allows("qa.browser-qa", "qa.jira.bug.create"), false);
  assert.deepEqual(grants.grantsFor("qa.browser-qa"), ["qa.playwright.test.run"]);
});

test("an unscoped agent is unrestricted by the grant layer", () => {
  const grants = new CapabilityGrantRegistry({
    "qa.browser-qa": ["qa.playwright.test.run"],
  });
  assert.equal(grants.isScoped("qa"), false);
  assert.equal(grants.allows("qa", "qa.jira.bug.create"), true);
  assert.equal(grants.allows("qa", "anything.at.all"), true);
  assert.deepEqual(grants.grantsFor("qa"), []);
});

test("an empty registry scopes nothing", () => {
  const grants = new CapabilityGrantRegistry();
  assert.equal(grants.isScoped("qa.browser-qa"), false);
  assert.equal(grants.allows("qa.browser-qa", "qa.jira.bug.create"), true);
});
