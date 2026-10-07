// DAILY PRIZE (Andy 2026-10-03): replaces the daily treat + Visit-5-days on the new world look.
// LOOK ONLY: the brain asks the database (mpe_claim_daily_prize = one per Taiwan day, amounts live THERE).
// A 7-box week: each visit day opens the next box (missed days never reset); box 7 = the big gift.
// Gentle and slow (Andy): rises in, slow shine line + soft breathing glow + slow sparkles, Claim -> prizes float
// to the jar / coin pill / Puzzle button, then the board floats away. Background darkened but still visible.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FUN3D_CSS } from "@/components/Fun3D";

const D = "/worlds/daily";
const UI = "/worlds/ui";

// Same table as the database (BACKUPFILES/daily_prize_20261003.sql) - shown on the boxes. Change BOTH together.
export const DAILY_TABLE: { t: number; c: number; p: number }[] = [
  { t: 3, c: 0, p: 0 }, { t: 2, c: 10, p: 0 }, { t: 3, c: 10, p: 1 }, { t: 4, c: 0, p: 0 },
  { t: 3, c: 15, p: 0 }, { t: 3, c: 15, p: 1 }, { t: 8, c: 40, p: 3 },
];
export type DailyKind = "treat" | "coin" | "piece";
type Pt = { x: number; y: number };
const ICON: Record<DailyKind, string> = { treat: `${UI}/treat.webp`, coin: `${UI}/coin.webp`, piece: `${UI}/i_puzzle.webp` };
const items = (i: number) => {
  const r = DAILY_TABLE[i];
  return ([["treat", r.t], ["coin", r.c], ["piece", r.p]] as [DailyKind, number][]).filter(([, n]) => n > 0);
};

const BW = 1000, BH = Math.round(1000 * 809 / 1270);   // board size on the stage (DARK teal art 1270 x 809, Andy 19:19)
const TW = 150, TH = 155, GAP = 15;                    // day boxes
const GX = 130, GY = 242;                              // (was 208: room for the week meter, Andy 2026-10-07)                              // grid top-left inside the board
const GIFT_X = GX + 3 * TW + 2 * GAP + 30, GIFT_W = 230;
const FLY_MS = 800;
// WEEK METER (Andy 2026-10-07): across the board between the ribbon and the boxes. Done days = green check, other days = number,
// bonus days 3 + 6 (puzzle piece) and day 7 (big gift) = little presents in different colours. [day, [box, lid, ribbon], size]
const MX0 = 150, MX1 = 850, MY = 172;
// every day has a little present (Andy 10:01), each its own colour; day 7 = gold + purple bow like the big gift, bigger
const PRESENTS: [number, [string, string, string], number][] = [
  [1, ["#ff9a3c", "#ffbd73", "#3fc1ff"], 60], [2, ["#4cd964", "#8ef09c", "#ff5d8f"], 60], [3, ["#ff6fae", "#ff9cc8", "#ffd23f"], 60],
  [4, ["#a066ff", "#c49bff", "#ffd23f"], 60], [5, ["#2ec4c4", "#7ee3e3", "#ff7a59"], 60], [6, ["#38a8ff", "#7cc8ff", "#ff5d8f"], 60],
  [7, ["#ffc531", "#ffdc6b", "#9b4dff"], 74]];
