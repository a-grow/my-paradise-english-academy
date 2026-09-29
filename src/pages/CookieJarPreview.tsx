/* PREVIEW ONLY (grammar-games): try the new CookieJar component. Saves NOTHING, no student data.
   Route /cookie-jar-preview (not linked from anywhere). The jar gets placed on the world page later,
   during the world template / world-page makeover. */
import { useState } from "react";
import CookieJar from "@/components/CookieJar";
import { FUN3D_CSS } from "@/components/Fun3D";

export default function CookieJarPreview() {
  const [count, setCount] = useState(6);
  const [muted, setMuted] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #7a5a63 0%, #6a4b45 45%, #3d2c26 100%)", padding: "28px 16px 40px", boxSizing: "border-box", fontFamily: "Fredoka, system-ui, sans-serif", color: "#f6ead2" }}>
      <style>{FUN3D_CSS}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", background: "rgba(84,64,50,.94)", border: "1px solid rgba(218,165,32,.38)", borderRadius: 32, padding: "26px 20px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, overflow: "hidden" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#e7b53c", fontWeight: 700 }}>Cookie jar preview</span>
          <button type="button" onClick={() => setMuted(m => !m)} style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: "#f6ead2", background: "rgba(255,240,210,.1)", border: "1px solid rgba(218,165,32,.38)", borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>
            Sound: {muted ? "off" : "on"}
          </button>
        </div>
        <CookieJar count={count} muted={muted} />
        <div style={{ fontFamily: "'Lilita One', 'Fredoka', sans-serif", fontSize: 30, marginTop: -4, textShadow: "0 3px 0 rgba(0,0,0,.3)" }}>
          {count} {count === 1 ? "treat" : "treats"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button className="f3-btn f3-green" onClick={() => setCount(c => c + 1)}>+1</button>
          <button className="f3-btn f3-yellow" onClick={() => setCount(c => c + 5)}>+5</button>
          <button className="f3-btn f3-yellow" onClick={() => setCount(c => c + 20)}>+20</button>
          <button className="f3-btn f3-cyan" disabled={count <= 0} onClick={() => setCount(c => Math.max(0, c - 1))}>Feed</button>
        </div>
      </div>
    </div>
  );
}
