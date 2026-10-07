// WORD SNAKE v2 = "Ticket Please!" (Andy 2026-10-05). Same pattern as Garden + Space (src/vocab/WhackGarden.tsx):
// full window (1600x944 design field scaled to fit, then widened), the grammar games' top bar with the Chinese target
// word + speaker, coins, a meter, new win/lose screens. The old WordSnake in GameTest.tsx stays as the fallback.
// RULES: a late-1800s steam train (no tracks - it drives anywhere) picks up passengers. Each passenger holds a ticket
// with ONE letter. Pick them up in order to spell the English word for the Chinese word on top; every passenger
// adds a car. Wrong letter = -1 life. Bumping into your own cars = -1 life. A life lost = red shake, then ~2s blink
// (can't lose another), the game keeps going. Word done -> the passengers get off (cars go), next word.
// EASY: whole word shown + the next ticket glows. MEDIUM: whole word shown, no glow, more wrong tickets.
// HARD: the word is hidden (only the Chinese + speaker), faster, the most wrong tickets.
// Coins (x1/x2/x3) and, while lives < 5, a heart appear now and then - drive over them. Coins are paid only on a WIN.
// Steering: arrow keys / WASD only (Andy 2026-10-07: NO mouse - a click made the train turn corners by itself). A finger on a touch screen still steers (iPad). Edges: the train turns by itself.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import GrammarGameBar from "@/components/GrammarGameBar";
import ControlHints, { HINT_BOTTOM_LEFT } from "@/components/ControlHints";
import HowToPlay from "@/components/HowToPlay";
import { wantHowto, seenHowto } from "@/lib/howtoSeen";
import { TICKET_HOWTO } from "@/components/howtos";

type Diff = "easy" | "medium" | "hard";
type Cfg = { timerSec: number };
type Unit = { vocab: string[]; chinese: Record<string, string> };

const ART = "/vocab/train";
export const TRAIN_MUSIC: string | null = `${ART}/music.mp3`; // Andy's ragtime song (aurec-ragtime-587559), levelled to ~-22.5 dB like the other game songs
const FW = 1600, FH = 944;
const MAX_LIVES = 5;
const COIN_IMG = "/worlds/ui/coin.webp", HEART_IMG = "/vocab/space/heart-orb.webp";
// train pieces in stage px. TOP-DOWN art (public/vocab/train/top-*.webp, drawn pointing RIGHT, turned in code):
// w = LENGTH along the way it drives, h = width. No tender any more: the engine pulls the cars directly.
const ENG = { w: 104, h: 32 }, CAR = { w: 68, h: 34 }; // smaller train (2026-10-06) so it fits the track grid
const NCARS = 7;
const WORDS = 4; // words per game, every level (Andy 2026-10-06: it was too long)
// The OPEN meadow of bg.webp (fractions of that 1024x572 picture). Train, tickets and faces stay inside it - never over fences, trees, houses.
const OPEN = { u0: 0.01, u1: 0.99, v0: 0.275, v1: 0.875 }; // new bg (2026-10-06): scenery only in thin strips at the edges, so the train may go right up to them
const BG_W = 1376, BG_H = 768;
// THE TRACK GRID of bg.webp (pixels of that 1376x768 picture, measured 2026-10-06): the train drives ONLY on these lines and turns only at crossings.
const GX = [74, 209, 340, 472, 607, 768, 900, 1032, 1165, 1302]; // 10 vertical tracks
const GY = [295, 415, 530, 666];                                   // 4 horizontal tracks
// Only these rows have rails running off BOTH sides of the picture (measured): the train may wrap round on them. The other two rows end at the outer vertical tracks.
const WRAP_ROW = [true, false, false, true];
// the train-sound loop (chug.wav) is parked: Andy heard it as a long buzz (2026-10-06). Set true to bring it back.
const CHUG_ON = true; // Andy 2026-10-06: wants it ON for the whole game, until the train stops at the station

// maxCars: long words would make a train longer than the field - after that, new passengers squeeze into the cars
const LV: Record<Diff, { speed: number; win: number; dis: number; coinMs: number; heartMs: number; glow: boolean; showWord: boolean; maxCars: number }> = {
  easy:   { speed: 165, win: 2, dis: 2, coinMs: 5000, heartMs: 6000, glow: true,  showWord: true,  maxCars: 5 },
  medium: { speed: 204, win: 3, dis: 4, coinMs: 5600, heartMs: 9000, glow: false, showWord: true,  maxCars: 6 },
  hard:   { speed: 248, win: 4, dis: 6, coinMs: 6200, heartMs: 14000, glow: false, showWord: false, maxCars: 7 },
};
const ITEM_UP = Infinity; // coins + hearts stay until the train takes them (Andy 2026-10-06)

const SND: Record<string, [string, number, number?]> = {
  levelup: ["/vocab/snd_levelup.mp3", 0.4],
  click: [`${ART}/click.mp3`, 1], // the Grab game's button sound
  oof: ["/vocab/garden/snd_oof.mp3", 0.6], // placeholder until Andy's train sounds
  // "thank you" from the passenger whose ticket you took (by face number, see TY below)
  "ty-asianwoman": [`${ART}/ty-asianwoman.mp3`, 0.9], "ty-woman": [`${ART}/ty-woman.mp3`, 0.9], "ty-oldlady": [`${ART}/ty-oldlady.mp3`, 0.9],
  "ty-man": [`${ART}/ty-man.mp3`, 0.9], "ty-gent": [`${ART}/ty-gent.mp3`, 0.9],
  "ty-great": [`${ART}/ty-great.mp3`, 0.9], "ty-excellent": [`${ART}/ty-excellent.mp3`, 0.9], "ty-hey": [`${ART}/ty-hey.mp3`, 0.9], "ty-bluehat": [`${ART}/ty-bluehat.mp3`, 0.9], "ty-sad": [`${ART}/ty-sad.mp3`, 0.9],
  "ty-boy": [`${ART}/ty-gent.mp3`, 0.9, 1.45], // the boy = the gentleman's clip played higher
};
// face-N.webp -> who says thank you (1 woman, 2 older man, 3 Asian woman, 4 gentleman, 5 older man, 6 snobby old lady, 7 redbeard man, 8 woman, 9 boy, 10 monocle gentleman)
const TY: Record<number, string> = { 1: "ty-hey", 2: "ty-great", 3: "ty-asianwoman", 4: "ty-gent", 5: "ty-excellent", 6: "ty-oldlady", 7: "ty-man", 8: "ty-bluehat", 9: "ty-boy", 10: "ty-sad" };

// The computer voice: the game music dips while it speaks (GamePage listens to 'mpe-duck').
let sayN = 0;
const duck = (on: boolean) => window.dispatchEvent(new CustomEvent("mpe-duck", { detail: on }));
const speak = (text: string, lang: string) => {
  try {
    speechSynthesis.cancel();
    const n = ++sayN, u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.volume = 0.8;
    const up = () => { if (n === sayN) duck(false); };
    u.onend = up; u.onerror = up; window.setTimeout(up, 4000);
    duck(true); speechSynthesis.speak(u);
  } catch { /* */ }
};

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const isLetter = (c: string) => /[a-z]/i.test(c);

