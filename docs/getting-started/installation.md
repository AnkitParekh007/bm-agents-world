# Installation

## Prerequisites

- Node.js 22.13 or newer
- npm
- A credential for the provider selected by `AI_MODEL`

From the repository root, use the commands for your shell:

<div class="bm-tabs" data-tabs>
  <div class="bm-tab-list" role="tablist" aria-label="Installation shell">
    <button role="tab" aria-selected="true" aria-controls="install-posix">macOS / Linux</button>
    <button role="tab" aria-selected="false" aria-controls="install-powershell">PowerShell</button>
  </div>
  <div id="install-posix" role="tabpanel">
    <pre><code class="lang-bash">cp apps/agent-window/.env.example apps/agent-window/.env
npm install
npm run dev</code></pre>
  </div>
  <div id="install-powershell" role="tabpanel" hidden>
    <pre><code class="lang-powershell">Copy-Item apps/agent-window/.env.example apps/agent-window/.env
npm install
npm run dev</code></pre>
  </div>
</div>

For OpenAI, set placeholders only in your local `.env` file:

```dotenv
AI_MODEL=openai:gpt-5.4-mini
OPENAI_API_KEY=<your-secret>
```

The UI opens at `http://localhost:5173`; Vite proxies `/api` to Express at `http://localhost:4000`. The root workspace scripts delegate into `@bm-agents-world/agent-window`.

{% hint style="danger" %}
Never commit `.env`, API tokens, Playwright storage state, or Jira/Bitbucket credentials. Secrets are server-side inputs and must not enter model context.
{% endhint %}

Verify with `npm run typecheck`, `npm run test --workspace @bm-agents-world/agent-window`, and `npm run build`.

<details>
<summary>What should be running?</summary>

The Vite UI listens on port 5173 and proxies `/api` requests to the Express runtime on port 4000. `GET /healthz` confirms the process is alive; `GET /api/health` reports pack discovery, adapters, storage, and readiness.

</details>
