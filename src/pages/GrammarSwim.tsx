import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { saveJarToCloud } from "@/lib/cloudSave";

export default function GrammarSwim() {
  const { code, studentName } = useParams();
  const navigate = useNavigate();
  const kidCode = (code || "").toUpperCase();
  const kidName = (studentName || "").toLowerCase();

  const [won, setWon] = useState(false);
  const claimed = useRef(false);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data && e.data.type === "MPE_SWIM_WIN" && !claimed.current) {
        claimed.current = true;
        // Mirror Grammar.tsx: read jar from localStorage, +2, write back, push to cloud.
        const jarKey = `mpe_jar_${kidCode}_${kidName}`;
        const current = parseInt(localStorage.getItem(jarKey) || "0");
        const newTotal = current + 2;
        localStorage.setItem(jarKey, String(newTotal));
        saveJarToCloud(kidCode, kidName, newTotal);
        setWon(true);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [kidCode, kidName]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <iframe
        src="/Teacher_Andy_Swim_game.html"
        title="Teacher Andy Swim"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
      {won && (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)", color: "#fff", textAlign: "center", gap: 24,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700 }}>You won 2 treats! 🎉</div>
          <button
            onClick={() => navigate(`/world/${kidCode}/${kidName}`)}
            style={{
              fontSize: 22, padding: "14px 28px", borderRadius: 16, border: "none",
              background: "#5ce0ff", color: "#003", fontWeight: 700, cursor: "pointer",
            }}
          >
            Back to World
          </button>
        </div>
      )}
    </div>
  );
}