// sounds: files (decoded once, can overlap) + small synth sounds; quiet when the bar's sound button is off
type Sfx = "click" | "levelup" | "oof" | "punch" | "toot" | "coin" | "life" | "pop" | "thud" | `ty-${string}`;
const useSfx = (on: boolean) => {
  const ctx = useRef<AudioContext | null>(null);
  const bufs = useRef<Record<string, AudioBuffer>>({});
  const onRef = useRef(on); onRef.current = on;
  const lastTy = useRef<AudioBufferSourceNode | null>(null);
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.current.state === "suspended") ctx.current.resume().catch(() => { });
    return ctx.current;
  };
  useEffect(() => {
    let dead = false;
    const c = getCtx();
    Object.entries(SND).forEach(([k, [url]]) => {
      fetch(url).then(r => r.arrayBuffer()).then(ab => c.decodeAudioData(ab)).then(buf => { if (!dead) bufs.current[k] = buf; }).catch(() => { });
    });
    return () => { dead = true; };
  }, []);
  return useCallback((type: Sfx) => {
    if (!onRef.current) return;
    try {
      const c = getCtx();
      const buf = bufs.current[type];
      if (buf) {
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = buf; g.gain.value = SND[type][1]; src.playbackRate.value = SND[type][2] ?? 1; src.connect(g); g.connect(c.destination);
        if (type.startsWith("ty-")) { try { lastTy.current?.stop(); } catch { /* */ } lastTy.current = src; } // one thank-you at a time
        src.start();
        return;
      }
      if (SND[type]) return;
      const t0 = c.currentTime;
      const osc = (f: number, t: number, d: number, v = 0.22, w: OscillatorType = "sine", f2?: number) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = w; o.frequency.setValueAtTime(f, t0 + t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + t + d);
        g.gain.setValueAtTime(v, t0 + t); g.gain.exponentialRampToValueAtTime(0.001, t0 + t + d);
        o.start(t0 + t); o.stop(t0 + t + d + 0.01);
      };
      if (type === "punch") { osc(1800, 0, 0.04, 0.12, "square", 600); osc(880, 0.05, 0.14, 0.12, "triangle", 1320); }
      if (type === "toot") { osc(523, 0, 0.28, 0.1, "sawtooth"); osc(659, 0, 0.28, 0.08, "sawtooth"); osc(523, 0.34, 0.45, 0.1, "sawtooth"); osc(659, 0.34, 0.45, 0.08, "sawtooth"); }
      if (type === "thud") osc(240, 0, 0.1, 0.22, "triangle", 90);
      if (type === "pop") osc(520, 0, 0.07, 0.05, "sine", 900);
      if (type === "life") [784, 988, 1175, 1568].forEach((f, i) => osc(f, i * 0.08, 0.22, 0.2, "triangle"));
      if (type === "coin") { osc(988, 0, 0.08, 0.14, "square"); osc(1319, 0.07, 0.24, 0.14, "square"); }
    } catch { /* */ }
  }, []);
};

// steam-train loop (chug.wav is cut to loop seamlessly; WebAudio looping has no gap) - plays while the game runs, mute button silences it
const useChug = (on: boolean) => {
  useEffect(() => {
    if (!on) return;
    let dead = false, src: AudioBufferSourceNode | null = null, ctx: AudioContext | null = null;
    const g0 = 0.8; let gain: GainNode | null = null;
    const wake = () => { ctx?.resume().catch(() => { }); }; // browsers keep sound asleep until the first touch/key
    const onDuck = (e: Event) => { if (gain && ctx) gain.gain.setTargetAtTime((e as CustomEvent).detail ? g0 * 0.35 : g0, ctx.currentTime, 0.1); };
    try {
      const c = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctx = c; c.resume().catch(() => { });
      fetch(`${ART}/chug.wav`).then(r => r.arrayBuffer()).then(ab => c.decodeAudioData(ab)).then(buf => {
        if (dead) return;
        const s = c.createBufferSource(), g = c.createGain();
        s.buffer = buf; s.loop = true; g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(g0, c.currentTime + 1.2);
        s.connect(g); g.connect(c.destination); s.start(); src = s; gain = g;
      }).catch(() => { });
      window.addEventListener("mpe-duck", onDuck);
      window.addEventListener("pointerdown", wake); window.addEventListener("keydown", wake);
    } catch { /* */ }
    return () => {
      dead = true; window.removeEventListener("mpe-duck", onDuck); window.removeEventListener("pointerdown", wake); window.removeEventListener("keydown", wake);
      try { if (gain && ctx) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15); } catch { /* */ }
      const s0 = src, c0 = ctx;
      window.setTimeout(() => { try { s0?.stop(); } catch { /* */ } try { c0?.close(); } catch { /* */ } }, 800);
    };
  }, [on]);
};

type Dir = { x: number; y: number };
type Pt = { x: number; y: number; dx: number; dy: number; face: number };
type Item = { id: number; kind: "pax" | "coin" | "heart"; x: number; y: number; ch: string; li: number; face: number; v: number;
  miss: number; until: number; born: number };
type Fx = { id: number; x: number; y: number; kind: "happy" | "coin" | "life" | "smoke" | "off"; v: number; img?: string; face?: number };
type Piece = { x: number; y: number; w: number; h: number; len: number; thick: number; rot: number; face: number; img: string }; // w,h = box on screen; len,thick,rot = the picture

