import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";

const DEFAULT_TIMEOUT_MS = 10_000;

/** An operator-curated, read-only API contract check. URLs are never model-supplied. */
export interface ApiContract {
  id: string;
  projectId: string;
  description?: string;
  method: "GET" | "HEAD";
  url: string;
  expectStatus: number;
  maxLatencyMs?: number;
  expectJsonFields: string[];
  /** Name of a server-side env var holding a bearer token, if the endpoint needs auth. */
  authTokenEnv?: string;
}

function cleanText(value: unknown, max = 200): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function redactUrl(raw: string): string {
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.slice(0, 2000);
  } catch {
    return raw.split("?", 1)[0]?.slice(0, 2000) ?? "invalid-url";
  }
}

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") return (current as Record<string, unknown>)[key];
    return undefined;
  }, value);
}

function loadContracts(): ApiContract[] {
  const path = process.env.QA_API_CONTRACTS_PATH?.trim();
  if (!path) return [];
  const resolved = resolve(path);
  if (!existsSync(resolved)) return [];
  try {
    const document = YAML.parse(readFileSync(resolved, "utf8")) as Record<string, unknown> | undefined;
    const entries = Array.isArray(document?.contracts) ? document.contracts : [];
    return entries
      .map((raw): ApiContract | undefined => {
        const record = (raw ?? {}) as Record<string, unknown>;
        const id = cleanText(record.id, 100);
        const projectId = cleanText(record.projectId, 100);
        const url = typeof record.url === "string" ? record.url.trim() : "";
        if (!id || !projectId || !url) return undefined;
        try {
          new URL(url);
        } catch {
          return undefined;
        }
        const method = record.method === "HEAD" ? "HEAD" : "GET";
        const expectStatusRaw = Number(record.expectStatus ?? 200);
        const maxLatencyRaw = Number(record.maxLatencyMs);
        return {
          id,
          projectId,
          description: cleanText(record.description, 500) || undefined,
          method,
          url,
          expectStatus: Number.isFinite(expectStatusRaw) ? expectStatusRaw : 200,
          maxLatencyMs: Number.isFinite(maxLatencyRaw) ? maxLatencyRaw : undefined,
          expectJsonFields: Array.isArray(record.expectJsonFields)
            ? record.expectJsonFields.map((item) => cleanText(item, 200)).filter(Boolean).slice(0, 50)
            : [],
          authTokenEnv: cleanText(record.authTokenEnv, 100) || undefined,
        };
      })
      .filter((contract): contract is ApiContract => Boolean(contract));
  } catch {
    return [];
  }
}

interface Assertion {
  name: string;
  passed: boolean;
  detail: string;
}

/** Reports whether the API contract executor has a configured allowlist. */
export function apiContractAdapterMode(): "live" | "mock" {
  return loadContracts().length > 0 ? "live" : "mock";
}

/**
 * Executes an allowlisted, read-only API contract check against an approved
 * endpoint. The model supplies only a contractId; the URL, method, and
 * expectations are server-curated. Falls back to an honest mock when no
 * allowlist is configured. Auth tokens are read from server-side env only.
 */
export class ApiContractAdapter implements CapabilityAdapter {
  readonly id = "qa-api-contract-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.api.contract.test") {
      return this.fallback.execute(definition, context, payload);
    }

    const contracts = loadContracts();
    if (contracts.length === 0) {
      return {
        ok: true,
        mode: "mock",
        externalSideEffect: false,
        data: {
          simulated: true,
          note: "No API contract allowlist is configured, so no request was made. Set QA_API_CONTRACTS_PATH to enable live contract checks.",
        },
      };
    }

    const contractId = cleanText(payload.contractId, 100);
    if (!contractId) {
      return { ok: false, mode: "live", externalSideEffect: false, error: "A contractId is required. Only allowlisted contract ids may be executed." };
    }

    const contract = contracts.find(
      (item) => item.id === contractId && item.projectId.toLowerCase() === context.projectId.toLowerCase(),
    );
    if (!contract) {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Contract ${contractId} is not on the approved allowlist for ${context.projectId}.` };
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    if (contract.authTokenEnv) {
      const token = process.env[contract.authTokenEnv]?.trim();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const startedAt = Date.now();
    try {
      const response = await this.fetchImpl(contract.url, {
        method: contract.method,
        headers,
        redirect: "follow",
        signal: controller.signal,
      });
      const latencyMs = Date.now() - startedAt;
      const assertions: Assertion[] = [];

      assertions.push({
        name: "status",
        passed: response.status === contract.expectStatus,
        detail: `Expected ${contract.expectStatus}, received ${response.status}.`,
      });

      if (contract.maxLatencyMs !== undefined) {
        assertions.push({
          name: "latency",
          passed: latencyMs <= contract.maxLatencyMs,
          detail: `${latencyMs}ms (budget ${contract.maxLatencyMs}ms).`,
        });
      }

      if (contract.method === "GET" && contract.expectJsonFields.length) {
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = undefined;
        }
        for (const field of contract.expectJsonFields) {
          assertions.push({
            name: `field:${field}`,
            passed: getPath(body, field) !== undefined,
            detail: getPath(body, field) !== undefined ? "present" : "missing",
          });
        }
      }

      const passed = assertions.every((assertion) => assertion.passed);
      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          contractId: contract.id,
          description: contract.description,
          method: contract.method,
          url: redactUrl(contract.url),
          status: response.status,
          latencyMs,
          assertions,
          passed,
        },
      };
    } catch (error) {
      const reason = error instanceof Error && error.name === "AbortError"
        ? "API contract request timed out."
        : error instanceof Error ? error.message : String(error);
      return { ok: false, mode: "live", externalSideEffect: false, error: reason };
    } finally {
      clearTimeout(timer);
    }
  }
}
