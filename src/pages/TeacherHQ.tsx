import { useState, useEffect, useMemo, useCallback } from "react";
import { teacherDb } from "@/lib/teacherAuth";
import { ALL_WORLDS, worldState, type WorldConfig } from "@/worlds";
import { getAnimalStageIdx, type Animal } from "@/worlds/types";
import { earnedBadges, badgeList, badgeImg } from "@/worlds/badges";
import { CARD_SETS, CARDS_TOTAL } from "@/cards/cardData";
import { PACK_PRICE } from "@/cards/economy";
import { useClickSfx } from "@/lib/clickSfx";

// SOUNDS (Andy 10-22): every button/card = the world page click (useClickSfx); sort / filter / world tiles = a soft
// synth "bloop" (marked data-noclick so they don't click too); Close = the red-X beep (data-closex).
// Sound switch (Andy 10-22): one ON/OFF for all of these, remembered on this device (localStorage mpe_hq_sound).
const SOUND_KEY = "mpe_hq_sound";
let sfxOn = true;
let bctx: AudioContext | null = null;
function bloop() {
  if (!sfxOn) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    bctx = bctx || new AC();
    if (bctx.state === "suspended") bctx.resume().catch(() => { });
    const t = bctx.currentTime, o = bctx.createOscillator(), g = bctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(320, t);
    o.frequency.exponentialRampToValueAtTime(760, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(bctx.destination); o.start(t); o.stop(t + 0.18);
  } catch { /* */ }
}

// TEACHER HQ 2.0 (Part 1, 2026-10-22): READ ONLY. One select of student_progress, nothing is ever written.
// Every number comes from the same rules the kid pages use (world list, worldState, stages, earnedBadges, card sets).
// Teacher tools (gifts, change animal) come in Part 3, after the real teacher login + tighter RLS (step 18).

// ---- TEACHER LOGIN (2026-10-23): Supabase Auth email + password; the database only lets teachers on the
// mpe_teachers list read kids (policy "teacher can read" + mpe_is_teacher). Replaces the old paradise2026 gate.
const SORT_KEY = "mpe_hq_sort";
const TEST_KEY = "mpe_hq_tests";
const VIEW_KEY = "mpe_hq_view";   // "cards" (big cards) | "list" (quick list, one line per kid - for many kids)

const UI = "/worlds/ui";
const STAGE_KEYS = ["egg", "baby", "young", "grown"];          // thumbnail names: /worlds/<world>/<animal>-<key>-t.webp
const thumb = (w: WorldConfig, a: Animal, i: number) => `/worlds/${w.id}/${a.id}-${STAGE_KEYS[i]}-t.webp`;
const worldIcon = (w: WorldConfig) => `${UI}/world_${w.id}.webp`;
const WORLD_COLOR: Record<string, string> = { ocean: "#1e9be0", dino: "#e07b2a", savanna: "#d9a21b", snowy: "#5aa7d6", taiwan: "#3a9e4f" };
const WORLD_BG: Record<string, string> = { ocean: "#cdeeff", dino: "#ffe3cc", savanna: "#fff0c4", snowy: "#dff0fb", taiwan: "#d9f2dc" };
// Puzzle Mixup covers per picture = cols x rows of LEVELS in src/pages/PuzzleMixup.tsx (keep the same if that table changes)
const PUZZLE_COVERS = [6, 6, 8, 9, 12, 12, 15];
const isTest = (code: string) => code.toUpperCase().startsWith("TEST");

type Row = {
  code: string; student_name: string; treats: number | null; active_pet: string | null; data: any;
  last_login: string | null; dino_jar_moved: number | null;
  coins_earned: number | null; coins_spent: number | null; puzzle_earned: number | null; puzzle_used: number | null;
  puzzle_idx: number | null; puzzle_gone: number[] | null; prizes_claimed: string[] | null;
  daily_box: number | null; daily_claimed: string | null; cards: Record<string, number> | null; card_swap: number | null;
  wins_vocab: number | null; wins_grammar: number | null; wins_list: string[] | null;
};
const COLS = "code, student_name, treats, active_pet, data, last_login, dino_jar_moved, coins_earned, coins_spent, puzzle_earned, puzzle_used, puzzle_idx, puzzle_gone, prizes_claimed, daily_box, daily_claimed, cards, card_swap, wins_vocab, wins_grammar, wins_list";

