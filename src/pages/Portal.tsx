import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, BookOpen, Calendar, LogOut, Trophy } from "lucide-react";

const SHEETDB_URL = "https://sheetdb.io/api/v1/9ctz2zljbz6wx";

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
        <p className="font-body text-muted-foreground mb-6 text-sm">Enter your family code to continue!</p>

        <input
          className="w-full px-5 py-4 rounded-2xl font-display font-bold text-xl text-center tracking-widest uppercase outline-none transition-all duration-200 mb-4"
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
        </button>

        {error && <p className="mt-4 text-red-500 font-body text-sm">{error}</p>}
        <p className="mt-6 text-xs text-muted-foreground font-body">Don't know your code? Message us on Line! 💬</p>
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
  const [request, setRequest] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [evals, setEvals] = useState<Record<string, { text: string; date: string }>>({});

  useEffect(() => {
    if (!family) return;
    fetch(`${SHEETDB_URL}?sheet=Evals`)
      .then(r => r.json())
      .then(data => {
        const map: Record<string, { text: string; date: string }> = {};
        data.filter((row: any) => row.familyCode === family.code)
            .forEach((row: any) => { map[row.studentName] = { text: row.evalText, date: row.date }; });
        setEvals(map);
      }).catch(() => {});
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

  const submitRequest = async () => {
    if (!request.trim()) return;
    try {
      await fetch(`${SHEETDB_URL}?sheet=Requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [{ familyCode: family.code, familyName: family.familyName, request, date: new Date().toLocaleDateString("en-US"), status: "New" }] })
      });
      setRequestSent(true); setRequest("");
    } catch { alert("Couldn't send — please try again."); }
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(45 100% 98%)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-lg px-6 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(to right, hsl(var(--paradise-purple)/0.92), hsl(var(--paradise-sky)/0.92))" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-paradise-yellow animate-bounce-gentle" />
          <span className="font-display font-bold text-xl text-white drop-shadow-md">My Paradise English</span>
        </div>
        <button onClick={() => { logout(); navigate("/portal"); }}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-body font-semibold text-sm px-4 py-2 rounded-full transition-all duration-200">
          <LogOut className="w-4 h-4" /> Sign Out
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
        <p className="font-body text-white/80 text-sm relative z-10">My Paradise English Academy — Family Portal</p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">

        {family.students.map((student) => (
          <div key={student.name} className="card-fun p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-paradise-yellow" />
              <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Latest Evaluation</span>
            </div>
            <h3 className="font-display font-bold text-xl text-paradise-coral mb-3">📋 {student.name}</h3>
            {evals[student.name] ? (
              <>
                <p className="font-body text-sm leading-relaxed text-foreground/80">{evals[student.name].text}</p>
                <p className="font-body text-xs text-muted-foreground mt-3">Received: {evals[student.name].date}</p>
              </>
            ) : (
              <p className="font-body text-sm text-muted-foreground italic">No evaluation yet — check back after your next milestone! 🌟</p>
            )}
          </div>
        ))}

        {/* World buttons */}
        <div className="card-fun p-6 flex flex-col items-center justify-center gap-5">
          <div className="flex items-center gap-2 self-start">
            <Star className="w-5 h-5 text-paradise-yellow fill-paradise-yellow" />
            <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Student World</span>
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
              <p className="font-body text-xs text-muted-foreground mt-2">Click to visit {student.name}'s creature world!</p>
            </div>
          ))}
        </div>

        {/* Homework */}
        <div className="card-fun p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-paradise-sky" />
            <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Homework</span>
          </div>
          <h3 className="font-display font-bold text-xl text-paradise-purple mb-4">📚 Submit Homework</h3>
          <textarea
            className="w-full min-h-28 px-4 py-3 rounded-2xl font-body text-sm outline-none transition-all duration-200 resize-y mb-3"
            style={{ border: "2px solid hsl(var(--paradise-sky)/0.4)" }}
            placeholder="Paste or type your child's homework here..."
            value={hwText}
            onChange={(e) => { setHwText(e.target.value); setHwSent(false); }}
          />
          <button onClick={submitHomework} disabled={hwLoading || !hwText.trim()}
            className="py-3 px-6 rounded-2xl font-display font-bold text-white text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(var(--paradise-sky)), hsl(var(--paradise-purple)))" }}>
            {hwLoading ? "Sending... ✨" : "Send to Teacher →"}
          </button>
          {hwSent && <p className="font-body text-sm mt-3 text-paradise-teal">✅ Homework sent! We'll review it soon.</p>}
        </div>

        {/* Schedule change */}
        <div className="card-fun p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-paradise-coral" />
            <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">Schedule</span>
          </div>
          <h3 className="font-display font-bold text-xl text-paradise-coral mb-4">📆 Request a Schedule Change</h3>
          <input
            className="w-full px-4 py-3 rounded-2xl font-body text-sm outline-none transition-all duration-200 mb-3"
            style={{ border: "2px solid hsl(var(--paradise-coral)/0.4)" }}
            type="text"
            placeholder="e.g. Can we move Tuesday's class to Thursday this week?"
            value={request}
            onChange={(e) => { setRequest(e.target.value); setRequestSent(false); }}
          />
          <button onClick={submitRequest} disabled={!request.trim()}
            className="py-3 px-6 rounded-2xl font-display font-bold text-white text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(var(--paradise-coral)), hsl(var(--paradise-pink)))" }}>
            Send Request →
          </button>
          {requestSent && <p className="font-body text-sm mt-3 text-paradise-teal">✅ Request sent! We'll get back to you on Line. 💬</p>}
        </div>

      </div>

      <div className="text-center py-6 font-body text-xs text-muted-foreground">
        🌴 My Paradise English Academy · Learning is an Adventure!
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
