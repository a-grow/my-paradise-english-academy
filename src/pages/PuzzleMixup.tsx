// PUZZLE MIXUP! (Andy 2026-10-11, from his Domino Dreams screenshots). All the worlds got mixed up, so every picture
// shows animals from different worlds together. A framed picture on a purple puzzle background; the picture is covered by
// cream jigsaw pieces, each with a BIG number = puzzle pieces needed. Tap a piece: your pieces fly into it, the number counts
// down, it cracks and pops off. Under the covers the picture is MUTED; when the last cover pops, colour sweeps out from the
// middle with a magic ring + sparkles, "Puzzle Complete!", then the prize. Then the next picture slides in.
// STEP 1 = DISPLAY ONLY on teacher code 1006 (pretend pieces + coins, NOTHING is saved). Every other code: "Coming soon".
// Real saving (puzzle_earned / puzzle_used columns + which covers are gone) = its own careful cloud session later.
// Test flags (1006 only): ?p=3 start on puzzle 3 | ?almost=1 every cover but one already gone | ?pc=12 pieces to start with.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Word3D, FUN3D_CSS } from "@/components/Fun3D";
import { MixupWord, MIXUP_CSS } from "@/components/MixupWord";
import { useClickSfx } from "@/lib/clickSfx";
import HowToPlay from "@/components/HowToPlay";
import { PUZZLE_HOWTO } from "@/components/howtos";
import { useHowtoSeen, wantHowto, seenHowto, firstHowto } from "@/lib/howtoSeen";
import { DEMO_COINS, demoCoinsGet, demoCoinsSet } from "@/cards/economy";
import { loadPuzzle, puzzlePop, addCoins, claimPrize, loadPrizes } from "@/lib/cloudSave";
import { lockLeft, LOCK_IMG } from "@/lib/locks";
import LockMsg from "@/components/LockMsg";

const MASTER_CODE = "1006";
// LAUNCH (2026-10-22): EVERY kid's code reads + saves for real (Puzzle + Card Album). Only the teacher code 1006 stays the demo.
// (Was a list of test codes: TEST99, TEST77, TEST88.) The locks (src/lib/locks.ts) still decide when a kid can open them.
export const isRealCode = (c: string) => !!c && c.toUpperCase() !== MASTER_CODE;
const P = "/puzzle";
const UI = "/worlds/ui";
const STAGE_W = 1600, STAGE_H = 1000;
// frame.webp 962x732: the hole inside (picture px, measured from the green cut)
const FR = { w: 962, h: 732, hx: 124, hy: 133, hw: 714, hh: 488 };
const FW = 960, FT = 122, PAD = 8;          // frame width + top on the stage; the picture reaches PAD px under the frame
const K = FW / FR.w, FH = FR.h * K;
const PIC = { x: FR.hx * K - PAD, y: FR.hy * K - PAD, w: FR.hw * K + 2 * PAD, h: FR.hh * K + 2 * PAD };
const PRIZE = { coins: 50, treats: 5 };     // shown only (Andy to decide) - the database will pay (cloud step)
export const DEMO_PIECES = 60;   // 1006 pretend pieces (also the world page's Puzzle button counter)
const DEMO_PCS_KEY = "mpe_demo_pieces";   // 1006: ONE pretend piece count for this browser tab, shared with the world page's Puzzle button counter (Andy 2026-10-11)
export const demoPiecesGet = () => { try { const n = parseInt(sessionStorage.getItem(DEMO_PCS_KEY) ?? "", 10); return Number.isFinite(n) && n >= 0 ? n : DEMO_PIECES; } catch { return DEMO_PIECES; } };
export const demoPiecesSet = (n: number) => { try { sessionStorage.setItem(DEMO_PCS_KEY, String(Math.max(0, n))); } catch { /* */ } };
const PILL = { x: 30 + 30, y: 22 + 34 };    // where flying pieces start (the piece icon on the pill)
const WELCOME = 8;                          // WELCOME GIFT: 8 pieces once per kid (database prize 'puzzle:welcome' pays them; Andy 2026-10-11)
const PLUCK = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25, 2.5];   // each gift piece lands with a harp pluck, a little higher each time (like the parties)
const pluck = (k: number) => { try { const a = new Audio("/celebration/piece_pluck.mp3") as HTMLAudioElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean }; a.volume = 0.6; a.preservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = PLUCK[k % PLUCK.length]; a.play().catch(() => { }); } catch { /* */ } };
// 1006 DEMO: progress kept for this browser tab (sessionStorage) - a game/world trip and back keeps it; a full page load starts fresh.
const DEMO_KEY = "mpe_demo_puzzle";
let demoBooted = false;
type DemoSave = { idx: number; gone: number[]; pieces: number; coins: number; done: number[] };

// The pictures (public/puzzle/p1..p7.webp). DIFFICULTY GROWS GENTLY (Andy 2026-10-11): a few more covers each picture and
// slightly higher numbers. [columns, rows, lowest need, highest need] per picture; the numbers inside a range are picked once
// (fixed seed = the same every time). Totals about 12, 16, 24, 27, 42, 48, 67 pieces. Andy can change this table.
type Puzzle = { img: string; cols: number; rows: number; need: number[] };
const LEVELS: [number, number, number, number][] = [
  [3, 2, 1, 3],   // 1 theme park selfie (6 covers)
  [3, 2, 1, 4],   // 2 at the movies (6)
  [4, 2, 2, 4],   // 3 picnic (8)
  [3, 3, 2, 4],   // 4 ice rink (9)
  [4, 3, 2, 5],   // 5 underwater (12)
  [4, 3, 3, 5],   // 6 water park (12)
  [5, 3, 3, 6],   // 7 flying car (15)
];
const PUZZLES: Puzzle[] = LEVELS.map(([cols, rows, lo, hi], k) => {
  let seed = 101 + k * 977;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return { img: `p${k + 1}`, cols, rows, need: Array.from({ length: cols * rows }, () => lo + Math.floor(r() * (hi - lo + 1))) };
});

const play = (src: string, vol = 0.6) => { try { const a = new Audio(src); a.volume = vol; a.play().catch(() => { }); } catch { /* */ } };

// ---------- little synth sounds (no files): pops, rising plinks, a soft "not yet" ----------
let AC: AudioContext | null = null;
const ac = () => {
  try {
    if (!AC) { const W = window as unknown as { webkitAudioContext?: typeof AudioContext }; AC = new (window.AudioContext || W.webkitAudioContext!)(); }
    if (AC.state === "suspended") AC.resume().catch(() => { });
    return AC;
  } catch { return null; }
};
const tone = (f0: number, f1: number, dur: number, vol = 0.16, type: OscillatorType = "sine", at = 0) => {
  const c = ac(); if (!c) return;
  const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
};
const plink = (k: number) => { const f = 620 * Math.pow(2, Math.min(k, 14) / 12); tone(f, f * 1.5, 0.14, 0.15, "triangle"); tone(f * 2, f * 2.3, 0.1, 0.05); };
const popIn = (k: number) => { const f = 280 + k * 38; tone(f, f * 2.4, 0.09, 0.13); };
const nope = () => { tone(330, 262, 0.12, 0.13, "triangle"); tone(262, 196, 0.17, 0.13, "triangle", 0.12); };
const snap = () => { tone(900, 300, 0.06, 0.12, "square"); tone(1400, 700, 0.05, 0.06, "triangle", 0.02); };

