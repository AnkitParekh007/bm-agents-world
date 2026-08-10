import type {
  AdapterResult,
  CapabilityAction,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import type { ArtifactStore, StoredArtifact } from "../platform/artifact-store.js";
import { safeJsonRequest } from "../platform/safe-http.js";
import { jiraAuthorizationHeader, loadQaIntegrationStatus } from "./qa-integration-config.js";

interface BugDraft {
  title: string;
  parentIssue: string;
  environment: string;
  build?: string;
  preconditions?: string[];
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  businessImpact?: string;
  severityRecommendation?: string;
  evidenceIds: string[];
  duplicateCandidates?: string[];
}

interface JiraSearchResponse {
  issues?: Array<{
    id?: string;
    key?: string;
    fields?: {
      summary?: string;
      status?: { name?: string };
      priority?: { name?: string };
      created?: string;
    };
  }>;
}

interface JiraCreateResponse {
  id?: string;
  key?: string;
  self?: string;
}

export interface JiraDuplicateCandidate {
  key: string;
  summary: string;
  status?: string;
  priority?: string;
  created?: string;
  similarity: number;
}

export interface JiraDefectReview {
  artifact: StoredArtifact;
  draft: BugDraft;
  jiraProjectKey: string;
  issueType: string;
  labels: string[];
  duplicateCandidates: JiraDuplicateCandidate[];
  writeMode: "live" | "mock";
}

const HIGH_CONFIDENCE_DUPLICATE = 0.82;
const DUPLICATE_SCAN_LIMIT = 25;

function cleanText(value: unknown, max = 4000): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function stringList(value: unknown, limit = 50): string[] {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, 1000)).filter(Boolean).slice(0, limit)
    : [];
}

function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !["the", "and", "for", "with", "from", "qa", "bug"].includes(token)),
  );
}

function similarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return union ? Number((intersection / union).toFixed(3)) : 0;
}

function projectKey(projectId: string): string {
  const envKey = `QA_${projectId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_JIRA_PROJECT_KEY`;
  const configured = process.env[envKey]?.trim();
  const candidate = configured || projectId;
  if (!/^[A-Z][A-Z0-9_]{1,30}$/i.test(candidate)) {
    throw new Error(`Invalid Jira project key configured for ${projectId}`);
  }
  return candidate;
}

function issueType(): string {
  return cleanText(process.env.QA_JIRA_BUG_ISSUE_TYPE || "Bug", 100) || "Bug";
}

function labels(): string[] {
  return (process.env.QA_JIRA_BUG_LABELS || "bm-agent,qa-automation")
    .split(",")
    .map((item) => item.trim().replace(/[^a-zA-Z0-9._-]/g, "-"))
    .filter(Boolean)
    .slice(0, 20);
}

function writeEnabled(): boolean {
  return process.env.QA_JIRA_WRITE_ENABLED?.trim().toLowerCase() === "true";
}

function paragraph(text: string) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function heading(text: string) {
  return { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text }] };
}

function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((item) => ({ type: "listItem", content: [paragraph(item)] })),
  };
}

function loadDraft(
  artifacts: ArtifactStore,
  payload: Record<string, unknown>,
): { artifact: StoredArtifact; draft: BugDraft } {
  const id = cleanText(payload.bugDraftArtifactId, 100);
  const expectedSha = cleanText(payload.bugDraftSha256, 128).toLowerCase();
  if (!id || !expectedSha) throw new Error("bugDraftArtifactId and bugDraftSha256 are required");

  const loaded = artifacts.readJson<BugDraft>(id, "bug-draft");
  if (!loaded) throw new Error("Bug draft artifact was not found or is not a valid bug-draft JSON artifact");
  if (loaded.record.sha256.toLowerCase() !== expectedSha) {
    throw new Error("Bug draft SHA-256 does not match the immutable artifact");
  }

  const draft: BugDraft = {
    title: cleanText(loaded.value.title, 255),
    parentIssue: cleanText(loaded.value.parentIssue, 100),
    environment: cleanText(loaded.value.environment, 100),
    build: cleanText(loaded.value.build, 200) || undefined,
    preconditions: stringList(loaded.value.preconditions),
    stepsToReproduce: stringList(loaded.value.stepsToReproduce),
    expectedResult: cleanText(loaded.value.expectedResult, 5000),
    actualResult: cleanText(loaded.value.actualResult, 5000),
    businessImpact: cleanText(loaded.value.businessImpact, 3000) || undefined,
    severityRecommendation: cleanText(loaded.value.severityRecommendation, 100) || undefined,
    evidenceIds: stringList(loaded.value.evidenceIds, 100),
    duplicateCandidates: stringList(loaded.value.duplicateCandidates, 20),
  };

  if (!draft.title || !draft.parentIssue || !draft.environment || !draft.expectedResult || !draft.actualResult) {
    throw new Error("Bug draft is missing required fields");
  }
  return { artifact: loaded.record, draft };
}