const Play = ({ unit, diff, sfxOn, musicOn, onToggleMusic, onBack, onWin, onLose }: {
  unit: Unit; diff: Diff; sfxOn: boolean; musicOn: boolean; onToggleMusic: () => void;
  onBack: () => void; onWin: (coins: number) => void; onLose: (reason: "timeout" | "lives") => void;
}) => {
  const sfx = useSfx(sfxOn);
  const L = LV[diff];

  const calc = () => {
    const w = window.innerWidth || FW, h = Math.max(200, (window.innerHeight || FH + 56) - 56);
    const s = Math.min(w / FW, h / FH);
    return { s, sw: w / s, sh: h / s };
  };
  const [fit, setFit] = useState(calc);
  const fitRef = useRef(fit); fitRef.current = fit;
  useEffect(() => { const on = () => setFit(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);

  // words: each word once, shuffled
  const queue = useRef<string[]>(shuffle(unit.vocab).slice(0, WORDS));
  const TOTAL = queue.current.length;
  const [wi, setWi] = useState(0);
  const [pos, setPos] = useState(0);       // index (in the word) of the next letter to pick up
  const [solvedN, setSolvedN] = useState(0); // words done (meter + SOLVED)
  const word = queue.current[Math.min(wi, TOTAL - 1)];

  const [, setTick] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const livesRef = useRef(MAX_LIVES);
  const [coins, setCoins] = useState(0);
  const coinsRef = useRef(0);
  const [ouch, setOuch] = useState(false);
  const [safe, setSafe] = useState(false);
  const [finale, setFinale] = useState(false);
  const [phase, setPhase] = useState<"count" | "play">("count"); // word shown + countdown (train frozen) -> play
  const [count, setCount] = useState(3);
  const [hints, setHints] = useState(diff === "easy" ? 3 : diff === "medium" ? 2 : 1); // the green Hints button: shows the whole word for 2 s
  const [hint, setHint] = useState(false);
  const [hid, setHid] = useState<number[]>([]);    // letter positions hidden on the board while playing
  const [chugOff, setChugOff] = useState(false);
  useChug(CHUG_ON && sfxOn && !chugOff);
  const offFaces = useRef(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).current; // the passengers who step off at the station
  const doneRef = useRef(false);

  const g = useRef({
    x: -150, y: 0, dir: { x: 1, y: 0 } as Dir, face: 1, trail: [] as Pt[], cars: [] as number[], items: [] as Item[], fx: [] as Fx[],
    id: 0, wi: 0, pos: 0, faces: [] as number[], busy: true, playing: true, invincible: false, cooldown: false,
    lastCoin: 0, lastHeart: 0, lastTurn: 0, lastSmoke: 0, carColor: 0,
    target: null as null | { x: number; y: number }, keyDir: null as Dir | null, keyAt: 0, stopped: false, freeze: true, timers: [] as number[], finalCars: [] as number[],
  });

  const finish = (fn: () => void) => { if (doneRef.current) return; doneRef.current = true; fn(); };

  const addFx = (f: Omit<Fx, "id">, ms = 950) => {
    const G = g.current; const id = G.id++;
    G.fx.push({ ...f, id });
    window.setTimeout(() => { G.fx = G.fx.filter(x => x.id !== id); }, ms);
  };

  // next letter index at or after i (skips spaces, hyphens, apostrophes)
  const nextLetter = (w: string, i: number) => { while (i < w.length && !isLetter(w[i])) i++; return i; };
  const upcoming = (w: string, from: number, n: number) => {
    const out: number[] = []; let i = nextLetter(w, from);
    while (i < w.length && out.length < n) { out.push(i); i = nextLetter(w, i + 1); }
    return out;
  };

  // the open meadow in stage px (the background is drawn "cover", so map the picture the same way)
  const box = () => {
    const { sw, sh } = fitRef.current;
    const k = Math.max(sw / BG_W, sh / BG_H), ox = (sw - BG_W * k) / 2, oy = (sh - BG_H * k) / 2;
    return { L: Math.max(8, ox + OPEN.u0 * BG_W * k), R: Math.min(sw - 8, ox + OPEN.u1 * BG_W * k), T: Math.max(8, oy + OPEN.v0 * BG_H * k), B: Math.min(sh - 8, oy + OPEN.v1 * BG_H * k) }; // never past what the window shows
  };

  // grid crossing points in stage px (the background is drawn "cover", so map the picture the same way)
  const gridXY = () => {
    const { sw, sh } = fitRef.current;
    const k = Math.max(sw / BG_W, sh / BG_H), ox = (sw - BG_W * k) / 2, oy = (sh - BG_H * k) / 2;
    return { X: GX.map(u => ox + u * k), Y: GY.map(v => oy + v * k) };
  };

  // the horizontal tracks run off both sides of the picture: leave on one side, come out the same track on the other
  const wrapInfo = () => {
    const { sw, sh } = fitRef.current;
    const k = Math.max(sw / BG_W, sh / BG_H), ox = (sw - BG_W * k) / 2;
    const Lw = Math.max(0, ox), Rw = Math.min(sw, ox + BG_W * k);
    return { Lw, Rw, W: Rw - Lw };
  };
  const wdx = (d: number) => { const { W } = wrapInfo(); return d - W * Math.round(d / W); }; // shortest x distance round the wrap

  // a free spot for a new item: ON the tracks - at a crossing or halfway along a stretch of track
  const freeSpot = (pieces: Piece[]) => {
    const { X, Y } = gridXY(), G = g.current;
    const pts: { x: number; y: number }[] = [];
    for (let j = 0; j < Y.length; j++) for (let i = 0; i < X.length; i++) {
      pts.push({ x: X[i], y: Y[j] });
      if (i < X.length - 1) pts.push({ x: (X[i] + X[i + 1]) / 2, y: Y[j] });
      if (j < Y.length - 1) pts.push({ x: X[i], y: (Y[j] + Y[j + 1]) / 2 });
    }
    // never behind the word board + instruction at the bottom: a ticket (with its face) must always be fully visible
    const { sw, sh } = fitRef.current, bh = Math.max(175, (queue.current[G.wi]?.length || 6) * 23 + 30);
    const okp = pts.filter(q => !(q.y + 44 > sh - 108 && Math.abs(q.x - sw / 2) < bh + 60));
    const pick = () => okp[Math.floor(Math.random() * okp.length)];
    for (let t = 0; t < 120; t++) {
      const { x, y } = pick();
      const relax = t > 70 ? 0.55 : 1;
      if (G.items.some(it => Math.hypot(wdx(it.x - x), it.y - y) < 150 * relax)) continue;
      if (Math.hypot(wdx(G.x - x), G.y - y) < 190 * relax) continue;
      if (t < 70) { // not right in front of the train on its own track
        if (G.dir.x && Math.abs(y - G.y) < 5 && wdx(x - G.x) * G.dir.x > 0 && wdx(x - G.x) * G.dir.x < 420) continue;
        if (G.dir.y && Math.abs(x - G.x) < 5 && (y - G.y) * G.dir.y > 0 && (y - G.y) * G.dir.y < 420) continue;
      }
      if (pieces.some(p => Math.abs(wdx(p.x - x)) < p.w / 2 + 50 && Math.abs(p.y - y) < p.h / 2 + 50)) continue;
      return { x, y };
    }
    return pick();
  };

  // a face not already on the field
  const nextFace = () => {
    const G = g.current, used = new Set(G.items.filter(it => it.kind === "pax").map(it => it.face));
    if (!G.faces.length) G.faces = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const i = G.faces.findIndex(f => !used.has(f));
    return i < 0 ? G.faces.pop()! : G.faces.splice(i, 1)[0];
  };
  // keep the next few letters of the word (and some wrong letters) waiting on the field
  const fillTickets = (pieces: Piece[]) => {
    const G = g.current, w = queue.current[G.wi];
    const need = upcoming(w, G.pos, L.win);
    const now = performance.now();
    need.forEach(li => {
      if (G.items.some(it => it.kind === "pax" && it.li === li)) return;
      const p = freeSpot(pieces);
      G.items.push({ id: G.id++, kind: "pax", x: p.x, y: p.y, ch: w[li], li, face: nextFace(), v: 0, miss: 0, until: 0, born: now });
    });
    const lw = w.toLowerCase();
    const pool = "abcdefghijklmnopqrstuvwxyz".split("").filter(c => !lw.includes(c));
    let nd = G.items.filter(it => it.kind === "pax" && it.li < 0).length;
    const disNow = L.dis + (diff === "easy" ? 0 : Math.min(2, Math.floor(G.wi / 3)));
    while (nd < disNow && pool.length) {
      const c = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      if (G.items.some(it => it.kind === "pax" && it.ch.toLowerCase() === c)) continue;
      const p = freeSpot(pieces);
      G.items.push({ id: G.id++, kind: "pax", x: p.x, y: p.y, ch: c, li: -1, face: nextFace(), v: 0, miss: 0, until: 0, born: now });
      nd++;
    }
  };

  const hurt = (why: string) => {
    const G = g.current;
    if (G.cooldown || G.invincible || doneRef.current) return;
    (window as unknown as { __tpLog?: string[] }).__tpLog?.push(why); // test aid only (exists only when a test made it)
    G.cooldown = true;
    sfx("oof");
    setOuch(true);
    livesRef.current--; setLives(livesRef.current);
    if (livesRef.current <= 0) { G.playing = false; window.setTimeout(() => finish(() => onLose("lives")), 900); return; }
    G.invincible = true; // red shake, then ~2s blink (can't lose another life), the game keeps going
    window.setTimeout(() => { setOuch(false); setSafe(true); }, 500);
    window.setTimeout(() => { G.invincible = false; G.cooldown = false; setSafe(false); }, 2300);
  };

  // where every piece of the train is (engine at the head, then one car per passenger). Top-down art: each piece
  // is turned the way it drives, so its box on screen is long x thin, or thin x long when driving up/down.
  const layout = (): Piece[] => {
    const G = g.current;
    const sizes = [ENG, ...G.cars.map(() => CAR)];
    const imgs = [`${ART}/top-engine.webp`, ...G.cars.map(c => `${ART}/top-car-${c + 1}.webp`)];
    const mk = (i: number, x: number, y: number, dx: number, dy: number): Piece => {
      const sz = sizes[i], vert = dx === 0;
      const rot = dx < 0 ? 180 : dy > 0 ? 90 : dy < 0 ? -90 : 0;
      return { x, y, w: vert ? sz.h : sz.w, h: vert ? sz.w : sz.h, len: sz.w, thick: sz.h, rot, face: dx, img: imgs[i] };
    };
    const out: Piece[] = [mk(0, G.x, G.y, G.dir.x, G.dir.y)];
    const tr = G.trail;
    let k = tr.length - 1, acc = 0, need = 0;
    let px = G.x, py = G.y;
    for (let i = 1; i < sizes.length; i++) {
      const prev = out[i - 1];
      const gap = (sizes[i - 1].w + sizes[i].w) / 2 - 4;
      need += gap;
      while (k > 0 && acc < need) {
        const a = tr[k], b = tr[k - 1];
        acc += Math.hypot(a.x - b.x, a.y - b.y);
        k--; px = b.x; py = b.y;
      }
      const p = tr[Math.max(0, k)];
      if (!p || acc < need) { // not enough trail yet (start): line up behind
        out.push(mk(i, prev.x - G.dir.x * gap, prev.y - G.dir.y * gap, G.dir.x, G.dir.y));
      } else out.push(mk(i, px, py, p.dx, p.dy));
    }
    return out;
  };

  const tm = (fn: () => void, ms: number) => { g.current.timers.push(window.setTimeout(fn, ms)); };
  const askHint = () => {
    const G = g.current;
    if (phase !== "play" || hint || hints <= 0 || G.busy || finale) return;
    setHints(h => h - 1); setHint(true); sfx("click");
    tm(() => setHint(false), 2000);
  };
  // a new word: the train FREEZES, the whole word shows with a 3-2-1 countdown, then some letters vanish and the tickets appear
  const startWord = (n: number) => {
    const G = g.current, w = queue.current[n];
    G.wi = n; G.pos = nextLetter(w, 0); G.busy = true; G.freeze = true; G.keyDir = null; G.target = null;
    G.items = G.items.filter(it => it.kind !== "pax");
    setWi(n); setPos(G.pos); setHid([]); setHint(false); setPhase("count"); setCount(3); sfx("pop");
    const idx = w.split("").map((_, i) => i).filter(i => isLetter(w[i])), m = idx.length;
    const nh = diff === "hard" ? Math.max(0, m - 1) : m; // after the countdown every letter is a blank until the kid collects it (hard keeps ONE letter showing)
    const hide = shuffle(idx).slice(0, nh);
    tm(() => { setCount(2); sfx("pop"); }, 1000);
    tm(() => { setCount(1); sfx("pop"); }, 2000);
    tm(() => { setCount(0); setHid(hide); setPhase("play"); G.busy = false; G.freeze = false; fillTickets(layout()); sfx("punch"); }, 3000);
  };

  const wordDone = () => {
    const G = g.current, w = queue.current[G.wi];
    G.busy = true;
    sfx("toot"); // (Andy 2026-10-06: the English word is no longer spoken after each word)
    const next = G.wi + 1;
    window.setTimeout(() => {
      // the passengers get off: the cars pop away one by one from the back
      const ps = layout().slice(1);
      ps.reverse().forEach((p, i) => window.setTimeout(() => {
        G.cars.pop();
        addFx({ x: p.x, y: p.y, kind: "off", v: 0 }, 700);
      }, i * 90));
      G.items = G.items.filter(it => it.kind !== "pax");
    }, 700);
    setSolvedN(next);
    if (next >= TOTAL) G.finalCars = [...G.cars]; // the side-view train at the end has the same cars
    if (next >= TOTAL) { // meter full: it turns green, the big ticket "All Aboard!" comes in, then the win screen
      window.setTimeout(() => { G.playing = false; setFinale(true); }, 1800);       // the side-view train slides in
      window.setTimeout(() => { setChugOff(true); sfx("levelup"); sfx("toot"); }, 1800 + 2800); // ...and stops at the station
      window.setTimeout(() => finish(() => onWin(coinsRef.current)), 1800 + 7600);
      return;
    }
    window.setTimeout(() => startWord(next), 1300 + w.length * 90);
  };

  // medium + hard get a bit faster with every word, and a few more wrong tickets
  const speedNow = () => L.speed * (diff === "easy" ? 1 : 1 + Math.min(0.3, 0.03 * g.current.wi));
  const pickUp = (it: Item) => {
    const G = g.current, w = queue.current[G.wi];
    const now = performance.now();
    if (it.miss && now - it.miss < 900) return;
    if (it.ch.toLowerCase() === w[G.pos].toLowerCase()) {
      // right: if it was a later copy of the same letter, swap jobs with the one meant for now
      const mine = G.items.find(o => o.kind === "pax" && o.li === G.pos);
      if (mine && mine !== it) mine.li = it.li;
      G.items = G.items.filter(o => o !== it);
      if (G.cars.length < L.maxCars) { G.cars.push(G.carColor % NCARS); G.carColor++; }
      sfx("punch"); sfx(TY[it.face] as Sfx);
      addFx({ x: it.x, y: it.y - 30, kind: "happy", v: 0 });
      G.pos = nextLetter(w, G.pos + 1); setPos(G.pos);
      if (G.pos >= w.length) wordDone();
      else fillTickets(layout());
    } else {
      it.miss = now; // wrong letter: the ticket shakes red, -1 life
      sfx("thud"); hurt("wrong " + it.ch);
    }
  };

  // keys: arrows + WASD (pointer steering stops)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const m: Record<string, Dir> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 } };
      const d = m[e.key] || m[e.key.toLowerCase()];
      if (!d) return;
      e.preventDefault();
      g.current.keyDir = d; g.current.keyAt = performance.now(); g.current.target = null;
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  useEffect(() => { // preload pictures
    [`${ART}/top-engine.webp`, `${ART}/ticket.webp`, COIN_IMG, HEART_IMG].forEach(u => { new Image().src = u; });
    for (let i = 1; i <= NCARS; i++) new Image().src = `${ART}/top-car-${i}.webp`;
    for (let i = 1; i <= 10; i++) new Image().src = `${ART}/face-${i}.webp`;
    new Image().src = `${ART}/side-engine.webp`; for (let i = 1; i <= NCARS; i++) new Image().src = `${ART}/side-car-${i}.webp`;
  }, []);

  // main loop
  useEffect(() => {
    let raf = 0, last = performance.now();
    const G = g.current;
    { const { X, Y } = gridXY(); G.x = X[1]; G.y = Y[1]; } // the train waits at a crossing, facing right
    G.lastCoin = last; G.lastHeart = last;
    const t1 = window.setTimeout(() => startWord(0), 900); // the train chugs in first
    const DIRS: Dir[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    // the game's own steering (mouse/touch target + auto choices) never drives the train into its own cars
    const blocked = (d: Dir) => {
      const ps = layout();
      for (const k of [50, 100, 150]) {
        const x = G.x + d.x * (ENG.w * 0.36 + k), y = G.y + d.y * (ENG.w * 0.36 + k);
        for (let i = 1; i < ps.length; i++) if (Math.abs(wdx(x - ps[i].x)) < ps[i].w / 2 + 12 && Math.abs(y - ps[i].y) < ps[i].h / 2 + 12) return true;
      }
      return false;
    };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (G.playing && !doneRef.current && !G.freeze) {
        const { X, Y } = gridXY(), nc = X.length, nr = Y.length;
        const { Lw, Rw, W } = wrapInfo();
        const shiftAll = (dx: number) => { G.x += dx; for (const t of G.trail) t.x += dx; }; // the whole train moves together, so the cars follow through the wrap
        if (G.x >= Rw) shiftAll(-W); else if (G.x < Lw) shiftAll(W);
        const near = (arr: number[], v: number) => arr.reduce((b, a, i) => Math.abs(a - v) < Math.abs(arr[b] - v) ? i : b, 0);
        if (G.dir.x) G.y = Y[near(Y, G.y)]; else G.x = X[near(X, G.x)]; // always exactly on the rails
        let rem = speedNow() * dt;
        for (let guard = 0; guard < 3 && rem > 0; guard++) {
          let dist = rem + 1, c = -1, r = -1, cm = 0; // distance to the next crossing straight ahead
          if (G.stopped) { dist = 0; c = near(X, G.x); r = near(Y, G.y); } // waiting at the end of a track: decide again from here
          else if (G.dir.x) { r = near(Y, G.y); for (let m = WRAP_ROW[r] ? -1 : 0; m <= (WRAP_ROW[r] ? 1 : 0); m++) for (let i = 0; i < nc; i++) { const d = (X[i] + m * W - G.x) * G.dir.x; if (d > 0.001 && d < dist) { dist = d; c = i; cm = m; } } r = near(Y, G.y); }
          else { for (let j = 0; j < nr; j++) { const d = (Y[j] - G.y) * G.dir.y; if (d > 0.001 && d < dist) { dist = d; r = j; } } c = near(X, G.x); }
          if (dist > rem) { G.x += G.dir.x * rem; G.y += G.dir.y * rem; rem = 0; break; }
          // at a crossing: turn here or go straight on (only here - the track has no other turns)
          rem -= dist; G.x = X[c] + cm * W; G.y = Y[r];
          const opts = DIRS.filter(d => !(d.x === -G.dir.x && d.y === -G.dir.y) && (d.x !== 0 ? (WRAP_ROW[r] || (c + d.x >= 0 && c + d.x < nc)) : (r + d.y >= 0 && r + d.y < nr))); // sideways: only along track that exists
          const has = (d: Dir | null) => !!d && opts.some(o => o.x === d.x && o.y === d.y);
          let pick: Dir | null = null;
          if (G.keyDir && now - G.keyAt > 1100) G.keyDir = null; // a key press waits for the next crossing, but not forever
          if (G.keyDir && has(G.keyDir)) { pick = G.keyDir; G.keyDir = null; }
          else {
            // the train NEVER turns by itself - only the player's keys/mouse turn it, or the end of the track forces it
            const nxt = (d: Dir) => X[(c + d.x + nc) % nc];
            const free1 = opts.filter(d => !blocked(d)), pool = free1.length ? free1 : opts;
            if (G.target) {
              const tx = G.target.x, ty = G.target.y;
              let best = 1e9;
              for (const d of pool) {
                const sc = Math.hypot(wdx((d.x ? nxt(d) : X[c]) - tx), (d.y ? Y[r + d.y] : Y[r]) - ty) - (d.x === G.dir.x && d.y === G.dir.y ? 8 : 0);
                if (sc < best) { best = sc; pick = d; }
              }
              if (Math.hypot(G.x - tx, G.y - ty) < 40) G.target = null;
            } else pick = opts.find(d => d.x === G.dir.x && d.y === G.dir.y) || null;
          }
          if (!pick) { G.stopped = true; break; } // end of the track and nobody steering: the train WAITS (never turns by itself)
          G.stopped = false;
          if (pick.x !== G.dir.x || pick.y !== G.dir.y) { G.dir = pick; G.lastTurn = now; if (pick.x) G.face = pick.x; }
        }
        if (G.x >= Rw) shiftAll(-W); else if (G.x < Lw) shiftAll(W);
        if (!G.stopped) G.trail.push({ x: G.x, y: G.y, dx: G.dir.x, dy: G.dir.y, face: G.face });
        if (G.trail.length > 4000) G.trail.splice(0, G.trail.length - 4000);

        const ps = layout();
        // smoke puffs (round, soft)
        if (now - G.lastSmoke > 380) {
          G.lastSmoke = now;
          addFx({ x: G.x + G.dir.x * ENG.w * 0.24, y: G.y + G.dir.y * ENG.w * 0.24 - 14, kind: "smoke", v: 0 }, 1500); // from the smokestack
        }
        // pick-ups: the front of the engine
        const fx0 = G.x + G.dir.x * ENG.w * 0.5, fy0 = G.y + G.dir.y * ENG.w * 0.5; // the NOSE of the engine picks things up
        for (const it of [...G.items]) {
          const d = Math.hypot(wdx(it.x - fx0), it.y + (it.kind === "pax" ? 10 : 0) - fy0);
          if (it.kind === "pax") { // generous for the right letter, strict for a wrong one (easy to drive past)
            const right = !G.busy && it.ch.toLowerCase() === queue.current[G.wi][G.pos]?.toLowerCase();
            if (!G.busy && now - it.born > 350 && d < (right ? 62 : 40)) pickUp(it);
          }
          else if (d < 56) {
            G.items = G.items.filter(o => o !== it);
            if (it.kind === "coin") { coinsRef.current += it.v; setCoins(coinsRef.current); sfx("coin"); addFx({ x: it.x, y: it.y, kind: "coin", v: it.v }); }
            else { livesRef.current = Math.min(MAX_LIVES, livesRef.current + 1); setLives(livesRef.current); sfx("life"); addFx({ x: it.x, y: it.y, kind: "life", v: 1 }); }
          }
        }
        // bumping into your own cars (the first car right behind the engine can't be reached)
        if (!G.invincible && !G.busy) {
          for (let i = 2; i < ps.length; i++) {
            const p = ps[i];
            if (Math.abs(wdx(fx0 - p.x)) < p.w / 2 - 16 && Math.abs(fy0 - p.y) < p.h / 2 - 8) { hurt("self"); break; }
          }
        }
        // coins + hearts
        G.items = G.items.filter(it => it.kind === "pax" || now < it.until);
        if (now - G.lastCoin > L.coinMs && G.items.filter(it => it.kind === "coin").length < 2) {
          G.lastCoin = now;
          const r = Math.random(), v = r < 0.12 ? 3 : r < 0.35 ? 2 : 1, p = freeSpot(ps);
          G.items.push({ id: G.id++, kind: "coin", x: p.x, y: p.y, ch: "", li: -1, face: 0, v, miss: 0, until: now + ITEM_UP, born: now });
        }
        if (G.items.filter(it => it.kind === "heart").length < Math.min(diff === "hard" ? 1 : 2, MAX_LIVES - livesRef.current) && now - G.lastHeart > L.heartMs) {
          G.lastHeart = now; const p = freeSpot(ps);
          G.items.push({ id: G.id++, kind: "heart", x: p.x, y: p.y, ch: "", li: -1, face: 0, v: 0, miss: 0, until: now + ITEM_UP, born: now });
        }
      }
      setTick(t => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(t1); G.timers.forEach(id => window.clearTimeout(id)); };
  }, []);

  // mouse / touch: drive towards that spot
  const fieldRef = useRef<HTMLDivElement>(null);
  const aim = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return; // mouse never steers (Andy 2026-10-07) - arrow keys only; a finger (iPad) still does
    if (e.type === "pointermove" && !e.buttons) return;
    const r = fieldRef.current?.getBoundingClientRect(); if (!r) return;
    const bx = box();
    g.current.target = { x: Math.max(bx.L, Math.min(bx.R, (e.clientX - r.left) / fitRef.current.s)), y: Math.max(bx.T, Math.min(bx.B, (e.clientY - r.top) / fitRef.current.s)) };
    g.current.keyDir = null;
  };

  const G = g.current;
  const { s, sw, sh } = fit;
  const solved = Math.min(solvedN, TOTAL);
  const pieces = layout();
  const now = performance.now();
  const wordShown = !finale;
  return (
    <div className="tp-page">
      <style>{CSS}</style>
      <GrammarGameBar onBack={onBack} muted={!musicOn} onToggleMute={onToggleMusic}
        stats={{ coins, lives, solved, total: TOTAL }} />
      <div className={"tp-field" + (ouch ? " ouch" : "")} ref={fieldRef} onPointerMove={aim} onPointerDown={aim}>
        <div className="tp-stage" style={{ width: sw, height: sh, transform: `scale(${s})` }}>
          <ControlHints keys={["left", "up", "down", "right"]} style={HINT_BOTTOM_LEFT} /> {/* controls as pictures (Andy 23:32) */}
          <div className={"tp-meter" + (solved >= TOTAL ? " full" : "")}>
            <div className="tp-track"><div className="tp-fill" style={{ width: `${Math.max(7, (solved / TOTAL) * 100)}%` }} /></div>
            <img className="tp-meng" src={`${ART}/engine.webp`} alt="" draggable={false} style={{ left: `calc(${Math.max(7, (solved / TOTAL) * 100)}% - 40px)` }} />
          </div>
          {wordShown && (
            <div className="tp-boardwrap">
              <div className="tp-msg" key={phase + wi + (hint ? "h" : "")}>{phase === "count" || hint ? "Remember the word!" : "Spell the complete word!"}</div>
              <div className="tp-board" key={wi}>
                {word.split("").map((c, i) => {
                  if (c === " ") return <span key={i} className="tp-gap" />;
                  const done = i < pos || !isLetter(c);
                  const blank = phase === "play" && !hint && !done && hid.includes(i); // a blank never shows or highlights its letter
                  const next = i === pos && !G.busy && !blank;
                  return <span key={i} className={"tp-slot" + (done ? " done" : "") + (phase === "count" || hint ? " flash" : "") + (next && L.glow ? " next" : "")}>{blank ? "" : c}</span>;
                })}
                <button data-noclick className={"tp-hint" + (hints <= 0 ? " empty" : "")} onPointerDown={e => e.stopPropagation()} onClick={askHint}>{hints > 0 ? `x${hints} Hints` : "0 Hints"}</button>
              </div>
            </div>
          )}
          {phase === "count" && count > 0 && !finale && <div className="tp-count" key={count}>{count}</div>}
          {G.items.map(it => {
            if (it.kind === "coin") return (
              <div key={it.id} className="tp-coin" style={{ left: it.x, top: it.y }}>
                <img src={COIN_IMG} alt="" draggable={false} />{it.v > 1 && <b>{"×"}{it.v}</b>}
              </div>);
            if (it.kind === "heart") return <img key={it.id} className="tp-heart" src={HEART_IMG} alt="" draggable={false} style={{ left: it.x, top: it.y }} />;
            const missing = it.miss && now - it.miss < 900;
            const glow = L.glow && !G.busy && it.li === pos && !hid.includes(pos); // a blank must not give its letter away
            return (
              <div key={it.id} className={"tp-pax" + (missing ? " miss" : "") + (glow ? " glow" : "")} style={{ left: it.x, top: it.y, zIndex: 20 + Math.round(it.y) }}>
                <img className="tp-face" src={`${ART}/face-${it.face}.webp`} alt="" draggable={false} />
                <div className="tp-ticket"><img src={`${ART}/ticket.webp`} alt="" draggable={false} /><span>{it.ch}</span></div>
              </div>
            );
          })}
          {!finale && (
            <div className={"tp-train" + (safe ? " safe" : "")}>
              {pieces.flatMap((p, i) => {
                const { Lw, Rw, W } = wrapInfo(), xw = Lw + (((p.x - Lw) % W) + W) % W;
                const xs = [xw]; if (xw + p.w / 2 > Rw) xs.push(xw - W); if (xw - p.w / 2 < Lw) xs.push(xw + W);
                return xs.map((x, j) => (
                  <div key={i + "-" + j} className={"tp-piece" + (i === 0 ? " eng" : "")} style={{ left: x, top: p.y, width: p.w, height: p.h, zIndex: 20 + Math.round(p.y) + (i === 0 ? 1 : 0) }}>
                    <img src={p.img} alt="" draggable={false} style={{ width: p.len, height: p.thick, transform: `translate(-50%,-50%) rotate(${p.rot}deg)` }} />
                  </div>));
              })}
            </div>
          )}
          {G.fx.map(f => f.kind === "smoke"
            ? <i key={f.id} className="tp-smoke" style={{ left: f.x, top: f.y }} />
            : f.kind === "coin"
            ? <div key={f.id} className="tp-fx coin" style={{ left: f.x, top: f.y }}><b>+{f.v}</b>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => <i key={k} style={{ ["--a" as string]: `${k * 36 + 10}deg` } as CSSProperties} />)}</div>
            : f.kind === "life"
            ? <div key={f.id} className="tp-fx life" style={{ left: f.x, top: f.y }}><img src={HEART_IMG} alt="" style={{ width: 80 }} /><b>+1</b></div>
            : <div key={f.id} className={"tp-fx " + f.kind} style={{ left: f.x, top: f.y }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(k => <i key={k} style={{ ["--a" as string]: `${k * 45 + 20}deg` } as CSSProperties} />)}</div>)}
          {finale && (() => {
            const kk = Math.max(sw / BG_W, sh / BG_H), ox = (sw - BG_W * kk) / 2, oy = (sh - BG_H * kk) / 2;
            const bx = (u: number) => ox + u * kk, by = (v: number) => oy + v * kk;
            const fc = G.finalCars, n = fc.length;
            const carBg = Math.min(135, 1250 / (n + 1.31)), carW = carBg * kk, engW = carW * 1.31, carH = carW * 110 / 320;
            const total = engW + n * (carW + 3), left = bx(688) - total / 2, yb = by(238);
            return (
              <div className="tp-finale"><i className="tp-finglow" />
                <i className="tp-frail" style={{ top: yb - 3 * kk, height: 10 * kk }} />
                <div className="tp-sidetrain" style={{ left, top: yb - carH * 1.05, width: total, ["--from" as string]: `${sw - left + 30}px` } as CSSProperties}>
                  <img src={`${ART}/side-engine.webp`} alt="" draggable={false} style={{ width: engW, transform: "scaleX(-1)" }} />
                  {fc.map((c, i) => <img key={i} src={`${ART}/side-car-${(c % NCARS) + 1}.webp`} alt="" draggable={false} style={{ width: carW, transform: "scaleX(-1)" }} />)}
                </div>
                {fc.map((_, i) => {
                  const cx = left + engW + 3 + i * (carW + 3) + carW / 2;
                  return <img key={i} className="tp-offpax" src={`${ART}/face-${offFaces[i % 10]}.webp`} alt="" draggable={false}
                    style={{ left: cx, top: yb - carH * 0.55, height: 34 * kk, animationDelay: `${2.9 + i * 0.25}s`, ["--dx" as string]: `${(bx(688) - cx) * 0.25}px`, ["--up" as string]: `${58 * kk}px` } as CSSProperties} />;
                })}
                <div className="tp-bigticket"><img src={`${ART}/ticket.webp`} alt="" draggable={false} /><span>Last Stop!</span></div>
              </div>);
          })()}
        </div>
      </div>
    </div>
  );
};

