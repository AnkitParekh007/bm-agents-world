import { useCallback, useEffect, useMemo, useState } from "react";
import {
  controlPlaneApi,
  formatWaiting,
  type AgentRow,
  type ApprovalRow,
  type CapabilityRow,
  type ControlPlaneOverview,
  type PostureLevel,
  type RiskLevel,
} from "./api";

/**
 * The governed platform's operator console (Phase 10).
 *
 * It answers three questions, in the order an operator asks them: is the
 * platform in a sound state, what is it allowed to do and who may ask, and what
 * is waiting on me right now. Every value shown is computed server-side; this
 * component sorts nothing and decides nothing, so what an operator reads is what
 * the server would enforce.
 */

const RISK_LEVELS: RiskLevel[] = ["L0", "L1", "L2", "L3", "L4"];

type TabId = "posture" | "capabilities" | "agents" | "approvals";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "posture", label: "Posture" },
  { id: "capabilities", label: "Capabilities" },
  { id: "agents", label: "Agents & grants" },
  { id: "approvals", label: "Approvals" },
];

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`cp-pill cp-pill-${tone}`}>{children}</span>;
}

function RiskPill({ level }: { level: RiskLevel }) {
  return <Pill tone={`risk-${level.toLowerCase()}`}>{level}</Pill>;
}

function useControlPlane() {
  const [overview, setOverview] = useState<ControlPlaneOverview>();
  const [capabilities, setCapabilities] = useState<CapabilityRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRow[]>([]);
  const [error, setError] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextOverview, nextCapabilities, nextAgents, nextApprovals] = await Promise.all([
        controlPlaneApi.overview(),
        controlPlaneApi.capabilities(),
        controlPlaneApi.agents(),
        controlPlaneApi.approvals(),
      ]);
      setOverview(nextOverview);
      setCapabilities(nextCapabilities.capabilities);
      setAgents(nextAgents.agents);
      setApprovals(nextApprovals.approvals);
      setLoadedAt(new Date());
      setError(undefined);
    } catch (reason: unknown) {
      // An unreachable control plane is itself operational information, so the
      // console says so plainly instead of rendering an empty, healthy-looking page.
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { overview, capabilities, agents, approvals, error, loading, loadedAt, refresh };
}

