import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
  loadProjectTestProfiles,
  projectTestCatalogStatus,
  resolveProjectTestSelection,
} from "./qa-project-tests.js";

function withCatalog(run: () => void) {
  const directory = mkdtempSync(resolve(tmpdir(), "bm-qa-catalog-"));
  const path = resolve(directory, "catalog.yaml");
  writeFileSync(path, `
version: 1
projects:
  PCC:
    identity:
      storageStateEnv: QA_PCC_PLAYWRIGHT_STORAGE_STATE
    suites:
      story-smoke:
        cases:
          - id: baseline
            title: Baseline
            baseline: true
            steps:
              - { type: goto, path: "/" }
          - id: supplier
            title: Supplier flow
            baseline: false
            pathPrefixes: ["src/app/supplier/"]
            steps:
              - { type: goto, path: "/suppliers" }
              - { type: expectVisible, selector: "app-supplier" }
`, "utf8");

  const previousCatalog = process.env.QA_PROJECT_TEST_CATALOG;
  const previousSecret = process.env.QA_PCC_PLAYWRIGHT_STORAGE_STATE;
  process.env.QA_PROJECT_TEST_CATALOG = path;
  process.env.QA_PCC_PLAYWRIGHT_STORAGE_STATE = "/secure/not-public/auth.json";
  try {
    run();
  } finally {
    if (previousCatalog === undefined) delete process.env.QA_PROJECT_TEST_CATALOG;
    else process.env.QA_PROJECT_TEST_CATALOG = previousCatalog;
    if (previousSecret === undefined) delete process.env.QA_PCC_PLAYWRIGHT_STORAGE_STATE;
    else process.env.QA_PCC_PLAYWRIGHT_STORAGE_STATE = previousSecret;
    rmSync(directory, { recursive: true, force: true });
  }
}

test("project catalog selects baseline plus changed-file-matched cases", () => withCatalog(() => {
  const selection = resolveProjectTestSelection("PCC", "story-smoke", ["src/app/supplier/search.component.ts"]);
  assert.ok(selection);
  assert.deepEqual(selection.cases.map((item) => item.id), ["baseline", "supplier"]);
  assert.equal(selection.identity.configured, true);
}));

test("project catalog public status exposes SecretReference metadata but not secret value", () => withCatalog(() => {
  const profiles = loadProjectTestProfiles();
  assert.equal(profiles.PCC?.identity.secretReference?.name, "QA_PCC_PLAYWRIGHT_STORAGE_STATE");
  const publicStatus = projectTestCatalogStatus();
  const serialized = JSON.stringify(publicStatus);
  assert.match(serialized, /QA_PCC_PLAYWRIGHT_STORAGE_STATE/);
  assert.doesNotMatch(serialized, /secure\/not-public/);
}));
