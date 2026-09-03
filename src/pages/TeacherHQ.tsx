import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ---- simple client-side gate (keeps the curious out, not the determined) ----
const PASSWORD = "paradise2026";
const SESSION_KEY = "mpe_hq_ok";
const SORT_KEY = "mpe_hq_sort";

// ---- REAL animal orders, copied verbatim from KidsWorld.tsx / DinosaurWorld.tsx ----
// Ocean: turtle -> dolphin -> octopus -> shark -> clownfish -> mantaray
// Dino:  triceratops -> pterodactyl -> velociraptor -> brontosaurus -> dilophosaurus -> trex
const OCEAN_ORDER = ["turtle", "dolphin", "octopus", "shark", "clownfish", "mantaray"];
const DINO_ORDER = ["triceratops", "pterodactyl", "velociraptor", "brontosaurus", "dilophosaurus", "trex"];
// Pretty display names (real names from the game, e.g. "Manta Ray" two words)
const OCEAN_NAMES: Record<string, string> = { turtle: "Turtle", dolphin: "Dolphin", octopus: "Octopus", shark: "Shark", clownfish: "Clownfish", mantaray: "Manta Ray" };
const DINO_NAMES: Record<string, string> = { triceratops: "Triceratops", pterodactyl: "Pterodactyl", velociraptor: "Velociraptor", brontosaurus: "Brontosaurus", dilophosaurus: "Dilophosaurus", trex: "T-Rex" };

