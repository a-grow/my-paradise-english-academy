import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import Blog from "./components/Blog";
import Schedule from "./components/Schedule";

createRoot(document.getElementById("root")!).render(
  <App>
    <Blog />
    <Schedule />
  </App>
);

