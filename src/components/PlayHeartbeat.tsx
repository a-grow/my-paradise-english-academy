import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// PLAY TIME (2026-10-22, Andy): while a kid's page is open, once a minute tell the database "still here" (mpe_ping,
// BACKUPFILES/play_step1_20261022.sql) - ONLY when the page is visible AND the kid did something in the last 2 minutes
// (tap / key / scroll) or is inside a game (the grammar games run in an iframe, which takes the focus).
// Teacher HQ shows "Playing now" + minutes from it. Never touches progress. Teacher code 1006 and /world-test/ never ping.
// A failed ping is ignored (nothing to retry).

const EVERY_MS = 60_000;
const ACTIVE_MS = 120_000;

// which kid this page belongs to (same code/name casing as the pages use), or null = not a kid page
function kidFromPath(path: string): { code: string; name: string } | null {
  const s = path.split("/").filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch { return x; } });
  if (s.length < 3) return null;
  let code = "", name = "";
  const first = s[0];
  if (["world", "ocean", "dino", "savanna", "snowy", "taiwan", "album", "puzzle"].includes(first)
    || first.startsWith("grammar-")) { code = s[1]; name = s[2]; }
  else if (first === "visit" && s.length >= 4) { code = s[2]; name = s[3]; }
  else if (first === "game") { if (s.length >= 5) { code = s[2]; name = s[3]; } else { code = s[1]; name = s[2]; } }
  else return null;
  code = code.toUpperCase(); name = name.toLowerCase();
  if (!code || !name || code === "1006") return null;
  return { code, name };
}

export default function PlayHeartbeat() {
  const loc = useLocation();
  const kid = kidFromPath(loc.pathname);
  const key = kid ? `${kid.code}|${kid.name}` : "";
  const last = useRef(Date.now());

  useEffect(() => {
    const on = () => { last.current = Date.now(); };
    const evs = ["pointerdown", "keydown", "touchstart", "wheel"];
    evs.forEach(e => window.addEventListener(e, on, { capture: true, passive: true }));
    return () => evs.forEach(e => window.removeEventListener(e, on, { capture: true } as EventListenerOptions));
  }, []);

  useEffect(() => {
    if (!key) return;
    const [code, name] = key.split("|");
    last.current = Date.now();   // opening a kid page counts as activity
    const t = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const inGame = document.activeElement?.tagName === "IFRAME";
      if (!inGame && Date.now() - last.current > ACTIVE_MS) return;
      Promise.resolve(supabase.rpc("mpe_ping", { p_code: code, p_name: name })).catch(() => { /* ignore */ });
    }, EVERY_MS);
    return () => window.clearInterval(t);
  }, [key]);

  return null;
}
