import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { saveJarToCloud } from "@/lib/cloudSave";
import GrammarGameBar from "@/components/GrammarGameBar";

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
        saveJarToCloud(kidCode, kidName, newTotal);
        setWon(true);
      }
      if (e.data && e.data.type === "MPE_GRAB_LOSE" && !claimed.current) {
        setLost(true);
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
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)", color: "#fff", textAlign: "center", gap: 24,
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 700 }}>You won 2 treats!</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => navigate(`/grammar-hub/${kidCode}/${kidName}${level ? `/${level}` : ""}`)}
              style={{
                fontSize: 22, padding: "14px 28px", borderRadius: 16, border: "none",
                background: "#fde047", color: "#003", fontWeight: 700, cursor: "pointer",
              }}
            >
              Choose Game
            </button>
            <button
              onClick={() => navigate(`/world/${kidCode}/${kidName}`)}
              style={{
                fontSize: 22, padding: "14px 28px", borderRadius: 16, border: "none",
                background: "#5ce0ff", color: "#003", fontWeight: 700, cursor: "pointer",
              }}
            >
              Return to World
            </button>
          </div>
        </div>
      )}
      {lost && !won && (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)", color: "#fff", textAlign: "center", gap: 24,
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 700 }}>Out of hearts!</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => { setLost(false); setTryKey((k) => k + 1); }}
              style={{
                fontSize: 22, padding: "14px 28px", borderRadius: 16, border: "none",
                background: "#86efac", color: "#003", fontWeight: 700, cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/grammar-hub/${kidCode}/${kidName}${level ? `/${level}` : ""}`)}
              style={{
                fontSize: 22, padding: "14px 28px", borderRadius: 16, border: "none",
                background: "#fde047", color: "#003", fontWeight: 700, cursor: "pointer",
              }}
            >
              Choose Game
            </button>
            <button
              onClick={() => navigate(`/world/${kidCode}/${kidName}`)}
              style={{
                fontSize: 22, padding: "14px 28px", borderRadius: 16, border: "none",
                background: "#5ce0ff", color: "#003", fontWeight: 700, cursor: "pointer",
              }}
            >
              Return to World
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
