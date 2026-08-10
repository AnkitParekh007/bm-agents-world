import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";
import { safeGetJson } from "../platform/safe-http.js";
import {
  bitbucketAuthorizationHeader,
  loadQaIntegrationStatus,
  type BitbucketRepositoryRef,
} from "./qa-integration-config.js";

interface BitbucketPullRequest {
  id: number;
  title?: string;
  description?: string;
  state?: string;
  draft?: boolean;
  created_on?: string;
  updated_on?: string;
  author?: { display_name?: string; nickname?: string };
  source?: {
    branch?: { name?: string };
    commit?: { hash?: string };
  };
  destination?: {
    branch?: { name?: string };
    commit?: { hash?: string };
  };
  links?: { html?: { href?: string } };
}

interface Paginated<T> {
  values?: T[];
  size?: number;
  next?: string;
}

interface DiffStat {
  status?: string;
  lines_added?: number;
  lines_removed?: number;
  old?: { path?: string };
  new?: { path?: string };
}

function queryEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function selectRepositories(
  configured: BitbucketRepositoryRef[],
  requested: unknown,
): BitbucketRepositoryRef[] {
  const value = typeof requested === "string" ? requested.trim().toLowerCase() : "";
  if (!value) return configured.slice(0, 4);
  return configured.filter((repo) =>
    repo.label.toLowerCase() === value ||
    repo.repoSlug.toLowerCase() === value ||
    `${repo.workspace}/${repo.repoSlug}`.toLowerCase() === value,
  ).slice(0, 4);
}

export class BitbucketReadAdapter implements CapabilityAdapter {
  readonly id = "qa-bitbucket-read-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.bitbucket.change-impact.read") {
      return this.fallback.execute(definition, context, payload);
    }

    const status = loadQaIntegrationStatus();
    if (status.bitbucket.mode !== "live") {
      return this.fallback.execute(definition, context, payload);
    }

    const authorization = bitbucketAuthorizationHeader();
    if (!authorization) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: "Bitbucket live mode is configured without a server-side access token.",
      };
    }

    const configured = status.bitbucket.projects[context.projectId] ?? [];
    const repositories = selectRepositories(configured, payload.repository);
    if (!repositories.length) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: `No Bitbucket Cloud repositories are configured for project ${context.projectId}.`,
      };
    }

    const storyId = String(payload.storyId ?? "").trim();
    if (!storyId) {
      return {
        ok: false,
        mode: "live",
        externalSideEffect: false,
        error: "storyId is required for Bitbucket change-impact discovery.",
      };
    }

    try {
      const matches: Array<Record<string, unknown>> = [];
      const reposScanned: string[] = [];

      for (const repo of repositories) {
        reposScanned.push(`${repo.workspace}/${repo.repoSlug}`);
        const listUrl = new URL(
          `${status.bitbucket.baseUrl}/repositories/${encodeURIComponent(repo.workspace)}/${encodeURIComponent(repo.repoSlug)}/pullrequests`,
        );
        const escapedStory = queryEscape(storyId);
        listUrl.searchParams.set(
          "q",
          `(title ~ "${escapedStory}" OR description ~ "${escapedStory}" OR source.branch.name ~ "${escapedStory}")`,
        );
        listUrl.searchParams.set("sort", "-updated_on");
        listUrl.searchParams.set("pagelen", "5");

        const pullRequests = await safeGetJson<Paginated<BitbucketPullRequest>>(listUrl.toString(), {
          fetchImpl: this.fetchImpl,
          headers: { Authorization: authorization },
        });

        for (const pr of (pullRequests.data.values ?? []).slice(0, 5)) {
          const diffUrl = `${status.bitbucket.baseUrl}/repositories/${encodeURIComponent(repo.workspace)}/${encodeURIComponent(repo.repoSlug)}/pullrequests/${pr.id}/diffstat?pagelen=100`;
          const diffResponse = await safeGetJson<Paginated<DiffStat>>(diffUrl, {
            fetchImpl: this.fetchImpl,
            headers: { Authorization: authorization },
            maxBytes: 3_000_000,
          });
          const changedFiles = (diffResponse.data.values ?? []).slice(0, 100).map((entry) => ({
            path: entry.new?.path ?? entry.old?.path,
            status: entry.status,
            linesAdded: entry.lines_added ?? 0,
            linesRemoved: entry.lines_removed ?? 0,
          }));

          matches.push({
            repository: {
              label: repo.label,
              workspace: repo.workspace,
              repoSlug: repo.repoSlug,
            },
            pullRequest: {
              id: pr.id,
              title: pr.title,
              state: pr.state,
              draft: pr.draft,
              author: pr.author?.display_name ?? pr.author?.nickname,
              sourceBranch: pr.source?.branch?.name,
              sourceCommit: pr.source?.commit?.hash,
              destinationBranch: pr.destination?.branch?.name,
              destinationCommit: pr.destination?.commit?.hash,
              updatedOn: pr.updated_on,
              url: pr.links?.html?.href,
            },
            changedFiles,
            totals: {
              files: changedFiles.length,
              linesAdded: changedFiles.reduce((sum, item) => sum + item.linesAdded, 0),
              linesRemoved: changedFiles.reduce((sum, item) => sum + item.linesRemoved, 0),
            },
          });
        }
      }

      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          source: "bitbucket-cloud-rest-v2",
          projectId: context.projectId,
          storyId,
          repositoriesScanned: reposScanned,
          pullRequestsMatched: matches.length,
          matches,
          readOnly: true,
          bounded: true,
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
