import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { componentTagger } from "lovable-tagger";

// Auto-refresh: every build gets a unique ID. It is baked into the app code AND written
// to /version.json, so an open tab can tell when a newer version has been deployed.
const BUILD_ID = new Date().toISOString();
// STEP 14 (2026-10-20): each grammar game's address carries a fingerprint of ITS file, so after an update every device loads the
// new game at once - and an unchanged game keeps using the copy already on the device (no big re-download for nothing).
const GRAMMAR_V = Object.fromEntries(["Run", "Swim", "Dig", "Grab"].map(g => {
  try { return [g, crypto.createHash("md5").update(fs.readFileSync(path.resolve(__dirname, `public/Teacher_Andy_${g}_game.html`))).digest("hex").slice(0, 10)]; }
  catch { return [g, BUILD_ID]; }
}));
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
    __MPE_GRAMMAR_V__: JSON.stringify(GRAMMAR_V),
  },
  plugins: [react(), mode === "development" && componentTagger(), mpeVersionFile()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
