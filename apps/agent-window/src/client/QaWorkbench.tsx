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
  playwright: {
    mode: "live" | "mock";
    enabled: boolean;
    browser: "chromium";
    targets: Array<{ projectId: string; environment: "playground" | "qa"; url: string }>;
  };
}

interface ProjectTestProfile {
  projectId: string;
  authenticatedIdentity: {
    configured: boolean;
    secretReference?: { provider: string; name: string; purpose: string };
  };
  suites: Array<{
    id: string;
    cases: Array<{ id: string; title: string; baseline: boolean; pathPrefixes: string[] }>;
  }>;
}

interface ApprovalDecisionResponse {
  id?: string;
  status?: string;
  error?: string;
  message?: string;
}

function ApprovalCard({ actionId, capabilityId, riskLevel, summary, payloadHash, respond }: {
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
        headers: { "content-type": "application/json", "x-user-id": "local-dev-user" },
        body: JSON.stringify({
          decision: next,
          reason: next === "approved" ? "Approved in BM Agents World QA workbench" : "Rejected in BM Agents World QA workbench",
        }),
      });
      const result = (await response.json()) as ApprovalDecisionResponse;
      if (!response.ok) throw new Error(result.message ?? result.error ?? `Approval returned ${response.status}`);
      setDecision(next);
      respond({ decision: next, actionId, serverStatus: result.status, payloadHash });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setSubmitting(null);
    }
  };

  return (
    <div className="approval-card">
      <div className="approval-card-header"><span className="risk-chip">{riskLevel}</span><strong>Human approval required</strong></div>
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
      actionId: z.string().uuid(), capabilityId: z.string(), riskLevel: z.string(), summary: z.string(), payloadHash: z.string(),
    }),
    render: ({ args, respond }) => {
      if (!respond || !args.actionId || !args.capabilityId || !args.payloadHash) return <div className="approval-card">Preparing approval request…</div>;
      return <ApprovalCard actionId={args.actionId} capabilityId={args.capabilityId} riskLevel={args.riskLevel ?? "L3"} summary={args.summary ?? "Review this QA action."} payloadHash={args.payloadHash} respond={respond} />;
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
  const [projectTests, setProjectTests] = useState<ProjectTestProfile[]>([]);
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
        return response.json() as Promise<{ capabilities: QaCapability[]; integrations: QaIntegrationStatus; projectTests: ProjectTestProfile[] }>;
      })
      .then(({ capabilities: loaded, integrations: status, projectTests: tests }) => {
        setCapabilities(loaded);
        setIntegrations(status);
        setProjectTests(tests);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  const riskSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const capability of capabilities) counts.set(capability.riskLevel, (counts.get(capability.riskLevel) ?? 0) + 1);
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [capabilities]);

  const run = async (label: string, instruction: string) => {
    setActiveAction(label);
    try {
      agent.addMessage({ id: crypto.randomUUID(), role: "user", content: instruction });
      await copilotkit.runAgent({ agent });
    } finally {
      setActiveAction(undefined);
    }
  };

  const analyzeStory = () => run(
    "Analyze story",
    `Analyze ${storyId} for project ${projectId} in ${environment}. First request and execute qa.jira.story.read with storyId ${storyId}, then request and execute qa.bitbucket.change-impact.read with storyId ${storyId}. Use only returned evidence to produce the QA impact analysis and test approach. Clearly distinguish live evidence from mock simulation.`,
  );

  const runProjectTests = () => run(
    "Run project tests",
    `Execute the governed story-scoped QA workflow for ${storyId} in ${projectId}/${environment}. First request and execute qa.bitbucket.change-impact.read for ${storyId}; extract the changed file paths from that returned evidence. Then call listQaProjectTests, request qa.playwright.test.run with payload {"suite":"story-smoke","storyId":"${storyId}","changedFiles":[the exact Bitbucket changed paths]} and execute it if policy permits. Never supply a target URL, selector, credential, storage-state contents, script, or test file path. The server selects project tests and authenticated identity. If live execution returns a bugDraftArtifact, surface its URI together with testResultArtifact and evidenceManifestArtifact and state that it is a draft requiring human review before any Jira write.`,
  );

  const approvalDemo = () => run(
    "Create bug",
    `Demonstrate the governed defect-write flow for ${storyId} in ${projectId}. Request qa.jira.bug.create with summary "QA demo defect for ${storyId}", severity "Major", and storyId "${storyId}". When pending_approval is returned, call reviewQaAction with the exact action id, capability id, risk level, payload hash, and summary. If I approve, execute that same action id. Be explicit that Jira write remains mock-only.`,
  );

  const configuredRepos = integrations?.bitbucket.projects[projectId]?.length ?? 0;
  const playwrightTarget = integrations?.playwright.targets.find((target) => target.projectId === projectId && target.environment === environment);
  const playwrightRunnable = environment !== "prod" && integrations?.playwright.mode === "live" && Boolean(playwrightTarget);
  const selectedProfile = projectTests.find((profile) => profile.projectId === projectId);
  const smokeSuite = selectedProfile?.suites.find((suite) => suite.id === "story-smoke");

  return (
    <section className="qa-workbench">
      <div className="section-title qa-title">
        <div><span className="eyebrow">QA VERTICAL SLICE</span><h2>Governed QA workbench</h2></div>
        <span className="live-chip">{capabilities.length} capabilities</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="qa-scope-grid">
        <label><span>Project</span><select value={projectId} onChange={(event) => {
          setProjectId(event.target.value);
          if (!storyId.startsWith(`${event.target.value}-`)) setStoryId(`${event.target.value}-1`);
        }}><option>PCC</option><option>SOP</option><option>DataBridge</option></select></label>
        <label><span>Environment</span><select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
          <option value="playground">Playground</option><option value="qa">QA</option><option value="prod">Prod · governed read</option>
        </select></label>
        <label className="story-field"><span>Jira story</span><input value={storyId} onChange={(event) => setStoryId(event.target.value)} /></label>
      </div>

      <div className="qa-actions">
        <button className="qa-action" disabled={agent.isRunning} onClick={() => void analyzeStory()}>
          <strong>{activeAction === "Analyze story" ? "Analyzing…" : "Analyze story"}</strong><span>Jira read → Bitbucket impact → QA plan</span>
        </button>
        <button className="qa-action" disabled={agent.isRunning || environment === "prod"} onClick={() => void runProjectTests()}>
          <strong>{activeAction === "Run project tests" ? "Running project QA…" : playwrightRunnable ? "Run story-scoped project tests" : "Run project test simulation"}</strong>
          <span>{playwrightRunnable ? `L1 · ${smokeSuite?.cases.length ?? 0} allowlisted cases · ${selectedProfile?.authenticatedIdentity.configured ? "authenticated" : "anonymous"}` : "L1 governed Playwright contract"}</span>
        </button>
        <button className="qa-action approval-demo" disabled={agent.isRunning} onClick={() => void approvalDemo()}>
          <strong>{activeAction === "Create bug" ? "Preparing…" : "Approval demo: create bug"}</strong><span>L3 → payload-bound human approval</span>
        </button>
      </div>

      <div className="risk-row">
        {riskSummary.map(([risk, count]) => <span key={risk}>{risk}: {count}</span>)}
        <span>Jira: {integrations?.jira.mode ?? "loading"}</span>
        <span>Bitbucket: {integrations?.bitbucket.mode ?? "loading"} · {configuredRepos} repos</span>
        <span>Playwright: {integrations?.playwright.mode ?? "loading"}{playwrightTarget ? ` · ${environment}` : ""}</span>
        <span>Identity: {selectedProfile?.authenticatedIdentity.configured ? "server-side auth ready" : "not configured"}</span>
        <span>Bug write: mock</span>
      </div>
    </section>
  );
}
