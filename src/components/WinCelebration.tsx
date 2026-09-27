import { useEffect, useRef, useState } from "react";

// Win screen for the grammar games: Teacher Andy cheers, won coins fly up into the coin-total pill
// (sparkles + rising pop sound), then Andy gives a thumbs-up and the buttons wake up.
// VISUAL ONLY: it saves nothing. startTotal = the kid's coin total before this win (0 until the coin jar exists).
type Props = {
  coinsWon: number;
  startTotal: number;
  muted: boolean;
  fanfare?: boolean;   // play Run's win fanfare when the screen opens (Swim/Dig/Grab; Run already had it at the flag)
  onChooseGame: () => void;
  onReturnToWorld: () => void;
};

const ART = "/celebration/";
const IMG = { cheer: ART + "andy_cheer.webp", blink: ART + "andy_blink.webp", thumbs: ART + "andy_thumbs.webp" };
const SFX = ART + "rising_pop.mp3";        // coins flying up
const WIN_SFX = ART + "win_pop.mp3";       // the moment the win screen pops up
const FANFARE = ART + "win_fanfare.mp3";   // Run's victory fanfare

// Load the art as soon as a game page loads, so Andy is ready the moment a kid wins.
if (typeof window !== "undefined") {
  Object.values(IMG).forEach((src) => { const i = new Image(); i.src = src; });
}

const COIN_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block"><circle cx="12" cy="12" r="10" fill="#ffcf33" stroke="#e0a91e" stroke-width="2"/><circle cx="8.5" cy="8.5" r="3.5" fill="#fff3b0"/></svg>';
const STAR_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block"><path d="M12 0 L14.3 9.7 L24 12 L14.3 14.3 L12 24 L9.7 14.3 L0 12 L9.7 9.7Z" fill="#fff8c4"/></svg>';

const MAX_FLYERS = 14;   // never more than 14 coins on screen, however many were won
const START = 1100;      // ms after the screen opens before coins leave
const GAP = 62;          // ms between coins
const POP = 260;         // ms burst outward
const FLIGHT = 620;      // ms curve up to the pill

function CoinFill() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ display: "block" }}>
      <circle cx="12" cy="12" r="10" fill="#ffcf33" stroke="#e0a91e" strokeWidth="2" />
      <circle cx="8.5" cy="8.5" r="3.5" fill="#fff3b0" />
    </svg>
  );
}

const CSS = `
.wc-root { position:fixed; inset:0; z-index:60; --u:min(1vh,0.75vw); overflow:hidden; color:#fff;
  background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); font-family:Fredoka, sans-serif; }
.wc-center { position:absolute; inset:0; padding-left:calc(var(--u) * 35); display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:24px; text-align:center; }
.wc-title { font-size:max(44px, calc(var(--u) * 5.6)); font-weight:700; text-shadow:0 4px 0 rgba(0,0,0,.35);
  animation:wc-popIn .5s cubic-bezier(.3,1.7,.5,1) both; }
.wc-row { position:relative; display:flex; align-items:center; gap:12px; font-size:max(44px, calc(var(--u) * 5.4));
  font-weight:700; color:#ffd84a; text-shadow:0 3px 0 rgba(0,0,0,.35); animation:wc-popIn .5s .25s cubic-bezier(.3,1.7,.5,1) both; }
.wc-src { width:max(58px, calc(var(--u) * 7)); height:max(58px, calc(var(--u) * 7)); }
.wc-row.drain .wc-src { animation:wc-shake .15s linear infinite; }
.wc-plus { position:absolute; left:100%; margin-left:14px; top:50%; transform:translateY(-50%); color:#8dff5c;
  -webkit-text-stroke:2px #1e5c12; paint-order:stroke fill; text-shadow:0 3px 0 rgba(0,0,0,.4); opacity:0; white-space:nowrap; }
.wc-plus.go { animation:wc-plus 1.4s ease-out forwards; }
.wc-btns { display:flex; flex-direction:column; gap:16px; animation:wc-popIn .4s .45s both; }
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

.wc-andy { position:absolute; right:calc(50% - var(--u) * 11.5 + 165px); bottom:calc(var(--u) * -30);
  height:calc(var(--u) * 84); aspect-ratio:559/1201; pointer-events:none; transform:translateY(110%); }
.wc-andy.in { animation:wc-andyIn .75s cubic-bezier(.25,1.45,.45,1) forwards; }
.wc-sway { width:100%; height:100%; transform-origin:50% 100%; animation:wc-sway 3.4s ease-in-out infinite; }
.wc-breathe { width:100%; height:100%; transform-origin:50% 100%; animation:wc-breathe 2.2s ease-in-out infinite; }
.wc-hop { position:relative; width:100%; height:100%; transform-origin:50% 100%; }
.wc-hop.bounce { animation:wc-hop .34s ease-in-out infinite; }
.wc-andy img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; user-select:none;
  filter:drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
@media (max-width:560px) { .wc-andy { display:none; } .wc-center { padding-left:0; } }

.wc-fly { position:absolute; left:0; top:0; width:40px; height:40px; margin:-20px 0 0 -20px; pointer-events:none; z-index:5; }
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
`;

