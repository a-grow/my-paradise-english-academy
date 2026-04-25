import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MASTER_CODE = "1006";
const GAME_DURATION = 75;

const BOOKS = [
  {
    id: 1, label: "Book 1", color: "#f97316", glow: "rgba(249,115,22,0.6)", locked: false,
    units: [
      { id: 1, label: "Unit 1", embedUrl: "https://wordwall.net/embed/e8d6c6ee5d7d4ab78129e00e2617f0bf?themeId=22&templateId=45&fontStackId=0" },
    ],
  },
  { id: 2, label: "Book 2", color: "#a855f7", glow: "rgba(168,85,247,0.4)", locked: true, units: [] },
  { id: 3, label: "Book 3", color: "#10b981", glow: "rgba(16,185,129,0.4)", locked: true, units: [] },
  { id: 4, label: "Book 4", color: "#3b82f6", glow: "rgba(59,130,246,0.4)", locked: true, units: [] },
  { id: 5, label: "Book 5", color: "#ec4899", glow: "rgba(236,72,153,0.4)", locked: true, units: [] },
];

// ── LOCK ICON ─────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.5" fill="rgba(255,255,255,0.4)"/>
  </svg>
);

// ── STAR ──────────────────────────────────────────────────────────────────────
const Star = ({ size = 20, color = "#fbbf24" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={color} strokeLinejoin="round"/>
  </svg>
);

// ── WHIMSICAL ADVENTURE BACKGROUND ───────────────────────────────────────────
const AdventureBg = () => (
  <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
    <defs>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#87CEEB"/>
        <stop offset="60%" stopColor="#b8e4f7"/>
        <stop offset="100%" stopColor="#d4f0a0"/>
      </linearGradient>
      <linearGradient id="hillG1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5cb85c"/>
        <stop offset="100%" stopColor="#3d8b3d"/>
      </linearGradient>
      <linearGradient id="hillG2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6dbf6d"/>
        <stop offset="100%" stopColor="#4a9e4a"/>
      </linearGradient>
      <radialGradient id="sunG" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#fff176"/>
        <stop offset="60%" stopColor="#ffd600"/>
        <stop offset="100%" stopColor="#ffb300"/>
      </radialGradient>
    </defs>

    {/* Sky */}
    <rect width="800" height="600" fill="url(#skyG)"/>

    {/* Sun */}
    <circle cx="680" cy="80" r="48" fill="url(#sunG)" opacity="0.95"/>
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>(
      <line key={i}
        x1={680+Math.cos(deg*Math.PI/180)*54}
        y1={80+Math.sin(deg*Math.PI/180)*54}
        x2={680+Math.cos(deg*Math.PI/180)*70}
        y2={80+Math.sin(deg*Math.PI/180)*70}
        stroke="#ffd600" strokeWidth="3.5" strokeLinecap="round"
        style={{animation:`sunRay ${2+i*0.1}s ease-in-out infinite ${i*0.08}s`}}/>
    ))}

    {/* Rainbow */}
    {[0,1,2,3,4,5].map(i=>(
      <path key={i}
        d={`M ${50+i*8} 320 Q 400 ${-80-i*12} ${750-i*8} 320`}
        fill="none"
        stroke={["#ff6b6b","#ffa500","#ffd700","#90ee90","#87ceeb","#dda0dd"][i]}
        strokeWidth="8" strokeOpacity="0.4" strokeLinecap="round"/>
    ))}

    {/* Clouds */}
    {[
      {x:80, y:60, s:1.1, d:18},
      {x:290,y:38, s:0.85,d:24},
      {x:490,y:65, s:1.0, d:20},
      {x:165,y:108,s:0.7, d:22},
    ].map((c,i)=>(
      <g key={i} style={{animation:`cloudDrift ${c.d}s ease-in-out infinite ${i*3}s`}}>
        <ellipse cx={c.x} cy={c.y} rx={55*c.s} ry={22*c.s} fill="white" opacity="0.92"/>
        <ellipse cx={c.x-20*c.s} cy={c.y-10*c.s} rx={28*c.s} ry={20*c.s} fill="white" opacity="0.92"/>
        <ellipse cx={c.x+18*c.s} cy={c.y-12*c.s} rx={24*c.s} ry={18*c.s} fill="white" opacity="0.92"/>
        <ellipse cx={c.x} cy={c.y-6*c.s} rx={38*c.s} ry={22*c.s} fill="white" opacity="0.95"/>
      </g>
    ))}

    {/* Back hills */}
    <ellipse cx="150" cy="480" rx="280" ry="160" fill="#7ed47e" opacity="0.5"/>
    <ellipse cx="650" cy="500" rx="260" ry="150" fill="#6dbf6d" opacity="0.5"/>

    {/* Mid hill */}
    <path d="M-10 600 Q100 380 280 420 Q420 460 560 390 Q680 340 810 420 L810 600 Z" fill="url(#hillG2)"/>

    {/* Front hill */}
    <path d="M-10 600 Q150 460 350 490 Q500 510 650 470 Q730 450 810 490 L810 600 Z" fill="url(#hillG1)"/>

    {/* Ground */}
    <rect x="0" y="545" width="800" height="60" fill="#5cb85c"/>
    <rect x="0" y="558" width="800" height="8" fill="#4a9e4a" opacity="0.5"/>

    {/* Flowers left */}
    {[[60,548],[95,552],[130,546],[42,555]].map(([x,y],i)=>(
      <g key={i}>
        <line x1={x} y1={y} x2={x} y2={y+18} stroke="#3d8b3d" strokeWidth="2.5"/>
        <circle cx={x} cy={y} r={7} fill={["#ff6b6b","#ffd700","#ff9de2","#ff6b6b"][i]}/>
        <circle cx={x} cy={y} r={3.5} fill="#fff176"/>
      </g>
    ))}

    {/* Flowers right */}
    {[[680,550],[715,546],[750,552],[770,548]].map(([x,y],i)=>(
      <g key={i}>
        <line x1={x} y1={y} x2={x} y2={y+18} stroke="#3d8b3d" strokeWidth="2.5"/>
        <circle cx={x} cy={y} r={7} fill={["#ffd700","#ff9de2","#ff6b6b","#ffd700"][i]}/>
        <circle cx={x} cy={y} r={3.5} fill="#fff176"/>
      </g>
    ))}

    {/* Trees */}
    {[[180,420],[620,410]].map(([x,y],i)=>(
      <g key={i}>
        <rect x={x-5} y={y+40} width="10" height="30" fill="#8B5E3C"/>
        <ellipse cx={x} cy={y+20} rx="30" ry="35" fill="#4a9e4a"/>
        <ellipse cx={x-8} cy={y+8} rx="20" ry="25" fill="#5cb85c"/>
        <ellipse cx={x+8} cy={y+5} rx="18" ry="22" fill="#5cb85c"/>
      </g>
    ))}

    {/* Butterflies */}
    {[
      {x:320,y:190,d:4,  dl:0,   c:"#ff9de2"},
      {x:500,y:230,d:3.5,dl:1.2, c:"#ffd700"},
      {x:200,y:270,d:5,  dl:0.8, c:"#87ceeb"},
    ].map((b,i)=>(
      <g key={i} style={{animation:`flutter ${b.d}s ease-in-out infinite ${b.dl}s`}}>
        <ellipse cx={b.x-10} cy={b.y} rx="12" ry="8" fill={b.c} opacity="0.8" transform={`rotate(-20,${b.x-10},${b.y})`}/>
        <ellipse cx={b.x+10} cy={b.y} rx="12" ry="8" fill={b.c} opacity="0.8" transform={`rotate(20,${b.x+10},${b.y})`}/>
        <ellipse cx={b.x-8} cy={b.y+6} rx="8" ry="5" fill={b.c} opacity="0.6" transform={`rotate(20,${b.x-8},${b.y+6})`}/>
        <ellipse cx={b.x+8} cy={b.y+6} rx="8" ry="5" fill={b.c} opacity="0.6" transform={`rotate(-20,${b.x+8},${b.y+6})`}/>
        <line x1={b.x} y1={b.y-6} x2={b.x-4} y2={b.y-14} stroke="#666" strokeWidth="1" strokeLinecap="round"/>
        <line x1={b.x} y1={b.y-6} x2={b.x+4} y2={b.y-14} stroke="#666" strokeWidth="1" strokeLinecap="round"/>
      </g>
    ))}

    {/* Birds */}
    {[[350,55],[380,46],[412,58]].map(([x,y],i)=>(
      <path key={i} d={`M${x} ${y} Q${x+8} ${y-7} ${x+16} ${y}`}
        fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"
        style={{animation:`birdFloat ${3+i*0.5}s ease-in-out infinite ${i*0.4}s`}}/>
    ))}

    <style>{`
      @keyframes cloudDrift{0%,100%{transform:translateX(0)}50%{transform:translateX(18px)}}
      @keyframes sunRay{0%,100%{opacity:0.7}50%{opacity:1}}
      @keyframes flutter{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-12px) rotate(3deg)}66%{transform:translateY(-5px) rotate(-3deg)}}
      @keyframes birdFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    `}</style>
  </svg>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
