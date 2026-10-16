import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installIosVolumeFix } from "./lib/iosVolume";

installIosVolumeFix(); // iPad/iPhone: quiet = pause, fades finish (2026-10-15)

createRoot(document.getElementById("root")!).render(<App />);
