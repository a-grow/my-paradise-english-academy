import { useEffect, useRef, useState } from "react";
import { FUN3D_CSS, Word3D, word3DDone } from "@/components/Fun3D";

// Win screen for the grammar games: big 3D "Great Job!" pops in letter by letter, then the won coins fly up into the
// coin-total pill (sparkles + rising pop sound). Andy starts hopping when the FIRST coin lands; after the last one he gives a
// thumbs-up, "You won 2 treats!" glows, the coin row twinkles, and the buttons wake up.
// TREATS (Andy 2026-10-04): the treat row sits beside the coin row; the treats fly to the BOTTOM-LEFT corner at the same
// time as the coins fly to the pill, and vanish in a bright yellow flash (puzzle pieces will do the same later).
// VISUAL ONLY: it saves nothing. startTotal = the kid's coin total before this win (0 until the coin jar exists).
type Props = {
  coinsWon: number;
  startTotal: number | null;  // null = no coin pill (the vocab games have no coins yet)
  muted: boolean;
  treatsTotal?: number | null; // NOT SHOWN since 2026-10-04 (jar removed) - kept so the game pages need no change
  treatsWon?: number;          // treats this win paid (grammar: 2)
  fanfare?: boolean;   // play Run's win fanfare when the screen opens (Swim/Dig/Grab; Run already had it at the flag)
  onChooseGame: () => void;
  onReturnToWorld: () => void;
};

const ART = "/celebration/";
const IMG = { cheer: ART + "andy_cheer.webp", blink: ART + "andy_blink.webp", thumbs: ART + "andy_thumbs.webp" };
const SFX = ART + "rising_pop.mp3";        // coins flying up
const WIN_SFX = ART + "win_pop.mp3";       // the moment the win screen pops up
const FANFARE = ART + "win_fanfare.mp3";   // Run's victory fanfare
const TREAT_IMG = "/worlds/ui/treat.webp";  // the new treat (same as the world page)
const TREAT_HTML = `<img src="${TREAT_IMG}" alt="" style="display:block;width:100%;height:100%;object-fit:contain">`;

// Load the art as soon as a game page loads, so Andy is ready the moment a kid wins.
if (typeof window !== "undefined") {
  Object.values(IMG).forEach((src) => { const i = new Image(); i.src = src; });
}

const COIN_IMG = "/worlds/ui/coin.webp";  // the world page's NEW coin (Andy 2026-10-03)
const COIN_SVG = `<img src="${COIN_IMG}" alt="" style="display:block;width:100%;height:100%;object-fit:contain">`; // flying coin (name kept)
const STAR_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block"><path d="M12 0 L14.3 9.7 L24 12 L14.3 14.3 L12 24 L9.7 14.3 L0 12 L9.7 9.7Z" fill="#fff8c4"/></svg>';

const MAX_FLYERS = 14;   // never more than 14 coins on screen, however many were won
const GREAT = "Great Job!";
const GREAT_DELAY = 150;  // ms before the first letter pops
const START = word3DDone(GREAT, GREAT_DELAY) + 80; // coins leave right after the last letter lands (~1.4s)

// twinkle dots/stars around the coin row (percent of the row box), fixed so they never jump around
const TWINKLES = Array.from({ length: 20 }, (_, i) => {
  const a = (i / 20) * Math.PI * 2 + (i % 3) * 0.13;
  return { left: 50 + Math.cos(a) * (58 + ((i * 37) % 17)), top: 50 + Math.sin(a) * (72 + ((i * 53) % 29)),
    size: 7 + ((i * 7) % 9), delay: (i * 173) % 1400, star: i % 3 === 0 };
});
// the treat row's twinkles: their OWN pseudo-random spots/sizes/timing, so they never mirror the coin row's
const TWINKLES2 = (() => {
  let seed = 97;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 18 }, () => {
    const a = rnd() * Math.PI * 2, d = 0.55 + rnd() * 0.5;
    return { left: 50 + Math.cos(a) * 66 * d * 1.25, top: 50 + Math.sin(a) * 80 * d * 1.25, size: 6 + Math.floor(rnd() * 10),
      delay: Math.floor(rnd() * 1600), star: rnd() < 0.3 };
  });
})();
const GAP = 62;          // ms between coins
const POP = 260;         // ms burst outward
const FLIGHT = 620;      // ms curve up to the pill

