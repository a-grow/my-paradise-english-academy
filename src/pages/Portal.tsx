import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, BookOpen, Calendar, LogOut, Trophy, X, ChevronDown, ChevronUp } from "lucide-react";
import { fetchSheet } from "@/lib/sheets";

import book1Data from "@/data/oxford-discover-book1.json";
import book2Data from "@/data/oxford-discover-book2.json";
import book3Data from "@/data/oxford-discover-book3.json";
import book4Data from "@/data/oxford-discover-book4.json";
import book5Data from "@/data/oxford-discover-book5.json";

const ZH = ({ children, size = "0.95em" }: { children: React.ReactNode; size?: string }) => (
  <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: size, color: "rgba(0,0,0,0.45)", marginTop: "0.15rem", lineHeight: 1.3 }}>
    {children}
  </div>
);

const ZHwhite = ({ children, size = "0.95em" }: { children: React.ReactNode; size?: string }) => (
  <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: size, color: "rgba(255,255,255,0.65)", marginTop: "0.15rem", lineHeight: 1.3 }}>
    {children}
  </div>
);

type EvalEntry = { student: string; units: string; date: string; eval_text: string };

const EvalsModal = ({ student, evals, onClose }: { student: string; evals: EvalEntry[]; onClose: () => void }) => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" style={{ border: "3px solid hsl(var(--paradise-sky)/0.3)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-paradise-yellow" />
              <span className="font-display font-bold text-lg text-paradise-coral">{student}'s Evaluations</span>
            </div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.72rem", color: "rgba(0,0,0,0.4)", marginLeft: "1.75rem" }}>{student}的評估記錄</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
          {evals.map((ev, idx) => (
            <div key={idx} className="rounded-2xl border cursor-pointer transition-all duration-200" style={{ border: openIdx === idx ? "2px solid hsl(var(--paradise-sky)/0.6)" : "2px solid #f1f5f9", background: openIdx === idx ? "hsl(var(--paradise-sky)/0.05)" : "white" }} onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-body font-semibold text-sm text-foreground">{ev.units}</div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5">{ev.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  {idx === 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)))" }}>Latest</span>}
                  {openIdx === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {openIdx === idx && <div className="px-4 pb-4 pt-1 border-t border-gray-100"><p className="font-body text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{ev.eval_text}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// ---- VOCAB HELPERS ----
type VocabWord = { word: string; definition_en: string; definition_zh: string; part_of_speech?: string };

function getBookData(bookNum: number): any {
  const map: Record<number, any> = { 1: book1Data, 2: book2Data, 3: book3Data, 4: book4Data, 5: book5Data };
  return map[bookNum] ?? null;
}

function getUnits(bookData: any): any[] {
  if (Array.isArray(bookData)) return bookData;
  if (bookData?.units) return bookData.units;
  return [];
}

function parseLatestUnit(unitsStr: string): number | null {
  if (!unitsStr) return null;
  const nums = unitsStr.match(/\d+/g);
  if (!nums) return null;
  return parseInt(nums[nums.length - 1], 10);
}

// ---- VOCAB CARD ----
const VocabCard = ({ bookNum, unitsStr }: { bookNum: number; unitsStr: string }) => {

  const unitNum = parseLatestUnit(unitsStr);
  if (!unitNum) return null;
  const bookData = getBookData(bookNum);
  if (!bookData) return null;
  const units = getUnits(bookData);
  const unit = units.find((u: any) => u.unit === unitNum);
  if (!unit?.vocabulary?.words) return null;

  const enriched: VocabWord[] = unit.vocabulary.words
    .filter((w: any) => typeof w === "object" && w.word && w.definition_en)
    .map((w: any) => ({ word: w.word, definition_en: w.definition_en, definition_zh: w.definition_zh || "", part_of_speech: w.part_of_speech || "" }));

  const raw: string[] = unit.vocabulary.words
    .filter((w: any) => typeof w === "string")
    .map((w: any) => w);

  const hasDefinitions = enriched.length > 0;
  const displayWords = hasDefinitions ? enriched : raw.map(w => ({ word: w, definition_en: "", definition_zh: "" }));
  if (displayWords.length === 0) return null;

  const topicLabel = unit.vocabulary?.topic || unit.topic || "";

  return (
    <div className="card-fun p-6 md:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-paradise-sky" />
          <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Vocabulary</span>
        </div>
      </div>
      <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>本單元詞彙</div>
      <h3 className="font-display font-bold text-xl text-paradise-sky mb-1">📖 Book {bookNum} · Unit {unitNum}{topicLabel ? ` — ${topicLabel}` : ""}</h3>
      <p className="font-body text-sm text-muted-foreground mb-1">Parents: Practice these words with your child — then quiz them! 🌟</p>
      <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.85rem", color: "rgba(0,0,0,0.4)", marginBottom: "1.25rem" }}>家長：跟孩子一起練習這些單字，然後考考他們！</div>

      <div className="flex flex-col divide-y divide-gray-100">
        {displayWords.map((w) => (
          <div key={w.word} className="flex items-baseline gap-3 py-3 px-2">
            <span className="font-display font-bold text-base text-paradise-sky min-w-fit">{w.word}</span>
            {w.part_of_speech && (
              <span className="font-body text-xs text-muted-foreground italic">{w.part_of_speech}</span>
            )}
            {w.definition_zh && (
              <span style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.6)" }}>{w.definition_zh}</span>
            )}
          </div>
        ))}
      </div>
      <p className="font-body text-xs text-muted-foreground mt-4 text-center">{displayWords.length} words · Book {bookNum} Unit {unitNum}</p>
    </div>
  );
};

const LoginScreen = () => {
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      const data = await fetchSheet("Families");
      const success = login(code, data);
      if (!success) setError("That code doesn't match any family. Please try again! 🌴");
    } catch { setError("Connection problem. Please try again."); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-paradise flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bubble bubble-1" /><div className="bubble bubble-2" /><div className="bubble bubble-3" />
      <Star className="absolute top-16 left-12 w-8 h-8 text-paradise-yellow animate-float fill-paradise-yellow" />
      <Star className="absolute bottom-20 right-16 w-10 h-10 text-paradise-yellow animate-float-delayed fill-paradise-yellow" />
      <Sparkles className="absolute top-24 right-20 w-8 h-8 text-white/60 animate-bounce-gentle" />
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10" style={{ border: "4px solid white" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-7 h-7 text-paradise-purple animate-bounce-gentle" />
          <span className="font-display font-bold text-xl text-paradise-purple">My Paradise English</span>
          <Sparkles className="w-7 h-7 text-paradise-purple animate-bounce-gentle" />
        </div>
        <div className="text-5xl mb-2">🌴</div>
        <h1 className="font-display font-bold text-3xl text-paradise-coral mb-1">Student Portal</h1>
        <ZH size="1em">學生入口</ZH>
        <p className="font-body text-muted-foreground mt-3 mb-1 text-sm">Enter your student code to continue!</p>
        <ZH>請輸入你的學生密碼！</ZH>
        <input className="w-full px-5 py-4 rounded-2xl font-display font-bold text-xl text-center tracking-widest uppercase outline-none transition-all duration-200 mb-4 mt-5" style={{ border: error ? "3px solid #f87171" : "3px solid hsl(var(--paradise-sky)/0.5)", background: error ? "#fef2f2" : "hsl(var(--paradise-sky)/0.07)" }} type="text" placeholder="e.g. ELSA123" value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} maxLength={20} autoFocus />
        <button onClick={handleLogin} disabled={loading || !code.trim()} className="w-full py-4 rounded-2xl font-display font-bold text-xl text-white transition-all duration-200 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl active:translate-y-0" style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)), hsl(var(--paradise-purple)))", boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}>
          {loading ? "Checking... ✨" : "Enter Portal →"}
          {!loading && <ZHwhite size="0.7em">進入入口</ZHwhite>}
        </button>
        {error && <p className="mt-4 text-red-500 font-body text-sm">{error}</p>}
        <p className="mt-6 text-xs text-muted-foreground font-body">Don't know your code? Message us on Line! 💬</p>
        <ZH size="0.75em">不知道密碼嗎？在Line上傳訊息給我們！</ZH>
      </div>
    </div>
  );
};

