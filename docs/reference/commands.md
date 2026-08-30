# Command reference

Run application commands from the repository root.

| Command | Result |
|---|---|
| `npm run dev` | API and Vite UI in watch mode |
| `npm run dev:agent-window:api` | Express only |
| `npm run dev:agent-window:ui` | Vite only |
| `npm run typecheck` | Strict TypeScript validation |
| `npm run typecheck:control-plane --workspace @bm-agents-world/agent-window` | Typecheck the operator console alone; proves it stays free of the agent runtime and passes where the CopilotKit v2 packages cannot resolve |
| `npm run test --workspace @bm-agents-world/agent-window` | Server policy and integration tests |
| `npm run build` | Typecheck and production client bundle |
| `docker build -f apps/agent-window/Dockerfile -t bm-agents-world:qa-pilot .` | Pilot image |

Run documentation commands from `docs/`.

| Command | Result |
|---|---|
| `npm install` | Install isolated HonKit tooling |
| `npm run serve` | Local portal at port 4001 with rebuilds |
| `npm run build` | Static production portal in `_book/` |
| `npm run clean` | Clean and rebuild `_book/` |
| `npm run validate` | Build and verify navigation, links, metadata, search, and 404 output |

From the repository root, the equivalent commands are `npm run docs:serve`, `npm run docs:build`, `npm run docs:clean`, and `npm run docs:validate`.

Documentation synchronization commands also run from the repository root:

| Command | Result |
|---|---|
| `npm run docs:generate` | Regenerate route, configuration, capability, pack, and deployment references |
| `npm run docs:generate:check` | Regenerate and fail when committed generated pages are stale |
| `npm run docs:impact -- --base origin/main` | Check changed code against the documentation impact map |
| `npm run docs:ci` | Run generation freshness, impact, and portal validation checks |
