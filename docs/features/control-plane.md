# Control plane

The control plane is the platform's operator console, served as its own page at `/control-plane.html`. It answers three questions, in the order an operator asks them:

1. Is the platform in a sound state?
2. What is it allowed to do, and which agent may ask?
3. What is waiting on me right now?

Before it existed, every operator endpoint was `/api/qa/*`, so those questions could only be answered by reading the source — and only about QA. The console is pack-agnostic: it describes every governed pack.

## Sections

| Section | Shows |
|---|---|
| Posture | Platform totals, the posture strip, and the capability risk distribution |
| Capabilities | Every governed capability, highest risk first: approval mode, allowed environments, backing adapter, admitting connector, and every agent that may request it |
| Agents & grants | The governed roster per pack, scoped specialists and unrestricted supervisors, with each specialist's exact allowlist |
| Approvals | Actions awaiting a human decision: payload hash, requesting agent, project and environment scope, waiting time, and expiry |

## Why the judgements are server-side

Every value the console shows is computed by `apps/agent-window/src/server/control-plane.ts` and rendered verbatim. The console sorts nothing and decides nothing.

This is what makes it trustworthy: a console that re-derived risk ordering or grant resolution in the browser could disagree with the broker that actually enforces them, and an operator would have no way to tell which was right. Keeping the derivations server-side also means they are unit-tested without a browser (`src/server/control-plane.test.ts`).

## Why it loads no agent runtime

`control-plane.html` is a separate Vite entry that imports no CopilotKit provider and mounts no agent. Governance posture and pending approvals are most worth reading when the runtime is unavailable, so the console must not share the runtime's fate. `App.tsx` links to it with a plain anchor rather than importing it, keeping the dependency one-way.

A practical consequence: the console can be typechecked on its own with `npm run typecheck:control-plane`, which succeeds even in environments where the CopilotKit v2 packages cannot resolve. That command exists to keep the isolation enforced rather than merely intended.

## Two things it deliberately does not soften

- **Invalid packs and pack-lock drift read as critical.** Drift means the released pack content and the running pack content disagree; it is not a footnote.
- **An expired approval is listed as expired, never dropped.** An operator needs to see that a decision was never made — silently filtering those hides exactly the case worth knowing about.

## Scope and access

Approvals and runs are filtered to the caller's identity scope by the same `canAccessExecutionContext` check the rest of the API uses. The console is read-only; approving or rejecting an action still goes through `POST /api/qa/actions/:id/decision`.

Continue with [API reference](../development/api-reference.md) or [Capability broker and data flow](../architecture/capability-broker.md).
