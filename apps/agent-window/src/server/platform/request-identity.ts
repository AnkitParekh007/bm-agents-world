import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestHandler } from "express";
import type { ExecutionContext } from "./capability-types.js";

export interface RequestIdentity {
  userId: string;
  tenantId: string;
  projectIds: string[];
  source: "local-dev" | "trusted-headers";
}

const identityStorage = new AsyncLocalStorage<RequestIdentity>();

function csv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function localIdentity(): RequestIdentity {
  return {
    userId: process.env.BM_LOCAL_USER_ID?.trim() || "local-dev-user",
    tenantId: process.env.BM_LOCAL_TENANT_ID?.trim() || "local-dev",
    projectIds: csv(process.env.BM_LOCAL_PROJECT_IDS || "PCC,SOP,DataBridge"),
    source: "local-dev",
  };
}

export function currentRequestIdentity(): RequestIdentity {
  const identity = identityStorage.getStore();
  if (identity) return identity;
  if (process.env.BM_IDENTITY_MODE?.trim().toLowerCase() === "trusted-headers") {
    throw new Error("Trusted request identity context is unavailable; refusing local fallback.");
  }
  return localIdentity();
}

export function identityMiddleware(): RequestHandler {
  return (request, response, next) => {
    const mode = process.env.BM_IDENTITY_MODE?.trim().toLowerCase() || "local-dev";
    if (mode !== "trusted-headers") {
      identityStorage.run(localIdentity(), next);
      return;
    }

    const userId = request.header("x-user-id")?.trim();
    const tenantId = request.header("x-tenant-id")?.trim();
    const projectIds = csv(request.header("x-project-ids") || request.header("x-project-id") || "");
    if (!userId || !tenantId) {
      response.status(401).json({
        error: "trusted_identity_required",
        message: "x-user-id and x-tenant-id must be injected by the trusted gateway.",
      });
      return;
    }

    identityStorage.run({
      userId,
      tenantId,
      projectIds,
      source: "trusted-headers",
    }, next);
  };
}

export function canAccessProject(identity: RequestIdentity, projectId: string): boolean {
  if (identity.projectIds.includes("*")) return true;
  return identity.projectIds.some((value) => value.toLowerCase() === projectId.toLowerCase());
}

export function canAccessExecutionContext(identity: RequestIdentity, context: ExecutionContext): boolean {
  return identity.tenantId === context.tenantId && canAccessProject(identity, context.projectId);
}

export function assertProjectAccess(identity: RequestIdentity, projectId: string): void {
  if (!canAccessProject(identity, projectId)) {
    throw new Error(`Identity ${identity.userId} is not authorized for project ${projectId}.`);
  }
}

export function canSelfApprove(identity: RequestIdentity): boolean {
  return identity.source === "local-dev" && process.env.BM_LOCAL_ALLOW_SELF_APPROVAL?.trim().toLowerCase() !== "false";
}