// Outer: keeps the result (win / lose) and restarts the game by remounting it.
export default function TicketPlease({ unit, diff, cfg, sfxOn = true, musicOn, onToggleMusic, onMusicTrack, onBack, onRestart, getCoinTotal, renderWin, renderLose }: {
  unit: Unit; diff: Diff; cfg: Cfg; sfxOn?: boolean; musicOn: boolean; onToggleMusic: () => void;
  onMusicTrack?: (src: string | null) => void; onBack: () => void; onRestart?: () => void;
  getCoinTotal?: () => Promise<number | null | undefined>;
  renderWin: (restart: () => void, coinsWon: number, coinStart: number) => ReactNode; renderLose: (reason: "timeout" | "lives", restart: () => void) => ReactNode;
}) {
  const [run, setRun] = useState(0);
  const [coinsWon, setCoinsWon] = useState(0);
  const [coinStart, setCoinStart] = useState(0);
  useEffect(() => { getCoinTotal?.().then(t => { if (typeof t === "number") setCoinStart(t); }); }, [run]);
  const [result, setResult] = useState<null | "win" | "timeout" | "lives">(null);
  const [howto, setHowto] = useState(() => wantHowto("snake")); // first 3 times (cloud), then only via "?" (Andy 2026-10-07)
  useEffect(() => () => onMusicTrack?.(null), []);
  useEffect(() => { onMusicTrack?.(result ? "" : TRAIN_MUSIC); }, [result]);
  useEffect(() => { // font for the tickets
    if (document.getElementById("mpe-font-titan2")) return;
    const l = document.createElement("link"); l.id = "mpe-font-titan2"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Titan+One&family=Bangers&display=swap"; document.head.appendChild(l);
  }, []);
  const restart = () => { onRestart?.(); setResult(null); setRun(r => r + 1); };
  if (result === "win") return <>{renderWin(restart, coinsWon, coinStart)}</>;
  if (result) return <>{renderLose(result, restart)}</>;
  if (howto) return <HowToPlay {...TICKET_HOWTO} muted={!musicOn} onDone={() => { setHowto(false); seenHowto("snake"); }} />;
  return <Play key={run} unit={unit} diff={diff} sfxOn={sfxOn && musicOn} musicOn={musicOn} onToggleMusic={onToggleMusic}
    onBack={onBack} onWin={c => { setCoinsWon(c); setResult("win"); }} onLose={r => setResult(r)} />;
}

