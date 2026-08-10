type PilotCheck = {
  id: string;
  ok: boolean;
  required: boolean;
  message: string;
  projectId?: string;
};

type PilotValidation = {
  phase: number;
  ready: boolean;
  instanceId: string;
  expectedReplicas: number;
  targetProjects: string[];
  checks: PilotCheck[];
};

type DeploymentReadiness = {
  ready: boolean;
  instanceId?: string;
  checks?: PilotCheck[];
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : fallback;
}

function requestHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    accept: "application/json",
    "cache-control": "no-cache",
  };
  const bearer = process.env.BM_PILOT_VALIDATION_BEARER_TOKEN?.trim();
  const cookie = process.env.BM_PILOT_VALIDATION_COOKIE?.trim();
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  if (cookie) headers.cookie = cookie;
  return headers;
}

async function requestJson<T>(baseUrl: string, path: string): Promise<{ status: number; body: T }> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: requestHeaders(),
    redirect: "follow",
    cache: "no-store",
  });
  const text = await response.text();
  let body: T;
  try {
    body = JSON.parse(text) as T;
  } catch {
    throw new Error(`${path} returned non-JSON HTTP ${response.status}.`);
  }
  return { status: response.status, body };
}

function failedChecks(checks: PilotCheck[] | undefined): PilotCheck[] {
  return (checks ?? []).filter((check) => check.required && !check.ok);
}

async function main() {
  const baseUrl = required("BM_PILOT_BASE_URL").replace(/\/+$/, "");
  const requestCount = boundedInteger(process.env.BM_PILOT_VALIDATION_REQUESTS, 12, 2, 100);
  const expectedReplicasOverride = process.env.BM_PILOT_EXPECTED_REPLICAS?.trim();

  const readiness = await requestJson<DeploymentReadiness>(baseUrl, `/readyz?validation=${Date.now()}`);
  if (readiness.status !== 200 || !readiness.body.ready) {
    const failures = failedChecks(readiness.body.checks).map((check) => `${check.id}: ${check.message}`).join("; ");
    throw new Error(`Deployment readiness failed (HTTP ${readiness.status})${failures ? `: ${failures}` : "."}`);
  }

  const instances = new Set<string>();
  let expectedReplicas = expectedReplicasOverride
    ? boundedInteger(expectedReplicasOverride, 2, 1, 20)
    : 2;
  let lastValidation: PilotValidation | undefined;

  for (let index = 0; index < requestCount; index += 1) {
    const result = await requestJson<PilotValidation>(baseUrl, `/api/qa/pilot/validation?probe=${Date.now()}-${index}`);
    lastValidation = result.body;
    if (result.status !== 200 || !result.body.ready) {
      const failures = failedChecks(result.body.checks).map((check) => `${check.projectId ? `${check.projectId}/` : ""}${check.id}: ${check.message}`).join("; ");
      throw new Error(`Phase 7 pilot gate failed (HTTP ${result.status})${failures ? `: ${failures}` : "."}`);
    }
    if (!expectedReplicasOverride) expectedReplicas = result.body.expectedReplicas;
    if (result.body.instanceId) instances.add(result.body.instanceId);
  }

  if (instances.size < expectedReplicas) {
    throw new Error(
      `Only ${instances.size} distinct serving instance(s) were observed after ${requestCount} requests; expected at least ${expectedReplicas}. `
      + "Check gateway load balancing, pod readiness, topology constraints, and replica health.",
    );
  }

  console.log("BM Agents World Phase 7 QA pilot validation passed.");
  console.log(`Target projects: ${lastValidation?.targetProjects.join(", ") || "unknown"}`);
  console.log(`Observed instances (${instances.size}/${expectedReplicas} required): ${[...instances].join(", ")}`);
  console.log(`Validation requests: ${requestCount}`);
  console.log("Deployment readiness, trusted identity, shared persistence, centralized policy, connector registry, and project integration gates are green.");
}

main().catch((error) => {
  console.error(`[phase-7-validation] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
