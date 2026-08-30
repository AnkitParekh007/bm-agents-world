import { canonicalHash } from "./platform/canonical.js";
import {
  normalizeWorkflowDocument,
  validateWorkflow,
  type NormalizedWorkflowStep,
} from "./workflow-schema.js";

/**
 * Workflow compiler (Phase 5, generalized in Phase 9).
 *
 * Compiles a declarative workflow into an executable model: a validated DAG plus
 * a deterministic execution order. Each "wave" is a set of steps whose
 * dependencies are all satisfied and that may therefore run in parallel; waves
 * are ordered, and steps within a wave are sorted by id for determinism. The
 * compiler fails closed on structural defects — duplicate step ids, references
 * to unknown steps or (optionally) unknown agents, cycles, and a document that
 * declares no steps at all — surfacing them as diagnostics rather than producing
 * an unrunnable (or silently empty) plan. A contentHash over the compiled form
 * ties workflows into the same provenance model as packs.
 *
 * The compiler is dialect-independent: {@link normalizeWorkflowDocument} has
 * already reduced whichever shape a pack authored to one normalized graph.
 */

export interface CompiledWorkflowStep {
  id: string;
  agent?: string;
  tool?: string;
  /** First declared skill, kept for single-skill packs and existing callers. */
  skill?: string;
  /** Every skill the step exercises, in declaration order. */
  skills: string[];
  /** A named external operation the step performs; a declared side effect. */
  action?: string;
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

function computeWaves(steps: NormalizedWorkflowStep[], diagnostics: string[]): { waves: string[][]; waveOf: Map<string, number> } {
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

  const { id, steps, declaresSteps } = normalizeWorkflowDocument(raw);

  // A document with no step list is not an empty workflow — it is a workflow the
  // compiler could not find, and running it as a no-op would report success for
  // work that never happened.
  if (!declaresSteps) diagnostics.push("workflow declares no steps");

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
      skills: step.skills,
      action: step.action,
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
