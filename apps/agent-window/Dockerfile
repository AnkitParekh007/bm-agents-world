# syntax=docker/dockerfile:1.7

FROM node:22-bookworm AS build
WORKDIR /workspace

COPY package.json ./
COPY apps/agent-window/package.json ./apps/agent-window/package.json
RUN npm install

COPY apps/agent-window ./apps/agent-window
COPY packs ./packs
RUN npm run build --workspace @bm-agents-world/agent-window

# Pin the browser image to the exact Playwright package version in package.json.
FROM mcr.microsoft.com/playwright:v1.62.0-noble AS runtime

ENV NODE_ENV=production \
    PORT=4000 \
    BM_AGENTS_REPO_ROOT=/workspace \
    HOME=/tmp/pwuser \
    TMPDIR=/tmp \
    NPM_CONFIG_CACHE=/tmp/npm-cache

WORKDIR /workspace

COPY --from=build /workspace/package.json ./package.json
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/agent-window ./apps/agent-window
COPY --from=build /workspace/packs ./packs

RUN mkdir -p /var/lib/bm-agents/state /var/lib/bm-agents/artifacts \
    && chown -R pwuser:pwuser /workspace /var/lib/bm-agents

USER pwuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "run", "start", "--workspace", "@bm-agents-world/agent-window"]