// ---------- MAGIC: one canvas, round glowing dots only (no star shapes) ----------
type Part = { x: number; y: number; vx: number; vy: number; s: number; t: number; life: number; k: 0 | 1 | 2; ph: number };
const sprite = (core: string, mid: string, edge: string) => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, core); gr.addColorStop(0.22, mid); gr.addColorStop(0.55, edge); gr.addColorStop(1, "rgba(255,190,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  }
  return c;
};
class Fx {
  ps: Part[] = [];
  em: { until: number; fn: (dt: number, now: number) => void }[] = [];
  cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null; spr: HTMLCanvasElement[];
  raf = 0; last = 0; on = true;
  constructor(cv: HTMLCanvasElement) {
    this.cv = cv; this.ctx = cv.getContext("2d");
    this.spr = [sprite("rgba(255,255,225,1)", "rgba(255,222,90,.95)", "rgba(255,150,10,.4)"),
      sprite("rgba(255,255,255,1)", "rgba(255,240,255,.95)", "rgba(220,170,255,.4)"),
      sprite("rgba(255,252,230,.95)", "rgba(255,232,150,.55)", "rgba(255,205,90,.18)")];
    this.raf = requestAnimationFrame(this.frame);
  }
  ember(x: number, y: number, sp = 1) {
    this.ps.push({ x, y, vx: (Math.random() - 0.5) * 60 * sp, vy: -(40 + Math.random() * 90) * sp, s: 2.6 + Math.random() * 3.4, t: 0, life: 1.2 + Math.random() * 1.5, k: 0, ph: Math.random() * 6.28 });
  }
  fairy(x: number, y: number, sp = 1) {
    const a = Math.random() * 6.28, v = (30 + Math.random() * 130) * sp;
    this.ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, s: 1.6 + Math.random() * 2.6, t: 0, life: 0.6 + Math.random() * 1.1, k: 1, ph: Math.random() * 6.28 });
  }
  glow(x: number, y: number, s: number, life = 0.9) { this.ps.push({ x, y, vx: 0, vy: 0, s, t: 0, life, k: 2, ph: 0 }); }
  burst(x: number, y: number, o: { embers?: number; fairies?: number; glow?: number; w?: number; h?: number; sp?: number }) {
    const w = o.w ?? 40, h = o.h ?? w;
    for (let i = 0; i < (o.embers ?? 0); i++) this.ember(x + (Math.random() - 0.5) * w, y + (Math.random() - 0.5) * h, o.sp);
    for (let i = 0; i < (o.fairies ?? 0); i++) this.fairy(x + (Math.random() - 0.5) * w, y + (Math.random() - 0.5) * h, o.sp);
    if (o.glow) this.glow(x, y, o.glow);
  }
  emit(ms: number, fn: (dt: number, now: number) => void) { this.em.push({ until: performance.now() + ms, fn }); }
  frame = (now: number) => {
    if (!this.on) return;
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0.016); this.last = now;
    this.em = this.em.filter(e => now < e.until); this.em.forEach(e => e.fn(dt, now));
    const c = this.ctx;
    if (c) {
      c.clearRect(0, 0, this.cv.width, this.cv.height);
      if (this.ps.length) {
        c.globalCompositeOperation = "lighter";
        this.ps = this.ps.filter(p => (p.t += dt) < p.life);
        for (const p of this.ps) {
          const k = p.t / p.life;
          let a = Math.min(1, p.t / 0.12) * (1 - k * k), r = p.s * 3.2;
          if (p.k === 0) { p.vy -= 12 * dt; p.x += (p.vx + Math.sin(p.t * 3 + p.ph) * 22) * dt; p.y += p.vy * dt; a *= 0.7 + 0.3 * Math.sin(p.t * 24 + p.ph); }
          else if (p.k === 1) { p.vx *= 1 - 1.5 * dt; p.vy = p.vy * (1 - 1.5 * dt) - 10 * dt; p.x += p.vx * dt; p.y += p.vy * dt; a *= 0.35 + 0.65 * Math.abs(Math.sin(p.t * 9 + p.ph)); }
          else { r = p.s * (0.7 + 0.5 * k); a = 0.9 * (1 - k); }
          c.globalAlpha = Math.max(0, Math.min(1, a));
          c.drawImage(this.spr[p.k], p.x - r, p.y - r, r * 2, r * 2);
        }
        c.globalAlpha = 1;
      }
    }
    this.raf = requestAnimationFrame(this.frame);
  };
  stop() { this.on = false; cancelAnimationFrame(this.raf); }
}

const useFit = () => {
  const calc = () => {
    const w = window.innerWidth || STAGE_W, h = window.innerHeight || STAGE_H;
    const s = Math.min(w / STAGE_W, h / STAGE_H);
    return { s, sw: w / s, sh: h / s };
  };
  const [f, setF] = useState(calc);
  useEffect(() => { const on = () => setF(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  return f;
};

// ---------- jigsaw cover shapes (each inside edge has a round tab one way or the other; outside edges are straight) ----------
type V = [number, number];
type Seg = [V, V, V, V];
const rnd = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
// canonical edge a -> b (+x when horiz, +y when not); s = 1 bulges toward +y (horiz) / +x (vertical), 0 = straight
function edge(a: V, b: V, s: number, m: number, horiz: boolean): Seg[] {
  const L = horiz ? b[0] - a[0] : b[1] - a[1];
  const pt = (u: number, v: number): V => (horiz ? [a[0] + u, a[1] + v * s] : [a[0] + v * s, a[1] + u]);
  if (!s) return [[pt(0, 0), pt(0, 0), pt(L, 0), pt(L, 0)]];
  const c = L / 2, k = m * 0.82;   // tab size (smaller = more room for the centred label, Andy 13:37)
  const q = (du: number, v: number) => pt(c + du * k, v * k);
  return [
    [pt(0, 0), pt(0, 0), q(-0.16, 0), q(-0.16, 0)],
    [q(-0.16, 0), q(-0.1, 0), q(-0.08, 0.03), q(-0.1, 0.08)],
    [q(-0.1, 0.08), q(-0.14, 0.17), q(-0.12, 0.25), q(0, 0.25)],
    [q(0, 0.25), q(0.12, 0.25), q(0.14, 0.17), q(0.1, 0.08)],
    [q(0.1, 0.08), q(0.08, 0.03), q(0.1, 0), q(0.16, 0)],
    [q(0.16, 0), q(0.16, 0), pt(L, 0), pt(L, 0)],
  ];
}
const rev = (segs: Seg[]): Seg[] => segs.slice().reverse().map(([p0, c1, c2, p3]) => [p3, c2, c1, p0] as Seg);
type Cover = { i: number; d: string; cx: number; cy: number; m: number; lx: number; ly: number; fs: number; iw: number };
// Label = piece icon + number. Size at scale 1: icon 0.27m wide, number 0.36m tall (m = the smaller cell side).
const LBL = (m: number, sc: number, digits: number) => {
  const fs = m * 0.36 * sc, iw = m * 0.27 * sc, gap = 6 * sc;
  return { fs, iw, gap, w: iw + gap + fs * (0.66 * digits + 0.1), h: Math.max(iw * 256 / 237, fs * 1.05) };
};
const bezAt = (g: Seg, t: number): V => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * g[0][0] + b * g[1][0] + c * g[2][0] + d * g[3][0], a * g[0][1] + b * g[1][1] + c * g[2][1] + d * g[3][1]];
};
const inside = (pt: V, poly: V[]) => {
  let r = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
};
const CLEAR = 13, EDGE = 28;   // px clear of every cut line / of the picture edge (the frame sits over it)
function fitLabel(poly: V[], x0: number, y0: number, x1: number, y1: number, m: number, digits: number, W: number, H: number, scales: number[]) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  for (const sc of scales) {
    const L = LBL(m, sc, digits), spots: V[] = [[mx, my]];   // ALWAYS the exact centre of the piece (Andy 13:37: every label in the same place)
    for (const [cx, cy] of spots) {
      const l = cx - L.w / 2, r = cx + L.w / 2, t = cy - L.h / 2, b = cy + L.h / 2;
      if (l < EDGE || t < EDGE || r > W - EDGE || b > H - EDGE) continue;
      if (![[l, t], [r, t], [l, b], [r, b]].every(c => inside(c as V, poly))) continue;
      if (poly.some(([px, py]) => px > l - CLEAR && px < r + CLEAR && py > t - CLEAR && py < b + CLEAR)) continue;
      return { sc, lx: l, ly: cy, fs: L.fs, iw: L.iw };
    }
  }
  const sc = scales[scales.length - 1], L = LBL(m, sc, digits);
  return { sc, lx: mx - L.w / 2, ly: my, fs: L.fs, iw: L.iw };
}
const SCALES = Array.from({ length: 12 }, (_, i) => 1 - i * 0.05);   // 1 .. 0.45
function makeCovers(pz: Puzzle, W: number, H: number, seed: number): Cover[] {
  const { cols, rows } = pz, cw = W / cols, ch = H / rows, m = Math.min(cw, ch), r = rnd(seed);
  const hs = Array.from({ length: rows + 1 }, (_, j) => Array.from({ length: cols }, () => (j === 0 || j === rows ? 0 : r() < 0.5 ? 1 : -1)));
  const vs = Array.from({ length: rows }, () => Array.from({ length: cols + 1 }, (_, i) => (i === 0 || i === cols ? 0 : r() < 0.5 ? 1 : -1)));
  const f = (v: V) => `${v[0].toFixed(1)} ${v[1].toFixed(1)}`;
  const raw: { i: number; d: string; cx: number; cy: number; m: number; poly: V[]; box: [number, number, number, number] }[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x0 = i * cw, x1 = (i + 1) * cw, y0 = j * ch, y1 = (j + 1) * ch;
    const segs = [
      ...edge([x0, y0], [x1, y0], hs[j][i], m, true),
      ...edge([x1, y0], [x1, y1], vs[j][i + 1], m, false),
      ...rev(edge([x0, y1], [x1, y1], hs[j + 1][i], m, true)),
      ...rev(edge([x0, y0], [x0, y1], vs[j][i], m, false)),
    ];
    const poly: V[] = [];
    segs.forEach(g => { for (let k = 0; k < 16; k++) poly.push(bezAt(g, k / 16)); });
    raw.push({ i: j * cols + i, d: `M${f(segs[0][0])}` + segs.map(sg => `C${f(sg[1])} ${f(sg[2])} ${f(sg[3])}`).join("") + "Z", cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, m, poly, box: [x0, y0, x1, y1] });
  }
  // ONE label size per picture: the biggest that fits EVERY cover; then each label sits at its safe spot nearest the middle.
  const dig = (i: number) => String(pz.need[i]).length;
  const common = Math.min(...raw.map(c => fitLabel(c.poly, ...c.box, m, dig(c.i), W, H, SCALES).sc));
  return raw.map(({ poly, box, ...c }) => {
    const { sc: _sc, ...lab } = fitLabel(poly, ...box, m, dig(c.i), W, H, [common]);
    return { ...c, ...lab };
  });
}