function CoinFill() {
  return (
    <img src={COIN_IMG} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
  );
}

const CSS = `
.wc-root { position:fixed; inset:0; z-index:60; --u:min(1vh,0.75vw);
  /* text + buttons sit centered; only when the screen is too narrow for Andy, everything slides right just enough */
  --shift:max(0px, calc(var(--u) * 45 + 165px - 50vw)); overflow:hidden; color:#fff;
  background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); font-family:Fredoka, sans-serif; }
.wc-center { position:absolute; inset:0; padding-left:calc(var(--shift) * 2); display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:20px; text-align:center; }
.wc-great { font-size:max(58px, calc(var(--u) * 10.5)); }
.wc-title { font-size:max(44px, calc(var(--u) * 5.6)); font-weight:700; text-shadow:0 4px 0 rgba(0,0,0,.35);
  animation:wc-popIn .5s .95s cubic-bezier(.3,1.7,.5,1) both; }
.wc-glowtxt.on { animation:wc-glow 1.6s ease-in-out infinite; }
.wc-row { position:relative; display:flex; align-items:center; gap:16px; font-size:max(64px, calc(var(--u) * 8.4));
  font-weight:700; color:#ffd84a; text-shadow:0 3px 0 rgba(0,0,0,.35); animation:wc-popIn .5s 1.1s cubic-bezier(.3,1.7,.5,1) both;
  isolation:isolate; }
.wc-row.shine::before { content:""; position:absolute; left:-32%; right:-32%; top:-50%; bottom:-50%; z-index:-1; border-radius:50%;
  background:radial-gradient(closest-side, rgba(255,214,80,.55), rgba(255,214,80,0)); animation:wc-halo 1.8s ease-in-out infinite; }
.wc-tw { position:absolute; inset:0; pointer-events:none; }
.wc-tw i { position:absolute; border-radius:50%; opacity:0; animation:wc-twinkle 1.4s ease-in-out infinite both;
  background:radial-gradient(circle, #fff 0%, #fff6b0 35%, rgba(255,210,80,0) 70%); }
.wc-tw i.st { border-radius:0; background:#fff8c4; filter:drop-shadow(0 0 4px #ffd84a);
  clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%); }
.wc-src { width:max(86px, calc(var(--u) * 11)); height:max(86px, calc(var(--u) * 11)); }
.wc-row.drain .wc-src { animation:wc-shake .15s linear infinite; }
.wc-rows { display:flex; align-items:center; justify-content:center; gap:max(150px, calc(var(--u) * 19)); margin:calc(var(--u) * 2.5) 0; }
.wc-row.t2 { animation-delay:1.2s; }
.wc-src img { display:block; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 3px 3px rgba(0,0,0,.35)); }
.wc-fly.wc-tfly { width:60px; height:60px; margin:-30px 0 0 -30px; }
.wc-plus { position:absolute; left:100%; margin-left:14px; top:50%; transform:translateY(-50%); color:#8dff5c;
  -webkit-text-stroke:2px #1e5c12; paint-order:stroke fill; text-shadow:0 3px 0 rgba(0,0,0,.4); opacity:0; white-space:nowrap; }
.wc-plus.go { animation:wc-plus 1.4s ease-out forwards; }
.wc-btns { display:flex; flex-direction:column; gap:22px; animation:wc-popIn .4s 1.25s both; }
.wc-btn { font-family:inherit; font-size:max(22px, calc(var(--u) * 2.8)); padding:.64em 1.3em; border-radius:16px; border:none;
  font-weight:700; color:#003; cursor:pointer; transition:opacity .25s, filter .25s; }
.wc-btn:disabled { opacity:.45; filter:grayscale(.6); cursor:default; }
.wc-btns.ready { animation:wc-ready .35s cubic-bezier(.3,1.7,.5,1); }

.wc-pill { position:absolute; top:18px; left:18px; height:52px; min-width:200px; padding:0 26px 0 64px; display:flex;
  align-items:center; justify-content:center; background:linear-gradient(#fffaf0, #f1dfbd); border-radius:999px;
  box-shadow:inset 0 -4px 0 rgba(160,110,50,.25), inset 0 3px 0 #fff, 0 4px 10px rgba(0,0,0,.45);
  font-weight:700; font-size:30px; color:#7a3e1d; letter-spacing:1px; font-variant-numeric:tabular-nums;
  opacity:0; transform:translateY(-20px); transition:opacity .35s, transform .35s cubic-bezier(.3,1.6,.5,1); z-index:2; }
.wc-pill.show { opacity:1; transform:none; }
.wc-pillcoin { position:absolute; left:-14px; top:50%; width:74px; height:74px; margin-top:-37px; }
.wc-flash { position:absolute; left:0; top:0; width:110px; height:110px; margin:-55px 0 0 -55px; border-radius:50%; pointer-events:none; z-index:7;
  background:radial-gradient(circle, #fff 0%, #fffbe0 16%, #ffef5a 38%, rgba(255,222,40,.6) 58%, rgba(255,210,0,0) 72%); }
.wc-treat { position:absolute; left:0; top:0; width:60px; height:auto; margin:-30px 0 0 -30px; pointer-events:none; z-index:6;
  filter:drop-shadow(0 3px 3px rgba(0,0,0,.4)); }

.wc-andy { position:absolute; right:calc(50% + var(--u) * 6 + 165px - var(--shift)); bottom:calc(var(--u) * -30);
  height:calc(var(--u) * 84); aspect-ratio:559/1201; pointer-events:none; transform:translateY(110%); }
.wc-andy.in { animation:wc-andyIn .75s cubic-bezier(.25,1.45,.45,1) forwards; }
.wc-sway { width:100%; height:100%; transform-origin:50% 100%; animation:wc-sway 3.4s ease-in-out infinite; }
.wc-breathe { width:100%; height:100%; transform-origin:50% 100%; animation:wc-breathe 2.2s ease-in-out infinite; }
.wc-hop { position:relative; width:100%; height:100%; transform-origin:50% 100%; }
.wc-hop.bounce { animation:wc-hop .42s ease-in-out infinite; }
.wc-andy img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; user-select:none;
  filter:drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
@media (max-width:560px) { .wc-andy { display:none; } .wc-center { padding-left:0; } }
@media (max-height:520px) { .wc-center { gap:10px; } .wc-great { font-size:46px; } .wc-title { font-size:32px; } .wc-row { font-size:48px; } .wc-src { width:64px; height:64px; } .wc-btns { gap:14px; } }

.wc-fly { position:absolute; left:0; top:0; width:52px; height:52px; margin:-26px 0 0 -26px; pointer-events:none; z-index:5; }
.wc-fly > div { width:100%; height:100%; animation:wc-tumble .35s linear infinite; filter:drop-shadow(0 3px 3px rgba(0,0,0,.4)); }
.wc-spark { position:absolute; left:0; top:0; width:16px; height:16px; margin:-8px 0 0 -8px; pointer-events:none; z-index:6;
  filter:drop-shadow(0 0 4px #ffe680); }
.wc-ring { position:absolute; left:0; top:0; width:20px; height:20px; margin:-10px 0 0 -10px; border-radius:50%; pointer-events:none;
  z-index:4; border:3px solid rgba(255,236,150,.9); box-shadow:0 0 18px rgba(255,220,90,.9); }

@keyframes wc-popIn { from{opacity:0; transform:scale(.4)} to{opacity:1; transform:scale(1)} }
@keyframes wc-shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
@keyframes wc-plus { 0%{opacity:0; transform:translate(0,-30%) scale(.6)} 15%{opacity:1; transform:translate(0,-50%) scale(1.15)}
  70%{opacity:1; transform:translate(0,-120%) scale(1)} 100%{opacity:0; transform:translate(0,-160%) scale(1)} }
@keyframes wc-ready { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
@keyframes wc-andyIn { from{transform:translateY(110%) rotate(-6deg)} to{transform:translateY(0) rotate(0)} }
@keyframes wc-sway { 0%,100%{transform:rotate(-1.2deg)} 50%{transform:rotate(1.2deg)} }
@keyframes wc-breathe { 0%,100%{transform:scale(1,1)} 50%{transform:scale(.992,1.014)} }
@keyframes wc-hop { 0%,100%{transform:translateY(0) scale(1,1)} 15%{transform:translateY(0) scale(1.03,.96)}
  50%{transform:translateY(-4%) scale(.98,1.03)} 85%{transform:translateY(0) scale(1.02,.98)} }
@keyframes wc-tumble { 0%{transform:scaleX(1)} 50%{transform:scaleX(.25)} 100%{transform:scaleX(1)} }
@keyframes wc-glow { 0%,100%{ color:#fff; text-shadow:0 4px 0 rgba(0,0,0,.35), 0 0 6px rgba(255,220,90,.3); }
  50%{ color:#fff6c8; text-shadow:0 4px 0 rgba(0,0,0,.35), 0 0 22px rgba(255,220,90,1), 0 0 44px rgba(255,190,40,.8); } }
@keyframes wc-halo { 0%,100%{opacity:.55; transform:scale(.95)} 50%{opacity:1; transform:scale(1.05)} }
@keyframes wc-twinkle { 0%,100%{opacity:0; transform:scale(.3) rotate(0deg)} 50%{opacity:1; transform:scale(1.3) rotate(45deg)} }
`;

