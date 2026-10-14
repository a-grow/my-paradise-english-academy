// WIN PARADE (Andy 2026-10-14): back on the world page after winning, everything won POPS UP in the middle (pop sound + soft glow),
// then flies to its place one kind after another, like the game win screen used to (each prize pops out, then curves in while it
// flips): treats -> jar, coins -> coin counter (the Card Album meter grows green with a rising sound), pieces -> Puzzle counter
// (harp plucks), new badges -> My Badges. A "+N" floats up at each place. Taps are blocked until it is done. No glowing dots.
// LOOK ONLY: the database already paid everything; the world page passes the amounts (what went up since it last showed).
import { useEffect, useRef, useState } from "react";
import type { PrizeKind } from "./GrowUpParty";

export type ParadeItem = { kind: PrizeKind; n: number; img: string };
const POP = 260, FLIGHT = 780, HOLD = 1400;                // pop up, friendly arc into the button, prizes shown in the middle first
const GAPS: Record<PrizeKind, number> = { coin: 62, treat: 160, piece: 160, badge: 0 };
const MAXN: Record<PrizeKind, number> = { coin: 14, treat: 6, piece: 6, badge: 1 };
const PLUCK = [1, 1.125, 1.25, 1.5, 1.667];                 // pieces: each harp pluck a little higher (same as the grow-up party)
const ORDER: PrizeKind[] = ["treat", "coin", "piece", "badge"];

