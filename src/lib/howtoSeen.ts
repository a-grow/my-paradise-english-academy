// HOW TO PLAY 'seen' counts IN THE CLOUD (Andy 2026-10-07: works the same on every device). Uses the kid's add-only
// seen list (student_progress.seen_flags via mpe_mark_seen - the same list as the Video Theater red dots):
// flags "howto:<id>:one", ":two", ":three" (the database only takes letters: ^[a-z]+:[a-z]+:[a-z]+$). A game's How to Play shows automatically the first 3 times, then only with '?'.
// (The world page uses the brain's own seen list: flag "howto:world:one", once.) Teacher code 1006 saves nothing.
import { useEffect, useState } from "react";
import { loadSeen, markSeen } from "@/lib/cloudSave";

const TEACHER = "1006";
const WORDS = ["one", "two", "three"];
const TIMES = WORDS.length;
const st = { code: "", name: "", list: null as string[] | null };

// Load the kid's seen list once per page (cheap read). Returns true when known (or when it could not be read).
export function useHowtoSeen(code?: string, name?: string) {
  const c = (code || "").toUpperCase(), n = (name || "").toLowerCase();
  const [ready, setReady] = useState(st.code === c && st.name === n && st.list !== null);
  useEffect(() => {
    if (st.code === c && st.name === n && st.list) { setReady(true); return; }
    st.code = c; st.name = n; st.list = null;
    if (!c || c === TEACHER) { st.list = []; setReady(true); return; }
    let dead = false;
    loadSeen(c, n).then(l => { if (dead) return; if (st.code === c && st.name === n) st.list = Array.isArray(l) ? l : []; setReady(true); });
    const t = window.setTimeout(() => { if (!st.list) st.list = []; setReady(true); }, 3000); // cloud slow / offline: show it
    return () => { dead = true; window.clearTimeout(t); };
  }, [c, n]);
  return ready;
}

const count = (id: string) => (st.list ?? []).filter(f => f.startsWith(`howto:${id}:`)).length;
export const wantHowto = (id: string) => count(id) < TIMES;
export function seenHowto(id: string) {
  const k = count(id);
  if (k >= TIMES) return;
  const flag = `howto:${id}:${WORDS[k]}`;
  st.list = [...(st.list ?? []), flag];
  if (st.code && st.code !== TEACHER) markSeen(st.code, st.name, flag);
}