const GamePage = () => {
  const { code, studentName } = useParams<{ code: string; studentName: string }>();
  const navigate = useNavigate();

  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem("mpe_music") !== "off");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.3"));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isMaster = code === MASTER_CODE;
if(isMaster){
  Object.keys(localStorage)
    .filter(k=>k.startsWith("mpe_game_claimed_"))
    .forEach(k=>localStorage.removeItem(k));
}
const todayKey = `mpe_game_claimed_${code}_${studentName}_${new Date().toDateString()}`;

  useEffect(() => {
    if (!isMaster && localStorage.getItem(todayKey)) setClaimed(true);
  }, []);

// Music
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/game-music.mp3");
      audioRef.current.loop = true;
    }
    if (musicOn) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const target = volume;
      const fade = setInterval(() => {
        v = Math.min(v + target/40, target);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= target) clearInterval(fade);
      }, 50);
      return () => { clearInterval(fade); audioRef.current?.pause(); };
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };

  const playSfx = useCallback((type: "click" | "unlock" | "celebrate") => {
    try {
      const ctx = getCtx();
      const play = (freq: number, time: number, dur: number, vol = 0.15, wave: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = wave; osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, ctx.currentTime + time);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur + 0.01);
      };
      const sounds: Record<string, () => void> = {
        click:     () => { play(440, 0, 0.06); play(660, 0.07, 0.08); },
        unlock:    () => { [523,659,784,1047].forEach((f,i) => play(f, i*0.08, 0.15, 0.18)); },
        celebrate: () => { [523,659,784,1047,1319,1568].forEach((f,i) => play(f, i*0.09, 0.28, 0.2)); },
      };
      sounds[type]?.();
    } catch {}
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setCanClaim(false);
    playSfx("click");
    if (timerRef.current) clearInterval(timerRef.current);
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      if (elapsed >= GAME_DURATION) {
        clearInterval(timerRef.current!);
        setCanClaim(true);
        playSfx("unlock");
      }
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleClaim = () => {
    if (!canClaim || claimed) return;
    setClaimed(true);
    setShowCelebration(true);
    localStorage.setItem(todayKey, "true");
    playSfx("celebrate");
    setTimeout(() => setShowCelebration(false), 3500);
  };

  const handleBookClick = (book: typeof BOOKS[0]) => {
    if (book.locked) return;
    playSfx("click");
    setSelectedBook(book.id);
    setSelectedUnit(null);
    setGameStarted(false);
    setCanClaim(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleUnitClick = (unit: { id: number; label: string; embedUrl: string }) => {
    setSelectedUnit(unit.id);
    startGame();
  };

  const currentBook = BOOKS.find(b => b.id === selectedBook);
  const currentUnit = currentBook?.units.find(u => u.id === selectedUnit);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'Fredoka One', cursive", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes fadeUp{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes popIn{0%{transform:scale(0) rotate(-8deg);opacity:0}65%{transform:scale(1.1) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes wiggleBtn{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-6px) rotate(-2deg)}75%{transform:translateY(-6px) rotate(2deg)}}
        @keyframes sparkle{0%,100%{opacity:0.4;transform:scale(0.8) rotate(0deg)}50%{opacity:1;transform:scale(1.5) rotate(25deg)}}
        @keyframes claimWiggle{0%,100%{transform:scale(1)}20%{transform:scale(1.06) rotate(-1.5deg)}40%{transform:scale(1.06) rotate(1.5deg)}60%{transform:scale(1.03)}80%{transform:scale(1.03)}}
        @keyframes celebPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes goldGlow{0%,100%{box-shadow:0 0 20px rgba(251,191,36,0.5),0 8px 32px rgba(0,0,0,0.15)}50%{box-shadow:0 0 45px rgba(251,191,36,0.9),0 8px 32px rgba(0,0,0,0.15)}}
        .glass{background:rgba(255,255,255,0.6);backdrop-filter:blur(16px);border:2px solid rgba(255,255,255,0.85);border-radius:1.75rem;box-shadow:0 8px 32px rgba(0,0,0,0.1)}
      `}</style>

      <AdventureBg />

      {/* CELEBRATION OVERLAY */}
      {showCelebration && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "linear-gradient(135deg,#fff9e6,#fffde7)",
            borderRadius: "2.5rem", padding: "2.5rem 2rem",
            textAlign: "center", maxWidth: 320, width: "100%",
            border: "3px solid #fbbf24",
            boxShadow: "0 0 60px rgba(251,191,36,0.6), 0 20px 60px rgba(0,0,0,0.25)",
            animation: "celebPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both"
          }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ animation: `sparkle ${1+i*0.2}s ease-in-out infinite ${i*0.15}s` }}>
                  <Star size={36} color="#fbbf24"/>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "2.8rem", color: "#f97316", lineHeight: 1 }}>
              Amazing!
            </div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.4rem", color: "#333", margin: "0.5rem 0" }}>
              You earned 2 treats!
            </div>
            <div style={{ fontFamily: "Nunito,sans-serif", fontSize: "1rem", color: "#888" }}>
              太棒了！繼續加油！
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(14px)",
        padding: "0.55rem 1rem", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
      }}>
        <button onClick={() => navigate(`/world/${code}/${studentName}`)} style={{
          background: "linear-gradient(135deg,#f97316,#fbbf24)",
          border: "none", color: "white",
          fontFamily: "'Fredoka One',cursive", fontSize: "0.95rem",
          padding: "0.38rem 1.1rem", borderRadius: "999px", cursor: "pointer",
          boxShadow: "0 3px 10px rgba(249,115,22,0.35)"
        }}>Back</button>
        <span style={{ color: "#333", fontFamily: "'Fredoka One',cursive", fontSize: "1.15rem" }}>
          My Paradise English
        </span>
        <div style={{position:"relative"}}>
          <button onClick={()=>{
            setMusicOn(m=>{
              localStorage.setItem("mpe_music",!m?"on":"off");
              return !m;
            });
          }} style={{
            background: musicOn ? "linear-gradient(135deg,#4ade80,#22d3ee)" : "rgba(0,0,0,0.08)",
            border: "none", borderRadius: "999px", padding: "0.35rem 0.9rem",
            fontFamily: "'Fredoka One',cursive", fontSize: "0.85rem",
            color: musicOn ? "white" : "#888", cursor: "pointer",
            boxShadow: musicOn ? "0 3px 10px rgba(74,222,128,0.4)" : "none",
            transition: "all 0.3s"
          }}>
            {musicOn ? "Music On" : "Music Off"}
          </button>
          {musicOn && (
            <div style={{
              position:"absolute", top:"110%", right:0,
              background:"rgba(255,255,255,0.95)",
              borderRadius:"999px", padding:"0.3rem 0.75rem",
              boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
              border:"1.5px solid rgba(0,0,0,0.06)",
              display:"flex", alignItems:"center", gap:"0.4rem",
              whiteSpace:"nowrap", zIndex:200
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#4ade80"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e=>{
                  const v=parseFloat(e.target.value);
                  setVolume(v);
                  localStorage.setItem("mpe_volume",String(v));
                  if(audioRef.current) audioRef.current.volume=v;
                }}
                style={{width:70,height:5,borderRadius:3,
                  WebkitAppearance:"none",appearance:"none" as any,
                  background:`linear-gradient(to right, #4ade80 ${volume*100}%, rgba(0,0,0,0.15) ${volume*100}%)`,
                  outline:"none",cursor:"pointer"}}/>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 600, margin: "0 auto", padding: "80px 14px 60px" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease-out" }}>
          <div style={{
            fontFamily: "'Fredoka One',cursive",
            fontSize: "clamp(2.4rem,7vw,3.4rem)",
            color: "#f97316",
            textShadow: "0 3px 0 rgba(0,0,0,0.06), 0 6px 20px rgba(249,115,22,0.2)",
            lineHeight: 1.1
          }}>
            Game Time!
          </div>
          <div style={{
            fontFamily: "Nunito,sans-serif", fontSize: "1.05rem",
            color: "#555", marginTop: "0.4rem", fontWeight: 700
          }}>
            Pick your book and play to earn treats!
          </div>
        </div>

        {/* BOOK BUTTONS */}
        <div className="glass" style={{ padding: "1.25rem", marginBottom: "1rem", animation: "fadeUp 0.6s ease-out" }}>
          <div style={{
            fontFamily: "'Fredoka One',cursive", fontSize: "1.3rem",
            color: "#333", marginBottom: "1rem", textAlign: "center"
          }}>
            Choose Your Book
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.6rem" }}>
            {BOOKS.map((book, i) => (
              <button key={book.id} onClick={() => handleBookClick(book)}
                disabled={book.locked}
                style={{
                  position: "relative",
                  padding: "0.9rem 0.25rem",
                  background: selectedBook === book.id
                    ? `linear-gradient(135deg,${book.color},${book.color}cc)`
                    : book.locked ? "rgba(0,0,0,0.06)"
                    : `linear-gradient(135deg,${book.color}cc,${book.color}88)`,
                  border: selectedBook === book.id
                    ? `2.5px solid ${book.color}`
                    : book.locked ? "1.5px solid rgba(0,0,0,0.08)"
                    : `2px solid ${book.color}88`,
                  borderRadius: "1.2rem",
                  cursor: book.locked ? "not-allowed" : "pointer",
                  boxShadow: selectedBook === book.id
                    ? `0 0 24px ${book.glow}, 0 4px 16px rgba(0,0,0,0.12)`
                    : book.locked ? "none" : `0 4px 12px ${book.glow}`,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "0.35rem",
                  opacity: book.locked ? 0.4 : 1,
                  transition: "all 0.2s",
                  animation: !book.locked && selectedBook !== book.id
                    ? `float3 ${2.5+i*0.3}s ease-in-out infinite ${i*0.2}s` : "none",
                }}
                onMouseEnter={e => { if (!book.locked) (e.currentTarget as HTMLElement).style.transform = "scale(1.08) translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                {book.locked && <div style={{ position: "absolute", top: 3, right: 3 }}><LockIcon /></div>}
                <div style={{
                  fontFamily: "'Fredoka One',cursive", fontSize: "0.8rem",
                  color: selectedBook === book.id || !book.locked ? "white" : "#999",
                  textShadow: book.locked ? "none" : "0 1px 4px rgba(0,0,0,0.25)",
                  lineHeight: 1.2, textAlign: "center"
                }}>
                  Book<br />{book.id}
                </div>
                {!book.locked && (
                  <div style={{ animation: `sparkle ${1.5+i*0.3}s ease-in-out infinite` }}>
                    <Star size={13} color={selectedBook === book.id ? "white" : book.color}/>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* UNIT SELECTOR */}
        {selectedBook && currentBook && !currentBook.locked && (
          <div className="glass" style={{ padding: "1.25rem", marginBottom: "1rem", animation: "popIn 0.4s ease-out" }}>
            <div style={{
              fontFamily: "'Fredoka One',cursive", fontSize: "1.3rem",
              color: "#333", marginBottom: "1rem", textAlign: "center"
            }}>
              Choose Your Unit
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {currentBook.units.map(unit => (
                <button key={unit.id} onClick={() => handleUnitClick(unit)} style={{
                  padding: "1rem 1.5rem",
                  background: selectedUnit === unit.id
                    ? `linear-gradient(135deg,${currentBook.color},${currentBook.color}cc)`
                    : `linear-gradient(135deg,${currentBook.color}99,${currentBook.color}66)`,
                  border: `2.5px solid ${selectedUnit === unit.id ? currentBook.color : currentBook.color+"88"}`,
                  borderRadius: "1.25rem", cursor: "pointer",
                  boxShadow: `0 6px 20px ${currentBook.glow}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  animation: selectedUnit !== unit.id ? "wiggleBtn 2s ease-in-out infinite" : "none",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                >
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "1.25rem", color: "white", textShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
                    {unit.label}
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.3)", borderRadius: "999px",
                    padding: "0.3rem 1rem",
                    fontFamily: "'Fredoka One',cursive", fontSize: "0.95rem", color: "white"
                  }}>
                    Whack-a-mole!
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME IFRAME */}
        {gameStarted && currentUnit && (
          <div style={{ animation: "fadeUp 0.5s ease-out" }}>
            <div style={{
              borderRadius: "1.5rem", overflow: "hidden",
              border: "3px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              marginBottom: "0.85rem", background: "white"
            }}>
              <iframe
                src={currentUnit.embedUrl}
                style={{ width: "100%", height: 480, border: "none", display: "block" }}
                allowFullScreen title="Game"
              />
            </div>

            {/* CLAIM — only appears after 40s */}
            {canClaim && (
              <button onClick={handleClaim} disabled={claimed} style={{
                width: "100%", padding: "1.15rem",
                background: claimed
                  ? "rgba(0,0,0,0.08)"
                  : "linear-gradient(135deg,#fbbf24,#f97316)",
                border: claimed
                  ? "2px solid rgba(0,0,0,0.08)"
                  : "2px solid rgba(255,215,0,0.5)",
                borderRadius: "999px",
                cursor: claimed ? "not-allowed" : "pointer",
                fontFamily: "'Fredoka One',cursive", fontSize: "1.5rem",
                color: claimed ? "#aaa" : "white",
                animation: claimed ? "none" : "claimWiggle 1s ease-in-out infinite, goldGlow 1.5s ease-in-out infinite",
                transition: "all 0.3s",
              }}>
                {claimed ? "Come back tomorrow for more treats!" : "Great job! Claim your treat!"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
