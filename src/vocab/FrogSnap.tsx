// FROG SNAP! (Andy 2026-10-06) = the new Arrow Shoot (game id "arrow"). Old ArrowShoot stays in GameTest.tsx as the fallback.
// A frog on a lily pad slides UP and DOWN on the left of a lagoon. Bubbles drift in from the right, each with a little fly
// and an English word inside. Click / tap the bubble with the English word for the Chinese word on top: the tongue
// snaps at it (mouse only - no SPACE bar, Andy 23:13). Right bubble = it pops and the fly buzzes away free (never eaten). Wrong bubble = the
// fly giggles, the frog gets dizzy for a moment, -1 life. A bubble that bumps into the frog = -1 life (red shake, then
// ~2s blink). Coin bubbles (x1/x2/x3) and, while lives < 5, heart bubbles: snap them or swim into them.
// Every unit word once -> meter full -> "Yummy!" party (Andy 23:32) -> win screen (treats + coins paid by the win screen).
// Art + sounds: public/vocab/frog (originals + cut_frog.py in BACKUPFILES/vocab_art/frog/originals).
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import GrammarGameBar from "@/components/GrammarGameBar";
import { FUN3D_CSS, Word3D } from "@/components/Fun3D";
import ControlHints, { HINT_BOTTOM, type HintKey } from "@/components/ControlHints";
import HowToPlay from "@/components/HowToPlay";
import { wantHowto, seenHowto } from "@/lib/howtoSeen";

type Diff = "easy" | "medium" | "hard";
type Cfg = { spawnMs: number; speedMult: number; timerSec: number; maxOnScreen: number };
type Unit = { vocab: string[]; chinese: Record<string, string> };

const ART = "/vocab/frog";
export const FROG_MUSIC = `${ART}/music.mp3`; // Andy's 'funny bouncy cartoon mischief', levelled to ~-22.4 LUFS
const FW = 1600, FH = 944;                    // design field (under the 56px bar)
const BW = 1376, BH = 768;                    // lagoon picture size (water effects use these pixels)
const FX = 150;                               // frog centre x (stage px)
const FROG_W = 125, FROG_H = 118, PAD_W = 192, PAD_H = 121; // a little smaller (Andy 23:05)
const MOUTH = { x: 29, y: 0 };  // inside the open mouth (frog-2 pixel 229,147 of 312x294) - Andy 23:07               // tongue starts here (from the frog centre), measured on frog-2
const MAX_LIVES = 5;
const COIN_W = 52, COIN_D = 122, HEART_D = 122; // bigger so x2/x3 fit inside (22:57)
const HEART_IMG = "/vocab/space/heart-orb.webp";
// word size that fits INSIDE the bubble outline: measured with the real font; 5px outline added (Andy 23:32)
let mctx: CanvasRenderingContext2D | null = null;
const fitFont = (word: string, d: number) => {
  const maxW = d * 0.72;                 // inside width at the word line (the rim takes the rest)
  try {
    mctx = mctx || document.createElement("canvas").getContext("2d");
    if (mctx) { mctx.font = "24px 'Lilita One', Fredoka, sans-serif"; const w = mctx.measureText(word).width; if (w > 0) return Math.min(26, (24 * (maxW - 6)) / w); }
  } catch { /* */ }
  return Math.min(26, maxW / (word.length * 0.58));
};
// long phrase -> 2 balanced lines when one line would be small (Andy 23:32: big readable words, inside the outline)
const fitWord = (word: string, d: number): { fs: number; two?: [string, string] } => {
  const one = fitFont(word, d);
  if (one >= 21 || !word.includes(" ")) return { fs: one };
  const sp = [...word].map((c, i) => (c === " " ? i : -1)).filter(i => i > 0);
  const at = sp.sort((a, b) => Math.max(a, word.length - a) - Math.max(b, word.length - b))[0];
  const l1 = word.slice(0, at), l2 = word.slice(at + 1);
  const fs = Math.min(24, fitFont(l1.length > l2.length ? l1 : l2, d * 0.97));
  return fs > one ? { fs, two: [l1, l2] } : { fs: one };
};
// per level: new bubble every spawnMs, max bubbles at once, drift speed px/s [min, max]
const LV: Record<Diff, { spawnMs: number; max: number; v: [number, number]; coinMs: number; heartMs: number }> = {
  easy: { spawnMs: 2300, max: 4, v: [70, 100], coinMs: 4200, heartMs: 7000 },
  medium: { spawnMs: 1600, max: 6, v: [113, 169], coinMs: 4800, heartMs: 9000 },
  hard: { spawnMs: 1050, max: 8, v: [155, 230], coinMs: 5400, heartMs: 12000 },
};
const SND: Record<string, [string, number]> = {
  tongue: [`${ART}/snd_tongue.mp3`, 0.75],                  // Andy's whip, loudest ~-17 heard
  croak: [`${ART}/snd_croak.mp3`, 1],                       // Andy's frog croak (1st ribbit), plays WITH the whip (22:57)
  giggle: ["/vocab/garden/snd_giggle.mp3", 0.65],           // wrong fly giggles at the frog
  oof: ["/vocab/garden/snd_oof.mp3", 0.6],                  // bubble bumps the frog
  levelup: ["/vocab/snd_levelup.mp3", 0.4],                 // win: Great Job!
};

// HOW TO PLAY (Andy 2026-10-07): pictures from the game's own art, super simple English
const chip: CSSProperties = { display: "flex", alignItems: "center", gap: 10, background: "rgba(0,40,60,.85)", border: "3px solid rgba(160,255,240,.6)",
  borderRadius: 999, padding: "6px 18px 6px 26px", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 52, color: "#b8fff2", boxShadow: "0 8px 0 rgba(0,0,0,.35)" };