function evidenceDetails(artifacts: ArtifactStore, ids: string[]) {
  return ids
    .map((id) => artifacts.find(id)?.record)
    .filter((item): item is StoredArtifact => Boolean(item))
    .slice(0, 30);
}

function descriptionAdf(draft: BugDraft, evidence: StoredArtifact[]) {
  const content: any[] = [
    paragraph(`Parent story: ${draft.parentIssue}`),
    paragraph(`Environment: ${draft.environment}${draft.build ? ` | Build: ${draft.build}` : ""}`),
  ];

  if (draft.preconditions?.length) content.push(heading("Preconditions"), bulletList(draft.preconditions));
  if (draft.stepsToReproduce.length) content.push(heading("Steps to reproduce"), bulletList(draft.stepsToReproduce));
  content.push(heading("Expected result"), paragraph(draft.expectedResult));
  content.push(heading("Actual result"), paragraph(draft.actualResult));
  if (draft.businessImpact) content.push(heading("Business impact"), paragraph(draft.businessImpact));
  if (draft.severityRecommendation) content.push(paragraph(`Severity recommendation: ${draft.severityRecommendation}`));
  if (evidence.length) {
    content.push(
      heading("BM Agents World evidence"),
      bulletList(evidence.map((item) => `${item.type}: ${item.uri} | sha256=${item.sha256}`)),
    );
  }
  content.push(paragraph("Created from a human-approved immutable BM Agents World bug-draft artifact."));
  return { type: "doc", version: 1, content };
}