const Present = ({ c, size }: { c: [string, string, string]; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 20 C24 6 11 8 15 16 C18 22 28 21 32 20 Z" fill={c[2]} stroke="#3a1a05" strokeWidth="3" strokeLinejoin="round" />
    <path d="M32 20 C40 6 53 8 49 16 C46 22 36 21 32 20 Z" fill={c[2]} stroke="#3a1a05" strokeWidth="3" strokeLinejoin="round" />
    <rect x="10" y="31" width="44" height="28" rx="4" fill={c[0]} stroke="#3a1a05" strokeWidth="3" />
    <rect x="6" y="20" width="52" height="13" rx="4" fill={c[1]} stroke="#3a1a05" strokeWidth="3" />
    <rect x="28" y="20" width="8" height="39" fill={c[2]} stroke="#3a1a05" strokeWidth="2.5" />
    <rect x="10" y="23" width="15" height="3.5" rx="1.75" fill="rgba(255,255,255,.75)" />
    <rect x="14" y="35" width="5" height="18" rx="2.5" fill="rgba(255,255,255,.35)" />
  </svg>
);

const SPARKS = [[-40, 120, 46, 3.6, 0], [1030, 90, 40, 4.2, 1.1], [-20, 470, 34, 3.9, 2.0], [1020, 430, 50, 4.6, 0.6],
  [180, -30, 36, 4.0, 1.6], [820, -40, 42, 3.7, 2.6], [520, 655, 38, 4.4, 0.3], [90, 640, 30, 3.8, 2.9], [930, 630, 34, 4.1, 1.9]];

// MAGIC GLOW (yellow since Andy 20:38; was pink) behind the Day 7 present when it is today (Andy 19:11): very bright vibrant pink glow + slow pink and
// white sparkles drifting out (the board is cream/yellow, so gold did not show). Fixed pseudo-random = same every load.
// dots: [angle deg, distance px, size px, seconds, delay seconds, white 0/1]; stars: [angle deg, radius px, size px, seconds, delay s]
const PINK = (() => {
  let seed = 7;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const dots = Array.from({ length: 46 }, () => [r() * 360, 115 + r() * 85, 3 + r() * 4, 3.4 + r() * 2.6, -r() * 6, r() < 0.35 ? 1 : 0]);
  const stars = Array.from({ length: 9 }, (_, i) => [i * 40 + r() * 20, 105 + r() * 45, 26 + r() * 16, 3 + r() * 1.8, -r() * 4]);
  return { dots, stars };
})();
const PinkMagic = ({ x, y }: { x: number; y: number }) => (
  <div className="dp-pink" style={{ left: x, top: y }} aria-hidden="true">
    <div className="dp-pinkhalo" />
    <div className="dp-rays" /> {/* turning yellow light rays, like the grow-up party (Andy 21:23) - only a little past the present */}
    {PINK.dots.map((d, i) => (
      <i key={"d" + i} className={"dp-pd" + (d[5] ? " w" : "")}
        style={{ width: d[2], height: d[2], margin: -d[2] / 2, ["--a" as string]: `${d[0]}deg`, ["--d" as string]: `${d[1]}px`, animationDuration: `${d[3]}s`, animationDelay: `${d[4]}s` } as CSSProperties} />
    ))}
  </div>
);

export default function DailyPrize({ cx, sh, day, sfxOn, onClaim, target, onLand, onDone }: {
  cx: number; sh: number;
  day: number;                                          // today's box 1..7
  sfxOn: boolean;
  onClaim: () => Promise<{ paid: boolean } | null | undefined>;
  target: (k: DailyKind) => Pt | null;                  // where each kind flies to (stage px)
  onLand: (k: DailyKind, add: number) => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"in" | "idle" | "busy" | "fly" | "out">("in");
  const [opened, setOpened] = useState(false);          // today's box shows the gold check
  const [flyers, setFlyers] = useState<{ id: number; img: string; x0: number; y0: number; x1: number; y1: number; delay: number }[]>([]);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { later(() => setPhase(p => (p === "in" ? "idle" : p)), 950); return () => timers.current.forEach(t => window.clearTimeout(t)); }, []);

  // WIGGLE (Andy 2026-10-07): the little presents on the meter + the big Day 7 present wiggle ONCE now and then,
  // one at a time, at random spread-out moments. Nothing else wiggles.
  const doneN = opened ? day : day - 1;
  const doneRef = useRef(doneN); doneRef.current = doneN;
  const [wig, setWig] = useState("");
  useEffect(() => {
    let t = 0, last = "";
    const next = (first: boolean) => {
      t = window.setTimeout(() => {
        const c = [...PRESENTS.filter(([d]) => d > doneRef.current).map(([d]) => "p" + d), ...(doneRef.current < 7 ? ["big"] : [])].filter(k => k !== last);
        if (c.length) { last = c[Math.floor(Math.random() * c.length)]; setWig(last); window.setTimeout(() => setWig(""), 1000); }
        next(false);
      }, first ? 1200 + Math.random() * 1000 : 1700 + Math.random() * 1800); // more often (Andy 10:01), never two at once
    };
    next(true);
    return () => window.clearTimeout(t);
  }, []);

  const left = cx - BW / 2, top = sh / 2 - BH / 2 - 20;
  const tilePos = (i: number) => i === 6
    ? { x: GIFT_X, y: GY, w: GIFT_W, h: 2 * TH + GAP }
    : { x: GX + (i % 3) * (TW + GAP), y: GY + Math.floor(i / 3) * (TH + GAP), w: TW, h: TH };

  const play = (f: string, vol: number) => { if (!sfxOn) return; const a = new Audio(f); a.volume = vol; a.play().catch(() => { }); };

  const claim = async () => {
    if (phase !== "idle") return;
    setPhase("busy");
    play(`${D}/claim.mp3`, 0.6);
    const res = await onClaim();
    setOpened(true);
    if (!res || !res.paid) { later(() => setPhase("out"), 900); later(onDone, 1500); return; }
    const p = tilePos(day - 1);
    const sx = left + p.x + p.w / 2, sy = top + p.y + p.h / 2;
    const list: typeof flyers = [];
    let last = 0;
    items(day - 1).forEach(([k, n], gi) => {
      const to = target(k);
      if (!to) { onLand(k, n); return; }
      const count = Math.min(n, 8);
      for (let j = 0; j < count; j++) {
        const delay = 250 + gi * 380 + j * 90;
        const add = Math.floor(n / count) + (j < n % count ? 1 : 0);
        list.push({ id: gi * 100 + j, img: ICON[k], x0: sx + (j % 3 - 1) * 16, y0: sy + (j % 2) * 12, x1: to.x, y1: to.y, delay });
        // Treats: the JAR plays its own drop sound when its cookie lands inside (Andy 14:15: it was too late) ->
        // start the jar's drop-in ~350ms before the flyer arrives, no extra plop. Coins + pieces land silently (Andy).
        later(() => onLand(k, add), delay + FLY_MS - (k === "treat" ? 350 : 0));
        last = Math.max(last, delay + FLY_MS);
      }
    });
    setFlyers(list);
    setPhase("fly");
    play(`${D}/harp.mp3`, 0.5); // Andy 21:36: soft harp while the treats + coins fly (first 2.6s of his 'remembrance harp', faded)
    later(() => setPhase("out"), last + 600);
    later(onDone, last + 1200);
  };

  const label = (txt: string, style: CSSProperties) => <div className="dp-txt" style={style}>{txt}</div>;

  return (
    <div className={"dp-root " + phase} style={{ position: "absolute", inset: 0, zIndex: 70 }}>
      <style>{FUN3D_CSS + CSS}</style>
      <div className="dp-dim" />
      <div className="dp-board" style={{ left, top, width: BW, height: BH }}>
        <div className="dp-glow" />
        {/* star-shaped sparkles REMOVED everywhere in the Daily Prize (Andy 19:19: no emoji-like sparkles) */}
        <img className="dp-art" src={`${D}/board.webp`} alt="" />
        <div className="dp-shine" />
        <svg className="dp-title" width={BW} height={200} viewBox={`0 0 ${BW} 200`} aria-label="Daily Prize">
          <path id="dp-arc" d="M290,116 Q500,64 710,116" fill="none" /> {/* measured on the dark board: ribbon middle ~y71 centre, ~y87 at x315/670 */}
          <text textAnchor="middle"><textPath href="#dp-arc" startOffset="50%">Daily Prize</textPath></text>
        </svg>
        <div className="dp-meter" style={{ left: MX0, top: MY, width: MX1 - MX0 }}>
          <div className="dp-mfill" style={{ width: doneN > 0 ? `${((doneN - 0.5) / 7) * 100}%` : 0 }} />
        </div>
        {DAILY_TABLE.map((_, i) => {
          const d = i + 1, x = MX0 + ((i + 0.5) / 7) * (MX1 - MX0), y = MY + 16;
          const pr = PRESENTS.find(p => p[0] === d);
          if (d <= doneN) return <div key={"m" + d} className="dp-mk done" style={{ left: x, top: y }}><svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" fill="none" stroke="#2f9a1c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></div>;
          if (pr) return <div key={"m" + d} className={"dp-mk gift" + (d === day ? " now" : "") + (wig === "p" + d ? " wig" : "")} style={{ left: x, top: y }}><Present c={pr[1]} size={pr[2]} /></div>;
          return <div key={"m" + d} className={"dp-mk dot" + (d === day ? " now" : "")} style={{ left: x, top: y }}>{d}</div>;
        })}
        {DAILY_TABLE.map((_, i) => {
          const p = tilePos(i);
          const done = i < day - 1 || (i === day - 1 && opened);
          const today = i === day - 1 && !opened;
          const its = items(i);
          if (i === 6) {
            return (
              <div key={i} className={"dp-tile dp-gift" + (today ? " today" : "")} style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
                {today && <PinkMagic x={GIFT_W / 2} y={118} />}
                {done
                  ? <img src={`${D}/tile_done.webp`} alt="" style={{ position: "absolute", left: 25, top: 40, width: 180 }} />
                  : (
                    <div className={"dp-giftbox" + (wig === "big" ? " wig" : "")} style={{ position: "absolute", left: 0, top: 0, width: GIFT_W, height: 240 }}>
                      <img src={`${D}/tile_gift.webp`} alt="" style={{ position: "absolute", left: 0, top: 0, width: GIFT_W }} />
                      {label("7", { left: 113, width: 60, top: 104, fontSize: 34, textAlign: "center", color: "#7a3d00", textShadow: "none", WebkitTextStroke: "0" })}
                    </div>
                  )}
                {today && <div className="dp-chips" style={{ top: 248 }}>
                  {its.map(([k, n]) => <span key={k}><img src={ICON[k]} alt="" />x{n}</span>)}
                </div>}
              </div>
            );
          }
          return (
            <div key={i} className={"dp-tile" + (today ? " today" : "")} style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
              <img src={done ? `${D}/tile_done.webp` : `${D}/tile${i + 1}.webp`} alt="" style={{ width: "100%", height: "100%" }} />
              {!done && label(today ? `Day ${i + 1}` : "Day", { left: 0, right: 0, top: 5, fontSize: 21, textAlign: "center" })}
              {!done && !today && label(String(i + 1), { left: 0, right: 0, top: 52, fontSize: 70, textAlign: "center" })}
              {today && (
                <div className={"dp-face n" + its.length}>
                  {its.map(([k, n]) => <span key={k}><img src={ICON[k]} alt="" />x{n}</span>)}
                </div>
              )}
            </div>
          );
        })}
        <button className="f3-btn f3-yellow dp-claim" disabled={phase !== "idle"} onClick={claim}>Claim!</button>
      </div>
      {flyers.map(f => (
        <img key={f.id} className="dp-fly" src={f.img} alt=""
          style={{ left: f.x0, top: f.y0, animationDelay: `${f.delay}ms`, ["--dx" as string]: `${f.x1 - f.x0}px`, ["--dy" as string]: `${f.y1 - f.y0}px` } as CSSProperties} />
      ))}
    </div>
  );
}

const CSS = `
.dp-root .dp-dim{position:absolute;inset:-200px;background:rgba(14,10,34,.55);animation:dp-fadeIn .6s ease-out both}
.dp-root.out .dp-dim{animation:dp-fadeOut .6s ease-in both}
.dp-board{position:absolute;animation:dp-rise 1s cubic-bezier(.3,1.35,.5,1) both}
.dp-root.out .dp-board{animation:dp-away .6s cubic-bezier(.5,0,.8,.6) both}
.dp-art{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 18px 24px rgba(0,0,0,.35))}
.dp-glow{position:absolute;left:-140px;right:-140px;top:-120px;bottom:-120px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,236,150,.55),rgba(255,214,90,.28) 55%,rgba(255,214,90,0) 100%);animation:dp-breathe 4s ease-in-out infinite}
.dp-shine{position:absolute;inset:0;pointer-events:none;-webkit-mask:url(${D}/board.webp) 0 0/100% 100%;mask:url(${D}/board.webp) 0 0/100% 100%;
  background:linear-gradient(105deg,rgba(255,255,255,0) 42%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 58%) 0 0/300% 100% no-repeat;
  animation:dp-sweep 5.5s ease-in-out infinite;mix-blend-mode:screen}
.dp-spark{position:absolute;margin:-50% 0 0 -50%;opacity:0;animation:dp-twinkle 4s ease-in-out infinite}
.dp-txt{position:absolute;font-family:'Titan One',sans-serif;color:#fff;line-height:1;white-space:nowrap;pointer-events:none;
  -webkit-text-stroke:2.5px #4a2408;paint-order:stroke fill;text-shadow:0 4px 0 #3a1a05,0 0 10px rgba(255,255,255,.3)}
.dp-title{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;filter:drop-shadow(0 4px 0 #3a1a05)}
.dp-title text{font-family:'Titan One',sans-serif;font-size:56px;fill:#fff;stroke:#4a2408;stroke-width:6px;stroke-linejoin:round;paint-order:stroke fill}
.dp-tile{position:absolute}
/* soft drop shadow under every box + the present (Andy 20:40) - on the img, so the 'today' glow animation keeps its own filter */
.dp-tile > img,.dp-giftbox > img{filter:drop-shadow(0 6px 6px rgba(0,0,0,.38))}
.dp-tile.today{animation:dp-today 2.6s ease-in-out infinite}
/* Day 7 gift when it is today: ONLY the present wiggles (Andy 14:49 - not the prizes under it), same peek-wiggle as
   the My Animals card (Andy 14:43) + soft gold glow */
.dp-tile.dp-gift.today{animation:none}
/* the big present no longer wiggles all the time: it wiggles once now and then with the meter presents (Andy 2026-10-07) */
.dp-giftbox{transform-origin:50% 80%}
.dp-giftbox.wig{animation:dp-wigbig 1s ease-in-out}
@keyframes dp-wigbig{0%,100%{transform:rotate(0)}15%{transform:rotate(-3.5deg)}30%{transform:rotate(3deg)}45%{transform:rotate(-2.2deg)}60%{transform:rotate(1.5deg)}75%{transform:rotate(-.7deg)}}
.dp-meter{position:absolute;height:24px;border-radius:999px;background:#0d3437;border:4px solid #f4e3b5;box-shadow:inset 0 3px 6px rgba(0,0,0,.5),0 3px 0 rgba(0,0,0,.25)}
.dp-mfill{height:100%;border-radius:999px;background:linear-gradient(180deg,#d4ffa8 0%,#6fdc4a 45%,#2f9a1c 100%);box-shadow:inset 0 3px 0 rgba(255,255,255,.55);transition:width .9s cubic-bezier(.3,1.3,.6,1)}
.dp-mk{position:absolute;transform:translate(-50%,-50%);pointer-events:none}
.dp-mk.done{width:42px;height:42px;border-radius:50%;background:#fff8e6;border:3px solid #c98a2a;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(0,0,0,.3);animation:dp-mkpop .45s cubic-bezier(.3,1.6,.5,1)}
.dp-mk.dot{width:30px;height:30px;border-radius:50%;background:#f4e3b5;border:3px solid #8a5a1a;display:flex;align-items:center;justify-content:center;font-family:'Titan One',sans-serif;font-size:15px;color:#5a2d08}
.dp-mk.dot.now{background:#ffe066;box-shadow:0 0 12px 3px rgba(255,220,90,.9)}
.dp-mk.gift{transform:translate(-50%,-76%);filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))}
.dp-mk.gift svg{display:block;transform-origin:50% 90%}
.dp-mk.gift.now{filter:drop-shadow(0 0 8px #fff3a0) drop-shadow(0 0 16px rgba(255,214,70,.95)) drop-shadow(0 4px 3px rgba(0,0,0,.35))} /* today's present glows */
.dp-mk.gift.wig svg{animation:dp-wig .9s ease-in-out}
@keyframes dp-wig{0%,100%{transform:rotate(0)}15%{transform:rotate(-8deg)}30%{transform:rotate(6.5deg)}45%{transform:rotate(-4.5deg)}60%{transform:rotate(3deg)}75%{transform:rotate(-1.2deg)}} /* smaller (Andy 10:01) */
@keyframes dp-mkpop{0%{transform:translate(-50%,-50%) scale(.3)}100%{transform:translate(-50%,-50%) scale(1)}}
.dp-pink{position:absolute;width:0;height:0;pointer-events:none}
.dp-pinkhalo{position:absolute;left:-190px;top:-190px;width:380px;height:380px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,226,90,.95),rgba(255,206,60,.62) 42%,rgba(255,220,110,.25) 70%,rgba(255,220,110,0) 100%); /* YELLOW (Andy 20:38, was pink) */
  animation:dp-pinkbreathe 3.4s ease-in-out infinite}
.dp-rays{position:absolute;left:-185px;top:-185px;width:370px;height:370px;border-radius:50%;
  background:repeating-conic-gradient(rgba(255,226,110,0) 0deg,rgba(255,226,110,.8) 9deg,rgba(255,226,110,0) 18deg,rgba(255,226,110,0) 45deg);filter:blur(5px); /* 8 even rays, a bit wider (Andy 21:25) */
  -webkit-mask-image:radial-gradient(closest-side,#000 30%,transparent 100%);mask-image:radial-gradient(closest-side,#000 30%,transparent 100%);
  animation:dp-spin 40s linear infinite}
@keyframes dp-spin{to{transform:rotate(360deg)}}
.dp-pd{position:absolute;left:0;top:0;border-radius:50%;background:#ffd93a;opacity:0;
  box-shadow:0 0 8px 3px rgba(255,217,58,.95),0 0 20px 7px rgba(255,200,60,.6);animation:dp-pdrift linear infinite}
.dp-pd.w{background:#fffbe6;box-shadow:0 0 8px 3px rgba(255,255,230,.95),0 0 18px 7px rgba(255,210,70,.75)}
.dp-pstar{position:absolute;opacity:0;filter:hue-rotate(275deg) saturate(2.2) brightness(1.15) drop-shadow(0 0 8px #ff3fcf);
  animation:dp-pstar ease-in-out infinite}
@keyframes dp-pinkbreathe{0%,100%{opacity:.82;transform:scale(.94)}50%{opacity:1;transform:scale(1.07)}}
@keyframes dp-pdrift{0%{opacity:0;transform:rotate(var(--a)) translateX(35px) scale(.4)}18%{opacity:1}75%{opacity:.9}100%{opacity:0;transform:rotate(var(--a)) translateX(var(--d)) scale(1)}}
@keyframes dp-pstar{0%,100%{opacity:0;transform:scale(.3) rotate(0deg)}45%{opacity:1;transform:scale(1) rotate(30deg)}70%{opacity:.55}}
@keyframes dp-peek{0%,52%,100%{transform:rotate(0)}56%{transform:rotate(-2.4deg)}61%{transform:rotate(2.2deg)}66%{transform:rotate(-1.8deg)}71%{transform:rotate(1.2deg)}76%{transform:rotate(0)}}
@keyframes dp-giftglow{0%,100%{filter:drop-shadow(0 0 6px rgba(255,220,90,.7))}50%{filter:drop-shadow(0 0 18px rgba(255,220,90,1))}}
.dp-face{position:absolute;left:14px;right:14px;top:40px;bottom:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  font-family:'Titan One',sans-serif;color:#5a2d08;font-size:20px}
.dp-face span{display:flex;align-items:center;gap:4px}
.dp-face.n1 img{width:62px;height:62px}.dp-face.n1{font-size:26px;flex-direction:column}
.dp-face.n1 span{flex-direction:column;gap:0}
.dp-face.n2 img,.dp-face.n3 img{width:34px;height:34px}
.dp-face img{object-fit:contain;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))}
.dp-chips{position:absolute;left:-6px;right:-6px;display:flex;justify-content:center;gap:6px;padding:6px 8px;border-radius:22px;background:rgba(255,248,230,.95);
  box-shadow:0 3px 0 rgba(150,90,20,.35);font-family:'Titan One',sans-serif;color:#5a2d08;font-size:19px}
.dp-chips span{display:flex;align-items:center;gap:2px}.dp-chips img{width:30px;height:30px;object-fit:contain}
.dp-claim{position:absolute;left:50%;top:${BH - 62}px;transform:translateX(-50%);font-size:40px;padding:14px 56px}
.dp-claim:disabled{filter:saturate(.6) brightness(.95)}
.dp-fly{position:absolute;width:58px;height:58px;margin:-29px 0 0 -29px;opacity:0;z-index:5;filter:drop-shadow(0 3px 3px rgba(0,0,0,.3));
  animation:dp-fly ${FLY_MS}ms cubic-bezier(.45,0,.55,1) forwards}
@keyframes dp-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes dp-fadeOut{from{opacity:1}to{opacity:0}}
@keyframes dp-rise{0%{opacity:0;transform:translateY(70px) scale(.72)}60%{opacity:1;transform:translateY(-8px) scale(1.03)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes dp-away{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(.88)}}
@keyframes dp-breathe{0%,100%{opacity:.7;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}
@keyframes dp-sweep{0%{background-position:120% 0}55%,100%{background-position:-20% 0}}
@keyframes dp-twinkle{0%,100%{opacity:0;transform:scale(.4) rotate(0deg)}45%{opacity:.95;transform:scale(1) rotate(25deg)}70%{opacity:.5}}
@keyframes dp-today{0%,100%{transform:scale(1);filter:drop-shadow(0 0 6px rgba(255,220,90,.7))}50%{transform:scale(1.05);filter:drop-shadow(0 0 18px rgba(255,220,90,1))}}
@keyframes dp-fly{0%{opacity:0;transform:translate(0,0) scale(.5)}12%{opacity:1;transform:translate(0,-40px) scale(1.05)}90%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.7)}}
@media (prefers-reduced-motion: reduce){.dp-glow,.dp-shine,.dp-spark,.dp-tile.today,.dp-gift.today .dp-giftbox,.dp-pinkhalo,.dp-pstar,.dp-rays{animation:none}.dp-pd{display:none}}
`;