export default function WinCelebration({ coinsWon, startTotal, muted, fanfare = false, onChooseGame, onReturnToWorld }: Props) {
  const won = Math.max(0, Math.floor(Number(coinsWon) || 0));
  const start = Math.max(0, Math.floor(Number(startTotal) || 0));

  const [total, setTotal] = useState(start);
  const [pillIn, setPillIn] = useState(false);
  const [andyIn, setAndyIn] = useState(false);
  const [flying, setFlying] = useState(false);
  const [thumbs, setThumbs] = useState(false);
  const [eyesShut, setEyesShut] = useState(false);
  const [ready, setReady] = useState(won === 0);

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
      root.querySelectorAll(".wc-fly,.wc-spark,.wc-ring").forEach((e) => e.remove());
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
      setThumbs(true);
      hopRef.current?.animate(
        [{ transform: "scale(1.06,.92)" }, { transform: "scale(.97,1.05)", offset: 0.6 }, { transform: "scale(1)" }],
        { duration: 450, easing: "cubic-bezier(.3,1.6,.5,1)" },
      );
      const a = andyRef.current?.getBoundingClientRect();
      if (a && a.width > 0) sparkBurst(a.left + a.width * 0.12, a.top + a.height * 0.24, 14, 70, false);
    };

    if (won === 0) return cleanup;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      later(() => { setTotal(start + won); setThumbs(true); setReady(true); }, 700);
      return cleanup;
    }

    sfx = new Audio(SFX);
    sfx.preload = "auto";
    const flyers = Math.min(won, MAX_FLYERS);
    let arrived = 0;

    const land = () => {
      arrived++;
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
        later(finish, 250);
        later(() => setReady(true), 500);
      }
    };

    const launch = (src: { x: number; y: number }, dst: { x: number; y: number }) => {
      const c = document.createElement("div");
      c.className = "wc-fly";
      c.innerHTML = `<div>${COIN_SVG}</div>`;
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
          if (u >= 1) { c.remove(); land(); return; }
        }
        c.style.transform = `translate(${x}px,${y}px) scale(${s})`;
        rafs.push(requestAnimationFrame(step));
      };
      rafs.push(requestAnimationFrame(step));
    };

    later(() => {
      if (!srcRef.current || !pillCoinRef.current) { setTotal(start + won); setReady(true); finish(); return; }
      const src = center(srcRef.current);
      const dst = center(pillCoinRef.current);
      setFlying(true);
      later(() => { if (sfx && !mutedRef.current) { sfx.currentTime = 0; sfx.play().catch(() => {}); } }, POP + FLIGHT - 100);
      for (let i = 0; i < flyers; i++) later(() => launch(src, dst), i * GAP);
    }, START);

    return cleanup;
    // Runs once per win screen; the numbers are fixed at the moment of the win.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="wc-root">
      <style>{CSS}</style>

      <div className={`wc-andy${andyIn ? " in" : ""}`} ref={andyRef}>
        <div className="wc-sway"><div className="wc-breathe">
          <div className={`wc-hop${flying ? " bounce" : ""}`} ref={hopRef}>
            <img src={IMG.cheer} alt="" draggable={false} style={{ opacity: thumbs ? 0 : 1 }} />
            <img src={IMG.blink} alt="" draggable={false} style={{ opacity: !thumbs && eyesShut ? 1 : 0 }} />
            <img src={IMG.thumbs} alt="" draggable={false} style={{ opacity: thumbs ? 1 : 0 }} />
          </div>
        </div></div>
      </div>

      <div className={`wc-pill${pillIn ? " show" : ""}`} ref={pillRef}>
        <div className="wc-pillcoin" ref={pillCoinRef}><CoinFill /></div>
        <span>{total}</span>
      </div>

      <div className="wc-center">
        <div className="wc-title">You won 2 treats!</div>
        {won > 0 && (
          <div className={`wc-row${flying ? " drain" : ""}`}>
            <div className="wc-src" ref={srcRef}><CoinFill /></div>
            <span>{"×"}{won}</span>
            <span className={`wc-plus${flying ? " go" : ""}`}>+{won}</span>
          </div>
        )}
        <div className={`wc-btns${ready && won > 0 ? " ready" : ""}`}>
          <button className="wc-btn" disabled={!ready} onClick={onChooseGame} style={{ background: "#fde047" }}>
            Choose Game
          </button>
          <button className="wc-btn" disabled={!ready} onClick={onReturnToWorld} style={{ background: "#5ce0ff" }}>
            Return to World
          </button>
        </div>
      </div>
    </div>
  );
}
