import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cloudBusy } from "@/lib/supabase";

// AUTO-REFRESH (safety net, step 4).
// A tab left open for days keeps running OLD code. This checks /version.json and, when a
// newer version is deployed, reloads the page - but ONLY at a safe moment:
//   - when the kid moves to another page (e.g. game -> world), or
//   - when the kid comes back to a tab that was hidden, unless they are on a game page.
// It never reloads while a cloud save is still sending (waits up to 15s, else tries later).
// The 5-minute timer only CHECKS; it never reloads by itself.

const CHECK_EVERY_MS = 5 * 60 * 1000;
const RETRY_GUARD_MS = 15 * 60 * 1000;
const GUARD_KEY = "mpe_reload_for";

const isGamePage = (path: string) => path.startsWith("/game/") || path.startsWith("/grammar");

let updateWaiting = false;
let latestBuild = "";
let reloadStarted = false;

function recentlyTriedFor(build: string): boolean {
  try {
    const [b, t] = (sessionStorage.getItem(GUARD_KEY) || "").split("|");
    return b === build && Date.now() - Number(t) < RETRY_GUARD_MS;
  } catch {
    return false;
  }
}

async function checkForUpdate(): Promise<boolean> {
  if (import.meta.env.DEV || updateWaiting) return updateWaiting;
  try {
    const r = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return false;
    const j = await r.json();
    const latest = j && typeof j.build === "string" ? j.build : "";
    // recentlyTriedFor: we already reloaded for this version and still got old code
    // (browser cache) -> don't reload again for 15 min (no reload loops).
    if (latest && latest !== __MPE_BUILD_ID__ && !recentlyTriedFor(latest)) {
      updateWaiting = true;
      latestBuild = latest;
    }
  } catch {
    /* offline or file missing: try again later */
  }
  return updateWaiting;
}

function reloadWhenSavesDone() {
  if (reloadStarted) return;
  reloadStarted = true;
  const started = Date.now();
  const tick = () => {
    if (!cloudBusy()) {
      try { sessionStorage.setItem(GUARD_KEY, `${latestBuild}|${Date.now()}`); } catch { /* ignore */ }
      window.location.reload();
      return;
    }
    if (Date.now() - started > 15000) {
      reloadStarted = false; // still busy: give up for now, the next safe moment tries again
      return;
    }
    setTimeout(tick, 300);
  };
  setTimeout(tick, 300); // short pause so a save started by the same tap has begun
}

export default function VersionWatcher() {
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  const firstRender = useRef(true);

  // Safe moment 1: the kid moved to another page.
  useEffect(() => {
    pathRef.current = pathname;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    checkForUpdate().then((waiting) => {
      if (waiting) reloadWhenSavesDone();
    });
  }, [pathname]);

  // Safe moment 2: the kid came back to this tab (not in the middle of a game).
  // Plus the 5-minute background check (check only, never reloads).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      checkForUpdate().then((waiting) => {
        if (waiting && !isGamePage(pathRef.current)) reloadWhenSavesDone();
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(() => { checkForUpdate(); }, CHECK_EVERY_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
