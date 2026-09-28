import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Auto-refresh: every build gets a unique ID. It is baked into the app code AND written
// to /version.json, so an open tab can tell when a newer version has been deployed.
const BUILD_ID = new Date().toISOString();
const mpeVersionFile = () => ({
  name: "mpe-version-file",
  apply: "build" as const,
  generateBundle(this: any) {
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ build: BUILD_ID }) });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  define: {
    __MPE_BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [react(), mode === "development" && componentTagger(), mpeVersionFile()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
