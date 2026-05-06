import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameTest from "./GameTest";

const MASTER_CODE = "1006";
const TREATS_PER_CLEAR = 3;
// const DAILY_TREAT_CAP = 9; // commented out for testing
const DAILY_TREAT_CAP = 999999;

const GamePage = () => {
  const { code, studentName } = useParams<{ code: string; studentName: string }>();
  const navigate = useNavigate();
  const isMaster = code === MASTER_CODE;
  const today = new Date().toDateString();

  const jarKey = `mpe_jar_${code}_${studentName}`;
  const capKey = `mpe_arcade_cap_${code}_${studentName}_${today}`;
  const comboKey = (unitId: number, gameId: string) =>
    `mpe_arcade_${code}_${studentName}_u${unitId}_${gameId}_${today}`;

  const getTreatsEarnedToday = () =>
    parseInt(localStorage.getItem(capKey) || "0");

  const getClaimedCombos = (): Set<string> => {
    if (isMaster) return new Set();
    const claimed = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const prefix = `mpe_arcade_${code}_${studentName}_`;
      const suffix = `_${today}`;
      if (k.startsWith(prefix) && k.endsWith(suffix) && !k.includes("_cap_")) {
        const comboId = k.slice(prefix.length, k.length - suffix.length);
        claimed.add(comboId);
      }
    }
    return claimed;
  };

  const [claimedCombos, setClaimedCombos] = useState<Set<string>>(getClaimedCombos);
  const [treatsEarnedToday, setTreatsEarnedToday] = useState(getTreatsEarnedToday);
  const [showCelebration, setShowCelebration] = useState(false);
  const [musicOn, setMusicOn] = useState(() => localStorage.getItem("mpe_music") !== "off");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("mpe_volume") || "0.18"));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const treatsCappedToday = false; // cap disabled for testing

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/game-music.mp3");
      audioRef.current.loop = true;
    }
    if (musicOn) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      let v = 0;
      const target = volume * 0.25;
      const fade = setInterval(() => {
        v = Math.min(v + target / 40, target);
        if (audioRef.current) audioRef.current.volume = v;
        if (v >= target) clearInterval(fade);
      }, 50);
      return () => { clearInterval(fade); audioRef.current?.pause(); };
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  const playCelebrate = useCallback(() => {
    try {
      if (!ctxRef.current)
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = ctxRef.current;
      const play = (freq: number, time: number, dur: number, vol = 0.18) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, ctx.currentTime + time);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur + 0.01);
      };
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => play(f, i * 0.09, 0.28, 0.2));
    } catch {}
  }, []);

  const handleClaim = useCallback((unitId: number, gameId: string) => {
    if (isMaster) {
      playCelebrate();
      setShowCelebration(true);
      return;
    }

    const key = comboKey(unitId, gameId);
    const comboId = `u${unitId}_${gameId}`;

    // Guards
    if (localStorage.getItem(key)) return;
    const earnedSoFar = getTreatsEarnedToday();
    // if (earnedSoFar >= DAILY_TREAT_CAP) return; // cap disabled for testing

    // Write to localStorage
    localStorage.setItem(key, "1");
    const newTotal = earnedSoFar + TREATS_PER_CLEAR;
    localStorage.setItem(capKey, String(newTotal));
    const current = parseInt(localStorage.getItem(jarKey) || "0");
    localStorage.setItem(jarKey, String(current + TREATS_PER_CLEAR));

    // Update state — both updates trigger GameTest re-render with fresh claimState
    setClaimedCombos(prev => new Set([...prev, comboId]));
    setTreatsEarnedToday(newTotal);

    playCelebrate();
    setShowCelebration(true);
  }, [isMaster, capKey, jarKey, playCelebrate]);

  if (!code || !studentName) return null;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* MUSIC TOGGLE */}
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 200,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4
      }}>
        <button onClick={() => {
          setMusicOn(m => {
            localStorage.setItem("mpe_music", !m ? "on" : "off");
            return !m;
          });
        }} style={{
          background: musicOn ? "linear-gradient(135deg,#4ade80,#22d3ee)" : "rgba(0,0,0,0.45)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          borderRadius: "999px", padding: "0.32rem 0.85rem",
          fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: "0.85rem",
          color: "white", cursor: "pointer",
          boxShadow: musicOn ? "0 3px 10px rgba(74,222,128,0.4)" : "none",
          transition: "all 0.3s"
        }}>
          {musicOn ? "🎵 On" : "🔇 Off"}
        </button>
        {musicOn && (
          <input type="range" min="0" max="1" step="0.05" value={volume}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              localStorage.setItem("mpe_volume", String(v));
              if (audioRef.current) audioRef.current.volume = v * 0.25;
            }}
            style={{
              width: 70, height: 5, borderRadius: 3,
              WebkitAppearance: "none", appearance: "none" as any,
              background: `linear-gradient(to right, #4ade80 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
              outline: "none", cursor: "pointer"
            }}
          />
        )}
      </div>

      {/* ARCADE */}
      <GameTest
        onClaim={handleClaim}
        claimedCombos={claimedCombos}
        treatsCappedToday={treatsCappedToday}
      />

      {/* CELEBRATION OVERLAY */}
      {showCelebration && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "linear-gradient(135deg,#fff9e6,#fffde7)",
            borderRadius: "2.5rem", padding: "2.5rem 2rem",
            textAlign: "center", maxWidth: 320, width: "100%",
            border: "3px solid #fbbf24",
            boxShadow: "0 0 60px rgba(251,191,36,0.6), 0 20px 60px rgba(0,0,0,0.3)",
            animation: "celebPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both"
          }}>
            <style>{`@keyframes celebPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}`}</style>
            <div style={{ fontSize: "4rem", marginBottom: "0.25rem" }}>🍪</div>
            <div style={{
              fontFamily: "'Nunito',sans-serif", fontWeight: 900,
              fontSize: "2.2rem", color: "#f97316", lineHeight: 1
            }}>+3 Treats!</div>
            <div style={{
              fontFamily: "'Nunito',sans-serif", fontWeight: 700,
              fontSize: "0.95rem", color: "#888", margin: "0.5rem 0 1.5rem"
            }}>
              太棒了！Go feed your turtle! 🐢
            </div>
            <button onClick={() => setShowCelebration(false)} style={{
              width: "100%", padding: "0.85rem",
              background: "linear-gradient(135deg,#4ade80,#22d3ee)",
              border: "none", borderRadius: "999px", color: "white",
              fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: "1.1rem",
              cursor: "pointer", marginBottom: "0.6rem",
              boxShadow: "0 6px 20px rgba(74,222,128,0.5)"
            }}>
              Keep Playing! 🎮
            </button>
            <button onClick={() => navigate(`/world/${code}/${studentName}`)} style={{
              width: "100%", padding: "0.85rem",
              background: "linear-gradient(135deg,#f97316,#fbbf24)",
              border: "none", borderRadius: "999px", color: "white",
              fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(249,115,22,0.5)"
            }}>
              🌊 Back to {studentName.charAt(0).toUpperCase() + studentName.slice(1)}'s World!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