function PostureView({ overview }: { overview: ControlPlaneOverview }) {
  const maxRisk = Math.max(1, ...RISK_LEVELS.map((level) => overview.riskHistogram[level]));

  return (
    <>
      <section className="cp-cards" aria-label="Platform totals">
        <div className="cp-card">
          <strong>{overview.governedPacks.length}</strong>
          <span>Governed packs</span>
          <small>{overview.governedPacks.join(", ") || "none"}</small>
        </div>
        <div className="cp-card">
          <strong>{overview.governedAgentCount}</strong>
          <span>Governed agents</span>
          <small>Supervisors and capability-scoped specialists</small>
        </div>
        <div className="cp-card">
          <strong>{overview.capabilityCount}</strong>
          <span>Capabilities</span>
          <small>{overview.externalWriteCount} can write to an external system</small>
        </div>
        <div className="cp-card">
          <strong>{overview.packCount}</strong>
          <span>Packs loaded</span>
          <small>Governed and metadata-only</small>
        </div>
      </section>

      <section className="cp-panel" aria-label="Posture">
        <h2>Posture</h2>
        <ul className="cp-posture">
          {overview.posture.map((item) => (
            <li key={item.id} className={`cp-posture-item cp-level-${item.level}`}>
              <span className="cp-posture-dot" aria-hidden="true" />
              <div className="cp-posture-copy">
                <div className="cp-posture-head">
                  <strong>{item.label}</strong>
                  <span className="cp-posture-value">{item.value}</span>
                </div>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="cp-panel" aria-label="Capability risk distribution">
        <h2>Capability risk</h2>
        <p className="cp-note">
          Higher levels require approval before anything executes. An action denied by policy has no capability at
          all, so this chart counts only what an agent can even ask for.
        </p>
        <div className="cp-histogram">
          {RISK_LEVELS.map((level) => {
            const count = overview.riskHistogram[level];
            return (
              <div className="cp-bar-row" key={level}>
                <RiskPill level={level} />
                <div className="cp-bar-track">
                  <div
                    className={`cp-bar cp-bar-${level.toLowerCase()}`}
                    style={{ width: `${(count / maxRisk) * 100}%` }}
                  />
                </div>
                <span className="cp-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function CapabilitiesView({ rows }: { rows: CapabilityRow[] }) {
  const [query, setQuery] = useState("");
  const [pack, setPack] = useState("all");
  const packs = useMemo(() => [...new Set(rows.map((row) => row.packId))].sort(), [rows]);

  const visible = rows.filter((row) => {
    if (pack !== "all" && row.packId !== pack) return false;
    const haystack = `${row.id} ${row.system} ${row.action} ${row.description}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section className="cp-panel" aria-label="Capabilities">
      <div className="cp-panel-head">
        <h2>Capabilities</h2>
        <div className="cp-filters">
          <select value={pack} onChange={(event) => setPack(event.target.value)} aria-label="Filter by pack">
            <option value="all">All packs</option>
            {packs.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter capabilities…"
            aria-label="Filter capabilities"
          />
        </div>
      </div>

      <div className="cp-table-scroll">
        <table className="cp-table">
          <thead>
            <tr>
              <th>Risk</th>
              <th>Capability</th>
              <th>Pack</th>
              <th>Approval</th>
              <th>Environments</th>
              <th>Backed by</th>
              <th>Who may request</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td><RiskPill level={row.riskLevel} /></td>
                <td>
                  <code>{row.id}</code>
                  <p className="cp-cell-note">{row.description}</p>
                  {row.externalWrite && <Pill tone="warn">external write</Pill>}
                </td>
                <td>{row.packId}</td>
                <td>
                  {row.approvalMode === "human" ? <Pill tone="warn">human</Pill> : row.approvalMode}
                </td>
                <td className="cp-nowrap">{row.allowedEnvironments.join(", ")}</td>
                <td>
                  <code>{row.adapterId}</code>
                  {!row.adapterRegistered && <Pill tone="bad">not registered</Pill>}
                  {row.connectorId && <p className="cp-cell-note">connector: {row.connectorId}</p>}
                </td>
                <td>
                  {row.grantedTo.length === 0
                    ? <span className="cp-muted">no agent</span>
                    : row.grantedTo.map((agent) => <code className="cp-agent" key={agent}>{agent}</code>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="cp-empty">No capability matches this filter.</p>}
      </div>
    </section>
  );
}

function AgentsView({ rows }: { rows: AgentRow[] }) {
  const byPack = useMemo(() => {
    const grouped = new Map<string, AgentRow[]>();
    for (const row of rows) {
      const list = grouped.get(row.packId) ?? [];
      list.push(row);
      grouped.set(row.packId, list);
    }
    return [...grouped.entries()];
  }, [rows]);

  return (
    <section className="cp-panel" aria-label="Agents and grants">
      <h2>Agents & grants</h2>
      <p className="cp-note">
        A specialist may request only its listed capabilities. An agent id matching no declaration is denied
        outright, so a typo'd or spoofed identity has no authority rather than inherited authority.
      </p>

      {byPack.map(([packId, agents]) => (
        <div className="cp-pack-block" key={packId}>
          <h3>{packId}</h3>
          <div className="cp-agent-grid">
            {agents.map((agent) => (
              <div className={`cp-agent-card ${agent.unrestricted ? "cp-agent-super" : ""}`} key={agent.runtimeId}>
                <div className="cp-agent-head">
                  <code>{agent.runtimeId}</code>
                  {agent.unrestricted ? <Pill tone="warn">unrestricted</Pill> : <Pill tone="ok">scoped</Pill>}
                </div>
                {agent.purpose && <p className="cp-cell-note">{agent.purpose}</p>}
                {agent.unrestricted ? (
                  <p className="cp-muted">Declared supervisor: may request any capability it coordinates.</p>
                ) : (
                  <ul className="cp-grant-list">
                    {(agent.capabilities ?? []).map((capability) => (
                      <li key={capability}><code>{capability}</code></li>
                    ))}
                    {(agent.capabilities ?? []).length === 0 && <li className="cp-muted">No capabilities granted.</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ApprovalsView({ rows }: { rows: ApprovalRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="cp-panel" aria-label="Approvals">
        <h2>Approvals</h2>
        <p className="cp-empty">No governed action is waiting on a human decision.</p>
      </section>
    );
  }

  return (
    <section className="cp-panel" aria-label="Approvals">
      <div className="cp-panel-head">
        <h2>Approvals</h2>
        <Pill tone="warn">{rows.length} waiting</Pill>
      </div>
      <p className="cp-note">
        Each approval is bound to the exact payload hash shown. Approving authorises that payload only — a
        substituted payload after approval is refused by the broker.
      </p>

      <div className="cp-approvals">
        {rows.map((row) => (
          <article className={`cp-approval ${row.expired ? "cp-approval-expired" : ""}`} key={row.actionId}>
            <header>
              <RiskPill level={row.riskLevel} />
              <code>{row.capabilityId}</code>
              {row.externalWrite && <Pill tone="warn">external write</Pill>}
              {row.expired && <Pill tone="bad">expired</Pill>}
            </header>
            <dl className="cp-approval-facts">
              <div><dt>Requested by</dt><dd>{row.requestedBy}</dd></div>
              <div><dt>Agent</dt><dd><code>{row.agentId}</code></dd></div>
              <div><dt>Scope</dt><dd>{row.projectId} · {row.environment}</dd></div>
              <div><dt>Waiting</dt><dd>{formatWaiting(row.waitingMinutes)}</dd></div>
              <div><dt>Payload hash</dt><dd><code className="cp-hash">{row.payloadHash}</code></dd></div>
              <div><dt>Action</dt><dd><code className="cp-hash">{row.actionId}</code></dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ControlPlane() {
  const { overview, capabilities, agents, approvals, error, loading, loadedAt, refresh } = useControlPlane();
  const [tab, setTab] = useState<TabId>("posture");

  const level: PostureLevel = overview
    ? overview.posture.some((item) => item.level === "critical")
      ? "critical"
      : overview.posture.some((item) => item.level === "attention")
        ? "attention"
        : "ok"
    : "ok";

  return (
    <div className="cp-shell">
      <header className="cp-header">
        <div>
          <div className="cp-eyebrow">BM AGENTS WORLD · CONTROL PLANE</div>
          <h1>Governed platform console</h1>
          <p>What this platform may do, which agent may ask, and what is waiting on a human.</p>
        </div>
        <div className="cp-header-side">
          {overview && (
            <span className={`cp-status cp-level-${level}`}>
              {level === "ok" ? "Nominal" : level === "attention" ? "Needs attention" : "Action required"}
            </span>
          )}
          <button className="cp-refresh" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          {loadedAt && <small>as of {loadedAt.toLocaleTimeString()}</small>}
        </div>
      </header>

      {error && (
        <div className="cp-error" role="alert">
          <strong>Control plane unreachable.</strong> {error}
        </div>
      )}

      <nav className="cp-tabs" aria-label="Control plane sections">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            className={`cp-tab ${tab === entry.id ? "active" : ""}`}
            onClick={() => setTab(entry.id)}
            aria-current={tab === entry.id}
          >
            {entry.label}
            {entry.id === "approvals" && approvals.length > 0 && <span className="cp-tab-count">{approvals.length}</span>}
          </button>
        ))}
      </nav>

      <main className="cp-main">
        {!overview && !error && <p className="cp-empty">Loading platform state…</p>}
        {overview && tab === "posture" && <PostureView overview={overview} />}
        {tab === "capabilities" && <CapabilitiesView rows={capabilities} />}
        {tab === "agents" && <AgentsView rows={agents} />}
        {tab === "approvals" && <ApprovalsView rows={approvals} />}
      </main>
    </div>
  );
}
