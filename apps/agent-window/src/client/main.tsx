import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint
      showDevConsole="auto"
      onError={({ error, code }) => {
        console.error("CopilotKit error", code, error);
      }}
    >
      <App />
    </CopilotKit>
  </StrictMode>,
);
