import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [preact()],
  publicDir: false,
  build: {
    outDir: "public",
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL("widget-src/index.ts", import.meta.url)),
      name: "AgentWidget",
      formats: ["iife"],
      fileName: () => "widget.js",
    },
  },
});
