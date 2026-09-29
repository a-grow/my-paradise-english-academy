import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { addTreats } from "@/lib/cloudSave";
import GrammarGameBar from "@/components/GrammarGameBar";
import WinCelebration from "@/components/WinCelebration";
import LoseScreen from "@/components/LoseScreen";
import type { GameStats } from "@/components/GrammarGameBar";

export default function GrammarGrab() {
  const { code, studentName, level } = useParams();
  const navigate = useNavigate();
  const kidCode = (code || "").toUpperCase();
  const kidName = (studentName || "").toLowerCase();

  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [tryKey, setTryKey] = useState(0);
  const claimed = useRef(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);
  const sendMute = (m: boolean) =>
    frameRef.current?.contentWindow?.postMessage({ type: "MPE_MUTE", muted: m }, "*");

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data && e.data.type === "MPE_GRAB_WIN" && !claimed.current) {
        claimed.current = true;
        // Mirror Grammar.tsx: read jar from localStorage, +2, write back, push to cloud.
        const jarKey = `mpe_jar_${kidCode}_${kidName}`;
        const current = parseInt(localStorage.getItem(jarKey) || "0");
        const newTotal = current + 2;
        localStorage.setItem(jarKey, String(newTotal));
        // ONE JAR: send only "+2" - the database adds it (never the device's whole number).
        addTreats(kidCode, kidName, 2).then(total => { if (typeof total === "number") localStorage.setItem(jarKey, String(total)); });
        // let the game's own ending (fireworks / chest / last grab) play, then show the celebration
        window.setTimeout(() => {
          setWon(true);
          frameRef.current?.contentWindow?.postMessage({ type: "MPE_FADE_OUT", ms: 400 }, "*"); // quick fade of the game's music
        }, 2000);
      }
      if (e.data && e.data.type === "MPE_STATS") {
        const d = e.data;
        setStats({ coins: Number(d.coins) || 0, lives: Number(d.lives) || 0, solved: Number(d.solved) || 0, total: Number(d.total) || 0 });
      }
      if (e.data && e.data.type === "MPE_GRAB_LOSE" && !claimed.current) {
        setLost(true);
        frameRef.current?.contentWindow?.postMessage({ type: "MPE_FADE_OUT", ms: 400 }, "*"); // game music out, game-over sting in
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [kidCode, kidName]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>
      <GrammarGameBar
        onBack={() => navigate(`/grammar-hub/${kidCode}/${kidName}${level ? `/${level}` : ""}`)}
        muted={muted}
        stats={stats}
        onToggleMute={() => {
          const m = !muted;
          setMuted(m);
          sendMute(m);
          frameRef.current?.contentWindow?.focus(); // keep arrow keys working after the click
        }}
      />
      <iframe
        key={tryKey}
        ref={frameRef}
        onLoad={() => { frameRef.current?.contentWindow?.focus(); sendMute(muted); }}
        src={`/Teacher_Andy_Grab_game.html?level=${level || 1}`}
        title="Teacher Andy Grab"
        style={{ width: "100%", flex: 1, minHeight: 0, border: "none", display: "block" }}
      />
      {won && (
        <WinCelebration
          coinsWon={stats?.coins ?? 0}
          startTotal={0}
          muted={muted}
          fanfare
          onChooseGame={() => navigate(`/grammar-hub/${kidCode}/${kidName}${level ? `/${level}` : ""}`)}
          onReturnToWorld={() => navigate(`/world/${kidCode}/${kidName}`)}
        />
      )}
      {lost && !won && (
        <LoseScreen
          muted={muted}
          onTryAgain={() => { setLost(false); setStats(null); setTryKey((k) => k + 1); }}
          onChooseGame={() => navigate(`/grammar-hub/${kidCode}/${kidName}${level ? `/${level}` : ""}`)}
          onReturnToWorld={() => navigate(`/world/${kidCode}/${kidName}`)}
        />
      )}
    </div>
  );
}