const WorldNoticeModal = ({ onConfirm, dontShowAgain, setDontShowAgain }: { onConfirm: () => void; dontShowAgain: boolean; setDontShowAgain: (v: boolean) => void }) => (
  <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-auto flex flex-col" style={{ border: "3px solid hsl(var(--paradise-mint)/0.5)" }}>
      <div className="overflow-y-auto flex-1 px-6 py-6">
        <p className="font-body text-base leading-relaxed text-foreground/90 whitespace-pre-line">
          🐣 Welcome to the Creature World!{"\n"}
          A couple of quick things for parents:{"\n"}
          • Your child's pets and treats are saved on this device only — computer, phone, or tablet — so it's best to always play on the same one.{"\n"}
          • If this device's saved data is cleared, the pets start fresh — but that's okay, the fun starts all over again! 💛
        </p>
        <div style={{ fontFamily: "Noto Sans TC, sans-serif" }} className="mt-4 text-base leading-relaxed text-foreground/80 whitespace-pre-line">
          🐣 歡迎來到Creature World！{"\n"}
          給家長的小提醒：孩子的寵物和點心只會儲存在「同一個裝置」上（電腦、手機或平板）。建議使用同一個裝置，如果清除了這個裝置的紀錄，需要重新開始飼養寵物。重新體驗一次全新的樂趣！
        </div>
        <label className="mt-5 flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="w-5 h-5 rounded" style={{ accentColor: "hsl(var(--paradise-teal))" }} />
          <span className="font-body text-sm text-muted-foreground">Don't show this again / 不要再顯示</span>
        </label>
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <button onClick={onConfirm} className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl" style={{ background: "linear-gradient(135deg, hsl(var(--paradise-mint)), hsl(var(--paradise-teal)))", boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
          Got it!
          <div style={{ fontSize: "0.75em", opacity: 0.85 }}>我知道了</div>
        </button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { family, logout } = useAuth();
  const navigate = useNavigate();
  const [evals, setEvals] = useState<Record<string, EvalEntry[]>>({});
  const [modalStudent, setModalStudent] = useState<string | null>(null);
  const [expandedEvals, setExpandedEvals] = useState<Record<string, boolean>>({});
  const [worldNotice, setWorldNotice] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!family) return;
    fetchSheet("Evals").then(data => {
      const map: Record<string, EvalEntry[]> = {};
      data.filter((row: any) => row.code === family.code).forEach((row: any) => {
        const name = row.student;
        if (!map[name]) map[name] = [];
        map[name].push({ student: row.student, units: row.units || "", date: row.date || "", eval_text: row.eval_text || "" });
      });
      Object.keys(map).forEach(name => { map[name].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); });
      setEvals(map);
    }).catch(() => {});
  }, [family?.code]);

  if (!family) return null;
  const studentEvalsForModal = modalStudent ? (evals[modalStudent] || []) : [];
  const firstStudentEvals = evals[family.students[0]?.name] || [];
  const latestUnitsStr = firstStudentEvals[0]?.units || "";

  return (
    <div className="min-h-screen" style={{ background: "hsl(45 100% 98%)" }}>
      {modalStudent && <EvalsModal student={modalStudent} evals={studentEvalsForModal} onClose={() => setModalStudent(null)} />}
      {worldNotice && (
        <WorldNoticeModal
          dontShowAgain={dontShowAgain}
          setDontShowAgain={setDontShowAgain}
          onConfirm={() => {
            if (dontShowAgain) localStorage.setItem(`mpe_worldnotice_seen_${family.code}`, "true");
            navigate(worldNotice);
            setWorldNotice(null);
            setDontShowAgain(false);
          }}
        />
      )}
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-lg px-6 py-3 flex items-center justify-between" style={{ background: "linear-gradient(to right, hsl(var(--paradise-purple)/0.92), hsl(var(--paradise-sky)/0.92))" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-paradise-yellow animate-bounce-gentle" />
          <span className="font-display font-bold text-xl text-white drop-shadow-md">My Paradise English</span>
        </div>
        <button onClick={() => { logout(); navigate("/portal"); }} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-body font-semibold text-base px-4 py-2 rounded-full transition-all duration-200">
          <LogOut className="w-4 h-4" />
          <div><div>Sign Out</div><div style={{ fontSize: "0.75em", opacity: 0.8 }}>登出</div></div>
        </button>
      </nav>
      <div className="px-6 py-10 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)), hsl(var(--paradise-purple)), hsl(var(--paradise-sky)))" }}>
        <div className="bubble bubble-1 opacity-30" /><div className="bubble bubble-2 opacity-30" />
        <Star className="absolute top-6 left-10 w-7 h-7 text-paradise-yellow fill-paradise-yellow animate-float" />
        <Star className="absolute bottom-6 right-12 w-6 h-6 text-paradise-yellow fill-paradise-yellow animate-float-delayed" />
        <h1 className="font-display font-bold text-4xl text-white drop-shadow-lg mb-1 relative z-10">Welcome, {family.familyName}! 👋</h1>
        <div className="relative z-10" style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: "0.25rem" }}>歡迎，{family.familyName}！</div>
        <p className="font-body text-white/80 text-base relative z-10">My Paradise English Academy — Student Portal</p>
        <div className="relative z-10" style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.6)" }}>天堂英語學院 — 學生入口</div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-5">
        {/* EVALS HIDDEN — parents see vocab + world only. Fetch + latestUnitsStr kept so vocab still gets the current unit. Reversible: uncomment to restore. */}
        {/* {family.students.map((student) => {
          const studentEvals = evals[student.name] || [];
          const latestEval = studentEvals[0] || null;
          return (
            <div key={student.name} className="card-fun p-6">
              <div className="flex items-center gap-2 mb-1"><Trophy className="w-5 h-5 text-paradise-yellow" /><span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Latest Evaluation</span></div>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>最新評估</div>
              <h3 className="font-display font-bold text-xl text-paradise-coral mb-3">📋 {student.name}</h3>
              {latestEval ? (
                <>
                  <div className="font-body text-xs font-semibold text-paradise-purple mb-2">{latestEval.units}</div>
                  <p className={`font-body text-base leading-relaxed text-foreground/80 whitespace-pre-wrap ${expandedEvals[student.name] ? "" : "line-clamp-4"}`}>{latestEval.eval_text}</p>
                  <button onClick={() => setExpandedEvals(prev => ({ ...prev, [student.name]: !prev[student.name] }))} className="mt-1 font-body text-sm font-semibold transition-colors duration-200" style={{ color: "hsl(var(--paradise-teal))" }}>
                    {expandedEvals[student.name] ? "Show less ↑ · 收起" : "Read more ↓ · 繼續閱讀"}
                  </button>
                  <p className="font-body text-base text-muted-foreground mt-3">Received: {latestEval.date}</p>
                  <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.35)" }}>收到日期：{latestEval.date}</div>
                  {studentEvals.length > 0 && (
                    <button onClick={() => setModalStudent(student.name)} className="mt-4 w-full py-2 rounded-xl font-body font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5" style={{ background: "hsl(var(--paradise-sky)/0.12)", color: "hsl(var(--paradise-sky))", border: "1.5px solid hsl(var(--paradise-sky)/0.3)" }}>
                      See All Evals ({studentEvals.length}) →
                      <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.72em", opacity: 0.8 }}>查看所有評估</div>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="font-body text-base text-muted-foreground italic">No evaluation yet — check back after your next milestone! 🌟</p>
                  <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.88rem", color: "rgba(0,0,0,0.35)", marginTop: "0.25rem" }}>還沒有評估 — 下次里程碑後再來看看！</div>
                </>
              )}
            </div>
          );
        })} */}
        <div className="card-fun p-6 flex flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-start self-start gap-0.5">
            <div className="flex items-center gap-2"><Star className="w-5 h-5 text-paradise-yellow fill-paradise-yellow" /><span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Student World</span></div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginLeft: "1.75rem" }}>學生世界</div>
          </div>
          {family.students.map((student) => (
            <div key={student.name} className="text-center w-full">
              <button onClick={() => {
                const path = `/world/${family.code}/${student.name.toLowerCase()}`;
                if (localStorage.getItem(`mpe_worldnotice_seen_${family.code}`) === "true") {
                  navigate(path);
                } else {
                  setWorldNotice(path);
                }
              }} className="relative w-full py-4 px-6 rounded-2xl font-display font-bold text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl" style={{ background: "linear-gradient(135deg, hsl(var(--paradise-mint)), hsl(var(--paradise-teal)))", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", animation: "wobble 3s ease-in-out infinite" }}>
                <span className="absolute -top-2 left-3 text-lg" style={{ animation: "sparkleAnim 2s ease-in-out infinite" }}>✨</span>
                🌴 {student.name}'s World
                <span className="absolute -top-2 right-3 text-lg" style={{ animation: "sparkleAnim 2s ease-in-out infinite 0.7s" }}>✨</span>
              </button>
              <p className="font-body text-sm text-muted-foreground mt-1">Click to visit {student.name}'s creature world!</p>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.35)" }}>點擊進入{student.name}的動物世界！</div>
            </div>
          ))}
        </div>
        {/* Vocab Card */}
        {family.book && (
          <VocabCard bookNum={family.book} unitsStr={latestUnitsStr || "1"} />
        )}

        {/* HOMEWORK SECTION — commented out, keeping for later
        <div className="card-fun p-6 md:col-span-2" style={{ opacity: 0.7, position: "relative", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "rgba(150,150,150,0.30)", zIndex: 5 }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "linear-gradient(135deg, #b45309, #d97706)", color: "white", fontFamily: "'Noto Sans TC', sans-serif", fontSize: "1.6rem", fontWeight: 900, padding: "0.75rem 2.25rem", borderRadius: "1.25rem", boxShadow: "0 6px 24px rgba(0,0,0,0.25)", textAlign: "center", lineHeight: 1.4, letterSpacing: "0.03em" }}>
              Coming Soon!<br />即將推出！
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1"><BookOpen className="w-5 h-5 text-paradise-sky" /><span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Homework</span></div>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>作業</div>
          <h3 className="font-display font-bold text-2xl text-paradise-purple mb-1">📚 Submit Homework</h3>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.45)", marginBottom: "1rem" }}>提交作業</div>
          <textarea className="w-full min-h-28 px-4 py-3 rounded-2xl font-body text-base outline-none resize-y mb-3" style={{ border: "2px solid hsl(var(--paradise-sky)/0.4)", background: "#f1f5f9", cursor: "not-allowed" }} placeholder="Photo upload coming soon! · 照片上傳即將推出！" disabled />
          <button disabled className="py-3 px-6 rounded-2xl font-display font-bold text-white text-base disabled:opacity-50 cursor-not-allowed" style={{ background: "linear-gradient(135deg, hsl(var(--paradise-sky)), hsl(var(--paradise-purple)))" }}>
            Send to Teacher →
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.8em", opacity: 0.85 }}>傳給老師</div>
          </button>
        </div>
        */}
        <div className="card-fun p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-1"><Calendar className="w-5 h-5 text-paradise-coral" /><span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Schedule</span></div>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>課程時間</div>
          <h3 className="font-display font-bold text-2xl text-paradise-coral mb-1">📆 Time Off or Schedule Changes</h3>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.45)", marginBottom: "1rem" }}>請假或更改課程時間</div>
          <p className="font-body text-base text-foreground/75 leading-relaxed">Parents: Need to request time off or make a schedule change? Message Teacher Shirley directly on LINE! 💬</p>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.5)", marginTop: "0.5rem", lineHeight: 1.6 }}>家長：需要請假或更改課程時間嗎？直接在LINE上傳訊息給Shirley老師！💬</div>
        </div>
      </div>
      <div className="text-center py-6 font-body text-xs text-muted-foreground">
        🌴 My Paradise English Academy · Learning is an Adventure!
        <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.9em", marginTop: "0.2rem" }}>天堂英語學院 · 學習是一場冒險！</div>
      </div>
      <style>{`
        @keyframes wobble { 0%, 100% { transform: rotate(-1deg) scale(1); } 25% { transform: rotate(1.5deg) scale(1.02); } 50% { transform: rotate(-1deg) scale(1); } 75% { transform: rotate(1deg) scale(1.01); } }
        @keyframes sparkleAnim { 0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); } 50% { opacity: 0.4; transform: scale(1.4) rotate(20deg); } }
      `}</style>
    </div>
  );
};

const Portal = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Dashboard /> : <LoginScreen />;
};

export default Portal;
