// TURN SIDEWAYS screen (Andy 2026-10-15): every kid page is built wide, so an iPad / phone held UPRIGHT gets one
// friendly full screen asking the kid to turn it. Kid pages only (worlds, vocab + grammar games, Album, Puzzle);
// landing page, blog, portal and Teacher HQ stay as they are. Touch devices only (a narrow desktop window never sees it).
// While it shows, games FREEZE (PAUSE.on for vocab games, MPE_PAUSE message to the grammar game iframes - re-sent every
// 0.4s so a game that loads behind the screen freezes too). Display only: saves nothing, changes nothing underneath.
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PAUSE } from "@/lib/pause";

const KID_PAGES = ["/world/", "/ocean/", "/dino/", "/savanna/", "/snowy/", "/taiwan/", "/visit/", "/world-test/", "/game/", "/grammar-", "/album/", "/puzzle/"];

const isTouch = () => typeof window !== "undefined" && ("ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0);
const tellGames = (on: boolean) => {
  document.querySelectorAll("iframe").forEach(f => { try { f.contentWindow?.postMessage({ type: "MPE_PAUSE", on }, "*"); } catch { /* */ } });
};

export default function TurnSideways() {
  const { pathname } = useLocation();
  const [upright, setUpright] = useState(false);

  useEffect(() => {
    if (!isTouch()) return;
    const check = () => setUpright(window.innerHeight > window.innerWidth);
    const later = () => { check(); window.setTimeout(check, 350); }; // iOS updates the size a moment after turning
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", later);
    return () => { window.removeEventListener("resize", check); window.removeEventListener("orientationchange", later); };
  }, []);

  const kid = KID_PAGES.some(p => pathname.startsWith(p));
  const shown = upright && kid;
  // kid pages: no long-press selection / copy bubble / save-image pop-up, no double-tap zoom delay (index.css html.mpe-kid)
  useEffect(() => { document.documentElement.classList.toggle("mpe-kid", kid); }, [kid]);

  useEffect(() => {
    PAUSE.on = shown;
    tellGames(shown);
    if (!shown) return;
    const t = window.setInterval(() => tellGames(true), 400);
    return () => { window.clearInterval(t); PAUSE.on = false; tellGames(false); };
  }, [shown]);

  if (!shown) return null;
  const phone = Math.min(window.screen.width, window.screen.height) < 600;

  return (
    <div className="ts-root" role="dialog" aria-label="Turn your device sideways">
      <style>{CSS}</style>
      <div className="ts-box">
        <svg className="ts-dev" viewBox="0 0 120 170" aria-hidden="true">
          <rect x="6" y="6" width="108" height="158" rx="16" fill="#2b3550" stroke="#ffd34d" strokeWidth="5" />
          <rect x="16" y="18" width="88" height="128" rx="6" fill="#7fd0ff" />
          <circle cx="82" cy="40" r="11" fill="#ffe36b" />
          <circle cx="60" cy="155" r="4" fill="#ffd34d" />
        </svg>
        <div className="ts-word">Turn your {phone ? "phone" : "iPad"} sideways!</div>
      </div>
    </div>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Titan+One&display=swap');
.ts-root{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#1d3f66 0%,#0b1c33 75%);touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.ts-box{display:flex;flex-direction:column;align-items:center;gap:56px;padding:0 24px;text-align:center}
.ts-dev{width:clamp(110px,26vw,210px);height:auto;animation:ts-turn 3.4s ease-in-out infinite;transform-origin:50% 50%;filter:drop-shadow(0 0 18px rgba(255,211,77,.35))}
@keyframes ts-turn{0%{transform:rotate(0);opacity:0}8%{opacity:1}22%{transform:rotate(0)}52%{transform:rotate(-90deg)}86%{transform:rotate(-90deg);opacity:1}100%{transform:rotate(-90deg);opacity:0}}
.ts-word{font-family:'Titan One','Fredoka',sans-serif;font-size:clamp(30px,8vw,60px);line-height:1.15;color:#ffd34d;text-shadow:0 3px 0 #b8741a,0 6px 14px rgba(0,0,0,.5)}
`;
