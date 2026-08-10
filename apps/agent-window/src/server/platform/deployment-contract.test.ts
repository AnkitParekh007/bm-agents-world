import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("pilot deployment scales across shared persistence and keeps HTTP probes", () => {
  const deployment = yamlFile("deployment.yaml");
  assert.equal(deployment.kind, "Deployment");
  assert.equal(deployment.spec.replicas, 2);
  assert.equal(deployment.spec.strategy.type, "RollingUpdate");
  assert.equal(deployment.spec.strategy.rollingUpdate.maxUnavailable, 0);

  const container = deployment.spec.template.spec.containers.find((item: any) => item.name === "agent-window");
  assert.ok(container);
  assert.equal(container.securityContext.readOnlyRootFilesystem, true);
  assert.equal(container.securityContext.allowPrivilegeEscalation, false);
  assert.equal(container.startupProbe.httpGet.path, "/healthz");
  assert.equal(container.readinessProbe.httpGet.path, "/readyz");
  assert.equal(container.livenessProbe.httpGet.path, "/healthz");
  assert.ok(!container.volumeMounts.some((item: any) => item.mountPath === "/var/lib/bm-agents"));
  assert.ok(container.volumeMounts.some((item: any) => item.mountPath === "/dev/shm"));

  const volumes = deployment.spec.template.spec.volumes;
  assert.ok(!volumes.some((item: any) => item.persistentVolumeClaim));
  assert.equal(volumes.find((item: any) => item.name === "shm")?.emptyDir.medium, "Memory");
});

test("shared pilot includes a loopback-only pinned OPA policy sidecar", () => {
  const deployment = yamlFile("deployment.yaml");
  const opa = deployment.spec.template.spec.containers.find((item: any) => item.name === "opa");
  assert.ok(opa);
  assert.equal(opa.image, "openpolicyagent/opa:1.17.0");
  assert.ok(opa.args.includes("--addr=127.0.0.1:8181"));
  assert.equal(opa.readinessProbe.httpGet.path, "/health");
  assert.ok(opa.volumeMounts.some((item: any) => item.mountPath === "/policies" && item.readOnly === true));

  const policy = yamlFile("opa-policy-configmap.yaml");
  assert.equal(policy.kind, "ConfigMap");
  assert.match(policy.data["authorization.rego"], /package bm\.agents\.world/);
  assert.match(policy.data["authorization.rego"], /Production reads require privileged approval/);
});

test("pilot service is internal-only and config requires shared trusted persistence and OPA", () => {
  const service = yamlFile("service.yaml");
  const configMap = yamlFile("configmap.yaml");
  const kustomization = yamlFile("kustomization.yaml");

  assert.equal(service.spec.type, "ClusterIP");
  assert.equal(configMap.data.BM_DEPLOYMENT_MODE, "pilot");
  assert.equal(configMap.data.BM_IDENTITY_MODE, "trusted-headers");
  assert.equal(configMap.data.BM_PERSISTENCE_MODE, "postgres-supabase");
  assert.equal(configMap.data.BM_POLICY_MODE, "opa");
  assert.equal(configMap.data.BM_OPA_URL, "http://127.0.0.1:8181");
  assert.equal(configMap.data.BM_SUPABASE_ARTIFACT_BUCKET, "bm-agents-world-evidence");
  assert.equal(configMap.data.BM_STATE_DB_PATH, undefined);
  assert.equal(configMap.data.BM_ARTIFACT_ROOT, undefined);
  assert.equal(configMap.data.QA_JIRA_WRITE_ENABLED, "false");
  assert.ok(kustomization.resources.includes("networkpolicy.yaml"));
  assert.ok(kustomization.resources.includes("opa-policy-configmap.yaml"));
  assert.ok(!kustomization.resources.includes("pvc.yaml"));
  assert.equal(existsSync(resolve(deploymentRoot, "pvc.yaml")), false);
  assert.ok(!kustomization.resources.some((item: string) => item.toLowerCase().includes("ingress")));
  assert.ok(!kustomization.resources.some((item: string) => item.toLowerCase().includes("secret.example")));
});

test("pilot secret template keeps shared persistence credentials server-side", () => {
  const secret = yamlFile("secret.example.yaml");
  assert.match(secret.stringData.BM_POSTGRES_URL, /REPLACE_WITH/);
  assert.match(secret.stringData.SUPABASE_URL, /REPLACE_WITH/);
  assert.match(secret.stringData.SUPABASE_SECRET_KEY, /REPLACE_WITH/);
  const config = yamlFile("configmap.yaml");
  assert.equal(config.data.BM_POSTGRES_URL, undefined);
  assert.equal(config.data.SUPABASE_SECRET_KEY, undefined);
});

test("pilot ingress accepts traffic only from explicitly trusted gateway pods", () => {
  const policy = yamlFile("networkpolicy.yaml");
  assert.equal(policy.apiVersion, "networking.k8s.io/v1");
  assert.equal(policy.kind, "NetworkPolicy");
  assert.deepEqual(policy.spec.policyTypes, ["Ingress"]);
  assert.equal(policy.spec.podSelector.matchLabels["app.kubernetes.io/name"], "bm-agents-world");
  assert.equal(policy.spec.podSelector.matchLabels["app.kubernetes.io/component"], "agent-window");

  const rule = policy.spec.ingress[0];
  assert.equal(rule.ports[0].protocol, "TCP");
  assert.equal(rule.ports[0].port, 4000);
  assert.equal(rule.from.length, 1);
  assert.equal(rule.from[0].namespaceSelector.matchLabels["bm-agents-world.io/trusted-gateway"], "true");
  assert.equal(rule.from[0].podSelector.matchLabels["bm-agents-world.io/trusted-gateway"], "true");
});