export default function WinCelebration({ coinsWon, startTotal, treatsTotal = null, treatsWon = 2, muted, fanfare = false, onChooseGame, onReturnToWorld }: Props) {
  const won = Math.max(0, Math.floor(Number(coinsWon) || 0));
  const start = Math.max(0, Math.floor(Number(startTotal) || 0));

  const [total, setTotal] = useState(start);
  const [pillIn, setPillIn] = useState(false);
  const [andyIn, setAndyIn] = useState(false);
  const [flying, setFlying] = useState(false);
  const [hop, setHop] = useState(false);       // Andy hops from the first coin landing until the last
  const [shine, setShine] = useState(false);   // treats text glows + coin row twinkles after the coins land
  const [thumbs, setThumbs] = useState(false);
  const [eyesShut, setEyesShut] = useState(false);
  const [ready, setReady] = useState(false);   // buttons wake up after the treats are in the jar
  const [treatsIn, setTreatsIn] = useState(0); // treats landed in the jar so far
  const jarRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const treatSrcRef = useRef<HTMLDivElement>(null);
  const treatsTotalRef = useRef(treatsTotal);
  treatsTotalRef.current = treatsTotal;

  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillCoinRef = useRef<HTMLDivElement>(null);
  const srcRef = useRef<HTMLDivElement>(null);
  const andyRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLDivElement>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timers: number[] = [];
    const rafs: number[] = [];
    let sfx: HTMLAudioElement | null = null;
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    const center = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const cleanup = () => {
      timers.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
      if (sfx) sfx.pause();
      winSfx.pause();
      fanfareSfx?.pause();
      root.querySelectorAll(".wc-fly,.wc-spark,.wc-ring,.wc-treat,.wc-flash").forEach((e) => e.remove());
    };

    const sparkBurst = (x: number, y: number, count: number, dist: number, big: boolean) => {
      const ring = document.createElement("div");
      ring.className = "wc-ring";
      root.appendChild(ring);
      ring.animate(
        [{ transform: `translate(${x}px,${y}px) scale(.4)`, opacity: 1 }, { transform: `translate(${x}px,${y}px) scale(${big ? 7 : 4})`, opacity: 0 }],
        { duration: big ? 700 : 420, easing: "ease-out" },
      ).onfinish = () => ring.remove();
      for (let k = 0; k < count; k++) {
        const s = document.createElement("div");
        s.className = "wc-spark";
        s.innerHTML = STAR_SVG;
        root.appendChild(s);
        const a = Math.random() * Math.PI * 2;
        const d = dist * (0.5 + Math.random() * 0.8);
        const sz = 0.5 + Math.random() * (big ? 1.3 : 0.9);
        s.animate(
          [
            { transform: `translate(${x}px,${y}px) scale(${sz}) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${x + Math.cos(a) * d}px,${y + Math.sin(a) * d}px) scale(0) rotate(${Math.random() * 180}deg)`, opacity: 0.2 },
          ],
          { duration: 450 + Math.random() * 350, easing: "cubic-bezier(.2,.7,.4,1)" },
        ).onfinish = () => s.remove();
      }
    };

    const winSfx = new Audio(WIN_SFX);
    if (!mutedRef.current) winSfx.play().catch(() => {});
    const fanfareSfx = fanfare ? new Audio(FANFARE) : null;
    if (fanfareSfx && !mutedRef.current) { fanfareSfx.volume = 0.7; fanfareSfx.play().catch(() => {}); }
    later(() => setAndyIn(true), 150);
    later(() => setPillIn(true), 300);
    const blinkLoop = () => later(() => { setEyesShut(true); later(() => setEyesShut(false), 140); blinkLoop(); }, 2500 + Math.random() * 2000);
    blinkLoop();

    const finish = () => {
      setFlying(false);
      setHop(false);
      setShine(true);
      setThumbs(true);
      hopRef.current?.animate(
        [{ transform: "scale(1.06,.92)" }, { transform: "scale(.97,1.05)", offset: 0.6 }, { transform: "scale(1)" }],
        { duration: 450, easing: "cubic-bezier(.3,1.6,.5,1)" },
      );
      const a = andyRef.current?.getBoundingClientRect();
      if (a && a.width > 0) sparkBurst(a.left + a.width * 0.12, a.top + a.height * 0.24, 14, 70, false);
    };

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      later(() => { setTotal(start + won); setThumbs(true); setShine(true); setTreatsIn(treatsWon); setReady(true); }, 700);
      return cleanup;
    }

    sfx = new Audio(SFX);
    sfx.preload = "auto";
    const flyers = Math.min(won, MAX_FLYERS);
    const tFlyers = Math.min(Math.max(0, treatsWon), 6);
    let arrived = 0, tArrived = 0, coinsDone = flyers === 0, treatsDone = tFlyers === 0, ended = false;
    // both done (coins in the pill + treats in the jar) -> thumbs-up, glow, buttons
    const allDone = () => { if (ended || !coinsDone || !treatsDone) return; ended = true; later(finish, 250); later(() => setReady(true), 500); };

    const land = () => {
      arrived++;
      if (arrived === 1) setHop(true);
      setTotal(start + Math.round((won * arrived) / flyers)); // lands exactly on start + won
      pillCoinRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.22)", offset: 0.4 }, { transform: "scale(1)" }],
        { duration: 220, easing: "ease-out" },
      );
      if (pillCoinRef.current) { const d = center(pillCoinRef.current); sparkBurst(d.x, d.y, 7, 55, false); }
      if (arrived === flyers) {
        later(() => {
          if (pillCoinRef.current) { const d = center(pillCoinRef.current); sparkBurst(d.x, d.y, 22, 120, true); }
          pillRef.current?.animate(
            [
              { boxShadow: "inset 0 -4px 0 rgba(160,110,50,.25), inset 0 3px 0 #fff, 0 0 0 rgba(255,220,90,0)" },
              { boxShadow: "inset 0 -4px 0 rgba(160,110,50,.25), inset 0 3px 0 #fff, 0 0 40px 12px rgba(255,220,90,.85)", offset: 0.3 },
              { boxShadow: "inset 0 -4px 0 rgba(160,110,50,.25), inset 0 3px 0 #fff, 0 4px 10px rgba(0,0,0,.45)" },
            ],
            { duration: 1000, easing: "ease-out" },
          );
        }, 120);
        coinsDone = true; allDone();
      }
    };
    // a treat reaches the bottom-left corner: bright yellow flash, gone
    let treatDst = { x: 0, y: 0 };
    const flash = (x: number, y: number) => {
      const f = document.createElement("div");
      f.className = "wc-flash";
      root.appendChild(f);
      f.animate([
        { transform: `translate(${x}px,${y}px) scale(.2)`, opacity: 1 },
        { transform: `translate(${x}px,${y}px) scale(1.5)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${x}px,${y}px) scale(2.3)`, opacity: 0 },
      ], { duration: 650, easing: "ease-out" }).onfinish = () => f.remove();
    };
    const landTreat = () => {
      flash(treatDst.x, treatDst.y);
      tArrived++;
      if (tArrived === 1 && flyers === 0) setHop(true);
      setTreatsIn(Math.round((treatsWon * tArrived) / tFlyers));
      if (tArrived === tFlyers) { treatsDone = true; allDone(); }
    };

    const launch = (src: { x: number; y: number }, dst: { x: number; y: number }, html: string, onLand: () => void, cls = "") => {
      const c = document.createElement("div");
      c.className = "wc-fly" + cls;
      c.innerHTML = `<div>${html}</div>`;
      root.appendChild(c);
      const a = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 60;
      const p1 = { x: src.x + Math.cos(a) * r, y: src.y + Math.sin(a) * r }; // pop-out spot
      const ctrl = { x: (p1.x + dst.x) / 2 + (Math.random() - 0.5) * 160, y: Math.min(p1.y, dst.y) - 60 - Math.random() * 80 };
      const t0 = performance.now();
      const step = (now: number) => {
        const t = now - t0;
        let x: number, y: number, s: number;
        if (t < POP) {
          const k = 1 - Math.pow(1 - t / POP, 3);
          x = src.x + (p1.x - src.x) * k; y = src.y + (p1.y - src.y) * k; s = 0.6 + 0.6 * k;
        } else {
          const u = Math.min(1, (t - POP) / FLIGHT);
          const k = u * u * (3 - 2 * u) * 0.35 + u * u * 0.65;
          const m = 1 - k;
          x = m * m * p1.x + 2 * m * k * ctrl.x + k * k * dst.x;
          y = m * m * p1.y + 2 * m * k * ctrl.y + k * k * dst.y;
          s = 1.2 - 0.45 * k;
          if (u >= 1) { c.remove(); onLand(); return; }
        }
        c.style.transform = `translate(${x}px,${y}px) scale(${s})`;
        rafs.push(requestAnimationFrame(step));
      };
      rafs.push(requestAnimationFrame(step));
    };

    // coins -> coin pill AND treats -> jar, at the same time
    later(() => {
      const coinOk = flyers > 0 && !!srcRef.current && !!pillCoinRef.current;
      const treatOk = tFlyers > 0 && !!treatSrcRef.current;
      if (!coinOk) { setTotal(start + won); coinsDone = true; }
      if (!treatOk) { setTreatsIn(treatsWon); treatsDone = true; }
      if (!coinOk && !treatOk) { allDone(); return; }
      setFlying(true);
      if (coinOk) {
        const src = center(srcRef.current!), dst = center(pillCoinRef.current!);
        later(() => { if (sfx && !mutedRef.current) { sfx.currentTime = 0; sfx.play().catch(() => {}); } }, POP + FLIGHT - 100);
        for (let i = 0; i < flyers; i++) later(() => launch(src, dst, COIN_SVG, land), i * GAP);
      }
      if (treatOk) {
        const src = center(treatSrcRef.current!), rr = root.getBoundingClientRect();
        const dst = { x: rr.left + 70, y: rr.bottom - 70 }; // bottom-left corner
        treatDst = dst;
        for (let i = 0; i < tFlyers; i++) later(() => launch(src, dst, TREAT_HTML, landTreat, " wc-tfly"), 60 + i * 160);
      }
    }, START);

    return cleanup;
    // Runs once per win screen; the numbers are fixed at the moment of the win.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="wc-root">
      <style>{FUN3D_CSS + CSS}</style>

      <div className={`wc-andy${andyIn ? " in" : ""}`} ref={andyRef}>
        <div className="wc-sway"><div className="wc-breathe">
          <div className={`wc-hop${hop ? " bounce" : ""}`} ref={hopRef}>
            <img src={IMG.cheer} alt="" draggable={false} style={{ opacity: thumbs ? 0 : 1 }} />
            <img src={IMG.blink} alt="" draggable={false} style={{ opacity: !thumbs && eyesShut ? 1 : 0 }} />
            <img src={IMG.thumbs} alt="" draggable={false} style={{ opacity: thumbs ? 1 : 0 }} />
          </div>
        </div></div>
      </div>

      <div className={`wc-pill${pillIn ? " show" : ""}`} ref={pillRef} style={startTotal === null ? { display: "none" } : undefined}>
        <div className="wc-pillcoin" ref={pillCoinRef}><CoinFill /></div>
        <span>{total}</span>
      </div>

      <div className="wc-center">
        <div className="wc-great"><Word3D text={GREAT} delay={GREAT_DELAY} /></div>
        <div className="wc-rows">
        {won > 0 && (
          <div className={`wc-row${flying ? " drain" : ""}${shine ? " shine" : ""}`}>
            {shine && (
              <div className="wc-tw">
                {TWINKLES.map((t, i) => (
                  <i key={i} className={t.star ? "st" : ""} style={{ left: `${t.left}%`, top: `${t.top}%`, width: t.size * (t.star ? 2 : 1),
                    height: t.size * (t.star ? 2 : 1), marginLeft: -t.size * (t.star ? 1 : 0.5), marginTop: -t.size * (t.star ? 1 : 0.5), animationDelay: `${t.delay}ms` }} />
                ))}
              </div>
            )}
            <div className="wc-src" ref={srcRef}><CoinFill /></div>
            <span>{"×"}{won}</span>
            <span className={`wc-plus${flying ? " go" : ""}`}>+{won}</span>
          </div>
        )}
        {treatsWon > 0 && (
          <div className={`wc-row t2${flying ? " drain" : ""}${shine ? " shine" : ""}`}>
            {shine && (
              <div className="wc-tw">
                {TWINKLES2.map((t, i) => (
                  <i key={i} className={t.star ? "st" : ""} style={{ left: `${t.left}%`, top: `${t.top}%`, width: t.size * (t.star ? 2 : 1),
                    height: t.size * (t.star ? 2 : 1), marginLeft: -t.size * (t.star ? 1 : 0.5), marginTop: -t.size * (t.star ? 1 : 0.5), animationDelay: `${t.delay}ms` }} />
                ))}
              </div>
            )}
            <div className="wc-src" ref={treatSrcRef}><img src={TREAT_IMG} alt="" draggable={false} /></div>
            <span>{"×"}{treatsWon}</span>
            <span className={`wc-plus${flying ? " go" : ""}`}>+{treatsWon}</span>
          </div>
        )}
        </div>
        <div className={`wc-btns${ready ? " ready" : ""}`}>
          <button className="f3-btn f3-yellow" disabled={!ready} onClick={onChooseGame}>
            Choose Game
          </button>
          <button className="f3-btn f3-cyan" disabled={!ready} onClick={onReturnToWorld}>
            Return to World
          </button>
        </div>
      </div>
    </div>
  );
}
