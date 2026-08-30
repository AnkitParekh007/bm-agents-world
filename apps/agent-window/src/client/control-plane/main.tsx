import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ControlPlane } from "./ControlPlane";
import "./control-plane.css";

/**
 * Standalone entry for the operator console.
 *
 * It mounts no agent runtime and imports no CopilotKit provider, so the console
 * loads independently of the chat lab — an operator can inspect governance
 * posture and pending approvals even when the runtime itself is down, which is
 * exactly when they need to.
 */
const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <ControlPlane />
  </StrictMode>,
);
