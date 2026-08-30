# Agent window

The agent window is the general pack explorer and chat surface implemented by `src/client/App.tsx`. It loads `/api/packs`, selects a pack, loads its detail endpoint, and changes the active CopilotKit agent. Users can inspect a pack's purpose, common tasks, subagents, and skills before starting a conversation.

The server exposes sanitized pack data; absolute pack directories are removed from responses. The `default` agent acts as supervisor and helps discover the correct role. Named agents are compiled at startup, so pack edits require a server restart.

When modifying the experience, preserve loading/error states, keyboard-operable controls, and the distinction between pack metadata and executable capabilities.

## Control plane

The sidebar links to the operator console at `/control-plane.html`, a separate page that loads no agent runtime. It answers the questions the pack explorer cannot: what the platform is allowed to do, which agent may request each capability, and what is waiting on a human decision. See [Control plane](control-plane.md).