export default function WinParade({ cx, sh, items, sfxOn, target, onLand, onDone }: {
  cx: number; sh: number; items: ParadeItem[]; sfxOn: boolean;
  target: (k: PrizeKind) => { x: number; y: number } | null; onLand: (k: PrizeKind, add: number) => void; onDone: () => void;
}) {
  const [list] = useState(() => [...items].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)));
  const TW = 160, rowY = Math.round(sh * 0.42);
  const tileX = (i: number) => cx + (i - (list.length - 1) / 2) * TW;
  const [gone, setGone] = useState<number[]>([]);
  const [plus, setPlus] = useState<{ id: number; x: number; y: number; t: string }[]>([]);
  const layer = useRef<HTMLDivElement>(null);

  const play = (f: string, vol: number) => {
    if (!sfxOn) return undefined;
    try { const a = new Audio(f); a.volume = vol; a.play().catch(() => { }); return a; } catch { return undefined; }
  };
  // PLACEHOLDER rising sound while the Card Album meter grows (made in the browser, no file). Andy can send a clip later.
  const rise = (ms: number) => {
    if (!sfxOn) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC(), o = ac.createOscillator(), g = ac.createGain();
      const t = ac.currentTime, d = Math.max(0.7, ms / 1000);
      o.type = "triangle";
      o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(990, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.15);
      g.gain.setValueAtTime(0.07, t + d - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.05);
      o.onended = () => { ac.close().catch(() => { }); };
    } catch { /* no sound */ }
  };

  useEffect(() => {
    const timers: number[] = [], rafs: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    // the button ABSORBS it: a round bright flash in its middle (Andy 10-14)
    const flash = (x: number, y: number) => {
      const root = layer.current; if (!root) return;
      const f = document.createElement("div");
      f.className = "wp-flash";
      root.appendChild(f);
      f.animate([
        { transform: `translate(${x}px,${y}px) scale(.2)`, opacity: 1 },
        { transform: `translate(${x}px,${y}px) scale(1.3)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${x}px,${y}px) scale(2)`, opacity: 0 },
      ], { duration: 550, easing: "ease-out" }).onfinish = () => f.remove();
    };
    // ONE PRIZE FLYING (Andy 10-14): pops UP a little, rises in a soft friendly arc, then swoops down into the MIDDLE of its
    // button, shrinking + fading as the button swallows it (flash). Each one gets a slightly different arc.
    const launch = (src: { x: number; y: number }, dst: { x: number; y: number }, img: string, size: number, flip: boolean) => {
      const root = layer.current; if (!root) return;
      const c = document.createElement("div");
      c.className = "wp-fly";
      c.style.width = c.style.height = `${size}px`; c.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
      c.innerHTML = `<div class="${flip ? "wp-tumble" : ""}"><img src="${img}" alt="" /></div>`;
      root.appendChild(c);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, r = 45 + Math.random() * 45;   // mostly upward
      const p1 = { x: src.x + Math.cos(a) * r, y: src.y + Math.sin(a) * r };
      const side = dst.x >= p1.x ? 1 : -1, lift = 110 + Math.random() * 90;
      const c1 = { x: p1.x + (dst.x - p1.x) * 0.25, y: Math.min(p1.y, dst.y) - lift };      // rises in a soft arc...
      const c2 = { x: dst.x - side * (30 + Math.random() * 50), y: dst.y - 80 - Math.random() * 50 };   // ...and comes down into the button
      const t0 = performance.now();
      const step = (now: number) => {
        const t = now - t0;
        let x: number, y: number, s: number, o = 1;
        if (t < POP) {
          const k = 1 - Math.pow(1 - t / POP, 3);
          x = src.x + (p1.x - src.x) * k; y = src.y + (p1.y - src.y) * k; s = 0.6 + 0.55 * k;
        } else {
          const u = Math.min(1, (t - POP) / FLIGHT), k = u * u * (3 - 2 * u), m = 1 - k;
          x = m * m * m * p1.x + 3 * m * m * k * c1.x + 3 * m * k * k * c2.x + k * k * k * dst.x;
          y = m * m * m * p1.y + 3 * m * m * k * c1.y + 3 * m * k * k * c2.y + k * k * k * dst.y;
          s = u < 0.8 ? 1.15 - 0.2 * (u / 0.8) : 0.95 - 0.7 * ((u - 0.8) / 0.2);           // shrinks as it goes in
          if (u > 0.88) o = Math.max(0, 1 - (u - 0.88) / 0.12);
          if (u >= 1) { c.remove(); flash(dst.x, dst.y); return; }
        }
        c.style.transform = `translate(${x}px,${y}px) scale(${s})`;
        c.style.opacity = String(o);
        rafs.push(requestAnimationFrame(step));
      };
      rafs.push(requestAnimationFrame(step));
    };

    play("/celebration/win_pop.mp3", 0.7);                    // the prizes pop up
    let t = HOLD;
    list.forEach((p, i) => {
      const start = t;
      const count = Math.max(1, Math.min(p.n, MAXN[p.kind])), gap = GAPS[p.kind];
      const end = start + (count - 1) * gap + POP + FLIGHT;
      // AIM WHEN IT LEAVES (fix 10-14): the world page's buttons slide in when it opens - measured at the start, the
      // prizes aimed where the buttons were mid-slide (coins above the screen, treats below). Measure at take-off instead.
      later(() => {
        setGone(g => [...g, i]);
        const to = target(p.kind);
        if (!to) { onLand(p.kind, p.n); return; }
        const src = { x: tileX(i), y: rowY };
        if (p.kind === "coin") later(() => rise((count - 1) * gap + 700), POP + FLIGHT - 150);
        for (let j = 0; j < count; j++) {
          const add = Math.floor(p.n / count) + (j < p.n % count ? 1 : 0);
          later(() => launch(src, target(p.kind) ?? to, p.img, p.kind === "badge" ? 96 : 60, false), j * gap);   // no flipping (Andy 10-14: you could see they are flat)
          // treats: the JAR plays its own drop sound - start it ~350ms before the treat arrives (same as the Daily Prize)
          later(() => {
            onLand(p.kind, add);
            if (p.kind === "coin" && j === 0) {
              const a = play("/celebration/coins_land.mp3", 0.6);
              if (a) { const e2 = (count - 1) * gap + 250; [1, 2, 3, 4, 5].forEach(k => later(() => { a.volume = 0.6 * (1 - k / 5); if (k === 5) a.pause(); }, e2 + k * 50)); }
            }
            if (p.kind === "piece") {
              const a = play("/celebration/piece_pluck.mp3", 0.6) as (HTMLAudioElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean }) | undefined;
              if (a) { a.preservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = PLUCK[j % PLUCK.length]; }
            }
            if (p.kind === "badge") play("/worlds/ui/snd_newfriend.mp3", 0.6);   // plays to its end (Andy 10-14: it was cut off)
          }, j * gap + POP + FLIGHT - (p.kind === "treat" ? 350 : 0));
        }
        later(() => {                                          // "+N" floats up where they landed
          const id = Date.now() + Math.random(), at = target(p.kind) ?? to;
          setPlus(q => [...q, { id, x: at.x, y: at.y - 30, t: p.kind === "badge" ? "New!" : `+${p.n}` }]);
          later(() => setPlus(q => q.filter(x => x.id !== id)), 1500);
        }, end - start);
      }, start);
      t = end + 450;
    });
    later(onDone, t + 400);
    // only the timers + flights stop on leaving; sounds play to their end (no abrupt cut)
    return () => { timers.forEach(x => window.clearTimeout(x)); rafs.forEach(x => cancelAnimationFrame(x)); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="wp-root" ref={layer}>
      <style>{CSS}</style>
      <i className="wp-glow" style={{ left: cx, top: rowY, width: Math.max(420, list.length * TW + 200) }} />
      {list.map((p, i) => (
        <div key={i} className={"wp-tile" + (gone.includes(i) ? " gone" : "")} style={{ left: tileX(i), top: rowY }}>
          <div className="wp-in" style={{ animationDelay: `${i * 90}ms` }}>
            <img src={p.img} alt="" style={{ width: p.kind === "badge" ? 110 : 96 }} />
            <div className="wp-n">{p.kind === "badge" ? "New!" : `+${p.n}`}</div>
          </div>
        </div>
      ))}
      {plus.map(q => <div key={q.id} className="wp-plus" style={{ left: q.x, top: q.y }}>{q.t}</div>)}
    </div>
  );
}