// ---- stage math: fed count -> stage label + progress to next ----
const GROWN_AT = 45;
function stageInfo(fed: number) {
  let label = "Egg";
  if (fed >= 45) label = "Grown";
  else if (fed >= 30) label = "Young";
  else if (fed >= 15) label = "Baby";
  const toGrow = fed >= GROWN_AT ? 0 : GROWN_AT - fed;
  return { label, toGrow };
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// A world is "finished" when every animal in the ORDER is fully grown (fed >= 45).
function worldFinished(world: any, order: string[]): boolean {
  if (!world || !world.animals) return false;
  return order.every((n) => (world.animals[n]?.fed ?? 0) >= GROWN_AT);
}

// Has the kid touched this world at all (any fed > 0)?
function worldTouched(world: any): boolean {
  if (!world || !world.animals) return false;
  return Object.keys(world.animals).some((n) => (world.animals[n]?.fed ?? 0) > 0);
}

// One display line for a world: either a "all done" summary, or the current animal
// with position + what's next.
function lineForWorld(
  world: any,
  worldKey: string,
  order: string[],
  jar: number | null,
  fallbackActive: string | null
) {
  if (!worldTouched(world)) return null;

  if (worldFinished(world, order)) {
    return { done: true, world: worldKey, jar };
  }

  const active = world.activePet || fallbackActive;
  const a = active ? world.animals[active] : null;
  if (!a) return null;
  const fed = a.fed ?? 0;
  const { label, toGrow } = stageInfo(fed);
  const idx = order.indexOf(active);
  const position = idx >= 0 ? idx + 1 : null;
  const nameMap = order === OCEAN_ORDER ? OCEAN_NAMES : DINO_NAMES;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  const next = nextId ? (nameMap[nextId] || cap(nextId)) : null;
  return {
    done: false,
    animalId: active,
    animal: cap(active),
    petName: a.petName || "",
    label,
    fed,
    toGrow,
    world: worldKey,
    jar,
    position,
    total: order.length,
    next: next,
  };
}

function worldLines(data: any, treats: number | null, activePetCol: string | null) {
  if (!data) return [];
  const out: any[] = [];
  const oceanActive = data.ocean?.activePet
    || (data.ocean?.animals?.[activePetCol ?? ""] ? activePetCol : null);
  const o = lineForWorld(data.ocean, "ocean", OCEAN_ORDER, treats ?? 0, oceanActive);
  if (o) out.push(o);
  const d = lineForWorld(data.dino, "dino", DINO_ORDER, data.dino?.jar ?? null, activePetCol);
  if (d) out.push(d);
  return out;
}

// full fed strip for a world, in real order: [{id,name,fed}]
function fedStrip(world: any, order: string[], nameMap: Record<string, string>) {
  if (!world || !world.animals) return [];
  return order.map((n) => ({ id: n, name: nameMap[n] || cap(n), fed: world.animals[n]?.fed ?? 0 }));
}

// ---- last seen: return the most recent visit Date (or null) ----
function lastSeenDate(data: any): Date | null {
  const lists: string[] = [];
  if (data?.shared?.visitDays) lists.push(...data.shared.visitDays);
  if (data?.ocean?.visitDays) lists.push(...data.ocean.visitDays);
  if (data?.dino?.visitDays) lists.push(...data.dino.visitDays);
  const times = lists.map((d) => new Date(d).getTime()).filter((t) => !isNaN(t));
  if (times.length === 0) return null;
  return new Date(Math.max(...times));
}
function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysSince(d: Date | null): number | null {
  if (!d) return null;
  const ms = Date.now() - d.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// ---- overall progress: how many animals grown across both worlds (X of 12) ----
function grownCount(data: any): { grown: number; total: number } {
  let grown = 0;
  const total = OCEAN_ORDER.length + DINO_ORDER.length;
  for (const n of OCEAN_ORDER) if ((data?.ocean?.animals?.[n]?.fed ?? 0) >= GROWN_AT) grown++;
  for (const n of DINO_ORDER) if ((data?.dino?.animals?.[n]?.fed ?? 0) >= GROWN_AT) grown++;
  return { grown, total };
}

// ---- HEALTH CHECK: green / yellow / red, with reasons ----
// RED = real contradiction that could affect world/treats/stages.
// YELLOW = odd but harmless (won't affect gameplay).
// This is a "look here" pointer, NOT a verdict — read the real blob to confirm.
type Health = { level: "green" | "yellow" | "red"; reasons: string[] };

function checkWorldHealth(world: any, order: string[], worldLabel: string, activePetCol: string | null, isOceanWithColumn: boolean): { level: "green" | "yellow" | "red"; reasons: string[] } {
  const reasons: string[] = [];
  let level: "green" | "yellow" | "red" = "green";
  if (!world || !world.animals) return { level, reasons };

  // active pet: ocean uses the active_pet column; dino uses blob activePet
  const active = isOceanWithColumn ? (world.activePet || activePetCol) : world.activePet;

  // RED: active pet points at an animal not present in this world's blob
  if (active && order.includes(active) && !world.animals[active]) {
    level = "red";
    reasons.push(`${worldLabel}: active pet "${cap(active)}" has no data in ${worldLabel}`);
  }

  // RED: sequence break — a later animal has fed>0 while an earlier one is still 0
  for (let i = 1; i < order.length; i++) {
    const cur = world.animals[order[i]]?.fed ?? 0;
    const prev = world.animals[order[i - 1]]?.fed ?? 0;
    if (cur > 0 && prev === 0) {
      level = "red";
      reasons.push(`${worldLabel}: ${cap(order[i])} started (fed ${cur}) but ${cap(order[i - 1])} still at 0 — out of order`);
    }
  }

  // RED: grown/flag contradiction — fed>=45 but no levelup recorded, or levelup full but fed low
  for (const n of order) {
    const a = world.animals[n];
    if (!a) continue;
    const fed = a.fed ?? 0;
    const lv = Array.isArray(a.levelup) ? a.levelup.length : 0;
    if (fed >= GROWN_AT && lv === 0) {
      level = "red";
      reasons.push(`${worldLabel}: ${cap(n)} is grown (fed ${fed}) but has no level-up record`);
    }
    if (lv >= 3 && fed < GROWN_AT) {
      level = "red";
      reasons.push(`${worldLabel}: ${cap(n)} has full level-ups but fed only ${fed}`);
    }
  }

  // YELLOW (only if not already red): grown animal with videoWatched flag still 0
  if (level !== "red") {
    for (const n of order) {
      const a = world.animals[n];
      if (!a) continue;
      const fed = a.fed ?? 0;
      if (fed >= GROWN_AT && (a.videoWatched ?? 0) === 0) {
        level = "yellow";
        reasons.push(`${worldLabel}: ${cap(n)} is grown but its video-watched flag is 0 (harmless)`);
      }
    }
  }

  return { level, reasons };
}

function checkHealth(data: any, treats: number | null, activePetCol: string | null): Health {
  const reasons: string[] = [];
  let level: "green" | "yellow" | "red" = "green";
  if (!data) return { level, reasons };

  const worlds: Array<{ w: any; order: string[]; label: string; oceanCol: boolean }> = [
    { w: data.ocean, order: OCEAN_ORDER, label: "Ocean", oceanCol: true },
    { w: data.dino, order: DINO_ORDER, label: "Dino", oceanCol: false },
  ];

  for (const { w, order, label, oceanCol } of worlds) {
    if (!w) continue;
    const res = checkWorldHealth(w, order, label, activePetCol, oceanCol);
    res.reasons.forEach((r) => reasons.push(r));
    if (res.level === "red") level = "red";
    else if (res.level === "yellow" && level !== "red") level = "yellow";
  }

  // YELLOW (only if not already flagged red): jar unusually high, worth a glance
  if (level !== "red") {
    const oceanJar = treats ?? 0;
    const dinoJar = typeof data?.dino?.jar === "number" ? data.dino.jar : 0;
    if (oceanJar >= 50) { level = level === "green" ? "yellow" : level; reasons.push(`Ocean jar unusually high (${oceanJar}) — worth a glance`); }
    if (dinoJar >= 50) { level = level === "green" ? "yellow" : level; reasons.push(`Dino jar unusually high (${dinoJar}) — worth a glance`); }
  }

  return { level, reasons };
}

type Row = {
  code: string;
  student_name: string;
  treats: number | null;
  active_pet: string | null;
  data: any;
};

export default function TeacherHQ() {
  const [ok, setOk] = useState<boolean>(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [wrongPw, setWrongPw] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "seen">(() => {
    try { return (sessionStorage.getItem(SORT_KEY) as "name" | "seen") || "name"; } catch { return "name"; }
  });

  function unlock() {
    setOk(true);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
  }

  function chooseSort(s: "name" | "seen") {
    setSortBy(s);
    try { sessionStorage.setItem(SORT_KEY, s); } catch {}
  }

  useEffect(() => {
    if (!ok) return;
    setLoading(true);
    supabase
      .from("student_progress")
      .select("code, student_name, treats, active_pet, data")
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setRows((data as Row[]) || []);
        setLoading(false);
      });
  }, [ok]);

  if (!ok) {
    return (
      <div style={gateWrap}>
        <div style={gateCard}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, color: "#1e3a5f" }}>
            Teacher HQ
          </h1>
          <p style={{ margin: "0 0 16px", color: "#6b7c93", fontSize: 14 }}>
            Enter the password to continue.
          </p>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setWrongPw(false); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (pw === PASSWORD) unlock();
                  else setWrongPw(true);
                }
              }}
              placeholder="Password"
              style={{ ...gateInput, marginBottom: 0, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={eyeBtn}
              title={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            onClick={() => {
              if (pw === PASSWORD) unlock();
              else setWrongPw(true);
            }}
            style={gateBtn}
          >
            Enter
          </button>
          {wrongPw && (
            <p style={{ color: "#c0392b", fontSize: 13, margin: "10px 0 0" }}>
              That password isn't right — please try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  const withMeta = rows.map((r) => {
    const seen = lastSeenDate(r.data);
    return { r, seen, health: checkHealth(r.data, r.treats, r.active_pet) };
  });

  const sorted = [...withMeta].sort((a, b) => {
    if (sortBy === "seen") {
      const ta = a.seen ? a.seen.getTime() : 0;
      const tb = b.seen ? b.seen.getTime() : 0;
      return tb - ta; // most recent first
    }
    return a.r.student_name.localeCompare(b.r.student_name);
  });

  const flaggedCount = withMeta.filter((m) => m.health.level !== "green").length;

  return (
    <div style={pageWrap}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={header}>
          <span style={{ fontSize: 28 }}>🏝️</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, color: "#fff" }}>Teacher HQ</h1>
            <p style={{ margin: 0, color: "#cfe3ff", fontSize: 13 }}>
              {loading ? "Loading students…" : `${sorted.length} students${flaggedCount > 0 ? ` · ${flaggedCount} flagged` : " · all healthy 🟢"}`}
            </p>
          </div>
        </div>

        {/* sort toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#6b7c93" }}>Sort by:</span>
          <button
            onClick={() => chooseSort("name")}
            style={sortBy === "name" ? sortBtnActive : sortBtn}
          >
            Name
          </button>
          <button
            onClick={() => chooseSort("seen")}
            style={sortBy === "seen" ? sortBtnActive : sortBtn}
          >
            Last seen
          </button>
        </div>

        {err && <div style={errBox}>Couldn't load: {err}</div>}

        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map(({ r, seen, health }) => {
            const lines = worldLines(r.data, r.treats, r.active_pet);
            const days = daysSince(seen);
            const { grown, total } = grownCount(r.data);
            const oceanStrip = fedStrip(r.data?.ocean, OCEAN_ORDER, OCEAN_NAMES);
            const dinoStrip = worldTouched(r.data?.dino) ? fedStrip(r.data?.dino, DINO_ORDER, DINO_NAMES) : [];
            // which animal is the kid currently on, per world (for highlight)
            const oceanActiveId = r.data?.ocean?.activePet
              || (r.data?.ocean?.animals?.[r.active_pet ?? ""] ? r.active_pet : null);
            const dinoActiveId = r.data?.dino?.activePet ?? null;
            const oceanDone = worldFinished(r.data?.ocean, OCEAN_ORDER);
            const dinoDone = worldFinished(r.data?.dino, DINO_ORDER);
            const dotColor = health.level === "red" ? "#e03131" : health.level === "yellow" ? "#f0a020" : "#2e9e5b";
            return (
              <div key={r.code + r.student_name} style={card}>
                <div style={cardTop}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span title={health.level} style={{ width: 12, height: 12, borderRadius: "50%", background: dotColor, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 17, color: "#1e3a5f" }}>{cap(r.student_name)}</span>
                    <span style={{ color: "#9aa8bd", fontSize: 13 }}>{r.code}</span>
                  </div>
                  <span style={{ color: days != null && days >= 7 ? "#f0a020" : "#9aa8bd", fontSize: 12 }}>
                    Last seen {fmtDate(seen)}{days != null ? ` · ${days}d ago` : ""}
                  </span>
                </div>

                {/* quick stat row */}
                <div style={statRow}>
                  <span>🏆 {grown} of {total} grown</span>
                </div>

                {lines.length > 0 ? (
                  lines.map((ln) => {
                    if (ln.done) return null;
                    const isDino = ln.world === "dino";
                    const boxBg = isDino ? "#eef3e6" : "#e6f1fb";
                    const boxBorder = isDino ? "#c0dd97" : "#b5d4f4";
                    const accent = isDino ? "#3b6d11" : "#185fa5";
                    const dotc = isDino ? "#97c459" : "#85b7eb";
                    return (
                      <div key={ln.world} style={{ background: boxBg, border: `0.5px solid ${boxBorder}`, borderRadius: 12, padding: "9px 14px", margin: "8px 0 4px", fontSize: 14.5, lineHeight: 1.5, color: "#2b3a4d", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ marginRight: 6 }}>{isDino ? "🦕" : "🌊"}</span>
                        <b style={{ color: "#1e3a5f" }}>{ln.animal}</b>
                        {ln.petName ? (
                          <span style={{ marginLeft: 6, color: accent, fontStyle: "italic", fontSize: 13 }}>"{ln.petName}"</span>
                        ) : (
                          <span style={noName}>*No name</span>
                        )}
                        {ln.position && (<><span style={{ margin: "0 7px", color: dotc }}>·</span><span style={{ color: accent }}>{ln.position} of {ln.total}</span></>)}
                        <span style={{ margin: "0 7px", color: dotc }}>·</span>
                        {ln.label}
                        <span style={{ margin: "0 7px", color: dotc }}>·</span>
                        {ln.fed}/{GROWN_AT} fed
                        {ln.toGrow > 0 ? (<><span style={{ margin: "0 7px", color: dotc }}>·</span><b>{ln.toGrow} to grow</b></>) : (<><span style={{ margin: "0 7px", color: dotc }}>·</span><b style={{ color: "#1e3a5f" }}>fully grown ✓</b></>)}
                        {ln.next && (<><span style={{ margin: "0 7px", color: dotc }}>·</span><span style={{ color: accent }}>next: {ln.next}</span></>)}
                        <span style={{ margin: "0 7px", color: dotc }}>·</span>
                        <span style={{ color: "#2b3a4d" }}>Treats in jar: <b style={{ color: "#1e3a5f" }}>{ln.jar ?? 0}</b></span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ ...line, color: "#9aa8bd" }}>No world progress yet</div>
                )}

                {/* full fed strips */}
                {oceanStrip.length > 0 && worldTouched(r.data?.ocean) && (
                  <div style={strip}>
                    <span style={stripLabel}>🌊 Ocean</span>
                    {oceanStrip.map((s, i) => {
                      const isCurrent = !oceanDone && s.id === oceanActiveId && s.fed < GROWN_AT;
                      return (
                        <span key={i} style={{ ...stripItem, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#1e3a5f" : s.fed >= GROWN_AT ? "#2e9e5b" : s.fed > 0 ? "#3a4a5f" : "#aeb9c7" }}>
                          {s.name} <b>{s.fed}</b>{s.fed >= GROWN_AT ? " ✓" : ""}
                        </span>
                      );
                    })}
                  </div>
                )}
                {dinoStrip.length > 0 && (
                  <div style={strip}>
                    <span style={stripLabel}>🦕 Dino</span>
                    {dinoStrip.map((s, i) => {
                      const isCurrent = !dinoDone && s.id === dinoActiveId && s.fed < GROWN_AT;
                      return (
                        <span key={i} style={{ ...stripItem, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#1e3a5f" : s.fed >= GROWN_AT ? "#2e9e5b" : s.fed > 0 ? "#3a4a5f" : "#aeb9c7" }}>
                          {s.name} <b>{s.fed}</b>{s.fed >= GROWN_AT ? " ✓" : ""}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* health reasons */}
                {health.reasons.length > 0 && (
                  <div style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 13,
                    background: health.level === "red" ? "#fff0f0" : "#fff8ec",
                    color: health.level === "red" ? "#c0392b" : "#8a5a00",
                    border: `1px solid ${health.level === "red" ? "#f5c2c2" : "#f0dca8"}`,
                  }}>
                    <b>{health.level === "red" ? "🔴 Check this:" : "🟡 Heads up:"}</b>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {health.reasons.map((rsn, i) => (<li key={i}>{rsn}</li>))}
                    </ul>
                    {health.level === "red" && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "#9a5555" }}>
                        Paste code <b>{r.code}</b> to Claude to investigate.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && sorted.length === 0 && !err && (
          <div style={{ textAlign: "center", color: "#6b7c93", padding: 40 }}>No students found.</div>
        )}
      </div>
    </div>
  );
}

// ---- styles ----
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#e8f1fb",
  padding: "20px 14px 40px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};
const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "linear-gradient(100deg,#3f7cbf 0%,#28517f 45%,#16233a 100%)",
  borderRadius: 16,
  padding: "18px 22px",
  marginBottom: 18,
  boxShadow: "0 6px 20px rgba(30,58,95,0.22)",
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: "16px 18px",
  boxShadow: "0 2px 12px rgba(30,58,95,0.07)",
  border: "0.5px solid #e4edf6",
};
const cardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
  flexWrap: "wrap",
  gap: 4,
};
const statRow: React.CSSProperties = {
  fontSize: 12.5,
  color: "#6b7c93",
  marginBottom: 8,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f5fa",
};
const line: React.CSSProperties = {
  fontSize: 14.5,
  color: "#3a4a5f",
  padding: "3px 0",
  lineHeight: 1.5,
};
const dot: React.CSSProperties = { margin: "0 7px", color: "#c3d0e0" };
const petTag: React.CSSProperties = {
  marginLeft: 6,
  color: "#2b6cb0",
  fontStyle: "italic",
  fontSize: 13,
};
const noName: React.CSSProperties = {
  marginLeft: 6,
  color: "#b0bccc",
  fontStyle: "italic",
  fontSize: 13,
};
const strip: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "6px 14px",
  fontSize: 13,
  marginTop: 6,
  fontVariantNumeric: "tabular-nums",
};
const stripLabel: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: "#6b7c93", marginRight: 2 };
const stripItem: React.CSSProperties = { fontWeight: 500 };
const sortBtn: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 16px",
  borderRadius: 999,
  border: "0.5px solid #cfe0f0",
  background: "#fff",
  color: "#3a4a5f",
  cursor: "pointer",
};
const sortBtnActive: React.CSSProperties = {
  ...sortBtn,
  background: "#2b6cb0",
  color: "#fff",
  border: "0.5px solid #2b6cb0",
};
const gateWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(160deg,#e8f4ff,#f7fbff)",
  fontFamily: "system-ui, -apple-system, sans-serif",
};
const gateCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: "32px 28px",
  textAlign: "center",
  boxShadow: "0 8px 30px rgba(30,58,95,0.15)",
  width: 300,
};
const gateInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  borderRadius: 10,
  border: "1px solid #cfe0f0",
  marginBottom: 10,
  boxSizing: "border-box",
};
const eyeBtn: React.CSSProperties = {
  position: "absolute",
  right: 6,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  padding: "2px 6px",
  lineHeight: 1,
};
const gateBtn: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  background: "#2b6cb0",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
};
const errBox: React.CSSProperties = {
  background: "#fff0f0",
  color: "#c0392b",
  padding: "10px 14px",
  borderRadius: 10,
  marginBottom: 14,
  fontSize: 14,
};