const CSS = `
.tp-page{position:fixed;inset:0;display:flex;flex-direction:column;background:#7fb94e;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden}
.tp-field{position:relative;flex:1;overflow:hidden;background:#8cc45a url(${ART}/bg.webp) center/cover no-repeat;touch-action:none}
.tp-field.ouch{animation:tp-ouch .12s linear 4}
.tp-field.ouch::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px 40px rgba(255,30,30,.55)}
@keyframes tp-ouch{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.tp-stage{position:absolute;left:0;top:0;transform-origin:0 0}
.tp-target{display:flex;align-items:center;gap:8px;background:rgba(40,25,5,.55);border:1.5px solid rgba(255,220,120,.45);border-radius:999px;padding:2px 10px 2px 22px}
.tp-zh{font-family:'Nunito',sans-serif;font-weight:900;font-size:30px;line-height:1.2;color:#ffe066;white-space:nowrap}
.tp-say{background:none;border:none;cursor:pointer;padding:4px;display:flex}

.tp-meter{position:absolute;top:16px;left:50%;transform:translateX(-50%);width:600px;height:44px;z-index:3000;pointer-events:none}
.tp-track{position:absolute;left:0;right:0;top:12px;height:30px;border-radius:999px;background:#fff4d6;border:5px solid #5b3412;overflow:hidden;
 box-shadow:inset 0 4px 0 rgba(120,70,20,.18),0 4px 0 #3b220c,0 8px 12px rgba(0,0,0,.25)}
.tp-fill{height:100%;border-radius:999px;background:linear-gradient(180deg,#ffe27a 0%,#ffbf1f 55%,#e08f00 100%);
 box-shadow:inset 0 4px 0 rgba(255,255,255,.45);transition:width .6s cubic-bezier(.3,1.3,.6,1)}
.tp-meter.full .tp-fill{background:linear-gradient(180deg,#b8f58e 0%,#5ccf3a 55%,#2f9a1c 100%)}
.tp-meng{position:absolute;top:-6px;width:96px;max-width:none;transform:scaleX(-1);transition:left .6s cubic-bezier(.3,1.3,.6,1);filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))}
.tp-meter.full .tp-meng{animation:tp-mwig .3s ease-in-out infinite alternate}
@keyframes tp-mwig{0%{transform:scaleX(-1) translateY(0)}100%{transform:scaleX(-1) translateY(-6px)}}

.tp-boardwrap{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);z-index:15;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none}
.tp-msg{font-family:'Titan One','Nunito',sans-serif;font-size:20px;line-height:1.2;color:#fff;background:rgba(40,25,5,.8);border:3px solid #ffe066;border-radius:999px;padding:2px 16px;text-shadow:0 2px 0 #3b220c;animation:tp-msgin .35s ease-out both}
@keyframes tp-msgin{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
.tp-count{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:3500;pointer-events:none;font-family:'Titan One','Bangers',sans-serif;font-size:230px;line-height:1;color:#ffe066;-webkit-text-stroke:10px #5b3412;paint-order:stroke fill;text-shadow:0 10px 0 #3b220c,0 16px 24px rgba(0,0,0,.4);animation:tp-cnt .9s ease-out both}
@keyframes tp-cnt{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}25%{transform:translate(-50%,-50%) scale(1.15);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
.tp-board{position:relative;display:flex;gap:6px;align-items:center;padding:6px 12px;
 background:linear-gradient(180deg,#8a5a2b,#6b4220);border:5px solid #3b220c;border-radius:14px;box-shadow:inset 0 3px 0 rgba(255,230,180,.3),0 6px 0 #2a1707,0 10px 14px rgba(0,0,0,.3);
 animation:tp-boardin .35s cubic-bezier(.3,1.5,.6,1) both}
@keyframes tp-boardin{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
.tp-slot{width:40px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#f6e6bd;border:3px solid #4a2a0c;
 font-family:'Titan One','Fredoka',sans-serif;font-size:30px;line-height:1;color:#a88b5a;box-shadow:inset 0 -4px 0 rgba(120,80,30,.25)}
.tp-slot.done{background:linear-gradient(180deg,#d9ffbf,#9be27a);border-color:#2f6b17;color:#1d4a0b;animation:tp-pop .3s cubic-bezier(.3,1.7,.6,1)}
.tp-slot.next{background:linear-gradient(180deg,#fff3a8,#ffcf3a);border-color:#8a5a00;color:#4a2a0c;transform:scale(1.14);box-shadow:0 0 16px rgba(255,210,60,.9)}
.tp-gap{width:22px}
.tp-hint{position:absolute;left:calc(100% + 16px);top:50%;transform:translateY(-50%);pointer-events:auto;cursor:pointer;font-family:'Titan One','Fredoka',sans-serif;font-size:22px;line-height:1;color:#fff;white-space:nowrap;padding:12px 20px;border-radius:16px;border:3px solid #1d7a24;
 background:linear-gradient(180deg,#8cf57a 0%,#34c23e 55%,#1f9a2c 100%);text-shadow:0 2px 0 rgba(0,70,10,.6);box-shadow:0 6px 0 #14661b,0 10px 14px rgba(0,0,0,.35),0 0 18px 4px rgba(110,255,110,.65),inset 0 3px 0 rgba(255,255,255,.45);animation:tp-hintglow 1.2s ease-in-out infinite alternate;transition:transform .08s,box-shadow .08s}
.tp-hint:active{transform:translateY(calc(-50% + 5px));box-shadow:0 1px 0 #14661b,0 3px 6px rgba(0,0,0,.35),0 0 10px 2px rgba(110,255,110,.5),inset 0 3px 0 rgba(255,255,255,.3);animation:none}
.tp-hint.empty{cursor:default;filter:grayscale(.75) brightness(.85);animation:none;box-shadow:0 4px 0 #14661b,0 6px 10px rgba(0,0,0,.3)}
.tp-hint.empty:active{transform:translateY(-50%)}
@keyframes tp-hintglow{0%{box-shadow:0 6px 0 #14661b,0 10px 14px rgba(0,0,0,.35),0 0 12px 2px rgba(110,255,110,.45),inset 0 3px 0 rgba(255,255,255,.45)}100%{box-shadow:0 6px 0 #14661b,0 10px 14px rgba(0,0,0,.35),0 0 28px 9px rgba(150,255,120,.95),inset 0 3px 0 rgba(255,255,255,.45)}}
.tp-slot.flash{background:linear-gradient(180deg,#fffbb8,#ffe433);border-color:#b07a00;color:#5a3300;box-shadow:0 0 18px 5px rgba(255,236,70,.95),0 0 40px 10px rgba(255,200,0,.7);animation:tp-flash .55s ease-in-out infinite alternate}
@keyframes tp-flash{0%{transform:scale(1)}100%{transform:scale(1.08)}}
@keyframes tp-pop{0%{transform:scale(1.4)}100%{transform:scale(1)}}

.tp-pax{position:absolute;width:0;height:0;pointer-events:none;animation:tp-in .4s cubic-bezier(.3,1.6,.6,1) both}
.tp-pax .tp-face{position:absolute;left:0;bottom:6px;height:78px;width:auto;max-width:none;transform:translateX(-50%);filter:drop-shadow(0 4px 3px rgba(0,0,0,.3));animation:tp-bob 1.8s ease-in-out infinite}
.tp-ticket{position:absolute;left:0;top:-12px;width:100px;transform:translateX(-50%) rotate(-4deg);filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))}
.tp-ticket img{display:block;width:100%}
.tp-ticket span{position:absolute;left:26%;right:6%;top:0;bottom:4%;display:flex;align-items:center;justify-content:center;
 font-family:'Titan One','Fredoka',sans-serif;font-size:42px;line-height:1;color:#5b3412;text-shadow:0 2px 0 rgba(255,250,220,.8)}
.tp-pax.glow .tp-ticket{filter:drop-shadow(0 0 10px #fff27a) drop-shadow(0 0 22px rgba(255,200,40,.95));animation:tp-glow 1s ease-in-out infinite alternate}
@keyframes tp-glow{0%{transform:translateX(-50%) rotate(-4deg) scale(1)}100%{transform:translateX(-50%) rotate(-4deg) scale(1.12)}}
.tp-pax.miss .tp-ticket{filter:drop-shadow(0 0 10px #ff2a2a) drop-shadow(0 0 20px rgba(255,0,0,.6));animation:tp-shake .1s linear 6}
@keyframes tp-shake{0%,100%{transform:translateX(-50%) rotate(-4deg)}25%{transform:translateX(calc(-50% - 7px)) rotate(-4deg)}75%{transform:translateX(calc(-50% + 7px)) rotate(-4deg)}}
@keyframes tp-in{0%{transform:scale(.2);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes tp-bob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-4px)}}

.tp-coin{position:absolute;width:64px;transform:translate(-50%,-50%);z-index:15;pointer-events:none;animation:tp-in .35s ease-out both}
.tp-coin img{width:100%;display:block;animation:tp-spin 1.2s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(255,210,60,.85))}
.tp-coin b{position:absolute;left:70%;top:36%;font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:28px;color:#fff;white-space:nowrap;
 text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 3px 0 #7a3f08}
@keyframes tp-spin{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.6)}}
.tp-heart{position:absolute;width:74px;transform:translate(-50%,-50%);z-index:15;pointer-events:none;filter:drop-shadow(0 0 10px rgba(255,140,120,.9));animation:tp-in .35s ease-out both}

.tp-train{position:absolute;inset:0;pointer-events:none}
.tp-train.safe{animation:tp-blink .3s steps(1) infinite}
@keyframes tp-blink{0%{opacity:1}50%{opacity:.3}}
.tp-piece{position:absolute;transform:translate(-50%,-50%);filter:drop-shadow(0 6px 4px rgba(0,0,0,.28))}
.tp-piece img{display:block;position:absolute;left:50%;top:50%;max-width:none}
.tp-piece.eng{animation:tp-chug .26s ease-in-out infinite alternate}
@keyframes tp-chug{0%{margin-top:0}100%{margin-top:-3px}}
.tp-smoke{position:absolute;width:30px;height:30px;margin:-15px;border-radius:50%;background:rgba(245,245,245,.85);z-index:2900;pointer-events:none;
 box-shadow:0 0 10px rgba(255,255,255,.6);animation:tp-puff 1.5s ease-out forwards}
@keyframes tp-puff{0%{transform:scale(.5);opacity:.9}100%{transform:translate(-14px,-90px) scale(2.4);opacity:0}}

.tp-fx{position:absolute;pointer-events:none;z-index:2950}
.tp-fx i{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px;border-radius:50%;background:#fffde6;
 box-shadow:0 0 3px 1px #fff27a,0 0 9px 3px #ffd000;animation:tp-dot .8s ease-out forwards}
.tp-fx.off i{background:#fff;box-shadow:0 0 3px 1px #fff,0 0 9px 3px #9fe8ff;animation-duration:.6s}
.tp-fx.coin i{width:9px;height:9px;margin:-4.5px;animation-duration:.55s}
@keyframes tp-dot{0%{opacity:1;transform:rotate(var(--a)) translateX(10px) scale(1.2)}100%{opacity:0;transform:rotate(var(--a)) translateX(100px) scale(.4)}}
.tp-fx b{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:46px;white-space:nowrap;animation:tp-plus .9s ease-out forwards}
.tp-fx.coin b{color:#ffd84a;text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 4px 0 #7a3f08}
.tp-fx.life b{color:#ff8a8a;text-shadow:0 0 10px rgba(255,120,120,.9),0 3px 0 #7a1020}
.tp-fx.life img{position:absolute;left:0;top:0;transform:translate(-50%,-50%);animation:tp-life .9s ease-out forwards}
@keyframes tp-life{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(2.2);opacity:0}}
@keyframes tp-plus{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}25%{opacity:1;transform:translate(-50%,-80%) scale(1.1)}100%{transform:translate(-50%,-180%) scale(1);opacity:0}}

.tp-finale{position:absolute;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;pointer-events:none;animation:tp-finbg .6s ease-out both}
@keyframes tp-finbg{0%{background:rgba(255,250,225,0)}100%{background:rgba(255,250,225,.35)}}
.tp-finglow{position:absolute;width:900px;height:900px;margin-top:230px;border-radius:50%;background:radial-gradient(circle,rgba(255,240,170,.85) 0%,rgba(255,220,120,.35) 40%,rgba(255,220,120,0) 70%);animation:tp-finin .7s ease-out 3.4s both}
.tp-bigticket{position:relative;width:520px;margin-top:230px;filter:drop-shadow(0 16px 14px rgba(0,0,0,.35));animation:tp-finin .7s cubic-bezier(.3,1.5,.6,1) 3.4s both,tp-finwig .34s ease-in-out 4.1s infinite alternate}
.tp-sidetrain{position:absolute;display:flex;align-items:flex-end;gap:3px;filter:drop-shadow(0 4px 3px rgba(0,0,0,.4));animation:tp-slide 2.8s cubic-bezier(.2,.7,.3,1) both}
.tp-sidetrain img{display:block;max-width:none;flex:none}
@keyframes tp-slide{0%{transform:translateX(var(--from))}100%{transform:translateX(0)}}
.tp-frail{position:absolute;left:0;right:0;background:linear-gradient(#b6bcc4 0 22%,transparent 22% 36%,#b6bcc4 36% 58%,#5a3a1c 58% 100%);animation:tp-fade .5s ease-out both}
@keyframes tp-fade{0%{opacity:0}100%{opacity:1}}
.tp-offpax{position:absolute;max-width:none;opacity:0;filter:drop-shadow(0 3px 2px rgba(0,0,0,.35));animation:tp-getoff 1.7s ease-out both}
@keyframes tp-getoff{0%{opacity:0;transform:translate(-50%,0) scale(.4)}12%{opacity:1;transform:translate(-50%,-4px) scale(1)}30%{opacity:1;transform:translate(-50%,calc(var(--up) * -.7))}42%{opacity:1;transform:translate(-50%,calc(var(--up) * -.5))}100%{opacity:1;transform:translate(calc(-50% + var(--dx)),calc(var(--up) * -1))}}
.tp-bigticket img{display:block;width:100%}
.tp-bigticket span{position:absolute;left:25%;right:10.3%;top:0;bottom:1%;display:flex;align-items:center;justify-content:center;white-space:nowrap;
 font-family:'Titan One','Fredoka',sans-serif;font-size:46px;line-height:1;color:#5b3412;text-shadow:0 4px 0 rgba(255,250,220,.85)}
@keyframes tp-finin{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:scale(1)}}
@keyframes tp-finwig{0%{transform:rotate(-3deg)}100%{transform:rotate(3deg)}}
@media (prefers-reduced-motion: reduce){.tp-coin img,.tp-pax .tp-face{animation:none}}
`;