const CSS = `
.wp-root{position:absolute;inset:0;z-index:80;pointer-events:auto}
.wp-glow{position:absolute;height:300px;translate:-50% -50%;border-radius:50%;pointer-events:none;
 background:radial-gradient(closest-side,rgba(255,240,170,.7),rgba(255,220,120,.25) 55%,rgba(255,220,120,0));animation:wp-glow 1.6s ease-out both}
@keyframes wp-glow{0%{opacity:0;transform:scale(.4)}25%{opacity:1;transform:scale(1.05)}70%{opacity:1}100%{opacity:0;transform:scale(1)}}
.wp-tile{position:absolute;translate:-50% -50%;pointer-events:none;transition:opacity .2s ease-in}
.wp-tile.gone{opacity:0}
.wp-in{display:flex;flex-direction:column;align-items:center;animation:wp-in .55s cubic-bezier(.3,1.6,.5,1) both}
@keyframes wp-in{0%{opacity:0;transform:scale(.2)}100%{opacity:1;transform:scale(1)}}
.wp-in img{display:block;filter:drop-shadow(0 6px 8px rgba(0,0,0,.4))}
.wp-n{margin-top:2px;font-family:'Titan One',sans-serif;font-size:34px;line-height:1;color:#fff;paint-order:stroke fill;-webkit-text-stroke:6px #3a1d6e;white-space:nowrap}
.wp-fly{position:absolute;left:0;top:0;pointer-events:none;z-index:2}
.wp-fly > div{width:100%;height:100%}
.wp-fly img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4))}
.wp-tumble{animation:wp-tumble .35s linear infinite}
.wp-flash{position:absolute;left:0;top:0;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;pointer-events:none;z-index:3;
 background:radial-gradient(circle,#fff 0%,#fffbe0 16%,#ffef5a 38%,rgba(255,222,40,.6) 58%,rgba(255,210,0,0) 72%)}
@keyframes wp-tumble{0%{transform:scaleX(1)}50%{transform:scaleX(.25)}100%{transform:scaleX(1)}}
.wp-plus{position:absolute;z-index:3;translate:-50% -100%;pointer-events:none;font-family:'Titan One',sans-serif;font-size:32px;line-height:1;
 color:#fff;paint-order:stroke fill;-webkit-text-stroke:6px #1f7a2a;white-space:nowrap;animation:wp-plus 1.4s ease-out both}
@keyframes wp-plus{0%{opacity:0;transform:translateY(10px) scale(.6)}20%{opacity:1;transform:translateY(0) scale(1.15)}70%{opacity:1}100%{opacity:0;transform:translateY(-46px) scale(1)}}
@media (prefers-reduced-motion: reduce){.wp-tumble{animation:none}}
`;
