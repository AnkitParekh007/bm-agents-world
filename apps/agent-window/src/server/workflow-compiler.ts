import { canonicalHash } from "./platform/canonical.js";
import { validateWorkflow, type WorkflowStep } from "./workflow-schema.js";

/**
 * Workflow compiler (Phase 5).
 *
 * Compiles a declarative workflow into an executable model: a validated DAG plus
 * a deterministic execution order. Each "wave" is a set of steps whose
 * dependencies are all satisfied and that may therefore run in parallel; waves
 * are ordered, and steps within a wave are sorted by id for determinism. The
 * compiler fails closed on structural defects — duplicate step ids, references
 * to unknown steps or (optionally) unknown agents, and cycles — surfacing them
 * as diagnostics rather than producing an unrunnable plan. A contentHash over
 * the compiled form ties workflows into the same provenance model as packs.
 */

export interface CompiledWorkflowStep {
  id: string;
  agent?: string;
  tool?: string;
  skill?: string;
  type?: string;
  dependsOn: string[];
  parallelGroup?: string;
  /** 0-based execution wave; steps in the same wave may run in parallel. */
  wave: number;
}

export interface CompiledWorkflow {
  id: string;
  steps: CompiledWorkflowStep[];
  /** Execution waves: order[w] is the sorted step ids runnable in wave w. */
  order: string[][];
  diagnostics: string[];
  ok: boolean;
  contentHash: string;
}

export interface CompileWorkflowOptions {
  /** When provided, agent references are validated against this set. */
  knownAgents?: ReadonlySet<string>;
  /** Throw on any diagnostic instead of returning a not-ok result. */
  strict?: boolean;
}

function computeWaves(steps: WorkflowStep[], diagnostics: string[]): { waves: string[][]; waveOf: Map<string, number> } {
  const ids = new Set(steps.map((step) => step.id));
  const deps = new Map<string, string[]>();
  for (const step of steps) {
    // Only real, in-graph dependencies count toward ordering.
    deps.set(step.id, (step.dependsOn ?? []).filter((dep) => ids.has(dep)));
  }

  const waveOf = new Map<string, number>();
  const waves: string[][] = [];
  let remaining = steps.map((step) => step.id);

  while (remaining.length > 0) {
    const ready = remaining
      .filter((id) => (deps.get(id) ?? []).every((dep) => waveOf.has(dep)))
      .sort((a, b) => a.localeCompare(b));

    if (ready.length === 0) {
      // Nothing became ready => the remaining steps form (or depend on) a cycle.
      diagnostics.push(`cycle or unresolved dependency among steps: ${[...remaining].sort().join(", ")}`);
      break;
    }

    const wave = waves.length;
    for (const id of ready) waveOf.set(id, wave);
    waves.push(ready);
    remaining = remaining.filter((id) => !waveOf.has(id));
  }

  return { waves, waveOf };
}

export function compileWorkflow(raw: unknown, options: CompileWorkflowOptions = {}): CompiledWorkflow {
  const diagnostics: string[] = [];
  const schema = validateWorkflow(raw);
  diagnostics.push(...schema.issues);

  const document = (raw ?? {}) as { metadata?: { id?: string }; steps?: WorkflowStep[] };
  const id = document.metadata?.id ?? "workflow";
  const steps = Array.isArray(document.steps) ? document.steps : [];

  // Unique step ids.
  const seen = new Set<string>();
  for (const step of steps) {
    if (seen.has(step.id)) diagnostics.push(`duplicate step id: ${step.id}`);
    seen.add(step.id);
  }

  // Dependency references must point at real steps.
  for (const step of steps) {
    for (const dep of step.dependsOn ?? []) {
      if (!seen.has(dep)) diagnostics.push(`step "${step.id}" depends on unknown step "${dep}"`);
    }
    if (options.knownAgents && step.agent && !options.knownAgents.has(step.agent)) {
      diagnostics.push(`step "${step.id}" references unknown agent "${step.agent}"`);
    }
  }

  const { waves, waveOf } = computeWaves(steps, diagnostics);

  const compiledSteps: CompiledWorkflowStep[] = steps
    .map((step) => ({
      id: step.id,
      agent: step.agent,
      tool: step.tool,
      skill: step.skill,
      type: step.type,
      dependsOn: step.dependsOn ?? [],
      parallelGroup: step.parallelGroup,
      wave: waveOf.get(step.id) ?? -1,
    }))
    .sort((a, b) => a.wave - b.wave || a.id.localeCompare(b.id));

  const ok = diagnostics.length === 0;
  if (!ok && options.strict) {
    throw new Error(`Workflow "${id}" failed to compile:\n  - ${diagnostics.join("\n  - ")}`);
  }

  const contentHash = canonicalHash({ id, steps: compiledSteps, order: waves });
  return { id, steps: compiledSteps, order: waves, diagnostics, ok, contentHash };
}
