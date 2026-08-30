import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    // Two independent pages. The control plane is its own entry so it carries
    // none of the agent-runtime bundle: an operator console must load and answer
    // "what is this platform allowed to do?" even when the runtime cannot start.
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        controlPlane: resolve(__dirname, "control-plane.html"),
      },
    },
  },
});
