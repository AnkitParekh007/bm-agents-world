import { useCallback, useEffect, useMemo, useState } from "react";

interface PilotSummary {
  periodDays: number;
  projectId?: string;
  totalRuns: number;
  evaluatedRuns: number;
  evaluatedSuccessRate: number | null;
  averageUsefulnessScore: number | null;
  wouldUseAgainRate: number | null;
  falsePositiveDefectRate: number | null;
  averageManualOverrideMinutes: number | null;
  averageRunDurationMs: number | null;
  actionSuccessRate: number | null;
  approvalRejectionRate: number | null;
  totalSelectedTests: number;
  totalPassedTests: number;
  totalFailedTests: number;
  browserPassRate: number | null;
  bugDraftsGenerated: number;
  jiraDefectsCreated: number;
  liveActions: number;
  externalSideEffects: number;
  modelUsageStatus: "not_instrumented";
}

interface RunEvaluation {
  outcome: "successful" | "partially_successful" | "failed" | "abandoned";
  usefulnessScore: number;
  wouldUseAgain: boolean;
  falsePositiveDefect: boolean;
  manualOverrideMinutes: number;
  notes?: string;
  reviewerUserId: string;
  updatedAt: string;
}

interface PilotRun {
  runId: string;
  projectId: string;
  environment: string;
  userId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  actionCount: number;
  executedActions: number;
  failedActions: number;
  rejectedActions: number;
  approvalsRequested: number;
  approvalsApproved: number;
  approvalsRejected: number;
  selectedTests: number;
  passedTests: number;
  failedTests: number;
  bugDraftGenerated: boolean;
  duplicateCandidates: number;
  jiraDefectCreated: boolean;
  liveActions: number;
  externalSideEffects: number;
  evaluation?: RunEvaluation;
}

interface SessionInfo {
  userId: string;
  tenantId: string;
  projectIds: string[];
}

function percent(value: number | null): string {
  return value == null ? "—" : `${Math.round(value * 100)}%`;
}

function duration(value: number | null): string {
  if (value == null) return "—";
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function EvaluationEditor({ run, onSaved, onCancel }: {
  run: PilotRun;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [outcome, setOutcome] = useState<RunEvaluation["outcome"]>(run.evaluation?.outcome ?? "successful");
  const [usefulnessScore, setUsefulnessScore] = useState(run.evaluation?.usefulnessScore ?? 4);
  const [wouldUseAgain, setWouldUseAgain] = useState(run.evaluation?.wouldUseAgain ?? true);
  const [falsePositiveDefect, setFalsePositiveDefect] = useState(run.evaluation?.falsePositiveDefect ?? false);
  const [manualOverrideMinutes, setManualOverrideMinutes] = useState(run.evaluation?.manualOverrideMinutes ?? 0);
  const [notes, setNotes] = useState(run.evaluation?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const save = async () => {
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/qa/runs/${encodeURIComponent(run.runId)}/evaluation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ outcome, usefulnessScore, wouldUseAgain, falsePositiveDefect, manualOverrideMinutes, notes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? result.error ?? `Evaluation returned ${response.status}`);
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pilot-evaluation-editor">
      <div className="pilot-evaluation-grid">
        <label><span>Outcome</span><select value={outcome} onChange={(event) => setOutcome(event.target.value as RunEvaluation["outcome"])}>
          <option value="successful">Successful</option>
          <option value="partially_successful">Partially successful</option>
          <option value="failed">Failed</option>
          <option value="abandoned">Abandoned</option>
        </select></label>
        <label><span>Usefulness</span><select value={usefulnessScore} onChange={(event) => setUsefulnessScore(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} / 5</option>)}
        </select></label>
        <label><span>Manual override</span><input type="number" min={0} max={480} value={manualOverrideMinutes} onChange={(event) => setManualOverrideMinutes(Number(event.target.value))} /></label>
      </div>
      <div className="pilot-checks">
        <label><input type="checkbox" checked={wouldUseAgain} onChange={(event) => setWouldUseAgain(event.target.checked)} /> Would use again</label>
        <label><input type="checkbox" checked={falsePositiveDefect} onChange={(event) => setFalsePositiveDefect(event.target.checked)} /> False-positive defect</label>
      </div>
      <label className="pilot-notes"><span>Pilot notes</span><textarea value={notes} maxLength={2000} onChange={(event) => setNotes(event.target.value)} placeholder="What still required manual work?" /></label>
      {error && <div className="approval-error">{error}</div>}
      <div className="pilot-evaluation-actions">
        <button className="secondary-button" disabled={saving} onClick={onCancel}>Cancel</button>
        <button className="primary-button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save evaluation"}</button>
      </div>
    </div>
  );
}

