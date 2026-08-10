import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import { safeGetJson } from "../platform/safe-http.js";
import {
  jiraAuthorizationHeader,
  loadQaIntegrationStatus,
} from "./qa-integration-config.js";

interface JiraIssueResponse {
  id?: string;
  key?: string;
  fields?: Record<string, any>;
}

function adfToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const node = value as Record<string, unknown>;
  const own = typeof node.text === "string" ? node.text : "";
  const content = Array.isArray(node.content) ? node.content.map(adfToText).filter(Boolean).join("\n") : "";
  return [own, content].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function compactPerson(value: any) {
  if (!value || typeof value !== "object") return undefined;
  return {
    accountId: value.accountId,
    displayName: value.displayName,
  };
}

function compactNamed(value: any) {
  if (!value || typeof value !== "object") return undefined;
  return { id: value.id, name: value.name };
}

export class JiraReadAdapter implements CapabilityAdapter {
  readonly id = "qa-jira-read-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.jira.story.read") {
      return this.fallback.execute(definition, context, payload);
    }

    const status = loadQaIntegrationStatus();
    if (status.jira.mode !== "live" || !status.jira.baseUrl) {
      return this.fallback.execute(definition, context, payload);
    }

    const authorization = jiraAuthorizationHeader();
    if (!authorization) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: "Jira live mode is configured without a usable server-side credential.",
      };
    }

    const storyId = String(payload.storyId ?? "").trim();
    if (!storyId || !/^[A-Za-z][A-Za-z0-9_]*-\d+$/.test(storyId)) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: "A valid Jira issue key is required for live Jira reads.",
      };
    }

    const acceptanceField = process.env.QA_JIRA_ACCEPTANCE_CRITERIA_FIELD?.trim();
    const fields = [
      "summary",
      "status",
      "description",
      "issuetype",
      "priority",
      "assignee",
      "labels",
      "components",
      "fixVersions",
      "versions",
      "parent",
      "subtasks",
      "issuelinks",
      ...(acceptanceField ? [acceptanceField] : []),
    ];

    try {
      const url = new URL(`${status.jira.baseUrl}/rest/api/3/issue/${encodeURIComponent(storyId)}`);
      url.searchParams.set("fields", fields.join(","));
      const response = await safeGetJson<JiraIssueResponse>(url.toString(), {
        fetchImpl: this.fetchImpl,
        headers: { Authorization: authorization },
      });
      const jira = response.data;
      const issueFields = jira.fields ?? {};
      const acceptanceCriteria = acceptanceField ? adfToText(issueFields[acceptanceField]) : "";

      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          source: "jira-cloud-rest-v3",
          projectId: context.projectId,
          key: jira.key ?? storyId,
          id: jira.id,
          summary: issueFields.summary,
          status: compactNamed(issueFields.status),
          issueType: compactNamed(issueFields.issuetype),
          priority: compactNamed(issueFields.priority),
          assignee: compactPerson(issueFields.assignee),
          description: adfToText(issueFields.description),
          acceptanceCriteria: acceptanceCriteria || undefined,
          labels: Array.isArray(issueFields.labels) ? issueFields.labels.slice(0, 50) : [],
          components: Array.isArray(issueFields.components) ? issueFields.components.slice(0, 30).map(compactNamed) : [],
          fixVersions: Array.isArray(issueFields.fixVersions) ? issueFields.fixVersions.slice(0, 30).map(compactNamed) : [],
          affectedVersions: Array.isArray(issueFields.versions) ? issueFields.versions.slice(0, 30).map(compactNamed) : [],
          parent: issueFields.parent ? { id: issueFields.parent.id, key: issueFields.parent.key, summary: issueFields.parent.fields?.summary } : undefined,
          subtasks: Array.isArray(issueFields.subtasks)
            ? issueFields.subtasks.slice(0, 50).map((item: any) => ({ id: item.id, key: item.key, summary: item.fields?.summary, status: compactNamed(item.fields?.status) }))
            : [],
          issueLinks: Array.isArray(issueFields.issuelinks)
            ? issueFields.issuelinks.slice(0, 50).map((link: any) => ({
                type: link.type?.name,
                inward: link.inwardIssue ? { key: link.inwardIssue.key, summary: link.inwardIssue.fields?.summary } : undefined,
                outward: link.outwardIssue ? { key: link.outwardIssue.key, summary: link.outwardIssue.fields?.summary } : undefined,
              }))
            : [],
          readOnly: true,
        },
      };
    } catch (error) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