export const FROG_HOWTO = {
  title: "Frog Snap!",
  steps: [
    { art: <span style={chip}>{"蘋果"}<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="#fff" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg></span>,
      text: <>Look at the <b>word</b> on top</> },
    { art: <div style={{ position: "relative", width: 340, height: 250 }}>
        <img src={`${ART}/frog-2.webp`} alt="" style={{ position: "absolute", left: 0, top: 96, width: 132 }} />
        <i style={{ position: "absolute", left: 96, top: 158, width: 110, height: 10, borderRadius: 5, background: "linear-gradient(180deg,#ff9fb4,#f2607e 45%,#c93b5d)", boxShadow: "0 0 0 2px #5a1426", transform: "rotate(-24deg)", transformOrigin: "0 50%" }} />
        <div style={{ position: "absolute", left: 178, top: 20, width: 160, height: 160 }}>
          <i style={{ position: "absolute", inset: "5%", borderRadius: "50%", background: "radial-gradient(circle at 38% 32%,rgba(255,255,255,.55),rgba(210,250,255,.32) 45%,rgba(120,220,255,.22) 100%)" }} />
          <img src={`${ART}/fly-2.webp`} alt="" style={{ position: "absolute", left: 51, top: 24, width: 58 }} />
          <span style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", fontFamily: "'Lilita One',sans-serif", fontSize: 30, color: "#fff", WebkitTextStroke: "5px #0b4a63", paintOrder: "stroke fill" }}>apple</span>
          <img src={`${ART}/bubble.webp`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </div>
      </div>,
      text: <><b>Snap</b> the correct bubble!</> },
    { art: <div style={{ position: "relative", width: 340, height: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
        <img src={`${ART}/frog-4.webp`} alt="" style={{ width: 150, marginBottom: 14, animation: "hw-jump .6s ease-in-out infinite alternate" }} />
        <div style={{ width: 300, height: 30, borderRadius: 999, border: "4px solid #f4fff8", background: "linear-gradient(180deg,#e2ffd2 0%,#9df07c 22%,#4cc531 55%,#2f9a1c 75%,#8de66a 100%)", boxShadow: "0 0 0 2px #0b4a63,0 0 16px rgba(120,255,120,.8)" }} />
      </div>,
      text: <><b>Fill</b> the meter to <b>win!</b></> },
  ],
  controls: [{ keys: ["up", "down"] as HintKey[], text: <>Move</> }, { mouse: true, text: <>Click to <b>snap</b></> }],
  tip: <>Don't let the bubbles <em>bump</em> you!</>,
};

// computer voice; the game music dips while it speaks (GamePage listens to 'mpe-duck')
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

type SfxName = "tongue" | "croak" | "giggle" | "oof" | "levelup" | "pop" | "coin" | "life" | "wrong";
const useSfx = (on: boolean) => {
  const ctx = useRef<AudioContext | null>(null);
  const bufs = useRef<Record<string, AudioBuffer>>({});
  const onRef = useRef(on); onRef.current = on;
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
  return useCallback((type: SfxName) => {
    if (!onRef.current) return;
    try {
      const c = getCtx();
      const buf = bufs.current[type];
      if (buf) {
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = buf; g.gain.value = SND[type][1]; src.connect(g); g.connect(c.destination); src.start();
        return;
      }
      const osc = (f: number, t: number, d: number, v = 0.22, w: OscillatorType = "sine", f2?: number) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = w;
        o.frequency.setValueAtTime(f, c.currentTime + t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + t + d);
        g.gain.setValueAtTime(v, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + d);
        o.start(c.currentTime + t); o.stop(c.currentTime + t + d + 0.01);
      };
      if (type === "pop") { osc(520, 0, 0.09, 0.3, "sine", 1400); osc(1600, 0.05, 0.08, 0.12, "triangle", 2400); }
      if (type === "wrong") { osc(330, 0, 0.18, 0.16, "square", 220); }
      if (type === "life") [784, 988, 1175, 1568].forEach((f, i) => osc(f, i * 0.08, 0.22, 0.2, "triangle"));
      if (type === "coin") { osc(988, 0, 0.08, 0.14, "square"); osc(1319, 0.07, 0.24, 0.14, "square"); }
    } catch { /* */ }
  }, []);
};

// ---- water effects on the lagoon picture (all in picture pixels, 1376x768) ----
const rnd = (() => { let s = 77; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
const inWater = (x: number, y: number) => y > 110 && (y < 545 || x < 480) && y < 735 && !(x > 1120 && y < 175);
const pickWater = () => { for (let i = 0; i < 50; i++) { const x = 30 + rnd() * 1300, y = 110 + rnd() * 620; if (inWater(x, y)) return [x, y]; } return [600, 300]; };
const SPARKS = Array.from({ length: 22 }, () => { const [x, y] = pickWater(); return { x, y, s: 0.6 + rnd() * 0.8, d: 2 + rnd() * 2.6, dl: -rnd() * 5 }; });
const GLINTS = Array.from({ length: 18 }, () => { const [x, y] = pickWater(); return { x, y, w: 22 + rnd() * 40, d: 4 + rnd() * 3.5, dl: -rnd() * 7 }; });
const STREAKS = Array.from({ length: 11 }, (_, i) => ({ x: 6 + i * 11 + rnd() * 5, w: 3 + Math.round(rnd() * 3), h: 22 + rnd() * 24, d: 0.55 + rnd() * 0.45, dl: -rnd() * 1 }));
const FOAM = Array.from({ length: 9 }, (_, i) => ({ x: 1180 + i * 13 + rnd() * 6, y: 120 + rnd() * 22, r: 9 + rnd() * 12, d: 0.8 + rnd() * 0.7, dl: -rnd() * 1.5 }));
const DROPS = Array.from({ length: 5 }, (_, i) => ({ x: 1196 + i * 22 + rnd() * 8, y: 124, d: 0.9 + rnd() * 0.5, dl: -rnd() * 1.4 }));

const WaterFx = () => (
  <>
    <div className="fs-shim" />
    {GLINTS.map((g, i) => <i key={"g" + i} className="fs-gl" style={{ left: g.x, top: g.y, width: g.w, animationDuration: `${g.d}s`, animationDelay: `${g.dl}s` }} />)}
    {SPARKS.map((p, i) => <i key={"s" + i} className="fs-spk" style={{ left: p.x, top: p.y, ["--s" as string]: p.s, animationDuration: `${p.d}s`, animationDelay: `${p.dl}s` } as CSSProperties} />)}
    <div className="fs-fall">
      {STREAKS.map((s, i) => <i key={i} style={{ left: s.x, width: s.w, height: s.h, animationDuration: `${s.d}s`, animationDelay: `${s.dl}s` }} />)}
      <b />
    </div>
    {FOAM.map((f, i) => <i key={"f" + i} className="fs-foam" style={{ left: f.x, top: f.y, width: f.r * 2, height: f.r * 1.4, animationDuration: `${f.d}s`, animationDelay: `${f.dl}s` }} />)}
    {DROPS.map((d, i) => <i key={"d" + i} className="fs-drop" style={{ left: d.x, top: d.y, animationDuration: `${d.d}s`, animationDelay: `${d.dl}s` }} />)}
  </>
);

type Bub = { id: number; kind: "word" | "coin" | "heart"; word: string; idx: number; fly: number; v: number; x: number; y0: number; y: number;
  d: number; vx: number; ph: number; red?: number; fs?: number; two?: [string, string] };
type Fx = { id: number; x: number; y: number; kind: "free" | "pop" | "coin" | "life"; n: number };
type Tongue = { t0: number; bid: number | null; hx: number; hy: number; done: boolean };

const Play = ({ unit, diff, sfxOn, musicOn, onToggleMusic, onBack, onWin, onLose }: {
  unit: Unit; diff: Diff; sfxOn: boolean; musicOn: boolean; onToggleMusic: () => void;
  onBack: () => void; onWin: (coins: number) => void; onLose: (reason: "timeout" | "lives") => void;
}) => {
  const sfx = useSfx(sfxOn);
  const L = LV[diff];
  const TOTAL = unit.vocab.length;

  // field: design 1600x944 scaled to fit, then widened to the window (like the world page)
  const calc = () => {
    const w = window.innerWidth || FW, h = Math.max(200, (window.innerHeight || FH + 56) - 56);
    const s = Math.min(w / FW, h / FH);
    return { s, sw: w / s, sh: h / s };
  };
  const [fit, setFit] = useState(calc);
  const fitRef = useRef(fit); fitRef.current = fit;
  useEffect(() => { const on = () => setFit(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  // the lagoon picture covers the field: picture pixel -> stage px
  const scene = (f = fitRef.current) => {
    const k = Math.max(f.sw / BW, f.sh / BH);
    return { k, ox: (f.sw - BW * k) / 2, oy: (f.sh - BH * k) / 2 };
  };
  const frogRange = () => { const f = fitRef.current, c = scene(f); return [Math.max(120, c.oy + 130 * c.k), Math.min(f.sh - 100, c.oy + 650 * c.k)]; };
  const bubRange = () => { const f = fitRef.current, c = scene(f); return [Math.max(130, c.oy + 140 * c.k), Math.min(f.sh - 120, c.oy + 600 * c.k)]; };

  const [, setTick] = useState(0);
  const [target, setTarget] = useState(unit.vocab[0]);
  const targetRef = useRef(target); targetRef.current = target;
  const [lives, setLives] = useState(MAX_LIVES);
  const livesRef = useRef(MAX_LIVES);
  const [solved, setSolved] = useState(0);
  const [coins, setCoins] = useState(0);
  const coinsRef = useRef(0);
  const [ouch, setOuch] = useState(false);
  const [safe, setSafe] = useState(false);
  const doneRef = useRef(false);
  const endRef = useRef(false);
  const [party, setParty] = useState(false);

  const g = useRef({ bubs: [] as Bub[], fx: [] as Fx[], tongue: null as Tongue | null, fy: 0, id: 0, start: 0, lastSpawn: 0, lastTgt: 0,
    lastCoin: 0, lastHeart: 0, held: {} as Record<string, number>, nudge: 0, dizzy: 0, happy: 0,
    lastWord: "", cooldown: false, invincible: false, cleared: new Set<string>(), keys: new Set<string>() });
  if (!g.current.fy) { const [a, b] = frogRange(); g.current.fy = (a + b) / 2; }

  const nextTarget = (cleared: Set<string>) => {
    const remaining = unit.vocab.filter(v => !cleared.has(v));
    if (!remaining.length) return;
    const others = remaining.filter(v => v !== targetRef.current);
    const pool = others.length ? others : remaining;
    setTarget(pool[Math.floor(Math.random() * pool.length)]);
  };
  const finish = (fn: () => void) => { if (doneRef.current) return; doneRef.current = true; fn(); };
  const addFx = (f: Omit<Fx, "id">, ms = 1300) => {
    const G = g.current; const id = G.id++;
    G.fx.push({ ...f, id });
    window.setTimeout(() => { G.fx = G.fx.filter(x => x.id !== id); }, ms);
  };
  const loseLife = () => {
    livesRef.current--; setLives(livesRef.current);
    if (livesRef.current <= 0) { window.setTimeout(() => finish(() => onLose("lives")), 900); return true; }
    return false;
  };
  // bubble bumps the frog: red shake, then ~2s blink (can't be hit), game keeps going
  const hurt = () => {
    const G = g.current;
    if (G.cooldown || G.invincible || doneRef.current || endRef.current) return;
    G.cooldown = true; sfx("oof"); setOuch(true);
    if (loseLife()) return;
    G.invincible = true;
    window.setTimeout(() => { setOuch(false); setSafe(true); }, 500);
    window.setTimeout(() => { G.invincible = false; G.cooldown = false; setSafe(false); }, 2300);
  };
  const collect = (b: Bub) => {
    const G = g.current;
    G.bubs = G.bubs.filter(x => x !== b);
    sfx("pop"); addFx({ x: b.x, y: b.y, kind: "pop", n: 0 }, 400);
    if (b.kind === "coin") { coinsRef.current += b.v; setCoins(coinsRef.current); sfx("coin"); addFx({ x: b.x, y: b.y, kind: "coin", n: b.v }, 950); }
    else { livesRef.current = Math.min(MAX_LIVES, livesRef.current + 1); setLives(livesRef.current); sfx("life"); addFx({ x: b.x, y: b.y, kind: "life", n: 0 }, 950); }
  };

  // the tongue reached a bubble
  const snapped = (b: Bub, now: number) => {
    const G = g.current;
    if (b.kind !== "word") { collect(b); return; }
    if (b.word === targetRef.current) {
      G.bubs = G.bubs.filter(x => x !== b);
      sfx("pop"); speak(b.word, "en-US");
      addFx({ x: b.x, y: b.y, kind: "pop", n: 0 }, 400);
      addFx({ x: b.x, y: b.y - b.d * 0.12, kind: "free", n: b.fly });
      G.happy = now + 700;
      G.cleared = new Set([...G.cleared, b.word]); setSolved(G.cleared.size);
      if (G.cleared.size >= TOTAL) { // meter full: every bubble pops, all flies go free, Great Job! party, then the win screen
        endRef.current = true;
        for (const o of G.bubs) {
          addFx({ x: o.x, y: o.y, kind: "pop", n: 0 }, 400);
          if (o.kind === "word") addFx({ x: o.x, y: o.y - o.d * 0.12, kind: "free", n: o.fly });
        }
        G.bubs = [];
        window.setTimeout(() => { setParty(true); sfx("levelup"); }, 600);
        window.setTimeout(() => finish(() => onWin(coinsRef.current)), 4000);
      } else window.setTimeout(() => nextTarget(G.cleared), 150);
    } else {
      // WRONG: the bubble shakes red, the fly giggles, the frog is dizzy for a moment, -1 life
      b.red = now + 700;
      G.dizzy = now + 1100;
      sfx("giggle"); sfx("wrong");
      loseLife();
    }
  };

  const shoot = (bid: number | null) => {
    const G = g.current;
    if (doneRef.current || endRef.current || G.tongue) return;
    const now = performance.now();
    if (G.dizzy > now) return;
    const mx = FX + MOUTH.x, my = G.fy + MOUTH.y;
    let b = bid != null ? G.bubs.find(x => x.id === bid) : undefined;
    if (bid == null) { // SPACE: straight ahead, the first bubble in line
      const line = G.bubs.filter(x => x.x > mx && Math.abs(x.y - my) < x.d * 0.45).sort((p, q) => p.x - q.x);
      b = line[0];
    }
    sfx("tongue"); window.setTimeout(() => sfx("croak"), 300); // ribbit right AFTER the whip (whip sound ends ~0.31s) - Andy 23:17
    G.tongue = { t0: now, bid: b ? b.id : null, hx: b ? b.x : mx + 520, hy: b ? b.y : my, done: !b };
  };

  // main loop (stage px per second)
  useEffect(() => {
    let raf = 0, last = performance.now();
    const G = g.current;
    if (!G.start) { G.start = last; G.lastSpawn = last - L.spawnMs + 900; G.lastTgt = last - 3000; G.lastCoin = last; G.lastHeart = last; }
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { sw } = fitRef.current;
      const [fTop, fBot] = frogRange();
      if (!doneRef.current && !endRef.current) {
        // frog: arrow keys / W S (tap = small glide, hold = steady speed); not while dizzy
        if (G.dizzy < now) {
          if (G.nudge) { const st = Math.abs(G.nudge) < 0.5 ? G.nudge : G.nudge * Math.min(1, dt * 14); G.fy += st; G.nudge -= st; }
          for (const [k, dir] of [["up", -1], ["down", 1]] as const) {
            if (!G.keys.has(k)) { delete G.held[k]; continue; }
            if (!G.held[k]) G.held[k] = now;
            if (now - G.held[k] > 150) G.fy += dir * 430 * dt;
          }
        } else G.nudge = 0;
        G.fy = Math.max(fTop, Math.min(fBot, G.fy));

        // new bubbles: the RIGHT one is never missing for long (5s), something new at least every 3s
        const [bTop, bBot] = bubRange();
        const words = G.bubs.filter(b => b.kind === "word");
        if (words.some(b => b.word === targetRef.current)) G.lastTgt = now;
        const needT = now - G.lastTgt > 5000;
        const gapAny = now - G.lastSpawn > 3000 && words.length < L.max + 2;
        if (needT || gapAny || (now - G.lastSpawn > L.spawnMs && words.length < L.max)) {
          G.lastSpawn = now;
          if (needT) G.lastTgt = now;
          const onScreen = words.filter(b => b.word === targetRef.current).length;
          const force = needT || (onScreen === 0 && words.length >= Math.min(3, L.max - 1));
          // never a word already on screen, never the same word twice in a row (Andy 2026-10-07)
          const onS = new Set(G.bubs.filter(b => b.kind === "word").map(b => b.word)), pool = unit.vocab.filter(v => !onS.has(v) && v !== G.lastWord);
          const pool2 = pool.length ? pool : unit.vocab.filter(v => v !== G.lastWord);
          const pick = pool2.length ? pool2 : unit.vocab;
          const word = force ? targetRef.current : pick[Math.floor(Math.random() * pick.length)];
          G.lastWord = word;
          const d = Math.max(118, Math.min(168, word.length * 12 + 50)); // smaller (Andy 23:32): room for the frog to dodge
          G.bubs.push(mkBub("word", word, d, sw, bTop, bBot));
        }
        // coins (never more than 3) + a heart while lives < 5
        if (now - G.lastCoin > L.coinMs && G.bubs.filter(b => b.kind === "coin").length < 3) {
          G.lastCoin = now;
          const r = Math.random(), v = r < 0.12 ? 3 : r < 0.35 ? 2 : 1;
          const b = mkBub("coin", "", COIN_D, sw, bTop, bBot); b.v = v; G.bubs.push(b);
        }
        if (livesRef.current < MAX_LIVES && now - G.lastHeart > L.heartMs && !G.bubs.some(b => b.kind === "heart")) {
          G.lastHeart = now; G.bubs.push(mkBub("heart", "", HEART_D, sw, bTop, bBot));
        }
        // drift left with a gentle bob
        for (const b of G.bubs) { b.ph += dt; b.x -= b.vx * dt; b.y = b.y0 + Math.sin(b.ph * 1.4) * 14; }
        for (const b of G.bubs) for (const o of G.bubs) if (o !== b && o.x < b.x && b.vx > o.vx && Math.hypot(b.x - o.x, b.y0 - o.y0) < (b.d + o.d) / 2 + 8) b.vx = o.vx; // never catch up and cover another bubble (22:57)
        G.bubs = G.bubs.filter(b => b.x > -b.d);
        // a bubble touching the frog: coin/heart = collected, word bubble = bump (-1 life)
        const touch = G.bubs.find(b => b.x - b.d / 2 < FX + 52 && b.x + b.d / 2 > FX - 50 && Math.abs(b.y - G.fy) < b.d / 2 + 42);
        if (touch) {
          if (touch.kind !== "word") collect(touch);
          else if (!G.invincible && !G.cooldown) {
            G.bubs = G.bubs.filter(b => b !== touch); sfx("pop");
            addFx({ x: touch.x, y: touch.y, kind: "pop", n: 0 }, 400);
            addFx({ x: touch.x, y: touch.y - touch.d * 0.12, kind: "free", n: touch.fly });
            hurt();
          }
        }
      }
      // tongue: out 110ms, holds, back by 320ms; it follows its bubble while going out
      const T = G.tongue;
      if (T) {
        const el = now - T.t0;
        const b = T.bid != null ? G.bubs.find(x => x.id === T.bid) : undefined;
        if (b && !T.done) { T.hx = b.x; T.hy = b.y; }
        if (el >= 110 && !T.done) { T.done = true; if (b && !doneRef.current && !endRef.current) snapped(b, now); }
        if (el > 320) G.tongue = null;
      }
      setTick(t => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    const mkBub = (kind: Bub["kind"], word: string, d: number, sw: number, bTop: number, bBot: number): Bub => {
      const G2 = g.current;
      // keep away from other bubbles near the right edge
      let y = bTop + Math.random() * (bBot - bTop), best = -1;
      for (let i = 0; i < 14; i++) {
        const c = bTop + Math.random() * (bBot - bTop);
        const near = G2.bubs.filter(o => o.x > (kind === "word" ? sw - 420 : sw * 0.3)); // coins/hearts: a clear lane
        const gap = near.length ? Math.min(...near.map(o => Math.abs(o.y0 - c) - (o.d + d) / 2)) : 9999;
        if (gap > best) { best = gap; y = c; }
        if (gap > (kind === "word" ? 10 : 70)) break;
      }
      // a bubble in this lane already? start just behind it (off screen) so they never cover each other (22:57)
      let sx = sw + d / 2 + 10;
      for (const o of G2.bubs) if (Math.abs(o.y0 - y) < (o.d + d) / 2 + 8) sx = Math.max(sx, o.x + (o.d + d) / 2 + 12);
      const vx = (L.v[0] + Math.random() * (L.v[1] - L.v[0])) * (kind === "word" ? 1 : 0.9);
      return { id: G2.id++, kind, word, idx: Math.max(0, unit.vocab.indexOf(word)), fly: 1 + Math.floor(Math.random() * 6), v: 1,
        x: sx, y0: y, y, d, vx, ph: Math.random() * 6, ...(kind === "word" ? fitWord(word, d) : { fs: 0 }) };
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // keyboard: up/down (or W/S) move, SPACE snaps straight ahead
  useEffect(() => {
    const G = g.current;
    const key = (e: KeyboardEvent) => e.key === "ArrowUp" || e.key === "w" || e.key === "W" ? "up"
      : e.key === "ArrowDown" || e.key === "s" || e.key === "S" ? "down" : "";
    const dn = (e: KeyboardEvent) => {
      const k = key(e); if (!k) return;
      e.preventDefault();
      if (!G.keys.has(k) && k === "up") G.nudge = Math.max(-60, G.nudge - 30);
      if (!G.keys.has(k) && k === "down") G.nudge = Math.min(60, G.nudge + 30);
      G.keys.add(k);
    };
    const up = (e: KeyboardEvent) => { const k = key(e); if (k) G.keys.delete(k); };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  // click / tap a bubble = the tongue snaps at it (wide hit area)
  const fieldRef = useRef<HTMLDivElement>(null);
  const onDown = (e: React.PointerEvent) => {
    const r = fieldRef.current?.getBoundingClientRect(); if (!r) return;
    const s0 = fitRef.current.s, px = (e.clientX - r.left) / s0, py = (e.clientY - r.top) / s0;
    const G = g.current;
    const hit = G.bubs.map(b => ({ b, dd: Math.hypot(b.x - px, b.y - py) })).filter(o => o.dd < o.b.d * 0.58).sort((p, q) => (p.b.kind === "word" ? 1 : 0) - (q.b.kind === "word" ? 1 : 0) || p.dd - q.dd)[0]; // hearts/coins first
    if (hit) shoot(hit.b.id);
  };
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;
  const hold = (k: "up" | "down") => (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.type === "touchstart") g.current.keys.add(k); else g.current.keys.delete(k);
  };

  const G = g.current;
  const now = performance.now();
  const { s, sw, sh } = fit;
  const sc = scene(fit);
  const zh = unit.chinese[target] || target;
  const pose = G.dizzy > now ? 3 : G.tongue ? 2 : G.happy > now ? 4 : 1;
  // tongue drawing
  let tongue: ReactNode = null;
  if (G.tongue) {
    const el = now - G.tongue.t0;
    const p = el < 110 ? el / 110 : el < 170 ? 1 : Math.max(0, 1 - (el - 170) / 150);
    const mx = FX + MOUTH.x, my = G.fy + MOUTH.y;
    const dx = G.tongue.hx - mx, dy = G.tongue.hy - my, len = Math.hypot(dx, dy) * p;
    tongue = (
      <div className="fs-tongue" style={{ left: mx, top: my, width: len, transform: `rotate(${Math.atan2(dy, dx)}rad)` }}><b /></div>
    );
  }
  return (
    <div className="fs-page">
      <style>{CSS + FUN3D_CSS}</style>
      <GrammarGameBar onBack={onBack} muted={!musicOn} onToggleMute={onToggleMusic}
        stats={{ coins, lives, solved, total: TOTAL }}
        center={
          <span className="fs-target">
            <span className="fs-zh">{zh}</span>
            <button className="fs-say" aria-label="Say it" onClick={e => { e.stopPropagation(); speak(zh.split("/")[0].trim(), "zh-TW"); }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H3v6h3l5 4V5z" fill="#fff" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            </button>
          </span>
        } />
      <div className="fs-field" ref={fieldRef} onPointerDown={onDown}>
        <div className="fs-stage" style={{ width: sw, height: sh, transform: `scale(${s})` }}>
          <div className="fs-scene" style={{ left: sc.ox, top: sc.oy, transform: `scale(${sc.k})` }}>
            <img className="fs-bg" src={`${ART}/bg.webp`} alt="" draggable={false} />
            <WaterFx />
          </div>
          <div className={"fs-meter" + (solved >= TOTAL ? " full" : "")}>
            <div className="fs-track"><div className="fs-fill" style={{ width: `${Math.max(5, (solved / TOTAL) * 100)}%` }} /></div>
            <img className="fs-micon" src={`${ART}/frog-4.webp`} alt="" draggable={false} />
          </div>
          {/* frog on its lily pad */}
          <div className={"fs-frog" + (ouch ? " ouch" : safe ? " safe" : "")} style={{ left: FX, top: G.fy }}>
            <div className="fs-bobber">
              <i className="fs-padring" /><i className="fs-padring two" />
              <img className="fs-pad" src={`${ART}/lilypad.webp`} alt="" draggable={false}
                style={{ width: PAD_W, height: PAD_H, left: -4 - PAD_W / 2, top: -11 }} />
              <img className={"fs-frogimg p" + pose} src={`${ART}/frog-${pose}.webp`} alt="" draggable={false}
                style={{ width: FROG_W, height: FROG_H, left: -FROG_W / 2, top: -FROG_H / 2 }} />
            </div>
          </div>
          {tongue}
          {G.bubs.map(b => {
            const red = b.red && b.red > now;
            if (b.kind === "word") {
              const fs = b.fs || fitFont(b.word, b.d);
              return (
                <div key={b.id} className={"fs-bub" + (red ? " red" : "")} style={{ left: b.x, top: b.y, width: b.d, height: b.d }}>
                  <div className="fs-wob">
                    <i className="fs-in" />
                    <img className="fs-fly" src={`${ART}/fly-${b.fly}.webp`} alt="" draggable={false} style={{ width: b.d * 0.36 }} />
                    <span className={"fs-word" + (b.two ? " two" : "")} style={{ fontSize: fs }}>{b.two ? <>{b.two[0]}<br />{b.two[1]}</> : b.word}</span>
                    <img className="fs-rim" src={`${ART}/bubble.webp`} alt="" draggable={false} />
                  </div>
                </div>
              );
            }
            return (
              <div key={b.id} className="fs-bub small" style={{ left: b.x, top: b.y, width: b.d, height: b.d }}>
                <div className="fs-wob">
                  <i className="fs-in" />
                  {b.kind === "coin"
                    ? <><img className="fs-coin" src="/worlds/ui/coin.webp" alt="" draggable={false} style={{ width: COIN_W }} />{b.v > 1 && <b className="fs-x">{"×"}{b.v}</b>}</>
                    : <img className="fs-heart" src={HEART_IMG} alt="" draggable={false} style={{ width: 62 }} />}
                  <img className="fs-rim" src={`${ART}/bubble.webp`} alt="" draggable={false} />
                </div>
              </div>
            );
          })}
          {G.fx.map(f => f.kind === "pop"
            ? <img key={f.id} className="fs-fx pop" src={`${ART}/bubble-pop.webp`} alt="" style={{ left: f.x, top: f.y }} />
            : f.kind === "free"
            ? <div key={f.id} className="fs-fx free" style={{ left: f.x, top: f.y }}>
                <img src={`${ART}/fly-${f.n}.webp`} alt="" />
                {[0, 1, 2, 3, 4, 5, 6, 7].map(k => <i key={k} style={{ ["--a" as string]: `${k * 45 + 20}deg` } as CSSProperties} />)}
              </div>
            : f.kind === "coin"
            ? <div key={f.id} className="fs-fx coin" style={{ left: f.x, top: f.y }}><img src="/worlds/ui/coin.webp" alt="" style={{ width: COIN_W }} /><b>+{f.n}</b></div>
            : <div key={f.id} className="fs-fx life" style={{ left: f.x, top: f.y }}><img src={HEART_IMG} alt="" style={{ width: 72 }} /><b>+1</b></div>)}
          {party && (
            <div className="fs-party">
              <div className="fs-ptext"><Word3D text="Yummy!" palette="gold" stagger={90} style={{ fontSize: 170 }} /></div>
              <div className="fs-pfrog">
                <i className="fs-pglow" />
                <img src={`${ART}/frog-4.webp`} alt="" />
                <div className="fs-orbit">
                  {[1, 2, 3, 4, 5, 6].map(k => <img key={k} src={`${ART}/fly-${k}.webp`} alt="" style={{ ["--a" as string]: `${k * 60}deg` } as CSSProperties} />)}
                </div>
              </div>
            </div>
          )}
          {!isTouch && !party && (
            <ControlHints keys={["up", "down"]} mouse style={HINT_BOTTOM} />
          )}
        </div>
        {isTouch && (
          <div className="fs-pads">
            <button onTouchStart={hold("up")} onTouchEnd={hold("up")}>{"▲"}</button>
            <button onTouchStart={hold("down")} onTouchEnd={hold("down")}>{"▼"}</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Outer: keeps the result (win / lose) and restarts the game by remounting it.
export default function FrogSnap({ unit, diff, sfxOn = true, musicOn, onToggleMusic, onMusicTrack, onBack, onRestart, getCoinTotal, renderWin, renderLose }: {
  unit: Unit; diff: Diff; cfg?: Cfg; sfxOn?: boolean; musicOn: boolean; onToggleMusic: () => void;
  onMusicTrack?: (src: string | null) => void; onBack: () => void; onRestart?: () => void;
  getCoinTotal?: () => Promise<number | null | undefined>;
  renderWin: (restart: () => void, coinsWon: number, coinStart: number) => ReactNode; renderLose: (reason: "timeout" | "lives", restart: () => void) => ReactNode;
}) {
  const [run, setRun] = useState(0);
  const [coinsWon, setCoinsWon] = useState(0);
  const [coinStart, setCoinStart] = useState(0);
  useEffect(() => { getCoinTotal?.().then(t => { if (typeof t === "number") setCoinStart(t); }); }, [run]);
  const [result, setResult] = useState<null | "win" | "timeout" | "lives">(null);
  const [howto, setHowto] = useState(() => wantHowto("arrow")); // first 3 times (cloud), then only via "?" (Andy 2026-10-07)
  useEffect(() => () => onMusicTrack?.(null), []);
  useEffect(() => { onMusicTrack?.(result ? "" : FROG_MUSIC); }, [result]);
  const restart = () => { onRestart?.(); setResult(null); setRun(r => r + 1); };
  if (result === "win") return <>{renderWin(restart, coinsWon, coinStart)}</>;
  if (result) return <>{renderLose(result, restart)}</>;
  if (howto) return <HowToPlay {...FROG_HOWTO} bg={`${ART}/bg.webp`} muted={!musicOn} onDone={() => { setHowto(false); seenHowto("arrow"); }} />;
  return <Play key={run} unit={unit} diff={diff} sfxOn={sfxOn && musicOn} musicOn={musicOn} onToggleMusic={onToggleMusic}
    onBack={onBack} onWin={c => { setCoinsWon(c); setResult("win"); }} onLose={r => setResult(r)} />;
}

const CSS = `
.fs-page{position:fixed;inset:0;display:flex;flex-direction:column;background:#0b5b6b;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden}
.fs-field{position:relative;flex:1;overflow:hidden;background:#1fd6ea;touch-action:none}
.fs-stage{position:absolute;left:0;top:0;transform-origin:0 0}
.fs-scene{position:absolute;width:${BW}px;height:${BH}px;transform-origin:0 0;overflow:hidden;pointer-events:none}
.fs-bg{position:absolute;left:0;top:0;width:${BW}px;height:${BH}px;image-rendering:pixelated}
.fs-target{display:flex;align-items:center;gap:8px;background:rgba(0,40,60,.55);border:1.5px solid rgba(160,255,240,.45);border-radius:999px;padding:2px 10px 2px 22px}
.fs-zh{font-family:'Nunito',sans-serif;font-weight:900;font-size:30px;line-height:1.2;color:#b8fff2;white-space:nowrap}
.fs-say{background:none;border:none;cursor:pointer;padding:4px;display:flex}
/* --- water --- */
.fs-shim{position:absolute;left:0;top:95px;width:${BW}px;height:650px;opacity:.55;
 background:repeating-linear-gradient(102deg,rgba(255,255,255,0) 0 70px,rgba(255,255,255,.10) 70px 78px,rgba(255,255,255,0) 78px 150px),
  repeating-linear-gradient(78deg,rgba(255,255,255,0) 0 90px,rgba(255,255,255,.07) 90px 96px,rgba(255,255,255,0) 96px 190px);
 -webkit-mask-image:radial-gradient(ellipse 60% 55% at 45% 50%,#000 30%,transparent 80%);mask-image:radial-gradient(ellipse 60% 55% at 45% 50%,#000 30%,transparent 80%);
 animation:fs-shim 14s linear infinite}
@keyframes fs-shim{0%{background-position:0 0,0 0}100%{background-position:300px 0,-380px 0}}
.fs-gl{position:absolute;height:4px;margin-top:-2px;border-radius:2px;background:rgba(255,255,255,.85);box-shadow:0 0 4px rgba(255,255,255,.7);opacity:0;animation:fs-gl ease-in-out infinite}
@keyframes fs-gl{0%,100%{opacity:0;transform:translateX(-12px) scaleX(.5)}50%{opacity:.85;transform:translateX(12px) scaleX(1)}}
.fs-spk{position:absolute;width:0;height:0;animation:fs-spk ease-in-out infinite}
.fs-spk::before,.fs-spk::after{content:"";position:absolute;background:#fff;box-shadow:0 0 6px 1px rgba(255,255,255,.9)}
.fs-spk::before{left:-2px;top:-9px;width:4px;height:18px}.fs-spk::after{left:-9px;top:-2px;width:18px;height:4px}
@keyframes fs-spk{0%,62%,100%{transform:scale(0) rotate(0)}75%{transform:scale(var(--s)) rotate(0)}88%{transform:scale(calc(var(--s) * .4)) rotate(45deg)}}
.fs-ripples{position:absolute;left:0;top:0;width:${BW}px;height:${BH}px;clip-path:polygon(880px 112px,1302px 112px,1320px 140px,1320px 480px,880px 480px)}
.fs-ripples i{position:absolute;left:1176px;top:126px;width:120px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.85);opacity:0;animation:fs-rip 3.6s linear infinite}
@keyframes fs-rip{0%{transform:scale(.45);opacity:0}10%{opacity:.9}100%{transform:scale(3.3);opacity:0}}
.fs-fall{position:absolute;left:1188px;top:0;width:150px;height:126px;overflow:hidden;
 clip-path:polygon(12px 0,147px 0,114px 40px,110px 122px,2px 122px,2px 55px)}
.fs-fall i{position:absolute;top:0;border-radius:3px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.85) 45%,rgba(255,255,255,0));animation:fs-streak linear infinite}
@keyframes fs-streak{0%{transform:translateY(-50px)}100%{transform:translateY(130px)}}
.fs-fall b{position:absolute;top:0;bottom:0;left:0;width:22px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(230,255,255,.45),rgba(255,255,255,0));animation:fs-gleam 4.5s ease-in-out infinite alternate}
@keyframes fs-gleam{0%{transform:translateX(0)}100%{transform:translateX(105px)}}
.fs-foam{position:absolute;border-radius:45%;background:#f4ffff;box-shadow:0 0 6px rgba(255,255,255,.9);transform:translate(-50%,-50%);animation:fs-foam ease-in-out infinite alternate}
@keyframes fs-foam{0%{transform:translate(-50%,-50%) scale(.55);opacity:.55}100%{transform:translate(-50%,-60%) scale(1.15);opacity:1}}
.fs-drop{position:absolute;width:6px;height:6px;border-radius:2px;background:#fff;box-shadow:0 0 4px #fff;animation:fs-dropj ease-out infinite}
@keyframes fs-dropj{0%{transform:translate(0,0);opacity:0}15%{opacity:1}50%{transform:translate(-6px,-22px)}100%{transform:translate(-12px,6px);opacity:0}}
/* --- frog --- */
.fs-frog{position:absolute;width:0;height:0;pointer-events:none;z-index:20}
.fs-bobber{position:absolute;left:0;top:0;animation:fs-bobber 2.6s ease-in-out infinite}
@keyframes fs-bobber{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}
.fs-pad,.fs-frogimg{position:absolute;display:block;max-width:none}
.fs-frogimg.p1{transform-origin:50% 95%;animation:fs-breathe 1.7s ease-in-out infinite}
@keyframes fs-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.035) scaleX(.99)}}
.fs-frogimg.p3{animation:fs-dizzy .5s ease-in-out infinite}
@keyframes fs-dizzy{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
.fs-frogimg.p4{animation:fs-hop .35s ease-out}
@keyframes fs-hop{0%{transform:translateY(0)}45%{transform:translateY(-16px)}100%{transform:translateY(0)}}
.fs-padring{position:absolute;left:-104px;top:18px;width:200px;height:66px;border-radius:50%;border:3px solid rgba(255,255,255,.55);animation:fs-pr 2.8s ease-out infinite}
.fs-padring.two{animation-delay:1.4s}
@keyframes fs-pr{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.35);opacity:0}}
.fs-frog.ouch{animation:fs-ouch .14s linear infinite}
@keyframes fs-ouch{0%,100%{transform:none;filter:none}25%{transform:translateX(-7px);filter:drop-shadow(0 0 14px #ff3b3b) brightness(1.4)}75%{transform:translateX(7px);filter:drop-shadow(0 0 14px #ff3b3b) brightness(1.4)}}
.fs-frog.safe{animation:fs-safe .3s steps(1) infinite}
@keyframes fs-safe{0%{opacity:1}50%{opacity:.35}}
.fs-tongue{position:absolute;height:9px;margin-top:-4.5px;transform-origin:0 50%;z-index:21;pointer-events:none;border-radius:5px;
 background:linear-gradient(180deg,#ff9fb4 0%,#f2607e 45%,#c93b5d 100%);box-shadow:0 0 0 2px #5a1426}
.fs-tongue b{position:absolute;right:-9px;top:-4.5px;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffc2cf,#f2607e 55%,#c93b5d);box-shadow:0 0 0 2px #5a1426}
/* --- bubbles --- */
.fs-bub{position:absolute;transform:translate(-50%,-50%);pointer-events:none;z-index:25}
.fs-wob{position:relative;width:100%;height:100%;animation:fs-wob 2.2s ease-in-out infinite}
@keyframes fs-wob{0%,100%{transform:scale(1,1)}50%{transform:scale(1.04,.96)}}
.fs-in{position:absolute;inset:5%;border-radius:50%;background:radial-gradient(circle at 38% 32%,rgba(255,255,255,.55),rgba(210,250,255,.32) 45%,rgba(120,220,255,.22) 100%)}
.fs-rim{position:absolute;left:0;top:0;width:100%;height:100%;display:block;max-width:none}
.fs-fly{position:absolute;left:50%;top:15%;transform:translateX(-50%);display:block;max-width:none;animation:fs-buzz .18s steps(2) infinite}
@keyframes fs-buzz{0%{margin-top:0}100%{margin-top:-3px}}
.fs-word.two{top:49%;line-height:.98}
.fs-word{position:absolute;left:0;right:0;top:55%;text-align:center;font-family:'Lilita One','Fredoka',sans-serif;line-height:1;color:#fff;white-space:nowrap;
 -webkit-text-stroke:5px #0b4a63;paint-order:stroke fill;text-shadow:0 3px 0 #0b4a63}
.fs-bub.red .fs-wob{animation:fs-shake .12s linear infinite}
.fs-bub.red .fs-in{background:radial-gradient(circle,rgba(255,120,120,.55),rgba(255,60,60,.35));box-shadow:0 0 22px 8px rgba(255,60,60,.7)}
@keyframes fs-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.fs-coin,.fs-heart{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;max-width:none}
.fs-coin{animation:fs-spin 1.8s ease-in-out infinite;filter:drop-shadow(0 0 6px rgba(255,210,60,.8))}
@keyframes fs-spin{0%,100%{transform:translate(-50%,-50%) scaleX(1)}50%{transform:translate(-50%,-50%) scaleX(.6)}}
.fs-bub.small{z-index:27}
.fs-x{position:absolute;left:56%;top:52%;font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:26px;color:#fff;white-space:nowrap;
 text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 3px 0 #7a3f08}
.fs-heart{animation:fs-pulse 1.1s ease-in-out infinite}
@keyframes fs-pulse{0%,100%{transform:translate(-50%,-50%) scale(.9)}50%{transform:translate(-50%,-50%) scale(1.08)}}
/* --- effects --- */
.fs-fx{position:absolute;pointer-events:none;z-index:30}
.fs-fx.pop{transform:translate(-50%,-50%);width:170px;animation:fs-popfx .4s ease-out forwards}
@keyframes fs-popfx{0%{opacity:1;transform:translate(-50%,-50%) scale(.8)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}}
.fs-fx.free img{position:absolute;left:0;top:0;width:76px;transform:translate(-50%,-50%);animation:fs-free 1.3s ease-in forwards}
@keyframes fs-free{0%{transform:translate(-50%,-50%) rotate(0)}20%{transform:translate(-20%,-120%) rotate(-12deg)}40%{transform:translate(-80%,-200%) rotate(10deg)}
 60%{transform:translate(0%,-300%) rotate(-8deg)}100%{transform:translate(80%,-560%) rotate(8deg) scale(.7);opacity:0}}
.fs-fx.free i{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px;border-radius:50%;background:#fffde6;box-shadow:0 0 3px 1px #fff27a,0 0 9px 3px #ffd000;animation:fs-dot .8s ease-out forwards}
@keyframes fs-dot{0%{opacity:1;transform:rotate(var(--a)) translateX(10px) scale(1.2)}100%{opacity:0;transform:rotate(var(--a)) translateX(100px) scale(.4)}}
.fs-fx.coin img,.fs-fx.life img{position:absolute;left:0;top:0;transform:translate(-50%,-50%);animation:fs-coinpop .7s ease-out forwards}
@keyframes fs-coinpop{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-90%) scale(1.5);opacity:0}}
.fs-fx.coin b,.fs-fx.life b{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:44px;animation:fs-plus .9s ease-out forwards}
.fs-fx.coin b{color:#ffd84a;text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 4px 0 #7a3f08}
.fs-fx.life b{color:#ff8a8a;text-shadow:0 0 10px rgba(255,120,120,.9),0 3px 0 #7a1020}
@keyframes fs-plus{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}25%{opacity:1;transform:translate(-50%,-80%) scale(1.1)}100%{transform:translate(-50%,-180%) scale(1);opacity:0}}
/* --- meter: water fills the bar, green when full --- */
.fs-meter{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;pointer-events:none}
.fs-track{width:520px;height:28px;border-radius:999px;background:rgba(6,50,70,.75);border:4px solid #f4fff8;overflow:hidden;
 box-shadow:inset 0 0 0 1px #3d8f86,0 0 0 2px #0b4a63,0 3px 8px rgba(0,0,0,.45)}
.fs-fill{position:relative;height:100%;border-radius:999px;overflow:hidden;transition:width .5s cubic-bezier(.3,1.4,.6,1);
 background:linear-gradient(180deg,#e6ffff 0%,#8af0ff 22%,#2cc6f0 58%,#1594d6 80%,#7fe2ff 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.9),0 0 10px rgba(140,240,255,.7)}
.fs-fill::after{content:"";position:absolute;top:0;bottom:0;width:70px;left:-90px;background:linear-gradient(100deg,transparent,rgba(255,255,255,.95),transparent);animation:fs-shine 2.4s ease-in-out infinite}
@keyframes fs-shine{0%{left:-90px}55%,100%{left:110%}}
.fs-meter.full .fs-fill{background:linear-gradient(180deg,#e2ffd2 0%,#9df07c 22%,#4cc531 55%,#2f9a1c 75%,#8de66a 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.8),0 0 12px rgba(120,255,120,.8)}
.fs-micon{width:64px;max-width:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
/* --- win party --- */
.fs-party{position:absolute;inset:0;z-index:300;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:90px}
.fs-ptext{animation:fs-rise .6s cubic-bezier(.25,1.4,.5,1) both}
@keyframes fs-rise{0%{transform:translateY(40px) scale(.6);opacity:0}100%{transform:none;opacity:1}}
.fs-pfrog{position:relative;width:300px;height:284px}
.fs-pfrog>img{position:relative;width:300px;max-width:none;animation:fs-jump .6s ease-in-out infinite alternate}
@keyframes fs-jump{0%{transform:translateY(0)}100%{transform:translateY(-34px)}}
.fs-pglow{position:absolute;left:50%;top:50%;width:640px;height:520px;margin:-260px 0 0 -320px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,250,190,.9),rgba(255,230,120,.45) 50%,rgba(255,220,80,0))}
.fs-orbit{position:absolute;left:50%;top:50%;width:0;height:0;animation:fs-orb 6s linear infinite}
.fs-orbit img{position:absolute;width:80px;margin:-31px 0 0 -40px;max-width:none;transform:rotate(var(--a)) translateX(230px) rotate(calc(var(--a) * -1))}
@keyframes fs-orb{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.fs-pads{position:absolute;right:18px;bottom:16px;display:flex;flex-direction:column;gap:14px}
.fs-pads button{width:88px;height:64px;border-radius:16px;background:rgba(0,40,60,.35);border:2px solid rgba(255,255,255,.55);color:#fff;font-size:28px;user-select:none}
@media (prefers-reduced-motion: reduce){.fs-shim,.fs-gl,.fs-spk,.fs-ripples i,.fs-fall i,.fs-fall b,.fs-foam,.fs-drop,.fs-bobber,.fs-wob,.fs-fly,.fs-padring{animation:none}}
`;