export function QaPilotDashboard() {
  const [session, setSession] = useState<SessionInfo>();
  const [summary, setSummary] = useState<PilotSummary>();
  const [runs, setRuns] = useState<PilotRun[]>([]);
  const [days, setDays] = useState(7);
  const [projectId, setProjectId] = useState("");
  const [editingRunId, setEditingRunId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const query = useMemo(() => {
    const params = new URLSearchParams({ days: String(days) });
    if (projectId) params.set("projectId", projectId);
    return params.toString();
  }, [days, projectId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [sessionResponse, summaryResponse, runsResponse] = await Promise.all([
        fetch("/api/session"),
        fetch(`/api/qa/observability/summary?${query}`),
        fetch(`/api/qa/observability/runs?${query}&limit=30`),
      ]);
      if (!sessionResponse.ok) throw new Error(`Session returned ${sessionResponse.status}`);
      if (!summaryResponse.ok) throw new Error(`Pilot summary returned ${summaryResponse.status}`);
      if (!runsResponse.ok) throw new Error(`Pilot runs returned ${runsResponse.status}`);
      const sessionBody = await sessionResponse.json() as SessionInfo;
      const summaryBody = await summaryResponse.json() as PilotSummary;
      const runsBody = await runsResponse.json() as { runs: PilotRun[] };
      setSession(sessionBody);
      setSummary(summaryBody);
      setRuns(runsBody.runs);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="pilot-dashboard">
      <div className="section-title pilot-dashboard-title">
        <div><span className="eyebrow">QA PILOT OBSERVABILITY</span><h2>Team pilot scorecard</h2></div>
        <div className="pilot-filters">
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} aria-label="Pilot project filter">
            <option value="">All authorized projects</option>
            {(session?.projectIds ?? []).map((project) => <option key={project} value={project}>{project}</option>)}
          </select>
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} aria-label="Pilot period filter">
            <option value={1}>24 hours</option><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option>
          </select>
          <button className="secondary-button" disabled={loading} onClick={() => void load()}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {summary && (
        <>
          <div className="pilot-metric-grid">
            <div className="pilot-metric"><strong>{summary.totalRuns}</strong><span>Runs</span></div>
            <div className="pilot-metric"><strong>{percent(summary.actionSuccessRate)}</strong><span>Action success</span></div>
            <div className="pilot-metric"><strong>{percent(summary.browserPassRate)}</strong><span>Browser pass</span></div>
            <div className="pilot-metric"><strong>{summary.averageUsefulnessScore ?? "—"}</strong><span>Usefulness / 5</span></div>
            <div className="pilot-metric"><strong>{percent(summary.wouldUseAgainRate)}</strong><span>Would use again</span></div>
            <div className="pilot-metric"><strong>{summary.averageManualOverrideMinutes ?? "—"}</strong><span>Manual minutes</span></div>
            <div className="pilot-metric"><strong>{percent(summary.approvalRejectionRate)}</strong><span>Approval reject</span></div>
            <div className="pilot-metric"><strong>{duration(summary.averageRunDurationMs)}</strong><span>Avg duration</span></div>
          </div>
          <div className="pilot-secondary-metrics">
            <span><strong>{summary.totalSelectedTests}</strong> selected tests</span>
            <span><strong>{summary.bugDraftsGenerated}</strong> bug drafts</span>
            <span><strong>{summary.jiraDefectsCreated}</strong> Jira defects</span>
            <span><strong>{summary.externalSideEffects}</strong> live side effects</span>
            <span><strong>{summary.evaluatedRuns}/{summary.totalRuns}</strong> runs evaluated</span>
            <span className="pilot-telemetry-pending">Token/cost telemetry: not instrumented</span>
          </div>
        </>
      )}

      <div className="pilot-run-list">
        <div className="pilot-run-header">
          <span>Run</span><span>Scope</span><span>Actions</span><span>Tests</span><span>Outcome</span><span>Evaluation</span>
        </div>
        {!loading && runs.length === 0 && <div className="pilot-empty">No QA runs exist in this scope yet.</div>}
        {runs.map((run) => (
          <div className="pilot-run" key={run.runId}>
            <div className="pilot-run-row">
              <div><strong>{run.runId.slice(0, 12)}</strong><small>{duration(run.durationMs)} · {new Date(run.startedAt).toLocaleString()}</small></div>
              <div><strong>{run.projectId}</strong><small>{run.environment} · {run.userId}</small></div>
              <div><strong>{run.executedActions}/{run.actionCount}</strong><small>{run.failedActions} failed · {run.rejectedActions} rejected</small></div>
              <div><strong>{run.passedTests}/{run.selectedTests}</strong><small>{run.failedTests} failed · {run.bugDraftGenerated ? "bug draft" : "no draft"}</small></div>
              <div><strong>{run.jiraDefectCreated ? "Jira created" : run.externalSideEffects ? "Live side effect" : "No write"}</strong><small>{run.approvalsApproved} approved · {run.approvalsRejected} rejected</small></div>
              <div>
                <strong>{run.evaluation ? `${run.evaluation.usefulnessScore}/5 · ${run.evaluation.outcome.replace("_", " ")}` : "Not evaluated"}</strong>
                <button className="pilot-evaluate-button" onClick={() => setEditingRunId(editingRunId === run.runId ? undefined : run.runId)}>{run.evaluation ? "Edit" : "Evaluate"}</button>
              </div>
            </div>
            {editingRunId === run.runId && <EvaluationEditor run={run} onCancel={() => setEditingRunId(undefined)} onSaved={() => { setEditingRunId(undefined); void load(); }} />}
          </div>
        ))}
      </div>
    </section>
  );
}
