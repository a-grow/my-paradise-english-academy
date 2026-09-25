import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

// Shared top bar for the 4 grammar games: Back (left) + fullscreen + sound on/off (right).
// Stats (COINS / LIVES / SOLVED) will go in the middle later.
type Props = {
  onBack: () => void;
  muted: boolean;
  onToggleMute: () => void;
};

const btn: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1.5px solid rgba(255,255,255,0.25)",
  color: "#fff",
  borderRadius: 999,
  cursor: "pointer",
  fontFamily: "Fredoka, sans-serif",
  fontWeight: 700,
};
const iconBtn: CSSProperties = {
  ...btn, width: 44, height: 44, padding: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
};

// Fullscreen helpers (webkit versions for Safari / iPad). iPhone has no fullscreen -> button hidden.
type FsDoc = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };
const fsDoc = () => document as FsDoc;
const fsSupported = () => !!(fsDoc().fullscreenEnabled || fsDoc().webkitFullscreenEnabled);
const fsActive = () => !!(fsDoc().fullscreenElement || fsDoc().webkitFullscreenElement);

function toggleFullscreen() {
  const d = fsDoc();
  const el = document.documentElement as FsEl;
  try {
    if (fsActive()) {
      if (d.exitFullscreen) d.exitFullscreen().catch(() => {});
      else d.webkitExitFullscreen?.();
    } else {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else el.webkitRequestFullscreen?.();
    }
  } catch { /* ignore */ }
  // give the keyboard back to the game after the click
  document.querySelector("iframe")?.contentWindow?.focus();
}

export default function GrammarGameBar({ onBack, muted, onToggleMute }: Props) {
  const [isFs, setIsFs] = useState(fsActive());
  useEffect(() => {
    const onChange = () => setIsFs(fsActive());
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  return (
    <div
      style={{
        height: 56, flex: "0 0 auto", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 12px", background: "#1f2937",
      }}
    >
      <button onClick={onBack} style={{ ...btn, fontSize: 18, padding: "6px 16px" }}>
        {"←"} Back
      </button>
      <div style={{ display: "flex", gap: 10 }}>
        {fsSupported() && (
          <button
            onClick={toggleFullscreen}
            aria-label={isFs ? "Exit full screen" : "Full screen"}
            style={iconBtn}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isFs ? (
                <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
              ) : (
                <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
              )}
            </svg>
          </button>
        )}
        <button
          onClick={onToggleMute}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          style={iconBtn}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5z" fill="#fff" />
            {muted ? (
              <>
                <line x1="16" y1="9" x2="22" y2="15" />
                <line x1="22" y1="9" x2="16" y2="15" />
              </>
            ) : (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
