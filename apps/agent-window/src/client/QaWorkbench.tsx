import { useEffect, useMemo, useState } from "react";
import {
  useAgent,
  useAgentContext,
  useCopilotKit,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

interface QaCapability {
  id: string;
  system: string;
  description: string;
  riskLevel: "L0" | "L1" | "L2" | "L3" | "L4";
  approvalMode: string;
  allowedEnvironments: string[];
  externalWrite: boolean;
}

interface QaIntegrationStatus {
  jira: { mode: "live" | "mock" };
  bitbucket: {
    mode: "live" | "mock";
    projects: Record<string, Array<{ label: string; workspace: string; repoSlug: string }>>;
  };
}

interface ApprovalDecisionResponse {
  id?: string;
  status?: string;
  error?: string;
  message?: string;
}

function ApprovalCard({
  actionId,
  capabilityId,
  riskLevel,
  summary,
  payloadHash,
  respond,
}: {
  actionId: string;
  capabilityId: string;
  riskLevel: string;
  summary: string;
  payloadHash: string;
  respond: (result: unknown) => void;
}) {
  const [submitting, setSubmitting] = useState<"approved" | "rejected" | null>(null);
  const [decision, setDecision] = useState<string>();
  const [error, setError] = useState<string>();

  const decide = async (next: "approved" | "rejected") => {
    setSubmitting(next);
    setError(undefined);
    try {
      const response = await fetch(`/api/qa/actions/${encodeURIComponent(actionId)}/decision`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "local-dev-user",
        },
        body: JSON.stringify({
          decision: next,
          reason: next === "approved" ? "Approved in BM Agents World QA workbench" : "Rejected in BM Agents World QA workbench",
        }),
      });
      const result = (await response.json()) as ApprovalDecisionResponse;
      if (!response.ok) throw new Error(result.message ?? result.error ?? `Approval returned ${response.status}`);
      setDecision(next);
      respond({
        decision: next,
        actionId,
        serverStatus: result.status,
        payloadHash,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setSubmitting(null);
    }
  };

  return (
    <div className="approval-card">
      <div className="approval-card-header">
        <span className="risk-chip">{riskLevel}</span>
        <strong>Human approval required</strong>
      </div>
      <p>{summary}</p>
      <dl className="approval-details">
        <div><dt>Capability</dt><dd>{capabilityId}</dd></div>
        <div><dt>Action</dt><dd>{actionId}</dd></div>
        <div><dt>Payload hash</dt><dd title={payloadHash}>{payloadHash.slice(0, 16)}…</dd></div>
      </dl>
      {error && <div className="approval-error">{error}</div>}
      {decision ? (
        <div className={`approval-result ${decision}`}>{decision === "approved" ? "Approved" : "Rejected"}</div>
      ) : (
        <div className="approval-actions">
          <button className="secondary-button" disabled={Boolean(submitting)} onClick={() => void decide("rejected")}>Reject</button>
          <button className="primary-button" disabled={Boolean(submitting)} onClick={() => void decide("approved")}>
            {submitting === "approved" ? "Approving…" : "Approve exact action"}
          </button>
        </div>
      )}
    </div>
  );
}

export function QaApprovalBridge() {
  useHumanInTheLoop({
    agentId: "qa",
    name: "reviewQaAction",
    description: "Ask the human to approve or reject an immutable QA capability action before execution.",
    parameters: z.object({
      actionId: z.string().uuid(),
      capabilityId: z.string(),
      riskLevel: z.string(),
      summary: z.string(),
      payloadHash: z.string(),
    }),
    render: ({ args, respond }) => {
      if (!respond || !args.actionId || !args.capabilityId || !args.payloadHash) {
        return <div className="approval-card">Preparing approval request…</div>;
      }
      return (
        <ApprovalCard
          actionId={args.actionId}
          capabilityId={args.capabilityId}
          riskLevel={args.riskLevel ?? "L3"}
          summary={args.summary ?? "Review this QA action."}
          payloadHash={args.payloadHash}
          respond={respond}
        />
      );
    },
  });
  return null;
}

export function QaWorkbench() {
  const [projectId, setProjectId] = useState("PCC");
  const [environment, setEnvironment] = useState("qa");
  const [storyId, setStoryId] = useState("PCC-1");
  const [capabilities, setCapabilities] = useState<QaCapability[]>([]);
  const [integrations, setIntegrations] = useState<QaIntegrationStatus>();
  const [error, setError] = useState<string>();
  const [activeAction, setActiveAction] = useState<string>();
  const { agent } = useAgent({ agentId: "qa" });
  const { copilotkit } = useCopilotKit();

  useAgentContext({
    description: "Current QA workbench selection. Use this as the default scope unless the user explicitly changes it.",
    value: { projectId, environment, storyId },
  });

  useEffect(() => {
    void fetch("/api/qa/capabilities")
      .then(async (response) => {
        if (!response.ok) throw new Error(`QA capabilities returned ${response.status}`);
        return response.json() as Promise<{ capabilities: QaCapability[]; integrations: QaIntegrationStatus }>;
      })
      .then(({ capabilities: loaded, integrations: status }) => {
        setCapabilities(loaded);
        setIntegrations(status);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  const riskSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const capability of capabilities) {
      counts.set(capability.riskLevel, (counts.get(capability.riskLevel) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [capabilities]);

  const run = async (label: string, instruction: string) => {
    setActiveAction(label);
    try {
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: instruction,
      });
      await copilotkit.runAgent({ agent });
    } finally {
      setActiveAction(undefined);
    }
  };

  const analyzeStory = () => run(
    "Analyze story",
    `Analyze ${storyId} for project ${projectId} in ${environment}. Execute the governed capability flow, not a fictional one: first request and execute qa.jira.story.read with storyId ${storyId}, then request and execute qa.bitbucket.change-impact.read with storyId ${storyId}. Use only the returned evidence to produce a concise QA impact analysis and test approach. If result.mode is live, identify it as actual read-only evidence. If result.mode is mock, clearly label it as a simulation. Never claim a write occurred.`,
  );

  const runSmoke = () => run(
    "Run smoke",
    `Run the QA smoke workflow for ${storyId} in project ${projectId}, environment ${environment}. Request qa.playwright.test.run with suite story-smoke and then execute it if policy permits. Interpret the result and clearly state that mock mode did not launch a real browser.`,
  );

  const approvalDemo = () => run(
    "Create bug",
    `Demonstrate the governed defect-write flow for ${storyId} in ${projectId}. Request qa.jira.bug.create with summary "QA demo defect for ${storyId}", severity "Major", and storyId "${storyId}". When the server returns pending_approval, call reviewQaAction with the exact action id, capability id, risk level, payload hash, and a clear summary. If I approve, execute that same action id. Be explicit that the current Jira write adapter remains mock-only and no real Jira issue is created.`,
  );

  const configuredRepos = integrations?.bitbucket.projects[projectId]?.length ?? 0;

  return (
    <section className="qa-workbench">
      <div className="section-title qa-title">
        <div>
          <span className="eyebrow">QA VERTICAL SLICE</span>
          <h2>Governed QA workbench</h2>
        </div>
        <span className="live-chip">{capabilities.length} capabilities</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="qa-scope-grid">
        <label>
          <span>Project</span>
          <select value={projectId} onChange={(event) => {
            setProjectId(event.target.value);
            if (!storyId.startsWith(`${event.target.value}-`)) setStoryId(`${event.target.value}-1`);
          }}>
            <option>PCC</option>
            <option>SOP</option>
            <option>DataBridge</option>
          </select>
        </label>
        <label>
          <span>Environment</span>
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
            <option value="playground">Playground</option>
            <option value="qa">QA</option>
            <option value="prod">Prod · governed read</option>
          </select>
        </label>
        <label className="story-field">
          <span>Jira story</span>
          <input value={storyId} onChange={(event) => setStoryId(event.target.value)} />
        </label>
      </div>

      <div className="qa-actions">
        <button className="qa-action" disabled={agent.isRunning} onClick={() => void analyzeStory()}>
          <strong>{activeAction === "Analyze story" ? "Analyzing…" : "Analyze story"}</strong>
          <span>Jira read → Bitbucket impact → QA plan</span>
        </button>
        <button className="qa-action" disabled={agent.isRunning} onClick={() => void runSmoke()}>
          <strong>{activeAction === "Run smoke" ? "Running…" : "Run smoke simulation"}</strong>
          <span>L1 standing-policy Playwright contract</span>
        </button>
        <button className="qa-action approval-demo" disabled={agent.isRunning} onClick={() => void approvalDemo()}>
          <strong>{activeAction === "Create bug" ? "Preparing…" : "Approval demo: create bug"}</strong>
          <span>L3 → payload-bound human approval</span>
        </button>
      </div>

      <div className="risk-row">
        {riskSummary.map(([risk, count]) => <span key={risk}>{risk}: {count}</span>)}
        <span>Jira read: {integrations?.jira.mode ?? "loading"}</span>
        <span>Bitbucket read: {integrations?.bitbucket.mode ?? "loading"} · {configuredRepos} repos</span>
        <span>Writes/Playwright: mock</span>
      </div>
    </section>
  );
}