export class JiraDefectAdapter implements CapabilityAdapter {
  readonly id = "qa-jira-defect-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly artifacts: ArtifactStore,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async previewCreateAction(action: CapabilityAction): Promise<JiraDefectReview> {
    if (action.capabilityId !== "qa.jira.bug.create") throw new Error("Action is not a Jira bug create action");
    const { artifact, draft } = loadDraft(this.artifacts, action.payload);
    const duplicateCandidates = await this.searchDuplicates(action.context, draft);
    return {
      artifact,
      draft,
      jiraProjectKey: projectKey(action.context.projectId),
      issueType: issueType(),
      labels: labels(),
      duplicateCandidates,
      writeMode: this.liveWriteReady() ? "live" : "mock",
    };
  }

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id === "qa.jira.duplicate.search") {
      try {
        const { artifact, draft } = loadDraft(this.artifacts, payload);
        const candidates = await this.searchDuplicates(context, draft);
        return {
          ok: true,
          mode: loadQaIntegrationStatus().jira.mode,
          externalSideEffect: false,
          data: {
            bugDraftArtifactId: artifact.id,
            bugDraftSha256: artifact.sha256,
            candidates,
            highConfidenceThreshold: HIGH_CONFIDENCE_DUPLICATE,
            boundedAt: DUPLICATE_SCAN_LIMIT,
          },
        };
      } catch (error) {
        return { ok: false, mode: loadQaIntegrationStatus().jira.mode, externalSideEffect: false, error: error instanceof Error ? error.message : String(error) };
      }
    }

    if (definition.id !== "qa.jira.bug.create") {
      return this.fallback.execute(definition, context, payload);
    }

    try {
      const { artifact, draft } = loadDraft(this.artifacts, payload);
      const evidence = evidenceDetails(this.artifacts, draft.evidenceIds);

      if (!this.liveWriteReady()) {
        return {
          ok: true,
          mode: "mock",
          externalSideEffect: false,
          data: {
            bugDraftArtifactId: artifact.id,
            bugDraftSha256: artifact.sha256,
            draft,
            evidence,
            note: "Human approval was verified, but Jira write is not enabled. Set QA_JIRA_WRITE_ENABLED=true with a write-capable server credential to enable the real create adapter.",
          },
        };
      }

      const duplicateCandidates = await this.searchDuplicates(context, draft);
      const highConfidence = duplicateCandidates.filter((candidate) => candidate.similarity >= HIGH_CONFIDENCE_DUPLICATE);
      if (highConfidence.length) {
        return {
          ok: false,
          mode: "live",
          externalSideEffect: false,
          data: { duplicateCandidates: highConfidence },
          error: "A high-confidence duplicate candidate appeared before Jira creation. Prepare and approve a fresh action after reviewing duplicates.",
        };
      }

      const status = loadQaIntegrationStatus();
      const authorization = jiraAuthorizationHeader();
      if (!status.jira.baseUrl || !authorization) throw new Error("Jira write mode is missing a usable server-side credential");

      const response = await safeJsonRequest<JiraCreateResponse>(`${status.jira.baseUrl}/rest/api/3/issue`, {
        method: "POST",
        fetchImpl: this.fetchImpl,
        headers: { Authorization: authorization },
        body: {
          fields: {
            project: { key: projectKey(context.projectId) },
            issuetype: { name: issueType() },
            summary: draft.title,
            description: descriptionAdf(draft, evidence),
            labels: labels(),
          },
        },
      });

      if (!response.data.key) throw new Error("Jira create response did not include an issue key");
      return {
        ok: true,
        mode: "live",
        externalSideEffect: true,
        data: {
          source: "jira-cloud-rest-v3",
          id: response.data.id,
          key: response.data.key,
          self: response.data.self,
          projectKey: projectKey(context.projectId),
          bugDraftArtifactId: artifact.id,
          bugDraftSha256: artifact.sha256,
          evidenceIds: evidence.map((item) => item.id),
          humanApproved: true,
        },
      };
    } catch (error) {
      return {
        ok: false,
        mode: this.liveWriteReady() ? "live" : "mock",
        externalSideEffect: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private liveWriteReady(): boolean {
    const status = loadQaIntegrationStatus();
    return writeEnabled() && status.jira.mode === "live" && Boolean(status.jira.baseUrl && jiraAuthorizationHeader());
  }

  private async searchDuplicates(context: ExecutionContext, draft: BugDraft): Promise<JiraDuplicateCandidate[]> {
    const status = loadQaIntegrationStatus();
    const authorization = jiraAuthorizationHeader();
    if (status.jira.mode !== "live" || !status.jira.baseUrl || !authorization) return [];

    const key = projectKey(context.projectId);
    const jql = `project = "${key}" AND issuetype = "${issueType().replace(/"/g, "")}" AND resolution IS EMPTY ORDER BY created DESC`;
    const response = await safeJsonRequest<JiraSearchResponse>(`${status.jira.baseUrl}/rest/api/3/search/jql`, {
      method: "POST",
      fetchImpl: this.fetchImpl,
      headers: { Authorization: authorization },
      body: {
        jql,
        maxResults: DUPLICATE_SCAN_LIMIT,
        fields: ["summary", "status", "priority", "created"],
      },
    });

    return (response.data.issues ?? [])
      .map((issue) => ({
        key: cleanText(issue.key, 100),
        summary: cleanText(issue.fields?.summary, 255),
        status: cleanText(issue.fields?.status?.name, 100) || undefined,
        priority: cleanText(issue.fields?.priority?.name, 100) || undefined,
        created: cleanText(issue.fields?.created, 100) || undefined,
        similarity: similarity(draft.title, cleanText(issue.fields?.summary, 255)),
      }))
      .filter((candidate) => candidate.key && candidate.summary && candidate.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
}
