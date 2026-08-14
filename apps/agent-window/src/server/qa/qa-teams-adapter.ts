import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";

const TEAMS_TIMEOUT_MS = 10_000;
// Server-configured webhook only. Restrict to known Microsoft Teams / Power
// Automate ("Workflows") hosts so a misconfiguration cannot post elsewhere.
const ALLOWED_TEAMS_HOST = /(^|\.)(webhook\.office\.com|outlook\.office\.com|office\.com|logic\.azure\.com)$/i;

function cleanText(value: unknown, max = 4000): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function webhookUrl(): string | undefined {
  const raw = process.env.QA_TEAMS_WEBHOOK_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return undefined;
    if (!ALLOWED_TEAMS_HOST.test(url.hostname)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Posts an approved QA status message to a Microsoft Teams Incoming Webhook.
 * The webhook URL is server-side only and never enters model context. When no
 * valid webhook is configured, execution falls back to the honest mock adapter
 * rather than fabricating a delivered message. Governance stays L3/human-approved.
 */
export class TeamsStatusAdapter implements CapabilityAdapter {
  readonly id = "qa-teams-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.teams.status.post") {
      return this.fallback.execute(definition, context, payload);
    }

    const url = webhookUrl();
    if (!url) return this.fallback.execute(definition, context, payload);

    const message = cleanText(payload.message, 4000);
    if (!message) {
      return { ok: false, mode: "live", externalSideEffect: false, error: "A non-empty message is required to post to Teams." };
    }
    const title = cleanText(payload.title, 200) || `QA status · ${context.projectId}/${context.environment}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TEAMS_TIMEOUT_MS);
    try {
      const response = await this.fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `**${title}**\n\n${message}` }),
        signal: controller.signal,
        redirect: "follow",
      });
      if (!response.ok) {
        const detail = (await response.text().catch(() => "")).slice(0, 300);
        return { ok: false, mode: "live", externalSideEffect: false, error: `Teams webhook returned HTTP ${response.status}${detail ? `: ${detail}` : ""}` };
      }
      return {
        ok: true,
        mode: "live",
        externalSideEffect: true,
        data: {
          posted: true,
          title,
          channelHint: cleanText(payload.channel, 100) || undefined,
          storyId: cleanText(payload.storyId, 100) || undefined,
          note: "QA status posted to the approved Teams Incoming Webhook. The webhook URL is server-side and never enters model context.",
        },
      };
    } catch (error) {
      const reason = error instanceof Error && error.name === "AbortError"
        ? "Teams webhook request timed out."
        : error instanceof Error ? error.message : String(error);
      return { ok: false, mode: "live", externalSideEffect: false, error: reason };
    } finally {
      clearTimeout(timer);
    }
  }
}
