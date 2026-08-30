import { useEffect, useMemo, useState } from "react";
import {
  CopilotChat,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { QaApprovalBridge, QaWorkbench } from "./QaWorkbench";
import { QaPilotDashboard } from "./QaPilotDashboard";

interface PackSummary {
  id: string;
  packName: string;
  displayName: string;
  version: string;
  supervisor: string;
  summary: string;
  projects: string[];
  environments: string[];
  subAgents: Array<{ id: string; role?: string; name?: string; purpose?: string; description?: string }>;
  skillCount: number;
  mcpCount: number;
  pluginCount: number;
  artifactCount: number;
  workflowCount: number;
  taskCount: number;
  policy: Record<string, unknown>;
}

interface PackDetails extends PackSummary {
  taskGroups: Array<{ name: string; tasks: string[] }>;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function TaskLauncher({ agentId, details }: { agentId: string; details?: PackDetails }) {
  const { agent } = useAgent({ agentId });
  const { copilotkit } = useCopilotKit();
  const [runningTask, setRunningTask] = useState<string | null>(null);

  const featuredTasks = useMemo(
    () =>
      (details?.taskGroups ?? [])
        .flatMap((group) => group.tasks.slice(0, 2).map((task) => ({ group: group.name, task })))
        .slice(0, 10),
    [details],
  );

  const launch = async (task: string, group: string) => {
    setRunningTask(task);
    try {
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: `Start this pack task: ${task}\nTask group: ${group}\n\nUse the loaded agent pack as the operating contract. Inspect the pack, explain the execution plan, identify the sub-agents/skills/tools/artifacts that should participate, and use any governed capability tools available for this pack. Clearly label mock/simulated results and never claim an external action occurred unless the tool result confirms a live side effect.`,
      });
      await copilotkit.runAgent({ agent });
    } finally {
      setRunningTask(null);
    }
  };

  if (!details) return <div className="task-empty">Loading task catalog…</div>;

  return (
    <div className="task-grid">
      {featuredTasks.map(({ group, task }) => (
        <button
          className="task-card"
          key={`${group}:${task}`}
          onClick={() => void launch(task, group)}
          disabled={agent.isRunning}
        >
          <span className="task-group">{group}</span>
          <span className="task-name">{task}</span>
          <span className="task-action">
            {runningTask === task ? "Running…" : agent.isRunning ? "Agent busy" : "Run task →"}
          </span>
        </button>
      ))}
    </div>
  );
}

export function App() {
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("qa");
  const [details, setDetails] = useState<PackDetails>();
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    void fetch("/api/packs")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Pack registry returned ${response.status}`);
        return response.json() as Promise<{ packs: PackSummary[] }>;
      })
      .then(({ packs: loaded }) => {
        setPacks(loaded);
        if (!loaded.some((pack) => pack.id === selectedId) && loaded[0]) setSelectedId(loaded[0].id);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setDetails(undefined);
    void fetch(`/api/packs/${encodeURIComponent(selectedId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load ${selectedId}`);
        return response.json() as Promise<PackDetails>;
      })
      .then(setDetails)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, [selectedId]);

  const selected = packs.find((pack) => pack.id === selectedId);
  const visiblePacks = packs.filter((pack) =>
    `${pack.displayName} ${pack.id}`.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <QaApprovalBridge />
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BM</div>
          <div>
            <strong>Agents World</strong>
            <span>CopilotKit Lab</span>
          </div>
        </div>

        <div className="sidebar-heading">
          <span>Agent packs</span>
          <span className="count-pill">{packs.length}</span>
        </div>

        <input
          className="pack-search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Find an agent…"
          aria-label="Find an agent"
        />

        <nav className="pack-list">
          {visiblePacks.map((pack) => (
            <button
              key={pack.id}
              className={`pack-item ${selectedId === pack.id ? "active" : ""}`}
              onClick={() => setSelectedId(pack.id)}
            >
              <span className="pack-avatar">{pack.displayName.slice(0, 2).toUpperCase()}</span>
              <span className="pack-copy">
                <strong>{pack.displayName}</strong>
                <small>{pack.taskCount} tasks · {pack.subAgents.length} agents</small>
              </span>
            </button>
          ))}
        </nav>

        {/* A plain link, not an import: the operator console is a separate entry
            that loads no agent runtime, so it stays reachable when this one cannot start. */}
        <a className="control-plane-link" href="/control-plane.html">
          Control plane →
        </a>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <div>
            <strong>Pack runtime online</strong>
            <small>{selectedId === "qa" ? "QA capability broker active" : "Pack metadata mode"}</small>
          </div>
        </div>
      </aside>

      <main className="workspace">
        {error && <div className="error-banner">{error}</div>}
        <header className="workspace-header">
          <div>
            <div className="eyebrow">BM AGENT FOUNDRY · INCUBATION PROJECT</div>
            <h1>{selected?.displayName ?? "Loading agents…"}</h1>
            <p>{selected?.summary ?? "Discovering agent packs from the repository."}</p>
          </div>
          {selected && (
            <div className="policy-badge">
              <span>{selectedId === "qa" ? "QA policy" : "Foundation policy"}</span>
              <strong>No production mutation</strong>
            </div>
          )}
        </header>

        {selected && (
          <section className="metrics-row" aria-label="Pack metrics">
            <Metric value={selected.taskCount} label="Tasks" />
            <Metric value={selected.subAgents.length} label="Sub-agents" />
            <Metric value={selected.skillCount} label="Skills" />
            <Metric value={selected.mcpCount} label="MCPs" />
            <Metric value={selected.artifactCount} label="Artifacts" />
            <Metric value={selected.workflowCount} label="Workflows" />
          </section>
        )}

        {selectedId === "qa" && <QaWorkbench />}
        {selectedId === "qa" && <QaPilotDashboard />}

        <div className="workspace-grid">
          <section className="operations-panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">PROGRAMMATIC CONTROL</span>
                <h2>Daily task launcher</h2>
              </div>
              <span className="live-chip">CopilotKit AG-UI</span>
            </div>
            {selected && <TaskLauncher agentId={selected.id} details={details} />}
          </section>

          <section className="chat-panel">
            {selected ? (
              <CopilotChat
                key={selected.id}
                agentId={selected.id}
                labels={{
                  chatInputPlaceholder: `Ask ${selected.displayName}…`,
                }}
                welcomeScreen={({ input, suggestionView }) => (
                  <div className="welcome-screen">
                    <div className="welcome-orb">✦</div>
                    <h3>{selected.displayName} is ready</h3>
                    <p>
                      This agent is compiled from the pack committed in this repository. Ask about its tasks,
                      specialists, skills, MCPs, artifacts, workflows, or operating boundaries.
                    </p>
                    {suggestionView}
                    {input}
                  </div>
                )}
              />
            ) : (
              <div className="chat-loading">Loading CopilotKit agent…</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
