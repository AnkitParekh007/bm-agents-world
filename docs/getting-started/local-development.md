# Local development

`npm run dev` starts two watched processes through `concurrently`: `tsx watch src/server/index.ts` on port 4000 and Vite on port 5173. The Vite proxy is defined in `apps/agent-window/vite.config.ts`.

Local identity defaults to user `local-dev-user`, tenant `local-dev`, and projects `PCC,SOP,DataBridge`. Override these with `BM_LOCAL_USER_ID`, `BM_LOCAL_TENANT_ID`, and `BM_LOCAL_PROJECT_IDS`. Local self-approval is enabled unless `BM_LOCAL_ALLOW_SELF_APPROVAL=false`; shared deployments never allow the requester to approve their own protected action.

## Recommended loop

1. Run the development processes.
2. Inspect `/api/health` to confirm pack count, adapters, storage paths, and readiness.
3. Select the QA pack and use the QA workbench.
4. Run typecheck and focused tests after server changes.
5. Run the production build before submitting.

Runtime state defaults below the current process directory in `.bm-agents-runtime/`. Remove or move test state only when you intentionally want a fresh local history.
