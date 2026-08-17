import assert from "node:assert/strict";
import test from "node:test";
import { CapabilityGrantRegistry } from "./capability-grants.js";

test("a scoped agent may request only its granted capabilities", () => {
  const grants = new CapabilityGrantRegistry({
    scoped: { "qa.browser-qa": ["qa.playwright.test.run"] },
  });
  assert.equal(grants.isScoped("qa.browser-qa"), true);
  assert.equal(grants.allows("qa.browser-qa", "qa.playwright.test.run"), true);
  assert.equal(grants.allows("qa.browser-qa", "qa.jira.bug.create"), false);
  assert.deepEqual(grants.grantsFor("qa.browser-qa"), ["qa.playwright.test.run"]);
});

test("a declared unrestricted principal may request anything", () => {
  const grants = new CapabilityGrantRegistry({
    scoped: { "qa.browser-qa": ["qa.playwright.test.run"] },
    unrestricted: ["qa"],
  });
  assert.equal(grants.isUnrestricted("qa"), true);
  assert.equal(grants.isScoped("qa"), false);
  assert.equal(grants.allows("qa", "qa.jira.bug.create"), true);
  assert.equal(grants.allows("qa", "anything.at.all"), true);
  assert.deepEqual(grants.grantsFor("qa"), []);
});

test("an unknown agent id is denied by default (fail closed)", () => {
  const grants = new CapabilityGrantRegistry({
    scoped: { "qa.browser-qa": ["qa.playwright.test.run"] },
    unrestricted: ["qa"],
  });
  // A typo'd / spoofed id matches no declaration => no authority.
  assert.equal(grants.isKnown("qa.browser_qa"), false);
  assert.equal(grants.allows("qa.browser_qa", "qa.playwright.test.run"), false);
  assert.equal(grants.allows("qa.browser_qa", "qa.jira.bug.create"), false);
});

test("legacy unknown:allow mode restores the fall-through for unknown ids", () => {
  const grants = new CapabilityGrantRegistry({
    scoped: { "qa.browser-qa": ["qa.playwright.test.run"] },
    unknown: "allow",
  });
  assert.equal(grants.isKnown("qa"), false);
  assert.equal(grants.allows("qa", "qa.jira.bug.create"), true);
  // Scoped agents are still constrained even in allow mode.
  assert.equal(grants.allows("qa.browser-qa", "qa.jira.bug.create"), false);
});

test("an empty registry denies everything (fail closed)", () => {
  const grants = new CapabilityGrantRegistry();
  assert.equal(grants.isKnown("qa.browser-qa"), false);
  assert.equal(grants.allows("qa.browser-qa", "qa.jira.bug.create"), false);
});
