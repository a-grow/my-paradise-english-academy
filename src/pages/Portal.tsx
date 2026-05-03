import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, BookOpen, Calendar, LogOut, Trophy, X, ChevronDown, ChevronUp } from "lucide-react";

const SHEETDB_URL = "https://sheetdb.io/api/v1/9ctz2zljbz6wx";

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

// ---- EVALS MODAL ----
type EvalEntry = { student: string; units: string; date: string; eval_text: string };

const EvalsModal = ({ student, evals, onClose }: { student: string; evals: EvalEntry[]; onClose: () => void }) => {
  const [openIdx, setOpenIdx] = useState<number>(0); // first one open by default

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        style={{ border: "3px solid hsl(var(--paradise-sky)/0.3)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-paradise-yellow" />
              <span className="font-display font-bold text-lg text-paradise-coral">{student}'s Evaluations</span>
            </div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.72rem", color: "rgba(0,0,0,0.4)", marginLeft: "1.75rem" }}>
              {student}的評估記錄
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Eval list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
          {evals.map((ev, idx) => (
            <div
              key={idx}
              className="rounded-2xl border cursor-pointer transition-all duration-200"
              style={{
                border: openIdx === idx ? "2px solid hsl(var(--paradise-sky)/0.6)" : "2px solid #f1f5f9",
                background: openIdx === idx ? "hsl(var(--paradise-sky)/0.05)" : "white"
              }}
              onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
            >
              {/* Eval header row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-body font-semibold text-sm text-foreground">{ev.units}</div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5">{ev.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)))" }}>
                      Latest
                    </span>
                  )}
                  {openIdx === idx
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </div>

              {/* Eval body */}
              {openIdx === idx && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                  <p className="font-body text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {ev.eval_text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${SHEETDB_URL}?sheet=Families`);
      const data = await res.json();
      const success = login(code, data);
      if (!success) setError("That code doesn't match any family. Please try again! 🌴");
    } catch {
      setError("Connection problem. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-paradise flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
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
        <h1 className="font-display font-bold text-3xl text-paradise-coral mb-1">Family Portal</h1>
        <ZH size="1em">家庭入口</ZH>
        <p className="font-body text-muted-foreground mt-3 mb-1 text-sm">Enter your family code to continue!</p>
        <ZH>請輸入你的家庭密碼！</ZH>

        <input
          className="w-full px-5 py-4 rounded-2xl font-display font-bold text-xl text-center tracking-widest uppercase outline-none transition-all duration-200 mb-4 mt-5"
          style={{ border: error ? "3px solid #f87171" : "3px solid hsl(var(--paradise-sky)/0.5)", background: error ? "#fef2f2" : "hsl(var(--paradise-sky)/0.07)" }}
          type="text"
          placeholder="e.g. ELSA123"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          maxLength={20}
          autoFocus
        />

        <button
          onClick={handleLogin}
          disabled={loading || !code.trim()}
          className="w-full py-4 rounded-2xl font-display font-bold text-xl text-white transition-all duration-200 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
          style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)), hsl(var(--paradise-purple)))", boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
        >
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

const Dashboard = () => {
  const { family, logout } = useAuth();
  const navigate = useNavigate();
  const [hwText, setHwText] = useState("");
  const [hwSent, setHwSent] = useState(false);
  const [hwLoading, setHwLoading] = useState(false);
  // evals: map of studentName -> sorted array of eval entries (newest first)
  const [evals, setEvals] = useState<Record<string, EvalEntry[]>>({});
  const [modalStudent, setModalStudent] = useState<string | null>(null);

  useEffect(() => {
    if (!family) return;
    fetch(`${SHEETDB_URL}?sheet=Evals`)
      .then(r => r.json())
      .then(data => {
        const map: Record<string, EvalEntry[]> = {};
        // Column names match the Evals tab: code, student, class, units, date, eval_text
        data
          .filter((row: any) => row.code === family.code)
          .forEach((row: any) => {
            const name = row.student;
            if (!map[name]) map[name] = [];
            map[name].push({
              student: row.student,
              units: row.units || "",
              date: row.date || "",
              eval_text: row.eval_text || ""
            });
          });
        // Sort each student's evals newest first
        Object.keys(map).forEach(name => {
          map[name].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        setEvals(map);
      }).catch(() => { });
  }, [family?.code]);

  if (!family) return null;

  const submitHomework = async () => {
    if (!hwText.trim()) return;
    setHwLoading(true);
    try {
      await fetch(`${SHEETDB_URL}?sheet=Homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [{ familyCode: family.code, familyName: family.familyName, hwText, date: new Date().toLocaleDateString("en-US"), status: "New" }] })
      });
      setHwSent(true); setHwText("");
    } catch { alert("Couldn't send — please try again."); }
    setHwLoading(false);
  };

  const studentEvalsForModal = modalStudent ? (evals[modalStudent] || []) : [];
  const [expandedEvals, setExpandedEvals] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen" style={{ background: "hsl(45 100% 98%)" }}>

      {/* Evals Modal */}
      {modalStudent && (
        <EvalsModal
          student={modalStudent}
          evals={studentEvalsForModal}
          onClose={() => setModalStudent(null)}
        />
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-lg px-6 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(to right, hsl(var(--paradise-purple)/0.92), hsl(var(--paradise-sky)/0.92))" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-paradise-yellow animate-bounce-gentle" />
          <span className="font-display font-bold text-xl text-white drop-shadow-md">My Paradise English</span>
        </div>
        <button onClick={() => { logout(); navigate("/portal"); }}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-body font-semibold text-base px-4 py-2 rounded-full transition-all duration-200">
          <LogOut className="w-4 h-4" />
          <div>
            <div>Sign Out</div>
            <div style={{ fontSize: "0.75em", opacity: 0.8 }}>登出</div>
          </div>
        </button>
      </nav>

      {/* Hero */}
      <div className="px-6 py-10 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)), hsl(var(--paradise-purple)), hsl(var(--paradise-sky)))" }}>
        <div className="bubble bubble-1 opacity-30" />
        <div className="bubble bubble-2 opacity-30" />
        <Star className="absolute top-6 left-10 w-7 h-7 text-paradise-yellow fill-paradise-yellow animate-float" />
        <Star className="absolute bottom-6 right-12 w-6 h-6 text-paradise-yellow fill-paradise-yellow animate-float-delayed" />
        <h1 className="font-display font-bold text-4xl text-white drop-shadow-lg mb-1 relative z-10">
          Welcome, {family.familyName} family! 👋
        </h1>
        <div className="relative z-10" style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: "0.25rem" }}>
          歡迎，{family.familyName}家！
        </div>
        <p className="font-body text-white/80 text-base relative z-10">My Paradise English Academy — Family Portal</p>
        <div className="relative z-10" style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.6)" }}>
          天堂英語學院 — 家庭入口
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">

        {family.students.map((student) => {
          const studentEvals = evals[student.name] || [];
          const latestEval = studentEvals[0] || null;

          return (
            <div key={student.name} className="card-fun p-6">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-paradise-yellow" />
                <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Latest Evaluation</span>
              </div>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>最新評估</div>
              <h3 className="font-display font-bold text-xl text-paradise-coral mb-3">📋 {student.name}</h3>

              {latestEval ? (
                <>
                  <div className="font-body text-xs font-semibold text-paradise-purple mb-2">{latestEval.units}</div>

                  <p className={`font-body text-base leading-relaxed text-foreground/80 whitespace-pre-wrap ${expandedEvals[student.name] ? "" : "line-clamp-4"}`}>
                    {latestEval.eval_text}
                  </p>
                  <button
                    onClick={() => setExpandedEvals(prev => ({ ...prev, [student.name]: !prev[student.name] }))}
                    className="mt-1 font-body text-sm font-semibold transition-colors duration-200"
                    style={{ color: "hsl(var(--paradise-teal))" }}
                  >
                    {expandedEvals[student.name] ? "Show less ↑ · 收起" : "Read more ↓ · 繼續閱讀"}
                  </button>

                  <p className="font-body text-base text-muted-foreground mt-3">Received: {latestEval.date}</p>
                  <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.35)" }}>收到日期：{latestEval.date}</div>

                  {studentEvals.length > 0 && (
                    <button
                      onClick={() => setModalStudent(student.name)}
                      className="mt-4 w-full py-2 rounded-xl font-body font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: "hsl(var(--paradise-sky)/0.12)", color: "hsl(var(--paradise-sky))", border: "1.5px solid hsl(var(--paradise-sky)/0.3)" }}
                    >
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
        })}

        {/* World buttons */}
        <div className="card-fun p-6 flex flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-start self-start gap-0.5">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-paradise-yellow fill-paradise-yellow" />
              <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Student World</span>
            </div>
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginLeft: "1.75rem" }}>學生世界</div>
          </div>
          {family.students.map((student) => (
            <div key={student.name} className="text-center w-full">
              <button
                onClick={() => navigate(`/world/${family.code}/${student.name.toLowerCase()}`)}
                className="relative w-full py-4 px-6 rounded-2xl font-display font-bold text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, hsl(var(--paradise-mint)), hsl(var(--paradise-teal)))", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", animation: "wobble 3s ease-in-out infinite" }}
              >
                <span className="absolute -top-2 left-3 text-lg" style={{ animation: "sparkleAnim 2s ease-in-out infinite" }}>✨</span>
                🌴 {student.name}'s World
                <span className="absolute -top-2 right-3 text-lg" style={{ animation: "sparkleAnim 2s ease-in-out infinite 0.7s" }}>✨</span>
              </button>
              <p className="font-body text-sm text-muted-foreground mt-1">Click to visit {student.name}'s creature world!</p>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.35)" }}>點擊進入{student.name}的動物世界！</div>
            </div>
          ))}
        </div>

        {/* Homework */}
        <div className="card-fun p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-paradise-sky" />
            <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Homework</span>
          </div>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>作業</div>
          <h3 className="font-display font-bold text-2xl text-paradise-purple mb-1">📚 Submit Homework</h3>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.45)", marginBottom: "1rem" }}>提交作業</div>
          <textarea
            className="w-full min-h-28 px-4 py-3 rounded-2xl font-body text-base outline-none transition-all duration-200 resize-y mb-3"
            style={{ border: "2px solid hsl(var(--paradise-sky)/0.4)" }}
            placeholder="Paste or type your child's homework here... / 在這裡輸入孩子的作業..."
            value={hwText}
            onChange={(e) => { setHwText(e.target.value); setHwSent(false); }}
          />
          <button onClick={submitHomework} disabled={hwLoading || !hwText.trim()}
            className="py-3 px-6 rounded-2xl font-display font-bold text-white text-base transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(var(--paradise-sky)), hsl(var(--paradise-purple)))" }}>
            {hwLoading ? "Sending... ✨" : "Send to Teacher →"}
            <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.8em", opacity: 0.85 }}>{hwLoading ? "傳送中..." : "傳給老師"}</div>
          </button>
          {hwSent && (
            <>
              <p className="font-body text-base mt-3 text-paradise-teal">✅ Homework sent! We'll review it soon.</p>
              <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.88rem", color: "rgba(0,0,0,0.45)", marginTop: "0.2rem" }}>✅ 作業已送出！我們很快會看。</div>
            </>
          )}
        </div>

        {/* Schedule */}
        <div className="card-fun p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-paradise-coral" />
            <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Schedule</span>
          </div>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.92rem", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>課程時間</div>
          <h3 className="font-display font-bold text-2xl text-paradise-coral mb-1">📆 Time Off or Schedule Changes</h3>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.45)", marginBottom: "1rem" }}>請假或更改課程時間</div>
          <p className="font-body text-base text-foreground/75 leading-relaxed">
            Need to request time off or make a schedule change? Message Teacher Shirley directly on LINE! 💬
          </p>
          <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.95rem", color: "rgba(0,0,0,0.5)", marginTop: "0.5rem", lineHeight: 1.6 }}>
            需要請假或更改課程時間嗎？直接在LINE上傳訊息給Shirley老師！💬
          </div>
        </div>

      </div>

      <div className="text-center py-6 font-body text-xs text-muted-foreground">
        🌴 My Paradise English Academy · Learning is an Adventure!
        <div style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: "0.9em", marginTop: "0.2rem" }}>天堂英語學院 · 學習是一場冒險！</div>
      </div>

      <style>{`
        @keyframes wobble {
          0%, 100% { transform: rotate(-1deg) scale(1); }
          25% { transform: rotate(1.5deg) scale(1.02); }
          50% { transform: rotate(-1deg) scale(1); }
          75% { transform: rotate(1deg) scale(1.01); }
        }
        @keyframes sparkleAnim {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.4; transform: scale(1.4) rotate(20deg); }
        }
      `}</style>
    </div>
  );
};

const Portal = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Dashboard /> : <LoginScreen />;
};

export default Portal;