// PLAY TIME (2026-10-22): rows of student_play (one per kid per Taiwan day, filled by mpe_ping - see PlayHeartbeat.tsx)
type PlayRow = { code: string; student_name: string; day: string; minutes: number; last_ping: string };
type Play = { today: number; week: number; total: number; last: number; now: boolean };
const PLAYING_MS = 150_000;   // pinged in the last 2.5 minutes = "Playing now"
function playStats(rows: PlayRow[]): Map<string, Play> {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  const weekAgo = new Date(Date.now() - 6 * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  const m = new Map<string, Play>();
  for (const p of rows) {
    const k = `${p.code}|${p.student_name}`;
    const s = m.get(k) ?? { today: 0, week: 0, total: 0, last: 0, now: false };
    const n = Number(p.minutes) || 0;
    s.total += n;
    if (p.day === today) s.today += n;
    if (p.day >= weekAgo) s.week += n;
    const t = new Date(p.last_ping).getTime();
    if (t > s.last) s.last = t;
    m.set(k, s);
  }
  for (const s of m.values()) s.now = Date.now() - s.last < PLAYING_MS;
  return m;
}
const NO_PLAY: Play = { today: 0, week: 0, total: 0, last: 0, now: false };
const mins = (n: number) => (n >= 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n} min`);

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const n0 = (v: any) => (typeof v === "number" && isFinite(v) ? v : Number(v) || 0);

// ONE JAR: the treats column + an old Dino jar still waiting to move in (dino_jar_moved = null) = what the kid will see.
function oneJar(r: Row): number {
  const waiting = r.dino_jar_moved == null && typeof r.data?.dino?.jar === "number" ? Math.max(0, r.data.dino.jar) : 0;
  return n0(r.treats) + waiting;
}

// ---- one world, read from the row: every animal's fed + stage, and the animal the kid is growing now ----
type AnimalView = { a: Animal; fed: number; stage: number; grown: boolean; petName: string; video: boolean };
type WorldView = {
  w: WorldConfig; idx: number; started: boolean; finished: boolean; animals: AnimalView[];
  cur: AnimalView | null; curPos: number;   // the first animal not grown yet (null = all grown)
};
function readWorld(w: WorldConfig, idx: number, data: any): WorldView {
  const st = worldState(w, data);
  const S = w.makeSave("", "");
  const r = st.started ? S.readCloud(data, null) : null;
  const animals = w.animals.map(a => {
    const p = r?.animals[a.id];
    const fed = n0(p?.fed);
    const stage = getAnimalStageIdx(a, fed);
    return { a, fed, stage, grown: stage === a.stages.length - 1, petName: p?.petName || "", video: !!p?.videoWatched };
  });
  const ci = animals.findIndex(v => !v.grown);
  return { w, idx, started: st.started, finished: st.finished, animals, cur: ci >= 0 ? animals[ci] : null, curPos: ci };
}

// ---- last seen ----
function seenInfo(s: string | null): { text: string; cls: string; days: number | null; t: number } {
  if (!s) return { text: "Never seen", cls: "old", days: null, t: 0 };
  const d = new Date(s);
  if (isNaN(d.getTime())) return { text: "Never seen", cls: "old", days: null, t: 0 };
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (d.toDateString() === new Date().toDateString()) return { text: `Today ${time}`, cls: "today", days, t: d.getTime() };
  if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) return { text: `Yesterday ${time}`, cls: "yest", days, t: d.getTime() };
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { text: `${date} · ${days} days ago`, cls: days >= 7 ? "quiet" : "old", days, t: d.getTime() };
}

// ---- health: a "look here" pointer, not a verdict (read the real row to confirm) ----
function health(worlds: WorldView[], jar: number): { level: "green" | "yellow" | "red"; reasons: string[] } {
  const reasons: string[] = [];
  let level: "green" | "yellow" | "red" = "green";
  for (const v of worlds) {
    for (let i = 1; i < v.animals.length; i++) {
      if (v.animals[i].fed > 0 && v.animals[i - 1].fed === 0) {
        level = "red";
        reasons.push(`${v.w.title}: ${v.animals[i].a.name} started but ${v.animals[i - 1].a.name} is still at 0 (out of order)`);
      }
    }
  }
  if (level !== "red" && jar >= 50) { level = "yellow"; reasons.push(`Treat jar unusually high (${jar}) - worth a glance`); }
  return { level, reasons };
}

// ---- win keys -> short labels: grammar:run:3 -> "Run L3" · vocab:space:2-4 -> "Space B2 U4" ----
function winLabel(k: string): string {
  const [kind, game, lv] = k.split(":");
  if (kind === "grammar") return `${cap(game)} L${lv}`;
  if (kind === "vocab") { const [b, u] = (lv || "").split("-"); return `${cap(game)} B${b} U${u}`; }
  return k;
}

const taiwanToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }); // YYYY-MM-DD

// ---- everything about one kid, worked out once ----
function buildKid(r: Row, plays: Map<string, Play>) {
  const worlds = ALL_WORLDS.map((w, i) => readWorld(w, i, r.data));
  const at = worlds.find(v => !v.finished) ?? null;           // the world the kid is on (null = every world finished)
  const jar = oneJar(r);
  const coins = n0(r.coins_earned) - n0(r.coins_spent);
  const pieces = n0(r.puzzle_earned) - n0(r.puzzle_used);
  const cards = r.cards || {};
  const owned = Object.keys(cards).filter(k => n0(cards[k]) > 0).length;
  const setsDone = CARD_SETS.filter(s => s.cards.every(c => n0(cards[`${s.id}-${c.n}`]) > 0)).length;
  const badges = earnedBadges({
    worlds: ALL_WORLDS, prizes: r.prizes_claimed, rowData: r.data, worldId: "", fed: {}, dailyBox: r.daily_box,
    wins: { vocab: n0(r.wins_vocab), grammar: n0(r.wins_grammar) },
  });
  const play = plays.get(`${r.code}|${r.student_name}`) ?? NO_PLAY;
  // last seen (10-23) = the last REAL play (ping = a real tap / game). last_login only for kids with no ping yet:
  // it also changes when a page opens by itself (Safari Reading List quietly reloading a saved page, Bruce 10-23).
  const seen = seenInfo(play.last > 0 ? new Date(play.last).toISOString() : r.last_login);
  // furthest = world, then animal, then fed (for the "Furthest" sort)
  const far = at ? at.idx * 10000 + Math.max(0, at.curPos) * 1000 + (at.cur?.fed ?? 0) : 999999;
  return { r, worlds, at, jar, coins, pieces, owned, setsDone, badges, seen, play, far, health: health(worlds, jar) };
}
type Kid = ReturnType<typeof buildKid>;

// ---------------------------------------------------------------------------------------------------
export default function TeacherHQ() {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const ok = auth === "in";
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState("");
  const [pwOpen, setPwOpen] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState<{ good: boolean; t: string } | null>(null);

  // is this logged-in person on the teacher list? (else sign out again)
  const checkTeacher = useCallback(async (mail: string) => {
    const { data, error } = await teacherDb().rpc("mpe_is_teacher");
    if (error) { setAuth("out"); setLoginMsg("Could not check the login - please try again."); return; }
    if (data === true) { setMe(mail); setAuth("in"); setLoginMsg(""); return; }
    await teacherDb().auth.signOut();
    setAuth("out"); setLoginMsg("This account is not on the teacher list.");
  }, []);
  useEffect(() => {
    teacherDb().auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s) checkTeacher(s.user.email || ""); else setAuth("out");
    });
    const { data: sub } = teacherDb().auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") { setAuth("out"); setRows([]); setPlayRows([]); } });
    return () => sub.subscription.unsubscribe();
  }, [checkTeacher]);
  async function logIn() {
    const mail = email.trim().toLowerCase();
    if (!mail || !pw) { setLoginMsg("Please type your email and password."); return; }
    setBusy(true); setLoginMsg("");
    const { data, error } = await teacherDb().auth.signInWithPassword({ email: mail, password: pw });
    if (error || !data.session) { setBusy(false); setLoginMsg("Email or password isn't correct - please try again."); return; }
    await checkTeacher(data.session.user.email || mail);
    setPw(""); setBusy(false);
  }
  async function logOut() { await teacherDb().auth.signOut(); setAuth("out"); setRows([]); setPlayRows([]); }
  async function changePw() {
    if (pw1.length < 8) { setPwMsg({ good: false, t: "Use at least 8 characters." }); return; }
    if (pw1 !== pw2) { setPwMsg({ good: false, t: "The two passwords are not the same." }); return; }
    setBusy(true);
    const { error } = await teacherDb().auth.updateUser({ password: pw1 });
    setBusy(false);
    if (error) setPwMsg({ good: false, t: "Could not change it: " + error.message });
    else { setPwMsg({ good: true, t: "Password changed." }); setPw1(""); setPw2(""); }
  }
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState<"seen" | "name" | "far">(() => {
    try { const s = sessionStorage.getItem(SORT_KEY); return s === "name" || s === "far" ? s : "seen"; } catch { return "seen"; }
  });
  const [showTests, setShowTests] = useState<boolean>(() => { try { return sessionStorage.getItem(TEST_KEY) === "1"; } catch { return false; } });
  const [view, setView] = useState<"cards" | "list">(() => { try { return sessionStorage.getItem(VIEW_KEY) === "list" ? "list" : "cards"; } catch { return "cards"; } });
  const [worldFilter, setWorldFilter] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selKey, setSelKey] = useState<string | null>(null);
  const [wide, setWide] = useState(() => typeof window === "undefined" || window.innerWidth > 1100);
  const [soundOn, setSoundOn] = useState<boolean>(() => { try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; } });
  sfxOn = soundOn;
  useClickSfx(soundOn);
  function toggleSound() {
    const v = !soundOn;
    sfxOn = v; setSoundOn(v);
    try { localStorage.setItem(SOUND_KEY, v ? "on" : "off"); } catch { /* */ }
    if (v) bloop();
  }

  useEffect(() => {
    const on = () => setWide(window.innerWidth > 1100);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const [playRows, setPlayRows] = useState<PlayRow[]>([]);
  const load = useCallback((quiet = false) => {
    if (!quiet) { setLoading(true); setErr(""); }
    teacherDb().from("student_progress").select(COLS).then(({ data, error }) => {
      if (error) { if (!quiet) setErr(error.message); }
      else setRows((data as unknown as Row[]) || []);
      if (!quiet) setLoading(false);
    });
    // play time: a missing table / error just shows no minutes (never blocks the page)
    teacherDb().from("student_play").select("code, student_name, day, minutes, last_ping").then(({ data, error }) => {
      if (!error) setPlayRows((data as unknown as PlayRow[]) || []);
    });
  }, []);
  useEffect(() => { if (ok) load(); }, [ok, load]);
  // AUTO-REFRESH every minute (quietly) so "Playing now" stays true
  useEffect(() => {
    if (!ok) return;
    const t = window.setInterval(() => { if (document.visibilityState === "visible") load(true); }, 60_000);
    return () => window.clearInterval(t);
  }, [ok, load]);

  const kids = useMemo(() => { const p = playStats(playRows); return rows.map(r => buildKid(r, p)); }, [rows, playRows]);
  const real = kids.filter(k => !isTest(k.r.code));
  const pool = showTests ? kids : real;
  const keyOf = (k: Kid) => `${k.r.code}|${k.r.student_name}`;

  const shown = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const list = pool.filter(k =>
      (!worldFilter || k.at?.w.id === worldFilter) &&
      (!qq || k.r.student_name.toLowerCase().includes(qq) || k.r.code.toLowerCase().includes(qq)));
    return list.sort((a, b) =>
      sortBy === "name" ? a.r.student_name.localeCompare(b.r.student_name)
        : sortBy === "far" ? b.far - a.far
          : b.seen.t - a.seen.t);
  }, [pool, worldFilter, q, sortBy]);

  const sel = kids.find(k => keyOf(k) === selKey) ?? (wide ? shown[0] ?? null : null);

  function chooseSort(s: "seen" | "name" | "far") { setSortBy(s); try { sessionStorage.setItem(SORT_KEY, s); } catch { /* */ } }
  function chooseView(v: "cards" | "list") { setView(v); try { sessionStorage.setItem(VIEW_KEY, v); } catch { /* */ } }
  function toggleTests() { const v = !showTests; setShowTests(v); try { sessionStorage.setItem(TEST_KEY, v ? "1" : "0"); } catch { /* */ } }

  if (!ok) {
    return (
      <div className="hq">
        <style>{CSS}</style>
        <div className="hq-gate">
          <div className="hq-logo t">Teacher HQ<small>MY PARADISE ENGLISH</small></div>
          <div className="hq-gatecard">
            {auth === "checking" ? <p>Checking your login...</p> : <>
              <p>Teacher login</p>
              <input className="hq-mail" type="email" value={email} placeholder="Email" autoFocus autoComplete="username"
                onChange={e => { setEmail(e.target.value); setLoginMsg(""); }}
                onKeyDown={e => { if (e.key === "Enter") logIn(); }} />
              <div className="hq-pwrow">
                <input type={showPw ? "text" : "password"} value={pw} placeholder="Password" autoComplete="current-password"
                  onChange={e => { setPw(e.target.value); setLoginMsg(""); }}
                  onKeyDown={e => { if (e.key === "Enter") logIn(); }} />
                <button type="button" className="hq-eye" onClick={() => setShowPw(v => !v)}>{showPw ? "Hide" : "Show"}</button>
              </div>
              <button className="hq-go" onClick={logIn} disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
              {loginMsg && <p className="hq-wrong">{loginMsg}</p>}
            </>}
          </div>
        </div>
      </div>
    );
  }

  const today = real.filter(k => k.seen.cls === "today").length;
  const playingNow = real.filter(k => k.play.now).length;
  const quiet = real.filter(k => k.seen.days == null || k.seen.days >= 7).length;

  return (
    <div className="hq">
      <style>{CSS}</style>
      {pwOpen && (
        <div className="hq-modal">
          <div className="hq-gatecard">
            <p>Change password for <b>{me}</b></p>
            <input className="hq-mail" type={showPw ? "text" : "password"} value={pw1} placeholder="New password (8+ characters)" autoComplete="new-password"
              onChange={e => { setPw1(e.target.value); setPwMsg(null); }} />
            <div className="hq-pwrow">
              <input type={showPw ? "text" : "password"} value={pw2} placeholder="New password again" autoComplete="new-password"
                onChange={e => { setPw2(e.target.value); setPwMsg(null); }}
                onKeyDown={e => { if (e.key === "Enter") changePw(); }} />
              <button type="button" className="hq-eye" onClick={() => setShowPw(v => !v)}>{showPw ? "Hide" : "Show"}</button>
            </div>
            <button className="hq-go" onClick={changePw} disabled={busy}>{busy ? "Saving..." : "Save new password"}</button>
            {pwMsg && <p className={pwMsg.good ? "hq-good" : "hq-wrong"}>{pwMsg.t}</p>}
            <button data-closex className="hq-eye hq-pwclose" onClick={() => setPwOpen(false)}>Close</button>
          </div>
        </div>
      )}
      <div className="hq-wrap">
        <header className="hq-head">
          <div className="hq-logo t">Teacher HQ<small>MY PARADISE ENGLISH</small></div>
          <div className="hq-chips">
            <div className="hq-chip"><b>{real.length}</b> kids</div>
            <div className={`hq-chip${playingNow ? " hq-live" : ""}`}><span className="hq-dot hq-pulse" /><b>{playingNow}</b> playing now</div>
            <div className="hq-chip"><span className="hq-dot" style={{ background: "#2e9e5b" }} /><b>{today}</b> played today</div>
            <div className="hq-chip"><span className="hq-dot" style={{ background: "#f08c00" }} /><b>{quiet}</b> quiet 7+ days</div>
            <button data-noclick className={`hq-chip hq-snd${soundOn ? "" : " off"}`} onClick={toggleSound} title="Button sounds on / off">
              <span className="hq-sw"><i /></span>Sounds {soundOn ? "on" : "off"}
            </button>
            <button className="hq-chip hq-btn" onClick={() => load()} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
            <button className="hq-chip hq-btn" onClick={() => { setPwMsg(null); setPw1(""); setPw2(""); setPwOpen(true); }} title={me}>Password</button>
            <button className="hq-chip hq-btn" onClick={logOut}>Log out</button>
          </div>
        </header>
        {err && <div className="hq-err">Could not read the database: {err}</div>}

        <section className="hq-worlds">
          {ALL_WORLDS.map(w => {
            const n = real.filter(k => k.at?.w.id === w.id).length;
            const on = worldFilter === w.id;
            return (
              <button key={w.id} data-noclick className={`hq-wt${on ? " on" : ""}${n === 0 ? " zero" : ""}`} style={{ ["--c" as any]: WORLD_COLOR[w.id] }}
                onClick={() => { bloop(); setWorldFilter(on ? null : w.id); }}>
                <img src={worldIcon(w)} alt="" />
                <div><div className="n t">{n}</div><div className="l">{n === 1 ? "kid" : "kids"} in {w.title}</div></div>
              </button>
            );
          })}
        </section>

        <div className="hq-bar">
          <input className="hq-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Find a kid..." />
          <div className="hq-viewsw">
            <button data-noclick className={view === "cards" ? "on" : ""} onClick={() => { bloop(); chooseView("cards"); }}>Cards</button>
            <button data-noclick className={view === "list" ? "on" : ""} onClick={() => { bloop(); chooseView("list"); }}>List</button>
          </div>
          <span className="hq-lbl">Sort:</span>
          <button data-noclick className={`hq-pill${sortBy === "seen" ? " on" : ""}`} onClick={() => { bloop(); chooseSort("seen"); }}>Last seen</button>
          <button data-noclick className={`hq-pill${sortBy === "name" ? " on" : ""}`} onClick={() => { bloop(); chooseSort("name"); }}>Name</button>
          <button data-noclick className={`hq-pill${sortBy === "far" ? " on" : ""}`} onClick={() => { bloop(); chooseSort("far"); }}>Furthest</button>
          {worldFilter && <button data-noclick className="hq-pill on" onClick={() => { bloop(); setWorldFilter(null); }}>Show all worlds</button>}
          <button data-noclick className={`hq-pill hq-tests${showTests ? " on" : ""}`} onClick={() => { bloop(); toggleTests(); }}>{showTests ? "Hide test kids" : "Show test kids"}</button>
        </div>

        <div className="hq-main">
          {view === "cards" ? (
            <div className="hq-grid">
              {shown.map(k => <KidCard key={keyOf(k)} k={k} sel={sel != null && keyOf(sel) === keyOf(k)} onPick={() => setSelKey(keyOf(k))} />)}
              {!loading && shown.length === 0 && <div className="hq-empty">No kids here.</div>}
            </div>
          ) : (
            <div className="hq-list">
              <div className="hq-lh">
                <span /><span>Kid</span><span>Where</span><span className="opt">Growing</span>
                <span className="num" title="treats"><img src={`${UI}/treat.webp`} alt="treats" /></span>
                <span className="num" title="coins"><img src={`${UI}/coin.webp`} alt="coins" /></span>
                <span className="num opt" title="puzzle pieces"><img src={`${UI}/i_puzzle.webp`} alt="pieces" /></span>
                <span className="num opt" title="badges"><img src={`${UI}/medal.webp`} alt="badges" /></span>
                <span className="num opt">Today</span>
                <span>Last seen</span>
              </div>
              {shown.map(k => <KidRow key={keyOf(k)} k={k} sel={sel != null && keyOf(sel) === keyOf(k)} onPick={() => setSelKey(keyOf(k))} />)}
              {!loading && shown.length === 0 && <div className="hq-empty">No kids here.</div>}
            </div>
          )}
          {sel && <Detail k={sel} wide={wide} onClose={() => setSelKey(null)} />}
        </div>
      </div>
    </div>
  );
}

// ---- one kid card ----
function KidCard({ k, sel, onPick }: { k: Kid; sel: boolean; onPick: () => void }) {
  const at = k.at;
  const c = at ? WORLD_COLOR[at.w.id] : "#f2b705";
  const bg = at ? WORLD_BG[at.w.id] : "#fff6d6";
  const cur = at?.cur;
  return (
    <div className={`hq-card${sel ? " sel" : ""}`} style={{ ["--c" as any]: c, ["--bg" as any]: bg }} onClick={onPick}>
      <span className="hq-health hq-dot" title={k.health.reasons.join("\n") || "All good"} style={{ background: k.health.level === "red" ? "#d64545" : k.health.level === "yellow" ? "#f0a020" : "#2e9e5b" }} />
      <div className="hq-top">
        <Pet k={k} />
        <div>
          <div className="hq-name t">{cap(k.r.student_name)}</div>
          <div className="hq-code">{k.r.code}</div>
          <Seen k={k} />
          {k.play.today > 0 && <div className="hq-mins">{mins(k.play.today)} today</div>}
        </div>
      </div>
      <WhereLine k={k} />
      {at && cur && <Growth v={cur} pos={at.curPos} total={at.animals.length} />}
      <div className="hq-path">
        {k.worlds.map(v => <img key={v.w.id} src={worldIcon(v.w)} alt="" className={v.finished ? "done" : v === at ? "now" : "no"} />)}
        <span className="lab">{at ? `World ${at.idx + 1} of ${ALL_WORLDS.length}` : "All worlds done!"}</span>
      </div>
      <div className="hq-stats">
        <span className="hq-st" title="treats in the jar"><img src={`${UI}/treat.webp`} alt="" />{k.jar}</span>
        <span className="hq-st" title="coins"><img src={`${UI}/coin.webp`} alt="" />{k.coins}</span>
        <span className="hq-st" title="puzzle pieces"><img src={`${UI}/i_puzzle.webp`} alt="" />{k.pieces}</span>
        <span className="hq-st" title="badges"><img src={`${UI}/medal.webp`} alt="" />{k.badges.length}</span>
      </div>
    </div>
  );
}

// last-seen pill, or a glowing "Playing now" pill
function Seen({ k }: { k: Kid }) {
  if (k.play.now) return <span className="hq-seen live"><i />Playing now</span>;
  return <span className={`hq-seen ${k.seen.cls}`}>{k.seen.text}</span>;
}

// ---- one line in the quick list (same numbers as the card, one source: buildKid) ----
function KidRow({ k, sel, onPick }: { k: Kid; sel: boolean; onPick: () => void }) {
  const at = k.at, cur = at?.cur;
  const goal = cur ? cur.a.stages[cur.a.stages.length - 1].min : 0;
  const pct = cur ? Math.max(2, Math.min(100, Math.round((cur.fed / goal) * 100))) : 100;
  return (
    <div className={`hq-row${sel ? " sel" : ""}`} onClick={onPick}
      style={{ ["--c" as any]: at ? WORLD_COLOR[at.w.id] : "#f2b705", ["--bg" as any]: at ? WORLD_BG[at.w.id] : "#fff6d6" }}>
      <span className="hq-dot" title={k.health.reasons.join("\n") || "All good"} style={{ background: k.health.level === "red" ? "#d64545" : k.health.level === "yellow" ? "#f0a020" : "#2e9e5b" }} />
      <span className="kid"><Pet k={k} small /><span><b className="t">{cap(k.r.student_name)}</b><small>{k.r.code}</small></span></span>
      <span className="where">
        {at ? <><img src={worldIcon(at.w)} alt="" /><span title={`${at.w.title} · ${cur ? `${cur.a.name}${cur.petName ? ` "${cur.petName}"` : ""} · ${cur.a.stages[cur.stage].name}` : "last video"}`}><b style={{ color: "var(--c)" }}>{at.w.title}</b> · {cur ? `${cur.a.name} · ${cur.a.stages[cur.stage].name}` : "last video"}</span></>
          : <b style={{ color: "#c08a00" }}>All worlds done!</b>}
      </span>
      <span className="grow opt">
        {cur && <><span className="hq-gbar"><i style={{ width: `${pct}%` }} /></span><small>{at ? `${at.curPos + 1}/${at.animals.length}` : ""} · {cur.fed}/{goal}</small></>}
      </span>
      <span className="num">{k.jar}</span>
      <span className="num">{k.coins}</span>
      <span className="num opt">{k.pieces}</span>
      <span className="num opt">{k.badges.length}</span>
      <span className="num opt">{k.play.today ? mins(k.play.today) : "-"}</span>
      <span><Seen k={k} /></span>
    </div>
  );
}

// current animal picture in a world-coloured circle + the small world badge
function Pet({ k, big, small }: { k: Kid; big?: boolean; small?: boolean }) {
  const at = k.at;
  let src = `${UI}/medal.webp`;
  if (at) {
    const v = at.cur ?? at.animals[at.animals.length - 1];
    src = thumb(at.w, v.a, v.stage);
  } else {
    const last = k.worlds[k.worlds.length - 1];
    const v = last.animals[last.animals.length - 1];
    src = thumb(last.w, v.a, v.stage);
  }
  return (
    <div className={`hq-pet${big ? " big" : ""}${small ? " small" : ""}`}>
      <img src={src} alt="" />
      {at && !small && <img className="wb" src={worldIcon(at.w)} alt="" />}
    </div>
  );
}

function WhereLine({ k }: { k: Kid }) {
  const at = k.at;
  if (!at) return <div className="hq-where"><span className="w" style={{ color: "#c08a00" }}>Every world finished!</span></div>;
  const cur = at.cur;
  const w = <span className="w">{at.w.title}</span>;
  if (!cur) return <div className="hq-where">{w} · all grown · <b>watch the last video to finish</b></div>;
  return (
    <div className="hq-where">
      {w} · {cur.a.name}{cur.petName ? ` "${cur.petName}"` : ""} · {cur.a.stages[cur.stage].name}
      {!at.started && <span className="hq-new"> · not opened yet</span>}
    </div>
  );
}

function Growth({ v, pos, total }: { v: AnimalView; pos: number; total: number }) {
  const goal = v.a.stages[v.a.stages.length - 1].min;
  const pct = Math.max(2, Math.min(100, Math.round((v.fed / goal) * 100)));
  return (
    <>
      <div className="hq-gbar"><i style={{ width: `${pct}%` }} /></div>
      <div className="hq-gnote"><span>Animal {pos + 1} of {total}</span><span>{v.fed}/{goal} fed · {goal - v.fed} to Grown</span></div>
    </>
  );
}

// ---- everything about one kid ----
function Detail({ k, wide, onClose }: { k: Kid; wide: boolean; onClose: () => void }) {
  const r = k.r;
  const at = k.at;
  const allBadges = badgeList(ALL_WORLDS);
  const box = n0(r.daily_box);
  const weekDay = box === 0 ? 0 : ((box - 1) % 7) + 1;
  const openedToday = r.daily_claimed === taiwanToday();
  const pIdx = n0(r.puzzle_idx);
  const gone = Array.isArray(r.puzzle_gone) ? r.puzzle_gone.length : 0;
  const wins = (r.wins_list || []).slice(-6).reverse();
  const packs = Math.floor(k.coins / PACK_PRICE);
  return (
    <aside className={`hq-detail${wide ? "" : " pop"}`} style={{ ["--c" as any]: at ? WORLD_COLOR[at.w.id] : "#c08a00", ["--bg" as any]: at ? WORLD_BG[at.w.id] : "#fff6d6" }}>
      {!wide && <button className="hq-x" data-closex onClick={onClose}>Close</button>}
      <div className="hq-dh">
        <Pet k={k} big />
        <div>
          <div className="hq-name t">{cap(r.student_name)}</div>
          <div className="hq-code">{r.code} · {k.play.now ? "playing now" : `seen ${k.seen.text.toLowerCase()}`}</div>
          <span className="hq-nowchip">{at ? `Playing ${at.w.title} World` : "Finished every world"}</span>
        </div>
      </div>
      {k.health.reasons.length > 0 && <div className={`hq-warn ${k.health.level}`}>{k.health.reasons.map((s, i) => <div key={i}>{s}</div>)}</div>}

      <div className="hq-sec"><h3 className="t">Worlds</h3>
        {k.worlds.map(v => {
          const isAt = v === at;
          const status = v.finished ? "Finished" : isAt ? (v.cur ? `Animal ${v.curPos + 1} of ${v.animals.length}` : "Last video to watch") : v.started ? "Started" : "Not yet";
          const showAnimals = v.finished || isAt || v.started;
          return (
            <div key={v.w.id} className={`hq-wrow${isAt ? " cur" : ""}${!showAnimals ? " locked" : ""}`}>
              <img src={worldIcon(v.w)} alt="" />
              <div className="wn">{v.w.title}<small style={v.finished ? { color: "#c08a00" } : undefined}>{status}</small></div>
              {showAnimals && (
                <div className="hq-an">
                  {v.animals.map(av => {
                    const isCur = isAt && av === v.cur;
                    const tip = `${av.a.name}${av.petName ? ` "${av.petName}"` : ""} · ${av.a.stages[av.stage].name} · fed ${av.fed}`;
                    if (av.grown) return <span key={av.a.id} className="g" title={tip}><img src={thumb(v.w, av.a, av.stage)} alt="" /></span>;
                    if (isCur || av.fed > 0) return <span key={av.a.id} className={isCur ? "c" : ""} title={tip}><img src={thumb(v.w, av.a, av.stage)} alt="" /></span>;
                    return <span key={av.a.id} className="x" title={av.a.name}><img src={`${UI}/lock_closed.webp`} alt="" /></span>;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hq-sec"><h3 className="t">Play time {k.play.now && <span className="hq-seen live" style={{ marginLeft: 6 }}><i />Playing now</span>}</h3>
        <div className="hq-wallet hq-play">
          <div className="hq-wl"><b className="t">{mins(k.play.today)}</b><small>today</small></div>
          <div className="hq-wl"><b className="t">{mins(k.play.week)}</b><small>last 7 days</small></div>
          <div className="hq-wl"><b className="t">{mins(k.play.total)}</b><small>total</small></div>
        </div>
        <p className="hq-note">Counted only while the kid is active (from 22 Oct 2026).</p>
      </div>

      <div className="hq-sec"><h3 className="t">Wallet</h3>
        <div className="hq-wallet">
          <div className="hq-wl"><img src={`${UI}/treat.webp`} alt="" /><b className="t">{k.jar}</b><small>treats</small></div>
          <div className="hq-wl"><img src={`${UI}/coin.webp`} alt="" /><b className="t">{k.coins}</b><small>{packs > 0 ? `${packs} pack${packs > 1 ? "s" : ""} ready` : `${PACK_PRICE - k.coins} to a pack`}</small></div>
          <div className="hq-wl"><img src={`${UI}/i_puzzle.webp`} alt="" /><b className="t">{k.pieces}</b><small>puzzle pieces</small></div>
          <div className="hq-wl"><img src={`${UI}/i_album.webp`} alt="" /><b className="t">{k.owned}</b><small>cards of {CARDS_TOTAL}</small></div>
        </div>
      </div>

      <div className="hq-sec"><h3 className="t">Badges <span className="hq-sub">{k.badges.length} of {allBadges.length}</span></h3>
        <div className="hq-badges">
          {allBadges.filter(b => k.badges.includes(b.id)).map(b => <img key={b.id} src={badgeImg(b.id)} alt="" title={b.name} />)}
        </div>
      </div>

      <div className="hq-sec hq-two">
        <div className="hq-box"><h3 className="t">Games won</h3>
          <div className="big t">{n0(r.wins_vocab)} <small>vocab</small> · {n0(r.wins_grammar)} <small>grammar</small></div>
          {wins.length > 0 && <div className="hq-winlbl">Newest first wins:</div>}
          <div className="hq-wins">{wins.map(w => <span key={w}>{winLabel(w)}</span>)}</div>
        </div>
        <div className="hq-box"><h3 className="t">Daily Prize</h3>
          <small>{box === 0 ? "No box opened yet" : `Box ${weekDay} of 7${openedToday ? " · opened today" : ""} · ${box} in all`}</small>
          <div className="hq-days">{[1, 2, 3, 4, 5, 6, 7].map(d => <span key={d} className={d <= weekDay ? "o" : ""}>{d}</span>)}</div>
        </div>
      </div>

      <div className="hq-sec hq-box"><h3 className="t">Puzzle + Album</h3>
        <small>
          {pIdx >= PUZZLE_COVERS.length ? `All ${PUZZLE_COVERS.length} puzzles done` : `Puzzle ${pIdx + 1} of ${PUZZLE_COVERS.length} · ${gone} of ${PUZZLE_COVERS[pIdx]} covers open`}
          {` · Album: ${k.setsDone} of ${CARD_SETS.length} sets done · ${n0(r.card_swap)} swap points`}
        </small>
      </div>

      <div className="hq-tools"><h3 className="t"><img src={`${UI}/lock_closed.webp`} alt="" />Teacher tools</h3>
        <div className="hq-tb"><span>Gift treats</span><span>Gift coins</span><span>Gift puzzle pieces</span><span>Change animal / stage</span></div>
        <p>Coming in Part 3, after the real teacher login.</p>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------------------------------
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Titan+One&family=Nunito:wght@700;800;900&display=swap');
.hq{min-height:100vh;font-family:Nunito,system-ui,sans-serif;font-weight:800;color:#1d3557;background:linear-gradient(180deg,#4fb8f5 0,#9fdcff 260px,#e8f7ff 620px,#f4fbff 100%)}
.hq *{box-sizing:border-box}
.hq button{font:inherit;cursor:pointer;border:0}
.hq .t{font-family:"Titan One",Nunito,sans-serif;font-weight:400;letter-spacing:.3px}
.hq-wrap{max-width:1440px;margin:0 auto;padding:20px 24px 40px}
.hq-head{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.hq-logo{font-size:40px;color:#fff;text-shadow:0 4px 0 #1767a8,0 8px 16px rgba(0,40,90,.25);line-height:1}
.hq-logo small{display:block;font-family:Nunito;font-size:14px;font-weight:900;color:#e9f7ff;text-shadow:none;letter-spacing:1.5px;margin-top:6px}
.hq-chips{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap}
.hq-chip{background:#fff;border-radius:999px;padding:9px 16px;font-size:15px;box-shadow:0 4px 0 rgba(23,103,168,.25);display:flex;align-items:center;gap:8px;color:#1d3557}
.hq-chip b{font-family:"Titan One";font-weight:400;font-size:18px}
.hq-btn{color:#1767a8!important}
.hq-dot{width:12px;height:12px;border-radius:50%;display:inline-block}
.hq-err{margin-top:12px;background:#ffe3e3;color:#b42318;border-radius:12px;padding:10px 14px}
.hq-worlds{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin:18px 0 14px}
.hq-wt{background:#fff;border-radius:22px;padding:10px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 5px 0 rgba(23,103,168,.18),0 10px 22px rgba(23,103,168,.12);border:3px solid transparent!important;text-align:left}
.hq-wt img{width:58px;height:58px;border-radius:50%;box-shadow:0 0 0 4px #fff,0 0 0 6px var(--c);flex:none}
.hq-wt .n{font-size:24px;color:var(--c);line-height:1}
.hq-wt .l{font-size:13px;color:#6b7f99}
.hq-wt.on{border-color:var(--c)!important}
.hq-wt.zero{opacity:.55}
.hq-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.hq-search{flex:1;min-width:200px;max-width:340px;background:#fff;border-radius:999px;padding:11px 18px;font:inherit;font-size:15px;color:#1d3557;border:0;outline:0;box-shadow:inset 0 2px 0 rgba(0,0,0,.06),0 3px 0 rgba(23,103,168,.15)}
.hq-pill{background:#fff;border-radius:999px;padding:9px 16px;font-size:14px;color:#6b7f99;box-shadow:0 3px 0 rgba(23,103,168,.15)}
.hq-pill.on{background:#1767a8;color:#fff}
.hq-tests{margin-left:auto}
.hq-lbl{font-size:13px;color:#4c6a8c}
.hq-main{display:grid;grid-template-columns:1fr 470px;gap:20px;align-items:start}
.hq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px}
.hq-empty{color:#6b7f99;padding:20px}
.hq-card{background:#fff;border-radius:24px;padding:14px 16px;position:relative;box-shadow:0 6px 0 rgba(23,103,168,.16),0 12px 26px rgba(23,103,168,.12);border:3px solid transparent;cursor:pointer}
.hq-card.sel{border-color:#1767a8;box-shadow:0 6px 0 #1767a8,0 14px 30px rgba(23,103,168,.3)}
.hq-top{display:flex;gap:12px;align-items:center}
.hq-pet{width:76px;height:76px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#fff 0,var(--bg) 75%);display:grid;place-items:center;flex:none;position:relative;box-shadow:inset 0 0 0 4px var(--c)}
.hq-pet>img:first-child{width:66px;height:66px;object-fit:contain}
.hq-pet.big{width:92px;height:92px}.hq-pet.big>img:first-child{width:80px;height:80px}
.hq-pet .wb{position:absolute;right:-6px;bottom:-4px;width:30px;height:30px;border-radius:50%;box-shadow:0 0 0 3px #fff}
.hq-pet.big .wb{width:36px;height:36px}
.hq-name{font-size:24px;line-height:1.05}
.hq-code{font-size:12px;color:#9aa8bd;letter-spacing:1px}
.hq-seen{display:inline-block;margin-top:5px;font-size:12px;border-radius:999px;padding:3px 9px}
.hq-seen.today{background:#e2f6ea;color:#2e9e5b}
.hq-seen.yest{background:#fff1d9;color:#a9741f}
.hq-seen.old{background:#eef2f7;color:#7d8da3}
.hq-seen.quiet{background:#ffe7c2;color:#b45f00}
.hq-where{margin:12px 0 6px;font-size:15px}
.hq-where .w{color:var(--c)}
.hq-new{color:#9aa8bd}
.hq-gbar{height:14px;border-radius:999px;background:#e8eef6;overflow:hidden;box-shadow:inset 0 2px 0 rgba(0,0,0,.06)}
.hq-gbar i{display:block;height:100%;border-radius:999px;background:linear-gradient(180deg,#8fe08a,#3fb54a)}
.hq-gnote{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#6b7f99;margin-top:4px}
.hq-path{display:flex;gap:6px;margin:12px 0 10px;align-items:center}
.hq-path img{width:30px;height:30px;border-radius:50%}
.hq-path .done{box-shadow:0 0 0 3px #f2b705}
.hq-path .now{box-shadow:0 0 0 3px #fff,0 0 0 6px #4fc3ff,0 0 10px 6px rgba(79,195,255,.6)}
.hq-path .no{filter:grayscale(1);opacity:.35}
.hq-path .lab{font-size:11px;color:#6b7f99;margin-left:auto}
.hq-stats{display:flex;justify-content:space-between;border-top:2px dashed #e3eaf3;padding-top:10px}
.hq-st{display:flex;align-items:center;gap:4px;font-size:16px}
.hq-st img{width:24px;height:24px;object-fit:contain}
.hq-health{position:absolute;top:14px;right:14px}
.hq-detail{background:#fff;border-radius:28px;padding:18px 20px 20px;box-shadow:0 7px 0 rgba(23,103,168,.2),0 16px 34px rgba(23,103,168,.16);position:sticky;top:14px;max-height:calc(100vh - 28px);overflow:auto}
.hq-detail.pop{position:fixed;inset:12px;max-height:none;z-index:70;top:12px}
.hq-x{position:sticky;top:0;float:right;background:#1767a8;color:#fff;border-radius:999px;padding:8px 16px;font-size:14px;z-index:2}
.hq-dh{display:flex;gap:14px;align-items:center;padding-bottom:12px;border-bottom:2px dashed #e3eaf3}
.hq-dh .hq-name{font-size:32px}
.hq-nowchip{display:inline-block;margin-top:6px;background:var(--bg);color:var(--c);border-radius:999px;padding:4px 12px;font-size:14px}
.hq-warn{margin-top:10px;border-radius:12px;padding:8px 12px;font-size:13px}
.hq-warn.red{background:#ffe3e3;color:#b42318}.hq-warn.yellow{background:#fff1d9;color:#8a5a00}
.hq-sec{margin-top:14px}
.hq h3{margin:0 0 8px;font-size:18px;color:#1767a8;font-weight:400}
.hq-sub{color:#9aa8bd;font-size:14px}
.hq-wrow{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:14px}
.hq-wrow+.hq-wrow{margin-top:4px}
.hq-wrow.cur{background:#eaf6ff}
.hq-wrow>img{width:38px;height:38px;border-radius:50%;flex:none}
.hq-wrow .wn{width:96px;font-size:14px;line-height:1.1;flex:none}
.hq-wrow .wn small{display:block;color:#6b7f99;font-size:11px}
.hq-wrow.locked{opacity:.5}
.hq-an{display:flex;gap:4px;flex-wrap:wrap}
.hq-an span{width:36px;height:36px;border-radius:50%;background:#eef3f9;display:grid;place-items:center}
.hq-an span img{width:32px;height:32px;object-fit:contain}
.hq-an .g{background:#fff7d6;box-shadow:inset 0 0 0 2px #f2b705}
.hq-an .c{background:#dff3ff;box-shadow:0 0 0 3px #4fc3ff}
.hq-an .x{opacity:.5}
.hq-an .x img{width:18px;height:18px;opacity:.45}
.hq-wallet{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.hq-wl{background:#f5f9fe;border-radius:16px;padding:8px 6px;text-align:center}
.hq-wl img{width:34px;height:34px;object-fit:contain}
.hq-wl b{display:block;font-size:22px;line-height:1.1;font-weight:400}
.hq-wl small{font-size:11px;color:#6b7f99}
.hq-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.hq-box{background:#f5f9fe;border-radius:16px;padding:10px 12px}
.hq-box h3{margin:0 0 4px}
.hq-box .big{font-size:22px}
.hq-box small{color:#6b7f99;font-size:12px}
.hq-badges{display:flex;gap:6px;flex-wrap:wrap}
.hq-badges img{height:46px}
.hq-days{display:flex;gap:5px;margin-top:8px}
.hq-days span{flex:1;height:30px;border-radius:9px;background:#eef3f9;display:grid;place-items:center;font-size:12px;color:#9aa8bd}
.hq-days .o{background:linear-gradient(180deg,#ffd75e,#f2b705);color:#7a5200}
.hq-winlbl{font-size:11px;color:#6b7f99;margin-top:6px}
.hq-wins{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
.hq-wins span{background:#e7eef7;border-radius:999px;padding:3px 9px;font-size:12px;color:#4c6a8c}
.hq-tools{margin-top:16px;border:3px dashed #c9d6e6;border-radius:20px;padding:12px;background:repeating-linear-gradient(45deg,#fafcff 0 10px,#f3f7fc 10px 20px)}
.hq-tools h3{display:flex;align-items:center;gap:8px;color:#8a9bb3}
.hq-tools h3 img{width:22px}
.hq-tb{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hq-tb span{background:#e7edf5;color:#9aa8bd;border-radius:14px;padding:10px;text-align:center;font-size:14px}
.hq-tools p{margin:8px 0 0;font-size:12px;color:#8a9bb3}
.hq-gate{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:20px}
.hq-gate .hq-logo{text-align:center}
.hq-gatecard{background:#fff;border-radius:24px;padding:22px;width:min(360px,100%);box-shadow:0 6px 0 rgba(23,103,168,.2),0 14px 30px rgba(23,103,168,.15)}
.hq-gatecard p{margin:0 0 12px;color:#6b7f99}
.hq-pwrow{display:flex;gap:8px;margin-bottom:10px}
.hq-pwrow input{flex:1;min-width:0;border-radius:14px;border:2px solid #d6e2f0;padding:11px 14px;font:inherit;color:#1d3557;outline:0}
.hq-eye{background:#eef3f9;color:#4c6a8c;border-radius:14px;padding:0 14px}
.hq-go{width:100%;background:#1767a8;color:#fff;border-radius:14px;padding:12px;font-size:16px;box-shadow:0 4px 0 #0f4c7e}
.hq-gatecard .hq-wrong{color:#b42318;font-size:13px;margin:10px 0 0}
.hq-mail{width:100%;box-sizing:border-box;border-radius:14px;border:2px solid #d6e2f0;padding:11px 14px;font:inherit;color:#1d3557;outline:0;margin-bottom:10px}
.hq-gatecard .hq-good{color:#2e7d4f;font-size:13px;margin:10px 0 0}
.hq-modal{position:fixed;inset:0;z-index:100;background:rgba(18,40,66,.45);display:flex;align-items:center;justify-content:center;padding:20px}
.hq-pwclose{display:block;margin:12px auto 0;padding:9px 18px}
.hq-snd{color:#1d3557}
.hq-snd.off{color:#9aa8bd}
.hq-sw{width:38px;height:22px;border-radius:999px;background:#3fb54a;position:relative;flex:none;transition:background .2s}
.hq-sw i{position:absolute;top:3px;left:19px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:left .2s}
.hq-snd.off .hq-sw{background:#c9d4e2}
.hq-snd.off .hq-sw i{left:3px}
@keyframes hqPulse{0%{box-shadow:0 0 0 0 rgba(46,158,91,.6)}70%{box-shadow:0 0 0 8px rgba(46,158,91,0)}100%{box-shadow:0 0 0 0 rgba(46,158,91,0)}}
.hq-pulse{background:#9aa8bd}
.hq-live .hq-pulse{background:#2ecc71;animation:hqPulse 2s infinite}
.hq-seen.live{background:#2ecc71;color:#fff;display:inline-flex;align-items:center;gap:6px}
.hq-seen.live i{width:8px;height:8px;border-radius:50%;background:#fff;animation:hqPulse 2s infinite}
.hq-mins{font-size:11px;color:#6b7f99;margin-top:3px}
.hq-play{grid-template-columns:repeat(3,1fr)}
.hq-play b{font-size:18px!important}
.hq-note{margin:6px 0 0;font-size:11px;color:#9aa8bd}
.hq-viewsw{display:flex;background:#fff;border-radius:999px;padding:4px;box-shadow:0 3px 0 rgba(23,103,168,.15)}
.hq-viewsw button{background:transparent;border-radius:999px;padding:6px 14px;font-size:14px;color:#6b7f99}
.hq-viewsw button.on{background:#f2b705;color:#5a3d00;box-shadow:0 2px 0 #c28f00}
.hq-pet.small{width:38px;height:38px;box-shadow:inset 0 0 0 3px var(--c)}.hq-pet.small>img:first-child{width:32px;height:32px}
.hq-list{overflow-x:auto;background:#fff;border-radius:24px;padding:6px 10px 10px;box-shadow:0 6px 0 rgba(23,103,168,.16),0 12px 26px rgba(23,103,168,.12)}
.hq-lh,.hq-row{display:grid;grid-template-columns:14px minmax(130px,1fr) minmax(200px,2.6fr) minmax(80px,.8fr) 46px 50px 44px 44px 58px 150px;gap:8px;align-items:center}
.hq-lh{padding:10px 8px;font-size:12px;color:#6b7f99;border-bottom:2px dashed #e3eaf3;position:sticky;top:0;background:#fff;z-index:1;border-radius:18px 18px 0 0}
.hq-lh img{width:22px;height:22px;object-fit:contain}
.hq-lh .num,.hq-row .num{text-align:center}
.hq-row{padding:6px 8px;border-radius:14px;cursor:pointer;border:2px solid transparent}
.hq-row:nth-child(odd){background:#f7fbff}
.hq-row:hover{background:#eaf6ff}
.hq-row.sel{border-color:#1767a8;background:#eaf6ff}
.hq-row .kid{display:flex;align-items:center;gap:8px;min-width:0}
.hq-row .kid b{font-size:16px;font-weight:400;display:block;line-height:1.1}
.hq-row .kid small{font-size:11px;color:#9aa8bd;letter-spacing:.5px}
.hq-row .where{display:flex;align-items:center;gap:6px;font-size:13px;min-width:0}
.hq-row .where img{width:24px;height:24px;border-radius:50%;flex:none}
.hq-row .where>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hq-row .hq-seen{white-space:nowrap}
.hq-row .grow small{display:block;font-size:11px;color:#6b7f99;margin-top:2px}
.hq-row .grow .hq-gbar{display:block;height:9px}
.hq-row .num{font-size:15px}
.hq-row .hq-seen{margin-top:0}
@media (max-width:1100px){.hq-main{grid-template-columns:1fr}.hq-worlds{grid-template-columns:repeat(3,1fr)}}
@media (max-width:820px){.hq-lh .opt,.hq-row .opt{display:none}.hq-lh,.hq-row{grid-template-columns:14px minmax(110px,1.2fr) minmax(120px,2fr) 44px 48px minmax(90px,1fr)}}
@media (max-width:640px){.hq-worlds{grid-template-columns:repeat(2,1fr)}.hq-wallet{grid-template-columns:repeat(2,1fr)}.hq-two{grid-template-columns:1fr}.hq-wrap{padding:16px}.hq-chips{margin-left:0}.hq-tests{margin-left:0}}
`;
