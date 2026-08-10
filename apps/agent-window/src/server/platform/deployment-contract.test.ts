import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import YAML from "yaml";

const workspace = process.cwd();
const deploymentRoot = resolve(workspace, "..", "..", "deploy", "k8s", "qa-pilot");

function yamlFile<T = Record<string, any>>(name: string): T {
  return YAML.parse(readFileSync(resolve(deploymentRoot, name), "utf8")) as T;
}

test("container pins the Playwright browser image and runs as pwuser", () => {
  const dockerfile = readFileSync(resolve(workspace, "Dockerfile"), "utf8");
  assert.match(dockerfile, /mcr\.microsoft\.com\/playwright:v1\.62\.0-noble/);
  assert.match(dockerfile, /USER pwuser/);
  assert.match(dockerfile, /\/healthz/);
});

test("pilot deployment is single replica with persistent data and HTTP probes", () => {
  const deployment = yamlFile("deployment.yaml");
  assert.equal(deployment.kind, "Deployment");
  assert.equal(deployment.spec.replicas, 1);
  assert.equal(deployment.spec.strategy.type, "Recreate");

  const container = deployment.spec.template.spec.containers[0];
  assert.equal(container.securityContext.readOnlyRootFilesystem, true);
  assert.equal(container.securityContext.allowPrivilegeEscalation, false);
  assert.equal(container.startupProbe.httpGet.path, "/healthz");
  assert.equal(container.readinessProbe.httpGet.path, "/readyz");
  assert.equal(container.livenessProbe.httpGet.path, "/healthz");
  assert.ok(container.volumeMounts.some((item: any) => item.mountPath === "/var/lib/bm-agents"));
  assert.ok(container.volumeMounts.some((item: any) => item.mountPath === "/dev/shm"));

  const volumes = deployment.spec.template.spec.volumes;
  assert.equal(volumes.find((item: any) => item.name === "data")?.persistentVolumeClaim.claimName, "bm-agents-world-data");
  assert.equal(volumes.find((item: any) => item.name === "shm")?.emptyDir.medium, "Memory");
});

test("pilot service is internal-only and config fails toward trusted production posture", () => {
  const service = yamlFile("service.yaml");
  const configMap = yamlFile("configmap.yaml");
  const kustomization = yamlFile("kustomization.yaml");

  assert.equal(service.spec.type, "ClusterIP");
  assert.equal(configMap.data.BM_DEPLOYMENT_MODE, "pilot");
  assert.equal(configMap.data.BM_IDENTITY_MODE, "trusted-headers");
  assert.equal(configMap.data.BM_STATE_DB_PATH, "/var/lib/bm-agents/state/qa-pilot.sqlite");
  assert.equal(configMap.data.BM_ARTIFACT_ROOT, "/var/lib/bm-agents");
  assert.equal(configMap.data.QA_JIRA_WRITE_ENABLED, "false");
  assert.ok(!kustomization.resources.some((item: string) => item.toLowerCase().includes("ingress")));
  assert.ok(!kustomization.resources.some((item: string) => item.toLowerCase().includes("secret.example")));
});