type Phase = "intro" | "gift" | "play" | "paying" | "finale" | "prize" | "collect" | "next" | "out";
type Flyer = { id: number; x0: number; y0: number; x1: number; y1: number; d: number; img: string; w: number };

export default function PuzzleMixup() {
  const { code: rawCode, studentName: rawName } = useParams();
  const code = (rawCode ?? "").toUpperCase(), name = (rawName ?? "").toLowerCase();
  const navigate = useNavigate();
  const isMaster = code === MASTER_CODE;
  const real = !isMaster && isRealCode(code);   // reads + saves the real piece jar (database)
  const on = isMaster || real;
  const { s, sw, sh } = useFit();
  const cx = sw / 2;
  useClickSfx(true);

  const ret = useMemo(() => {
    const r = sessionStorage.getItem("mpe_return_world") || "";
    return r.toLowerCase().includes(`/${code.toLowerCase()}/${name}`) ? r : `/world/${code}/${name}`;
  }, [code, name]);

  const qs = useMemo(() => new URLSearchParams(window.location.search), []);
  const startIdx = Math.max(0, Math.min(PUZZLES.length - 1, (parseInt(qs.get("p") ?? "1", 10) || 1) - 1));
  const flagged = ["p", "almost", "pc"].some(k => qs.has(k));   // test flags = always start from them
  if (isMaster && !demoBooted) { demoBooted = true; try { sessionStorage.removeItem(DEMO_KEY); } catch { /* */ } }
  const saved = useMemo<DemoSave | null>(() => {
    if (!isMaster || flagged) return null;
    try { const d = JSON.parse(sessionStorage.getItem(DEMO_KEY) || "null"); return d && typeof d.idx === "number" ? d : null; } catch { return null; }
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(saved?.idx ?? startIdx);
  const pz = PUZZLES[idx];
  const covers = useMemo(() => makeCovers(pz, PIC.w, PIC.h, 7 + idx * 131), [pz, idx]);
  const almost = () => (qs.get("almost") === "1" ? new Set(pz.need.map((_, i) => i).slice(1)) : new Set<number>());
  const [gone, setGone] = useState<Set<number>>(() => (saved ? new Set(saved.gone) : almost()));   // covers already popped off
  const [rem, setRem] = useState<number[]>(() => pz.need.slice());  // number showing on each cover (counts down while paying)
  const [pieces, setPieces] = useState(() => { if (real) return 0; const n = parseInt(qs.get("pc") ?? "", 10); return Number.isFinite(n) ? n : demoPiecesGet(); });   // 1006 = the tab's shared pretend count
  const [coins, setCoins] = useState(real ? 0 : isMaster ? demoCoinsGet() : saved?.coins ?? DEMO_COINS);
  useEffect(() => { if (isMaster) demoCoinsSet(coins); }, [isMaster, coins]); // 1006: one pretend coin number for the tab (2026-10-15)
  const [doneList, setDoneList] = useState<number[]>(() => saved?.done ?? Array.from({ length: startIdx }, (_, i) => i));
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [cls, setCls] = useState<Record<number, string>>({});      // per-cover animation class (wig / crack / pop / hint)
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [bubble, setBubble] = useState<{ i: number; more: number; k: number } | null>(null);
  const [pillFx, setPillFx] = useState("");
  const [hint, setHint] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  const [gift, setGift] = useState<{ n: number; out: boolean } | null>(null);   // the 'Welcome gift!' card (n = pieces still on it)
  // REAL KID: read the puzzle + piece jar + coins first; the board waits for it. Could not read = 'try again' screen.
  const [loaded, setLoaded] = useState(!real);
  const [failed, setFailed] = useState(false);
  const prizeRef = useRef({ coins: PRIZE.coins, treats: PRIZE.treats });   // what the database paid for this puzzle
  const [lockN, setLockN] = useState(0);   // LOCK (launch step 4): stages still to grow (0 = open) - checked BEFORE the welcome gift
  const giftRef = useRef(isMaster && qs.get("gift") === "1" ? WELCOME : 0);   // welcome pieces still to fly in (TEST ONLY 1006 ?gift=1 = show it, nothing saved)
  useEffect(() => {
    if (!real) return;
    let alive = true;
    // WELCOME GIFT: asked FIRST (the database pays 8 pieces once; a repeat = paid false), so the jar read below already holds them.
    // The pill starts WITHOUT the gift; the pieces fly in after the frame drops (welcomeGift). A kid leaving early keeps them (paid).
    (async () => {
      const list = await loadPrizes(code, name);   // LOCK first: a locked kid is paid nothing here (no welcome gift yet)
      if (!alive) return;
      if (list === undefined) { setFailed(true); return; }
      const left = lockLeft("puzzle", list, false);
      if (left > 0) { setLockN(left); return; }
      const w = await claimPrize(code, name, "puzzle:welcome");
      const [p, c] = await Promise.all([loadPuzzle(code, name), addCoins(code, name, 0)]);
      if (!alive) return;
      if (p === undefined) { setFailed(true); return; }
      const gift = w && w.paid ? Math.max(0, Number((w as { pieces?: number }).pieces ?? WELCOME)) : 0;
      giftRef.current = gift;
      if (typeof c === "number") setCoins(c);
      const all = !!p && p.idx >= PUZZLES.length, n = p ? Math.min(p.idx, PUZZLES.length - 1) : 0;
      setIdx(n); setRem(PUZZLES[n].need.slice());
      setGone(new Set(all ? PUZZLES[n].need.map((_, i) => i) : p ? p.gone : []));
      setPieces(Math.max(0, (p ? p.pieces : 0) - gift));
      setDoneList(Array.from({ length: all ? PUZZLES.length : n }, (_, i) => i));
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, [real, code, name]);
  // HOW TO PLAY first (first 3 times, cloud 'seen' like the games; id 'puzzle'), then the frame drops in. '?' reopens it.
  const howReady = useHowtoSeen(code, name);
  const [how, setHow] = useState<"ask" | "open" | "done">("ask");
  const [go, setGo] = useState(false);
  // PICTURE READY FIRST (Andy 10-19 iPad: the open parts showed plain grey at first): the board drops in only once the iPad has
  // the picture loaded + decoded (or after 4 s at most); every puzzle picture is fetched at the start too.
  const picUrl = `${P}/${pz.img}.webp`;
  const [picOk, setPicOk] = useState("");
  useEffect(() => { PUZZLES.forEach(q => { new Image().src = `${P}/${q.img}.webp`; }); }, []);
  useEffect(() => {
    let alive = true;
    const done = () => { if (alive) setPicOk(picUrl); };
    const im = new Image(); im.src = picUrl;
    (im.decode ? im.decode() : Promise.resolve()).then(done, done);
    const t = window.setTimeout(done, 4000);
    return () => { alive = false; window.clearTimeout(t); };
  }, [picUrl]);
  useEffect(() => {
    if (!on || !loaded || how !== "ask" || !howReady || picOk !== picUrl) return;
    if (wantHowto("puzzle")) setHow("open"); else { setHow("done"); setGo(true); }
  }, [on, loaded, how, howReady, picOk, picUrl]);
  const closeHow = () => { if (!go) { seenHowto("puzzle"); setGo(true); } setHow("done"); };

  const cvRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<Fx | null>(null);
  const timers = useRef<number[]>([]);
  const fid = useRef(0);
  const lastTap = useRef(performance.now());
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => { timers.current.forEach(t => window.clearTimeout(t)); }, []);
  // MUSIC FADE (Andy 2026-10-11): the puzzle song dips out for the fanfare, then fades back in.
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const fadeIv = useRef(0);
  const fadeMusic = (to: number, ms: number) => {
    const a = musicRef.current; if (!a) return;
    window.clearInterval(fadeIv.current);
    const from = a.volume, steps = Math.max(1, Math.round(ms / 50)); let n = 0;
    fadeIv.current = window.setInterval(() => {
      n++; try { a.volume = Math.max(0, Math.min(1, from + (to - from) * n / steps)); } catch { /* */ }
      if (n >= steps) window.clearInterval(fadeIv.current);
    }, 50);
  };

  const fl = cx - FW / 2;                          // frame left
  const picL = fl + PIC.x, picT = FT + PIC.y;      // picture box on the stage
  const centre = (c: Cover) => ({ x: picL + c.cx, y: picT + c.cy });

  useEffect(() => {
    if (!on) return;
    if (cvRef.current) fxRef.current = new Fx(cvRef.current);
    return () => { fxRef.current?.stop(); fxRef.current = null; };
  }, [on]);
  useEffect(() => {
    let on = true;
    document.fonts?.load("20px 'Titan One'").then(() => on && setFontReady(true)).catch(() => on && setFontReady(true));
    const t = window.setTimeout(() => on && setFontReady(true), 1500);
    return () => { on = false; window.clearTimeout(t); };
  }, []);

  // MUSIC: the cozy album song for now (off if the world the kid came from has music off).
  useEffect(() => {
    if (!on || !go) return;
    const w = (ret.match(/\/(dino|savanna|snowy|taiwan)\//) || [])[1];
    const off = (() => { try { return localStorage.getItem(w ? `mpe_${w}_music` : "mpe_music") === "off"; } catch { return false; } })();
    if (off) return;
    const a = new Audio(`${P}/music.mp3`); a.loop = true; a.volume = 0;   // Andy 14:38: maksymmalko quirky (levelled like the album song)
    musicRef.current = a;
    const t = window.setTimeout(() => {
      a.play().then(() => fadeMusic(1, 2000)).catch(() => { });
    }, 1400);
    return () => { window.clearTimeout(t); window.clearInterval(fadeIv.current); a.pause(); if (musicRef.current === a) musicRef.current = null; };
  }, [on, ret, go]);

  // INTRO (every new picture): the frame drops in with a bounce + thud, then the covers pop in one by one (rising pops).
  useEffect(() => {
    if (!on || !go) return;
    setPhase("intro"); setReveal(false); setCls({}); setHint(null);
    play("/cards/ui/whoosh.mp3", 0.6);
    later(560, () => { play(`${UI}/snd_thud.mp3`, 0.6); const f = fxRef.current; if (f) { f.burst(cx, FT + FH - 10, { fairies: 22, w: FW * 0.8, h: 30, sp: 0.8 }); } });
    const live = covers.filter(c => !gone.has(c.i));
    if (!live.length) { later(900, () => { setReveal(true); setPhase("next"); }); return; }   // every puzzle done: show the last one in colour
    live.forEach((_, k) => later(760 + k * 75, () => popIn(k)));
    later(760 + live.length * 75 + 350, () => { if (giftRef.current > 0) welcomeGift(); else { setPhase("play"); lastTap.current = performance.now(); } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, on, go]);

  // A gentle twinkle along the gold frame now and then.
  useEffect(() => {
    if (!on) return;
    const iv = window.setInterval(() => {
      const f = fxRef.current; if (!f || document.hidden) return;
      const side = Math.random(), x = fl + 30 + Math.random() * (FW - 60), y = FT + 40 + Math.random() * (FH - 80);
      const px = side < 0.5 ? x : (Math.random() < 0.5 ? fl + 34 : fl + FW - 34), py = side < 0.5 ? (Math.random() < 0.5 ? FT + 40 : FT + FH - 36) : y;
      f.fairy(px, py, 0.25);
    }, 380);
    return () => window.clearInterval(iv);
  }, [on, fl]);

  const canPay = (i: number) => !gone.has(i) && pieces >= pz.need[i];

  // IDLE HINT: 5 s with nothing tapped -> the hand points at the cheapest cover the kid can open (or the piece pill wiggles).
  useEffect(() => {
    if (!on || phase !== "play") { setHint(null); return; }
    const iv = window.setInterval(() => {
      if (performance.now() - lastTap.current < 5000) return;
      const ok = covers.filter(c => canPay(c.i)).sort((a, b) => pz.need[a.i] - pz.need[b.i]);
      if (ok.length) setHint(ok[0].i);
      else { setPillFx("shake"); window.setTimeout(() => setPillFx(""), 450); lastTap.current = performance.now(); }
    }, 700);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, phase, gone, pieces, idx]);

  const setC = (i: number, c: string) => setCls(o => ({ ...o, [i]: c }));

  const tapCover = (c: Cover) => {
    lastTap.current = performance.now(); setHint(null);
    if (phase !== "play" || gone.has(c.i)) return;
    const need = pz.need[c.i];
    if (pieces < need) {
      nope(); setC(c.i, "wig"); later(460, () => setC(c.i, ""));
      setPillFx("shake"); later(450, () => setPillFx(""));
      setBubble({ i: c.i, more: need - pieces, k: Date.now() }); later(2200, () => setBubble(b => (b && b.i === c.i ? null : b)));
      return;
    }
    setPhase("paying"); setBubble(null);
    if (real) {   // the DATABASE pays first; the animation only runs when it said yes
      puzzlePop(code, name, idx, c.i).then(r => {
        if (r && r.ok) {
          if (r.done) prizeRef.current = { coins: r.coins ?? 0, treats: r.treats ?? 0 };
          payAnim(c, need);
        } else {
          if (r) { setPieces(Math.max(0, r.pieces)); if (r.idx === idx) setGone(new Set(r.gone)); }
          nope(); setC(c.i, "wig"); later(460, () => setC(c.i, ""));
          setPhase("play"); lastTap.current = performance.now();
        }
      });
      return;
    }
    payAnim(c, need);
  };
  const payAnim = (c: Cover, need: number) => {
    // PAY: up to 10 pieces fly from the pill into the cover (bigger numbers = several per flyer), each landing = rising plink.
    const V = Math.min(need, 10), base = Math.floor(need / V), extra = need % V;
    const to = centre(c), GAP = 115, FLY = 620;
    play("/cards/ui/whoosh.mp3", 0.45);
    const fs: Flyer[] = [];
    for (let q = 0; q < V; q++) {
      const amt = base + (q < extra ? 1 : 0);
      fs.push({ id: ++fid.current, x0: PILL.x - 32, y0: PILL.y - 34, x1: to.x - 32, y1: to.y - 34, d: q * GAP, img: `${P}/piece.webp`, w: 64 });
      later(q * GAP, () => setPieces(p => p - amt));
      later(q * GAP + FLY, () => {
        plink(q); setRem(r => { const n = r.slice(); n[c.i] = Math.max(0, n[c.i] - amt); return n; });
        fxRef.current?.burst(to.x, to.y, { fairies: 5, w: 30, sp: 0.6 });
      });
    }
    setFlyers(f => [...f, ...fs]);
    const end = (V - 1) * GAP + FLY;
    later(end + 60, () => { const ids = new Set(fs.map(x => x.id)); setFlyers(f => f.filter(x => !ids.has(x.id))); });
    later(end + 220, () => { setC(c.i, "crack"); snap(); play("/cookiejar/snd_tink.mp3", 0.5); });
    later(end + 620, () => {
      setC(c.i, "pop"); play("/celebration/rising_pop.mp3", 0.6);
      const f = fxRef.current; if (f) { f.burst(to.x, to.y, { fairies: 30, embers: 8, glow: 110, w: c.m * 0.8, sp: 1.1 }); }
    });
    later(end + 1420, () => {
      const g = new Set(gone); g.add(c.i); setGone(g); setC(c.i, "");
      if (g.size === covers.length) finale(); else { setPhase("play"); lastTap.current = performance.now(); }
    });
  };

  // FINALE: colour sweeps out from the middle (magic ring + sparkles on its edge), the frame shines, "Puzzle Complete!".
  const finale = () => {
    setPhase("finale");
    later(350, () => {
      setReveal(true); play("/worlds/daily/harp.mp3", 0.7); play(`${UI}/snd_newfriend.mp3`, 0.45);
      const f = fxRef.current, X = picL + PIC.w / 2, Y = picT + PIC.h / 2, R = 0.75 * Math.sqrt((PIC.w ** 2 + PIC.h ** 2) / 2), T0 = performance.now();
      if (f) f.emit(2200, (_dt, now) => {
        const k = Math.min(1, (now - T0) / 2200), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, r = e * R;
        for (let n = 0; n < 4; n++) {
          const a = Math.random() * 6.283, x = X + Math.cos(a) * r, y = Y + Math.sin(a) * r;
          if (x > picL && x < picL + PIC.w && y > picT && y < picT + PIC.h) f.fairy(x, y, 0.5);
        }
      });
    });
    later(2100, () => fadeMusic(0, 600));
    later(2700 + 6720 + 150, () => fadeMusic(1, 2500));
    later(2700, () => {
      play("/celebration/win_fanfare.mp3", 0.7);
      const f = fxRef.current;
      if (f) for (let n = 0; n < 6; n++) later(n * 160, () => f.burst(picL + Math.random() * PIC.w, picT + Math.random() * PIC.h * 0.7, { embers: 14, fairies: 18, glow: 90, w: 120, sp: 1.2 }));
    });
    later(4200, () => setPhase("prize"));
  };

  // WELCOME GIFT show: 'Welcome gift! x8' pops up over the frame, then the pieces fly one by one into the piece pill (harp plucks).
  const welcomeGift = () => {
    const n = giftRef.current; giftRef.current = 0;
    const gy = FT + FH / 2 - 40, START = 1200, GAP = 140, FLY = 620;
    setPhase("gift"); setGift({ n, out: false }); play("/celebration/rising_pop.mp3", 0.6);
    fxRef.current?.burst(cx, gy, { fairies: 24, glow: 90, w: 320, sp: 0.9 });
    const fs: Flyer[] = [];
    for (let q = 0; q < n; q++) {
      fs.push({ id: ++fid.current, x0: cx - 70 - 32, y0: gy + 40 - 32, x1: PILL.x - 32, y1: PILL.y - 34, d: START + q * GAP, img: `${P}/piece.webp`, w: 64 });
      later(START + q * GAP, () => setGift(g => (g ? { ...g, n: Math.max(0, g.n - 1) } : g)));
      later(START + q * GAP + FLY, () => { pluck(q); setPieces(x => x + 1); fxRef.current?.burst(PILL.x, PILL.y, { fairies: 4, w: 30, sp: 0.6 }); });
    }
    setFlyers(f => [...f, ...fs]);
    const end = START + Math.max(0, n - 1) * GAP + FLY;
    later(end - 250, () => setGift(g => (g ? { ...g, out: true } : g)));
    later(end + 150, () => { const ids = new Set(fs.map(x => x.id)); setFlyers(f => f.filter(x => !ids.has(x.id))); setGift(null); setPhase("play"); lastTap.current = performance.now(); });
  };

  const collect = () => {
    if (phase !== "prize") return;
    setPhase("collect"); play("/celebration/rising_pop.mp3", 0.6);   // the coin-flying sound (same as the grow-up party)
    const px = cx, py = FT + FH + 20, fs: Flyer[] = [];
    for (let q = 0; q < 6; q++) fs.push({ id: ++fid.current, x0: px - 90 + q * 8, y0: py - 30, x1: 43, y1: 126, d: q * 90, img: `${UI}/coin.webp`, w: 58 });
    for (let q = 0; q < 4; q++) {
      fs.push({ id: ++fid.current, x0: px + 70, y0: py - 30, x1: px + 260 + q * 40, y1: -120, d: 80 + q * 100, img: `${UI}/treat.webp`, w: 58 });
      later(80 + q * 100 + 560, () => play(q % 2 ? "/cookiejar/snd_drop2.mp3" : "/cookiejar/snd_drop1.mp3", 0.4));   // the jar's treat drops
    }
    setFlyers(f => [...f, ...fs]);
    later(650, () => setCoins(c => c + (real ? prizeRef.current.coins : PRIZE.coins)));   // coins land silently (Andy)
    later(1400, () => { const ids = new Set(fs.map(x => x.id)); setFlyers(f => f.filter(x => !ids.has(x.id))); setDoneList(d => (d.includes(idx) ? d : [...d, idx])); setPhase("next"); });
  };

  const nextPuzzle = () => {
    if (phase !== "next" || idx >= PUZZLES.length - 1) return;
    setPhase("out"); play("/cards/ui/whoosh.mp3", 0.7);
    later(520, () => {
      const n = idx + 1;
      setIdx(n); setGone(new Set()); setRem(PUZZLES[n].need.slice()); setPhase("intro"); setRound(r => r + 1);
    });
  };

  // 1006 DEMO: remember progress for this tab at calm moments (a finished picture = remembered as the NEXT picture, fresh).
  useEffect(() => {
    if (!isMaster || (phase !== "play" && phase !== "next")) return;
    const fin = phase === "next" && idx < PUZZLES.length - 1;
    const d: DemoSave = { idx: fin ? idx + 1 : idx, gone: fin ? [] : [...gone], pieces, coins, done: doneList };
    try { sessionStorage.setItem(DEMO_KEY, JSON.stringify(d)); } catch { /* */ }
  }, [isMaster, phase, idx, gone, pieces, coins, doneList]);

  useEffect(() => { if (isMaster) demoPiecesSet(pieces); }, [isMaster, pieces]);   // 1006: keep the shared pretend count (world page counter reads it)

  const leave = () => { setLeaving(true); later(380, () => navigate(ret)); };

  if (!on || failed || lockN > 0) return (
    <div className="pz-root"><style>{FONTS + FUN3D_CSS + MIXUP_CSS + CSS}</style>
      <div className="pz-soon">
        <MixupWord size={64} pop />
        {lockN > 0 && !failed ? <><img src={LOCK_IMG} alt="" style={{ height: 150, margin: "18px 0 6px", filter: "drop-shadow(0 8px 8px rgba(0,0,0,.35))" }} />
        <div style={{ fontSize: 34, lineHeight: "44px", textAlign: "center", margin: "0 0 30px" }}><LockMsg left={lockN} nColor="#7fd8ff" /></div></>
          : <div style={{ fontSize: 30, margin: "18px 0 30px" }}>{failed ? "Please try again later." : "Coming soon!"}</div>}
        <button className="f3-btn f3-yellow" onClick={() => navigate(ret)}>Back</button>
      </div>
    </div>
  );

  const hintC = hint !== null ? covers.find(c => c.i === hint) : null;
  const bubC = bubble ? covers.find(c => c.i === bubble.i) : null;
  const last = idx >= PUZZLES.length - 1;
  const v = (o: Record<string, string>) => o as CSSProperties;
  const HAND_W = 120, HAND_H = HAND_W * 256 / 320;

  return (
    <div className={"pz-root" + (leaving ? " leaving" : "")}>
      <style>{FONTS + FUN3D_CSS + MIXUP_CSS + CSS}</style>
      <div className={"pz-stage" + (go ? " go" : "")} data-font={fontReady ? 1 : 0} style={{ width: sw, height: sh, transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="pz-bg" />

        <div className="pz-title pz-inT" style={{ left: cx }}><MixupWord size={86} pop /></div>

        {/* THE BOARD: muted picture, colour picture (revealed at the end), the covers, then the frame on top */}
        {go && <div key={round} className={"pz-board" + (phase === "out" ? " out" : " drop") + (phase === "finale" || phase === "prize" ? " glow" : "")}
          style={{ left: fl, top: FT, width: FW, height: FH }}>
          <div className="pz-pic" style={{ left: PIC.x, top: PIC.y, width: PIC.w, height: PIC.h }}>
            <img className="pz-mute" src={`${P}/${pz.img}.webp`} alt="" />
            <img className={"pz-color" + (reveal ? " on" : "")} src={`${P}/${pz.img}.webp`} alt="" />
            <div className={"pz-ring" + (reveal ? " on" : "")} />
            <div className={"pz-shine" + (phase === "prize" ? " on" : "")} />
            <svg className="pz-svg" width={PIC.w} height={PIC.h} viewBox={`0 0 ${PIC.w} ${PIC.h}`}>
              <defs>
                <linearGradient id="pzc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#f3dcae" /></linearGradient>
                <filter id="pzs" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5a2a00" floodOpacity="0.35" /></filter>
              </defs>
              {/* WHILE THE COVERS DROP IN (Andy 10-20: open parts showed plain grey for 1-2 s): only the spots still waiting for
                  their cover get the plain colour; parts already uncovered show the picture at once - nothing hidden can be seen */}
              {phase === "intro" && covers.filter(c => !gone.has(c.i)).map(c => <path key={"veil" + c.i} d={c.d} fill="#cbbfd8" stroke="#cbbfd8" strokeWidth={4} />)}
              {covers.filter(c => !gone.has(c.i)).map((c, k) => {
                const n = rem[c.i], fs = c.fs, iw = c.iw, gx = c.lx;   // safe spot found in makeCovers (never touches a line)
                const anim = cls[c.i] || (hint === c.i ? "hint" : phase === "intro" ? "in" : "");
                return (
                  <g key={c.i} className={"pz-cv " + anim + (canPay(c.i) && phase === "play" ? " can" : "")} style={v({ "--d": `${760 + k * 75}ms` })} onClick={() => tapCover(c)}>
                    <path d={c.d} fill="url(#pzc)" stroke="#d2a964" strokeWidth={3} filter="url(#pzs)" />
                    <path d={c.d} className="pz-gl" />
                    <path d={c.d} className="pz-wh" />
                    <image href={`${P}/piece.webp`} x={gx} y={c.ly - iw * 0.54} width={iw} height={iw * 256 / 237} />
                    <text key={n} className={"pz-num" + (n < pz.need[c.i] ? " bump" : "")} x={gx + iw + fs * 0.05 + 6 * (fs / (c.m * 0.36))} y={c.ly + fs * 0.36} fontSize={fs} strokeWidth={fs * 0.16}>{n}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <img className="pz-frame" src={`${P}/frame.webp`} alt="" />
        </div>}

        {/* prize panel under the frame -> after the finale: tap to collect -> Next Puzzle! */}
        {go && phase !== "next" && phase !== "out" && (
          <div className={"pz-prize" + (phase === "prize" ? " ready" : "") + (phase === "collect" ? " gone" : "")} style={{ left: cx - 230, top: FT + FH - 40, width: 460 }} onClick={collect}>
            <div>
              <span className="pz-pt">COMPLETE TO GET</span>
              <span className="pz-pr"><img src={`${UI}/coin.webp`} alt="" /><b>{PRIZE.coins}</b><img src={`${UI}/treat.webp`} alt="" /><b>{PRIZE.treats}</b></span>
            </div>
            {phase === "prize" && <span className="pz-tapc">Tap to collect!</span>}
          </div>
        )}
        {phase === "next" && (
          <div className="pz-next" style={{ left: cx, top: FT + FH - 22 }}>
            {last ? <div className="pz-alldone">You finished every puzzle!</div>
              : <button className="f3-btn f3-green" onClick={nextPuzzle}>Next Puzzle!</button>}
          </div>
        )}
        {(phase === "finale" || phase === "prize") && reveal && (
          <div className="pz-congrats" style={{ left: cx, top: FT + 150 }}><Word3D text="Puzzle Complete!" palette="gold" stagger={45} delay={2350} /></div>
        )}

        {/* right: my puzzles */}
        <div className="pz-col pz-inR" style={{ left: sw - 206 }}>
          <div className="pz-colh">Puzzles</div>
          <div className="pz-coln">{doneList.length} / {PUZZLES.length}</div>
          {PUZZLES.map((q, i) => {
            const done = doneList.includes(i), now = i === idx && !done;
            return (
              <div key={i} className={"pz-th" + (done ? " done" : now ? " now" : " lock")} onClick={done ? () => setZoom(i) : undefined}>
                {done ? <img src={`${P}/${q.img}.webp`} alt="" /> : <span>?</span>}   {/* surprise (Andy 11:50): no peek until it is finished */}
                {done && <i className="pz-ok" />}
              </div>
            );
          })}
        </div>

        {/* top left: my pieces + my coins */}
        <div className="pz-grp pz-inL">{/* slide-in group (the pill keeps its own shake) */}
        <div className={"pz-pcs " + pillFx}><img src={`${P}/piece.webp`} alt="" /><b key={pieces}>{pieces}</b></div>
        <div className="pz-coins"><span key={coins}>{coins}</span></div>
        </div>
        <div className="pz-rb pz-tap pz-inT" style={{ right: 22 }} onClick={leave}><img src={`${UI}/rb_exit.webp`} alt="Exit" /></div>
        <div className="pz-rb pz-tap pz-inT" style={{ right: 108 }} onClick={() => setHow("open")}><img src={`${UI}/rb_help.webp`} alt="How to play" /></div>
        {isMaster && <div className="pz-teacher pz-inL">Teacher view: nothing is saved</div>}

        {bubC && bubble && (
          <div key={bubble.k} className="pz-bub" style={{ left: centre(bubC).x, top: centre(bubC).y - bubC.m * 0.38 }}>
            <div>Need <b>{bubble.more}</b> more <img src={`${P}/piece.webp`} alt="pieces" /></div>
            <small>Win pieces in games!</small>
          </div>
        )}
        {hintC && phase === "play" && (
          <div className="pz-hand" style={{ left: centre(hintC).x + hintC.m * 0.3 - HAND_W * 0.016, top: centre(hintC).y + hintC.m * 0.18 - HAND_H * 0.945, width: HAND_W }}>
            <img src={`${UI}/hand_point.webp`} alt="" />
          </div>
        )}
        {gift && (
          <div className={"pz-gift" + (gift.out ? " out" : "")} style={{ left: cx, top: FT + FH / 2 - 40 }}>
            <div className="pz-gift-t">Welcome gift!</div>
            <div className="pz-gift-n"><img src={`${P}/piece.webp`} alt="pieces" /><b key={gift.n}>x{gift.n}</b></div>
          </div>
        )}
        {flyers.map(f => (
          <img key={f.id} className="pz-fly" src={f.img} alt="" style={{ width: f.w, ...v({ "--x0": `${f.x0}px`, "--y0": `${f.y0}px`, "--x1": `${f.x1}px`, "--y1": `${f.y1}px`,
            "--xm": `${(f.x0 + f.x1) / 2}px`, "--ym": `${Math.min(f.y0, f.y1) - 140}px`, "--d": `${f.d}ms` }) }} />
        ))}

        {zoom !== null && (
          <div className="pz-zoom">{/* closes ONLY with the X (Andy 14:38) */}
            <img src={`${P}/${PUZZLES[zoom].img}.webp`} alt="" />
            <div className="pz-rb pz-tap pz-zx" onClick={() => setZoom(null)}><img src={`${UI}/rb_exit.webp`} alt="Close" /></div>
          </div>
        )}
        <canvas ref={cvRef} className="pz-fx" width={Math.round(sw)} height={Math.round(sh)} style={{ width: sw, height: sh }} aria-hidden="true" />
      </div>
      {how === "open" && <HowToPlay {...PUZZLE_HOWTO} needOk={!go && firstHowto("puzzle")} onDone={closeHow} />}{/* outside the scaled stage (it fits itself to the window) */}
    </div>
  );
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Titan+One&display=swap');`;
const CSS = `
.pz-root{position:fixed;inset:0;overflow:hidden;background:#3a0f6e;user-select:none;-webkit-user-select:none}
.pz-stage{position:absolute;left:50%;top:50%;transform-origin:center center;overflow:hidden;overflow:clip;font-family:'Titan One',sans-serif;color:#fff;animation:pz-fade .4s backwards}
.pz-root.leaving .pz-stage{opacity:0;transition:opacity .35s}
@keyframes pz-fade{from{opacity:0}to{opacity:1}}
.pz-bg{position:absolute;inset:0;background:#5a1aa0 url(/puzzle/bg.webp) center/cover no-repeat;animation:pz-bgb .9s ease-out backwards}
/* ENTRY (Andy 2026-10-13): the background bounces, the UI slides/drops in like the world page. Uses the 'translate'/'scale'
   properties (not 'transform') so every existing transform (translateX(-50%) etc.) stays as it is. */
.pz-inL{animation:pz-inL .8s cubic-bezier(.3,1.35,.5,1) .1s backwards}
.pz-inR{animation:pz-inR .8s cubic-bezier(.3,1.35,.5,1) .15s backwards}
.pz-inT{animation:pz-inT .75s cubic-bezier(.3,1.35,.5,1) .05s backwards}
@keyframes pz-inL{0%{translate:-460px 0}100%{translate:0 0}}
@keyframes pz-inR{0%{translate:460px 0}100%{translate:0 0}}
@keyframes pz-inT{0%{translate:0 -300px}100%{translate:0 0}}
@keyframes pz-bgb{0%{scale:1}28%{scale:1.07}60%{scale:1}80%{scale:1.015}100%{scale:1}}
.pz-grp{position:absolute;inset:0;z-index:20;pointer-events:none}
.pz-stage:not(.go) :is(.pz-bg,.pz-table,.pz-inL,.pz-inR,.pz-inT){animation-play-state:paused}   /* the entry waits while How to Play is open */
.pz-grp>*{pointer-events:auto}
.pz-tap{cursor:pointer}
.pz-fx{position:absolute;left:0;top:0;z-index:80;pointer-events:none}
.pz-title{position:absolute;top:8px;transform:translateX(-50%);z-index:6;filter:drop-shadow(0 6px 8px rgba(40,0,80,.45))}

.pz-board{position:absolute;z-index:5}
.pz-board.drop{animation:pz-drop .8s cubic-bezier(.3,1.45,.5,1) backwards}
.pz-board.out{animation:pz-out .5s ease-in forwards}
@keyframes pz-drop{from{transform:translateY(-1100px) rotate(-4deg)}to{transform:none}}
@keyframes pz-out{to{transform:translateX(-1500px) rotate(-10deg)}}
.pz-frame{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;filter:drop-shadow(0 14px 18px rgba(40,0,70,.5))}
.pz-board.glow .pz-frame{animation:pz-fglow 1.4s ease-in-out infinite}
@keyframes pz-fglow{0%,100%{filter:drop-shadow(0 14px 18px rgba(40,0,70,.5))}50%{filter:drop-shadow(0 0 26px rgba(255,230,120,.95))}}
.pz-pic{position:absolute;overflow:hidden;border-radius:34px;background:#cbbfd8}
.pz-pic>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.pz-mute{filter:saturate(.16) brightness(1.04) contrast(.9);transform:translateZ(0)} /* own layer: Safari paints the muted picture reliably */
.pz-color{clip-path:circle(0% at 50% 50%);transition:clip-path 2.2s cubic-bezier(.45,0,.3,1)}
.pz-color.on{clip-path:circle(75% at 50% 50%)}
.pz-ring{position:absolute;left:50%;top:50%;width:0;height:0;border-radius:50%;transform:translate(-50%,-50%);opacity:0;pointer-events:none;
 box-shadow:0 0 34px 16px rgba(255,244,190,.95),inset 0 0 30px 12px rgba(255,244,190,.85)}
.pz-ring.on{animation:pz-ring 2.2s cubic-bezier(.45,0,.3,1) forwards}
@keyframes pz-ring{0%{width:0;height:0;opacity:1}88%{opacity:1}100%{width:960px;height:960px;opacity:0}}
.pz-shine{position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.6) 50%,transparent 65%);transform:translateX(-130%)}
.pz-shine.on{animation:pz-shine 1.3s .2s ease-in-out}
@keyframes pz-shine{to{transform:translateX(130%)}}
.pz-svg{position:absolute;left:0;top:0;overflow:visible}

.pz-cv{cursor:pointer;transform-box:fill-box;transform-origin:center}
.pz-cv.in{animation:pz-cin .45s var(--d) ease-out backwards}
@keyframes pz-cin{0%{transform:none}45%{transform:scale(1.07)}100%{transform:none}}
.pz-cv.in .pz-wh{animation:pz-wh2 .45s var(--d) backwards}
@keyframes pz-wh2{0%{opacity:0}40%{opacity:.6}100%{opacity:0}}
.pz-cv.wig{animation:pz-wig .45s}
@keyframes pz-wig{0%,100%{transform:none}20%{transform:rotate(-6deg)}40%{transform:rotate(5deg)}60%{transform:rotate(-4deg)}80%{transform:rotate(3deg)}}
.pz-cv.crack{animation:pz-crack .4s}
@keyframes pz-crack{0%,100%{transform:none}20%{transform:scale(1.05) rotate(-2deg)}45%{transform:scale(1.06) rotate(2deg)}70%{transform:scale(1.04) rotate(-1deg)}}
.pz-cv.pop{animation:pz-pop .8s cubic-bezier(.5,0,.75,.4) forwards;pointer-events:none}
@keyframes pz-pop{0%{transform:none;opacity:1}22%{transform:scale(1.16) rotate(-5deg);opacity:1}100%{transform:translateY(-320px) scale(.55) rotate(22deg);opacity:0}}
.pz-cv.hint{animation:pz-hint .9s ease-in-out infinite}
@keyframes pz-hint{0%,100%{transform:none}50%{transform:scale(1.05)}}
.pz-gl{fill:none;stroke:#ffe14a;stroke-width:8;opacity:0;pointer-events:none}
.pz-cv.can .pz-gl{animation:pz-glow 1.6s ease-in-out infinite}
@keyframes pz-glow{0%,100%{opacity:0}50%{opacity:.85}}
.pz-wh{fill:#fff;opacity:0;pointer-events:none}
.pz-cv.crack .pz-wh{animation:pz-wh .4s}
.pz-cv.pop .pz-wh{opacity:.7}
@keyframes pz-wh{0%{opacity:0}50%{opacity:.8}100%{opacity:.5}}
.pz-cv image{pointer-events:none}
.pz-num{font-family:'Titan One',sans-serif;fill:#fff;stroke:#6b3a12;paint-order:stroke fill;stroke-linejoin:round;pointer-events:none;transform-box:fill-box;transform-origin:center}
.pz-num.bump{animation:pz-nb .3s}
@keyframes pz-nb{0%{transform:scale(1.5)}100%{transform:none}}

.pz-prize{position:absolute;z-index:8;height:112px;padding:7px;border-radius:30px;background:linear-gradient(#ffe07a,#f59a1a);box-shadow:0 10px 18px rgba(30,0,60,.4);transition:transform .3s,opacity .3s}
.pz-prize>div{width:100%;height:100%;border-radius:24px;background:linear-gradient(#8f4316,#68290b);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.pz-pt{font-size:21px;color:#ffd75a;letter-spacing:1.5px}
.pz-pr{display:flex;align-items:center;gap:10px;font-size:42px;line-height:1}
.pz-pr b{font-weight:400;-webkit-text-stroke:7px #4a1a04;paint-order:stroke fill;margin-right:18px}
.pz-pr img{height:54px;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4))}
.pz-prize.ready{cursor:pointer;animation:pz-ready 1s ease-in-out infinite}
@keyframes pz-ready{0%,100%{transform:scale(1);box-shadow:0 10px 18px rgba(30,0,60,.4)}50%{transform:scale(1.06);box-shadow:0 0 34px 8px rgba(255,220,90,.9)}}
.pz-prize.gone{transform:scale(.6);opacity:0}
.pz-tapc{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:4px;font-size:28px;white-space:nowrap;-webkit-text-stroke:6px #4a1070;paint-order:stroke fill;animation:pz-blink 1s ease-in-out infinite}
@keyframes pz-blink{50%{opacity:.45}}
.pz-next{position:absolute;transform:translateX(-50%);z-index:8;animation:pz-nin .45s cubic-bezier(.3,1.7,.5,1) backwards}
@keyframes pz-nin{from{opacity:0;transform:translateX(-50%) scale(.3)}to{opacity:1;transform:translateX(-50%)}}
.pz-alldone{font-size:40px;white-space:nowrap;-webkit-text-stroke:8px #4a1070;paint-order:stroke fill}
.pz-congrats{position:absolute;transform:translateX(-50%);font-size:92px;z-index:20;white-space:nowrap;pointer-events:none;animation:pz-cgout .6s 5.3s forwards}
@keyframes pz-cgout{to{opacity:0;transform:translateX(-50%) translateY(-30px) scale(.9)}}

.pz-col{position:absolute;top:118px;width:184px;z-index:6;display:flex;flex-direction:column;align-items:center;gap:9px;padding:12px 0 16px;border-radius:28px;
 background:rgba(45,10,90,.5);box-shadow:inset 0 0 0 4px rgba(255,255,255,.2),0 8px 16px rgba(30,0,60,.3)}
.pz-colh{font-size:30px;-webkit-text-stroke:7px #3a1270;paint-order:stroke fill;line-height:1}
.pz-coln{font-size:24px;color:#ffe066;-webkit-text-stroke:6px #3a1270;paint-order:stroke fill;line-height:1;margin-bottom:4px}
.pz-th{position:relative;width:138px;height:92px;border-radius:14px;overflow:hidden;border:4px solid #fff;box-shadow:0 4px 8px rgba(0,0,0,.35);background:#6b34b0;flex:none}
.pz-th img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
.pz-th.done{cursor:pointer}
.pz-th.now{border-color:#ffd23a;animation:pz-thg 1.6s ease-in-out infinite}
.pz-th.now{display:flex;align-items:center;justify-content:center}
.pz-th.now span{font-size:50px;color:#ffe066}
@keyframes pz-thg{0%,100%{box-shadow:0 4px 8px rgba(0,0,0,.35)}50%{box-shadow:0 0 18px 5px rgba(255,215,60,.9)}}
.pz-th.lock{display:flex;align-items:center;justify-content:center;border-color:rgba(255,255,255,.45)}
.pz-th.lock span{font-size:50px;color:rgba(255,255,255,.75)}
.pz-ok{position:absolute;right:4px;bottom:4px;width:32px;height:32px;border-radius:50%;background:#3ccb5a;border:3px solid #fff;box-sizing:border-box}
.pz-ok::after{content:"";position:absolute;left:8px;top:3px;width:8px;height:14px;border:solid #fff;border-width:0 4px 4px 0;transform:rotate(45deg)}

.pz-pcs{position:absolute;left:30px;top:22px;width:214px;height:74px;border-radius:40px;z-index:20;background:linear-gradient(#ffffff,#eadcff);border:5px solid #7d4fd0;
 box-shadow:0 6px 10px rgba(30,0,60,.35);display:flex;align-items:center;justify-content:flex-end;padding-right:34px;box-sizing:border-box;font-size:40px;color:#5a2a9a}
.pz-pcs img{position:absolute;left:-22px;top:-16px;width:96px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}
.pz-pcs b{font-weight:400;display:inline-block;animation:pz-nb .3s}
.pz-pcs.shake{animation:pz-shake .45s}
@keyframes pz-shake{0%,100%{transform:none}20%{transform:translateX(-10px)}40%{transform:translateX(9px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
.pz-coins{position:absolute;left:24px;top:110px;width:230px;height:90px;padding-left:96px;display:flex;align-items:center;justify-content:center;z-index:20;box-sizing:border-box;
 background:url(/worlds/ui/pill_coin.webp) center/100% 100% no-repeat;font-size:34px;color:#8a4a10;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))}
.pz-coins span{display:inline-block;animation:pz-nb .3s}
.pz-rb{position:absolute;top:14px;width:76px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35));z-index:30}
.pz-rb img{display:block;width:100%;pointer-events:none}
.pz-teacher{position:absolute;left:30px;top:206px;width:260px;text-align:left;font-size:14px;opacity:.85;text-shadow:0 2px 3px rgba(0,0,0,.8);z-index:30;font-family:'Titan One',sans-serif}

.pz-bub{position:absolute;transform:translate(-50%,-100%);z-index:40;background:#fff;color:#6b2fb5;border-radius:24px;padding:12px 22px 10px;text-align:center;white-space:nowrap;
 box-shadow:0 8px 16px rgba(30,0,60,.4);animation:pz-bub 2.2s forwards;pointer-events:none}
.pz-bub::after{content:"";position:absolute;left:50%;bottom:-14px;margin-left:-14px;border:14px solid transparent;border-bottom:0;border-top-color:#fff}
.pz-bub div{display:flex;align-items:center;justify-content:center;gap:8px;font-size:30px}
.pz-bub b{font-weight:400;color:#ff4f9a}
.pz-bub img{height:38px}
.pz-bub small{display:block;font-size:19px;color:#8a62c9;margin-top:2px}
@keyframes pz-bub{0%{opacity:0;transform:translate(-50%,-80%) scale(.6)}12%{opacity:1;transform:translate(-50%,-100%) scale(1.06)}20%{transform:translate(-50%,-100%) scale(1)}85%{opacity:1}100%{opacity:0}}
.pz-hand{position:absolute;z-index:45;pointer-events:none;animation:pz-fade .4s}
.pz-hand img{display:block;width:100%;filter:drop-shadow(0 5px 5px rgba(0,0,0,.35));animation:pz-tapH .55s cubic-bezier(.45,0,.55,1) infinite alternate}
@keyframes pz-tapH{from{transform:translate(0,0)}to{transform:translate(10px,-14px)}}
.pz-fly{position:absolute;left:0;top:0;z-index:50;pointer-events:none;filter:drop-shadow(0 4px 4px rgba(0,0,0,.35));animation:pz-fly .62s var(--d) cubic-bezier(.45,0,.55,1) both}
.pz-gift{position:absolute;transform:translate(-50%,-50%);z-index:45;background:#fff;color:#6b2fb5;border:6px solid #7d4fd0;border-radius:34px;padding:18px 44px 14px;text-align:center;white-space:nowrap;box-shadow:0 14px 30px rgba(40,0,80,.45);animation:pz-gin .5s cubic-bezier(.3,1.5,.5,1) backwards}
.pz-gift.out{animation:pz-gout .4s ease-in forwards}
.pz-gift-t{font-size:56px;line-height:1.1;color:#ff4f9a}
.pz-gift-n{display:flex;align-items:center;justify-content:center;gap:12px;font-size:52px;margin-top:6px}
.pz-gift-n img{height:72px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.25))}
.pz-gift-n b{font-weight:400;display:inline-block;animation:pz-nb .3s}
@keyframes pz-gin{from{opacity:0;transform:translate(-50%,-50%) scale(.3)}to{opacity:1;transform:translate(-50%,-50%)}}
@keyframes pz-gout{to{opacity:0;transform:translate(-50%,-50%) scale(.85)}}
@keyframes pz-fly{0%{transform:translate(var(--x0),var(--y0)) scale(.6);opacity:0}12%{opacity:1}50%{transform:translate(var(--xm),var(--ym)) scale(1.15)}100%{transform:translate(var(--x1),var(--y1)) scale(.8);opacity:1}}
.pz-zoom{position:absolute;inset:0;z-index:70;background:rgba(25,5,50,.78);display:flex;align-items:center;justify-content:center;animation:pz-fade .3s}
.pz-zoom>img{width:min(80%,1180px);border-radius:30px;border:10px solid #ffd75a;box-shadow:0 20px 40px rgba(0,0,0,.5);animation:pz-zin .4s cubic-bezier(.3,1.5,.5,1)}
@keyframes pz-zin{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
.pz-zx{right:22px}
.pz-soon{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:'Titan One',sans-serif;background:#5a1aa0 url(/puzzle/bg.webp) center/cover}
@media (prefers-reduced-motion: reduce){.pz-cv.in,.pz-cv.hint,.pz-cv.can .pz-gl,.pz-th.now,.pz-prize.ready{animation:none}}
`;
