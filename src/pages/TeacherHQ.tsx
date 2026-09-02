import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ---- simple client-side gate (keeps the curious out, not the determined) ----
const PASSWORD = "paradise2026";

// ---- stage math: fed count -> stage label + progress to next ----
const STAGE_STEP = 15;
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

// A world is "finished" when every animal is fully grown (fed >= 45).
function worldFinished(world: any): boolean {
  if (!world || !world.animals) return false;
  const names = Object.keys(world.animals);
  if (names.length === 0) return false;
  return names.every((n) => (world.animals[n]?.fed ?? 0) >= GROWN_AT);
}

// Has the kid touched this world at all (any fed > 0)?
function worldTouched(world: any): boolean {
  if (!world || !world.animals) return false;
  return Object.keys(world.animals).some((n) => (world.animals[n]?.fed ?? 0) > 0);
}

// One display line for a world: either a "all done" summary, or the current animal.
function lineForWorld(
  world: any,
  worldKey: string,
  jar: number | null,
  fallbackActive: string | null
) {
  if (!worldTouched(world)) return null;

  if (worldFinished(world)) {
    return { done: true, world: worldKey, jar };
  }

  const active = world.activePet || fallbackActive;
  const a = active ? world.animals[active] : null;
  if (!a) return null;
  const fed = a.fed ?? 0;
  const { label, toGrow } = stageInfo(fed);
  return {
    done: false,
    animal: cap(active),
    petName: a.petName || "",
    label,
    fed,
    toGrow,
    world: worldKey,
    jar,
  };
}

function worldLines(data: any, treats: number | null, activePetCol: string | null) {
  if (!data) return [];
  const out: any[] = [];
  const oceanActive = data.ocean?.activePet
    || (data.ocean?.animals?.[activePetCol ?? ""] ? activePetCol : null);
  const o = lineForWorld(data.ocean, "ocean", treats ?? 0, oceanActive);
  if (o) out.push(o);
  const d = lineForWorld(data.dino, "dino", data.dino?.jar ?? null, activePetCol);
  if (d) out.push(d);
  return out;
}

// most recent visit date across shared + per-world lists
function lastSeen(data: any): string {
  const lists: string[] = [];
  if (data?.shared?.visitDays) lists.push(...data.shared.visitDays);
  if (data?.ocean?.visitDays) lists.push(...data.ocean.visitDays);
  if (data?.dino?.visitDays) lists.push(...data.dino.visitDays);
  if (lists.length === 0) return "—";
  const times = lists
    .map((d) => new Date(d).getTime())
    .filter((t) => !isNaN(t));
  if (times.length === 0) return "—";
  const latest = new Date(Math.max(...times));
  return latest.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Row = {
  code: string;
  student_name: string;
  treats: number | null;
  active_pet: string | null;
  data: any;
};

export default function TeacherHQ() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [wrongPw, setWrongPw] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setWrongPw(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pw === PASSWORD) setOk(true);
                else setWrongPw(true);
              }
            }}
            placeholder="Password"
            style={gateInput}
          />
          <button
            onClick={() => {
              if (pw === PASSWORD) setOk(true);
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

  const sorted = [...rows].sort((a, b) =>
    a.student_name.localeCompare(b.student_name)
  );

  return (
    <div style={pageWrap}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={header}>
          <span style={{ fontSize: 28 }}>🏝️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, color: "#fff" }}>
              Teacher HQ
            </h1>
            <p style={{ margin: 0, color: "#cfe3ff", fontSize: 13 }}>
              {loading
                ? "Loading students…"
                : `${sorted.length} students`}
            </p>
          </div>
        </div>

        {err && (
          <div style={errBox}>Couldn't load: {err}</div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map((r) => {
            const lines = worldLines(r.data, r.treats, r.active_pet);
            const seen = lastSeen(r.data);
            return (
              <div key={r.code + r.student_name} style={card}>
                <div style={cardTop}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 17, color: "#1e3a5f" }}>
                      {cap(r.student_name)}
                    </span>
                    <span style={{ color: "#9aa8bd", fontSize: 13, marginLeft: 8 }}>
                      {r.code}
                    </span>
                  </div>
                  <span style={{ color: "#9aa8bd", fontSize: 12 }}>
                    Last seen {seen}
                  </span>
                </div>

                {lines.length > 0 ? (
                  lines.map((ln) =>
                    ln.done ? (
                      <div key={ln.world} style={line}>
                        <span style={{ marginRight: 6 }}>
                          {ln.world === "dino" ? "🦕" : "🌊"}
                        </span>
                        <b style={{ color: "#1e3a5f" }}>
                          {ln.world === "dino" ? "Dino World" : "Ocean World"}
                        </b>
                        <span style={dot}>·</span>
                        <span style={{ color: "#2e9e5b", fontWeight: 600 }}>
                          all done ✓
                        </span>
                        {ln.world === "dino" && (
                          <>
                            <span style={dot}>·</span>
                            Dino treats {ln.jar ?? 0}
                          </>
                        )}
                      </div>
                    ) : (
                      <div key={ln.world} style={line}>
                        <span style={{ marginRight: 6 }}>
                          {ln.world === "dino" ? "🦕" : "🌊"}
                        </span>
                        <b style={{ color: "#1e3a5f" }}>{ln.animal}</b>
                        {ln.petName && (
                          <span style={petTag}>"{ln.petName}"</span>
                        )}
                        <span style={dot}>·</span>
                        {ln.label}
                        <span style={dot}>·</span>
                        {ln.fed}/{GROWN_AT} fed
                        {ln.toGrow > 0 ? (
                          <>
                            <span style={dot}>·</span>
                            <b>{ln.toGrow} to grow</b>
                          </>
                        ) : (
                          <>
                            <span style={dot}>·</span>
                            <span style={{ color: "#2e9e5b" }}>fully grown ✓</span>
                          </>
                        )}
                        <span style={dot}>·</span>
                        {ln.world === "dino" ? "Dino treats" : "Treats"} {ln.jar ?? 0}
                      </div>
                    )
                  )
                ) : (
                  <div style={{ ...line, color: "#9aa8bd" }}>
                    No world progress yet
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && sorted.length === 0 && !err && (
          <div style={{ textAlign: "center", color: "#6b7c93", padding: 40 }}>
            No students found.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- styles ----
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(160deg,#e8f4ff 0%,#f7fbff 100%)",
  padding: "20px 14px 40px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};
const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "linear-gradient(135deg,#2b6cb0,#1e3a5f)",
  borderRadius: 16,
  padding: "16px 20px",
  marginBottom: 18,
  boxShadow: "0 6px 20px rgba(30,58,95,0.25)",
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: "14px 16px",
  boxShadow: "0 2px 10px rgba(30,58,95,0.08)",
  border: "1px solid #eaf1f8",
};
const cardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  flexWrap: "wrap",
  gap: 4,
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
