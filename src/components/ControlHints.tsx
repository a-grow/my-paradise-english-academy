// CONTROL HINTS (Andy 2026-10-06 23:32): every game shows its controls as PICTURES only - no English or Chinese text.
// Key caps (arrows / space bar) + a mouse whose left button blinks. Small dark pill; never catches clicks.
// Hidden on touch devices (phones / iPads have their own on-screen controls).
// KeyCaps = the same pictures without the pill (also used big on the How to Play screens, 2026-10-07).
import type { CSSProperties } from "react";

export type HintKey = "left" | "up" | "down" | "right" | "space";
const ROT: Record<Exclude<HintKey, "space">, number> = { up: 0, right: 90, down: 180, left: 270 };
const ORDER: HintKey[] = ["left", "up", "down", "right", "space"];

const css = `
.ch-pill{position:absolute;z-index:40;display:flex;align-items:center;gap:8px;pointer-events:none;background:rgba(0,30,45,.55);border-radius:999px;padding:7px 18px}
.ch-caps{display:flex;align-items:center;gap:8px}
.ch-key{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9px;background:linear-gradient(180deg,#3f6f86,#1f4d61);
 border:2px solid #d4eef7;box-shadow:0 4px 0 #0b3141;flex:none}
.ch-key.space{width:96px}
.ch-gap{width:12px;flex:none}
.ch-mouse{display:block;flex:none;filter:drop-shadow(0 3px 0 #0b3141)}
.ch-lmb{animation:ch-click 1.2s ease-in-out infinite}
.ch-caps.big{gap:10px}
.ch-caps.big .ch-key{width:58px;height:58px;border-radius:12px;border-width:3px;box-shadow:0 6px 0 #0b3141}
.ch-caps.big .ch-key.space{width:140px}
.ch-caps.big .ch-key svg{transform:scale(1.45)}
.ch-caps.big .ch-mouse{transform:scale(1.4);margin:0 8px}
@keyframes ch-click{0%,60%,100%{opacity:1}75%{opacity:.25}}
@media (prefers-reduced-motion: reduce){.ch-lmb{animation:none}}
`;

export function KeyCaps({ keys, mouse = false, big = false }: { keys: HintKey[]; mouse?: boolean; big?: boolean }) {
  const ks = ORDER.filter(k => keys.includes(k));
  return (
    <span className={"ch-caps" + (big ? " big" : "")}>
      <style>{css}</style>
      {ks.map(k => k === "space"
        ? <span key={k} className="ch-key space">
            <svg width="56" height="20" viewBox="0 0 56 20"><path d="M6 6 V14 H50 V6" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        : <span key={k} className="ch-key">
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 5 L18 15 H4 Z" fill="#fff" transform={`rotate(${ROT[k]} 11 11)`} /></svg>
          </span>)}
      {mouse && ks.length > 0 && <i className="ch-gap" />}
      {mouse && (
        <svg className="ch-mouse" width="30" height="42" viewBox="0 0 30 42">
          <rect x="2" y="2" width="26" height="38" rx="13" fill="#fff" stroke="#0b4a63" strokeWidth="3" />
          <path d="M15 2 V17 M2 17 H28" stroke="#0b4a63" strokeWidth="3" />
          <path className="ch-lmb" d="M15 3.5 V15.5 H3.5 V15 A11.5 11.5 0 0 1 15 3.5 Z" fill="#ffd84a" />
        </svg>
      )}
    </span>
  );
}

export default function ControlHints({ keys, mouse = false, style, className }: {
  keys: HintKey[]; mouse?: boolean; style?: CSSProperties; className?: string;
}) {
  if (typeof window !== "undefined" && "ontouchstart" in window) return null;
  return (
    <div className={"ch-pill" + (className ? " " + className : "")} style={style} aria-hidden="true">
      <KeyCaps keys={keys} mouse={mouse} />
    </div>
  );
}

// common spots
export const HINT_BOTTOM: CSSProperties = { left: "50%", bottom: 14, transform: "translateX(-50%)" };
export const HINT_TOP: CSSProperties = { left: "50%", top: 64, transform: "translateX(-50%)" };      // under the 56px game bar
export const HINT_TOP_RIGHT: CSSProperties = { right: 14, top: 64 };
export const HINT_BOTTOM_LEFT: CSSProperties = { left: 14, bottom: 14 };
