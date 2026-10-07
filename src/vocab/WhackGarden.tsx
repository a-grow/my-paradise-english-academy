// WHACK-A-MOLE v2 = "Get Out of My Garden!" (Andy 2026-10-05). Same pattern as Space Robots (src/vocab/SpaceShooter.tsx):
// full window (1600x944 design field scaled to fit, then widened), the grammar games' top bar with the Chinese target
// word + speaker, its own song, coins, new win/lose screens. The old WhackAMole in GameTest.tsx stays as the fallback.
// RULES: garden critters (bunny, mole, mouse, squirrel) pop out of holes holding a word sign. Whack the one with the
// English word for the Chinese word on top. Each word must be whacked TWICE (so an easy round lasts about a minute).
// Wrong word = -1 life. RED X boards pop up too: whack one = -1 life. Coins (x1/x2/x3) and, while lives < 5, a heart pop
// up now and then - whack them to collect. MEDIUM + HARD: more holes (12 / 15) and FAKE words (the target word
// misspelled) - read carefully! A life lost = red shake, then ~2s blink (can't lose another), the game keeps going.
// All words done = win (treats paid by the win screen, coins collected paid only on a win); time or lives out = lose.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import GrammarGameBar from "@/components/GrammarGameBar";
import ControlHints, { HINT_BOTTOM_LEFT } from "@/components/ControlHints";
import HowToPlay from "@/components/HowToPlay";
import { wantHowto, seenHowto } from "@/lib/howtoSeen";
import { gardenHowTo } from "@/components/howtos";

type Diff = "easy" | "medium" | "hard";
type Cfg = { timerSec: number };
type Unit = { vocab: string[]; chinese: Record<string, string> };

const ART = "/vocab/garden";
export const GARDEN_MUSIC = `${ART}/music.mp3`; // Andy's 'ping pong' song, levelled to ~-22 dB like the Space song
const FW = 1600, FH = 944;
const MAX_LIVES = 5, REPS = 2;
const COIN_IMG = "/worlds/ui/coin.webp", HEART_IMG = "/vocab/space/heart-orb.webp";
const COIN_UP = 2800, HEART_UP = 3200; // prizes stay up longer (Andy 10-05)

// per level: holes across (3 rows), hole size + gap, how fast things pop, how long they stay up, red X / fake chances
const LV: Record<Diff, { cols: number; hw: number; gap: number; spawnMs: number; upMs: number; maxUp: number; tDelay: number;
  pX: number; maxX: number; pFake: number; coinMs: number; heartMs: number; two: number }> = { // two = chance of a 2nd right answer up at once (Andy 10-05)
  easy:   { cols: 3, hw: 250, gap: 400, spawnMs: 900, upMs: 3400, maxUp: 4, tDelay: 1100, pX: 0.14, maxX: 1, pFake: 0,    coinMs: 4200, heartMs: 15000, two: 0 },
  medium: { cols: 4, hw: 228, gap: 330, spawnMs: 700, upMs: 3400, maxUp: 6, tDelay: 900,  pX: 0.16, maxX: 2, pFake: 0.3,  coinMs: 4800, heartMs: 19000, two: 0 }, // only ONE right critter at a time (Andy 15:42)
  hard:   { cols: 5, hw: 206, gap: 282, spawnMs: 380, upMs: 3400, maxUp: 11, tDelay: 900, pX: 0.24, maxX: 3, pFake: 0.55, coinMs: 5400, heartMs: 26000, two: 0 }, // harder (Andy 15:26): busier, more fakes + red X, fewer double right ones
};
const ROW_Y = [0.355, 0.6, 0.845]; // a bit more room between rows (lower rows stand in front)  // hole centres (x field height)
const ROW_S = [0.86, 0.93, 1];        // back rows a little smaller (depth)
// hole pictures: size + the dark inside (from BACKUPFILES/vocab_art/garden/originals/make_garden.py)
const HOLES = [
  { w: 424, h: 322, ix0: 74, ix1: 377, iy0: 41, iy1: 235 },
  { w: 459, h: 299, ix0: 115, ix1: 396, iy0: 35, iy1: 223 },
  { w: 385, h: 281, ix0: 69, ix1: 315, iy0: 35, iy1: 200 },
];
const CRIT = [ // [name, width, height, size factor]
  ["bunny", 274, 357, 1.2], ["mole", 289, 231, 1.3], ["mouse", 259, 345, 1.2], ["squirrel", 329, 305, 1.2],
] as const;
const CRIT_OW: Record<string, [number, number]> = { bunny: [248, 311], mole: [288, 231], mouse: [282, 328], squirrel: [317, 293] };

const SND: Record<string, [string, number]> = {
  right: [`${ART}/snd_right.mp3`, 0.3], oof: [`${ART}/snd_oof.mp3`, 0.6],   // all a little softer (Andy 14:29)
  bonk: [`${ART}/snd_bonk.mp3`, 0.45], boing: [`${ART}/snd_boing.mp3`, 0.65], giggle: [`${ART}/snd_giggle.mp3`, 0.65], // Andy 10-05
  levelup: ["/vocab/snd_levelup.mp3", 0.4], // win: big basket (Andy 15:37)
  gasp: [`${ART}/snd_gasp.mp3`, 0.55], intro: [`${ART}/intro_music.mp3`, 1], // intro song: first 3.6s of cute-cute-music, levelled down
};

// The computer voice: full volume, the game music dips while it speaks (GamePage listens to 'mpe-duck').
let sayN = 0;
const duck = (on: boolean) => window.dispatchEvent(new CustomEvent("mpe-duck", { detail: on }));
const speak = (text: string, lang: string) => {
  try {
    speechSynthesis.cancel();
    const n = ++sayN, u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.volume = 0.8; // a little softer (Andy 14:29)
    const up = () => { if (n === sayN) duck(false); };
    u.onend = up; u.onerror = up; window.setTimeout(up, 4000);
    duck(true); speechSynthesis.speak(u);
  } catch { /* */ }
};

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// FAKE words (medium + hard): the target word with one small spelling slip, never a real word of the unit
const VOW = "aeiou";
const fakesOf = (word: string, real: Set<string>) => {
  const out = new Set<string>(), w = word;
  const isL = (c: string) => /[a-z]/i.test(c);
  if (w.replace(/[^a-z]/gi, "").length < 3) return [];
  for (let i = 1; i < w.length; i++) {
    const c = w[i];
    if (!isL(c)) continue;
    if (i + 1 < w.length && isL(w[i + 1]) && w[i + 1] !== c) out.add(w.slice(0, i) + w[i + 1] + c + w.slice(i + 2)); // swap
    if (w.replace(/[^a-z]/gi, "").length >= 4 && w[i - 1] !== c && i < w.length - 1) out.add(w.slice(0, i) + w.slice(i + 1)); // drop (never the last letter: mammals -> mammal is a real word)
    if (!VOW.includes(c.toLowerCase()) && w[i - 1] !== c && w[i + 1] !== c) out.add(w.slice(0, i) + c + w.slice(i)); // double
    if (VOW.includes(c.toLowerCase())) for (const v of VOW) if (v !== c.toLowerCase()) out.add(w.slice(0, i) + v + w.slice(i + 1)); // vowel
  }
  return [...out].filter(f => f !== w && !real.has(f.toLowerCase()) && !/\s{2}|^\s|\s$/.test(f));
};

// sounds: Andy's files (decoded once, can overlap) + small synth sounds; quiet when the bar's sound button is off
type Sfx = "right" | "oof" | "bonk" | "boing" | "giggle" | "gasp" | "intro" | "levelup" | "thud" | "coin" | "life" | "pop";
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
  return useCallback((type: Sfx) => {
    if (!onRef.current) return true;   // sound off: nothing to wait for
    try {
      const c = getCtx();
      const buf = bufs.current[type];
      if (buf) {
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = buf; g.gain.value = SND[type][1]; src.connect(g); g.connect(c.destination); src.start();
        return true;
      }
      if (SND[type]) return false;      // file not loaded yet
      const t0 = c.currentTime;
      const osc = (f: number, t: number, d: number, v = 0.22, w: OscillatorType = "sine", f2?: number) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination); o.type = w; o.frequency.setValueAtTime(f, t0 + t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + t + d);
        g.gain.setValueAtTime(v, t0 + t); g.gain.exponentialRampToValueAtTime(0.001, t0 + t + d);
        o.start(t0 + t); o.stop(t0 + t + d + 0.01);
      };
      if (type === "thud") osc(240, 0, 0.1, 0.22, "triangle", 90); // empty swing / X board
      if (type === "pop") osc(520, 0, 0.07, 0.05, "sine", 900);
      if (type === "life") [784, 988, 1175, 1568].forEach((f, i) => osc(f, i * 0.08, 0.22, 0.2, "triangle"));
      if (type === "coin") { osc(988, 0, 0.08, 0.14, "square"); osc(1319, 0.07, 0.24, 0.14, "square"); }
    } catch { /* */ }
    return true;
  }, []);
};

type Slot = { id: number; kind: "word" | "x" | "coin" | "heart"; word: string; fake: boolean; sp: number; v: number;
  state: "up" | "hit" | "miss" | "down"; until: number };
type Fx = { id: number; x: number; y: number; kind: "happy" | "coin" | "life"; v: number };

const Play = ({ unit, diff, cfg, sfxOn, musicOn, onToggleMusic, onBack, onWin, onLose, intro, onPlaying }: {
  unit: Unit; diff: Diff; cfg: Cfg; sfxOn: boolean; musicOn: boolean; onToggleMusic: () => void; intro: boolean; onPlaying: () => void;
  onBack: () => void; onWin: (coins: number) => void; onLose: (reason: "timeout" | "lives") => void;
}) => {
  const sfx = useSfx(sfxOn);
  const L = LV[diff];
  const N = L.cols * 3;

  const calc = () => {
    const w = window.innerWidth || FW, h = Math.max(200, (window.innerHeight || FH + 56) - 56);
    const s = Math.min(w / FW, h / FH);
    return { s, sw: w / s, sh: h / s };
  };
  const [fit, setFit] = useState(calc);
  const fitRef = useRef(fit); fitRef.current = fit;
  useEffect(() => { const on = () => setFit(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);

  // target order: every word ONCE, shuffled - no word twice in the same game (Andy 2026-10-07; was every word twice)
  const queue = useRef<string[]>(shuffle([...new Set(unit.vocab)]));
  const TOTAL = queue.current.length;
  const real = useRef(new Set(unit.vocab.map(v => v.toLowerCase())));
  const [qi, setQi] = useState(0);
  const target = queue.current[Math.min(qi, TOTAL - 1)];
  const targetRef = useRef(target); targetRef.current = target;

  const [, setTick] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const livesRef = useRef(MAX_LIVES);
  const [coins, setCoins] = useState(0);   // collected this round (paid only on a WIN)
  const coinsRef = useRef(0);
  const [ouch, setOuch] = useState(false);
  const [safe, setSafe] = useState(false);
  const doneRef = useRef(false);
  const [hammer, setHammer] = useState({ x: -999, y: -999, swing: 0, show: false });

  const g = useRef({ slots: Array<Slot | null>(N).fill(null), freeAt: Array<number>(N).fill(0), fx: [] as Fx[], id: 0,
    lastSpawn: 0, lastCoin: 0, lastHeart: 0, targetSince: 0, start: 0, cooldown: false, invincible: false });

  // hole positions in stage px (recomputed from the field size, so it always fits the window)
  const holes = (sw: number, sh: number) => Array.from({ length: N }, (_, i) => {
    const row = Math.floor(i / L.cols), col = i % L.cols, r = ROW_S[row];
    const gap = L.gap * (0.9 + 0.1 * r);
    const x = sw / 2 + (col - (L.cols - 1) / 2) * gap, y = sh * ROW_Y[row];
    const v = (i * 7 + row) % 3, H = HOLES[v];
    const iw = L.hw * r * 0.68, k = iw / (H.ix1 - H.ix0);
    return { x, y, row, r, v, iw, k, H, gap };
  });

  const finish = (fn: () => void) => { if (doneRef.current) return; doneRef.current = true; fn(); };

  useEffect(() => { // preload the pictures (no blank first pop)
    ["bunny", "mole", "mouse", "squirrel"].forEach(n => { new Image().src = `${ART}/${n}.webp`; new Image().src = `${ART}/${n}-ow.webp`; });
    [`${ART}/xboard.webp`, COIN_IMG, HEART_IMG, `${ART}/hammer-2.webp`, `${ART}/gardener-happy.webp`, `${ART}/gardener-surprised-r.webp`, `${ART}/basket-fly.webp`, `${ART}/gardener-angry-r2.webp`, `${ART}/basket-big.webp`, `${ART}/basket-small.webp`].forEach(u => { new Image().src = u; });
  }, []);

  // INTRO (Andy 10-05): the happy gardener walks in with her basket (intro song), spots the holes (gasp, surprised 1s),
  // turns angry (1s), then her white bubble "Get out of my Garden!" wiggles ~3s; she fades away, the hammer fades in,
  // then the timer + game song start. Only on the first round of a visit (Play again skips it).
  const [phase, setPhase] = useState<"walk" | "gasp" | "angry" | "shout" | "fade" | "play">(intro ? "walk" : "play");
  const [entered, setEntered] = useState(false);
  const playingRef = useRef(!intro);
  const endRef = useRef(false);            // all words done: basket finale playing
  const [finale, setFinale] = useState(false);
  const startPlay = () => {
    const G = g.current, t = performance.now();
    G.start = t; G.lastSpawn = t; G.lastCoin = t; G.lastHeart = t; G.targetSince = t;
    playingRef.current = true; setPhase("play"); onPlaying();
    const { sw, sh } = fitRef.current;
    setHammer(h => (h.show ? h : { x: sw / 2, y: sh * 0.55, swing: 0, show: true }));
  };
  useEffect(() => {
    if (!intro) { onPlaying(); return; }
    const ts: number[] = [];
    let tries = 0;
    const go = () => { // wait (max ~1.5s) until the intro song is loaded, then run the scene
      if (!sfx("intro") && tries++ < 15) { ts.push(window.setTimeout(go, 100)); return; }
      setEntered(true);
      ts.push(window.setTimeout(() => { setPhase("gasp"); sfx("gasp"); }, 3300));
      ts.push(window.setTimeout(() => setPhase("shout"), 4400)); // angry + bubble together (Andy 15:06)
      ts.push(window.setTimeout(() => setPhase("fade"), 7900));
      ts.push(window.setTimeout(startPlay, 8500));
    };
    ts.push(window.setTimeout(go, 50));
    return () => ts.forEach(t => window.clearTimeout(t));
  }, []);

  const hurt = (oof = true) => {
    const G = g.current;
    if (G.cooldown || G.invincible || doneRef.current) return;
    G.cooldown = true;
    if (oof) sfx("oof");
    setOuch(true);
    livesRef.current--; setLives(livesRef.current);
    if (livesRef.current <= 0) { window.setTimeout(() => finish(() => onLose("lives")), 900); return; }
    G.invincible = true; // red shake, then ~2s blink (can't lose another life), the game keeps going
    window.setTimeout(() => { setOuch(false); setSafe(true); }, 500);
    window.setTimeout(() => { G.invincible = false; G.cooldown = false; setSafe(false); }, 2300);
  };

  const addFx = (f: Omit<Fx, "id">) => {
    const G = g.current; const id = G.id++;
    G.fx.push({ ...f, id });
    window.setTimeout(() => { G.fx = G.fx.filter(x => x.id !== id); }, 950);
  };

  // main loop: holes go up and down
  useEffect(() => {
    let raf = 0;
    const G = g.current;
    const t0 = performance.now();
    if (playingRef.current) { G.start = t0; G.lastSpawn = t0; G.lastCoin = t0; G.lastHeart = t0; G.targetSince = t0; }
    const free = (now: number, nope = -1) => {
      const f = G.slots.map((s, i) => (!s && now > G.freeAt[i] && i !== nope ? i : -1)).filter(i => i >= 0);
      return f.length ? f[Math.floor(Math.random() * f.length)] : -1;
    };
    const put = (i: number, s: Omit<Slot, "id" | "state">) => { G.slots[i] = { ...s, id: G.id++, state: "up" }; sfx("pop"); };
    const loop = (now: number) => {
      if (playingRef.current && !doneRef.current && now - G.start > 900) {
        // time up / whacked -> sink -> empty
        G.slots.forEach((s, i) => {
          if (!s) return;
          if (s.state !== "down" && now > s.until) { s.state = "down"; s.until = now + 260; }
          else if (s.state === "down" && now > s.until) { G.slots[i] = null; G.freeAt[i] = now + 350; }
        });
        const up = G.slots.filter(s => s && s.state === "up");
        const tgt = targetRef.current;
        const tCount = G.slots.filter(s => s && s.kind === "word" && !s.fake && s.word === tgt && s.state !== "down").length;
        const tShown = tCount > 0;
        const sp = Math.floor(Math.random() * 4);
        // the target word: one at a time, a moment after the new Chinese word shows
        if (!tShown && now - G.targetSince > L.tDelay && up.length < L.maxUp + 1) {
          const i = free(now);
          if (i >= 0) { put(i, { kind: "word", word: tgt, fake: false, sp, v: 0, until: now + L.upMs }); G.lastSpawn = now; }
        } else if (now - G.lastSpawn > L.spawnMs * (0.75 + Math.random() * 0.5) && up.length < L.maxUp) {
          const i = free(now);
          if (i >= 0) {
            G.lastSpawn = now;
            const nX = G.slots.filter(s => s && s.kind === "x").length;
            const fakeUp = G.slots.some(s => s && s.fake);
            const fakes = L.pFake ? fakesOf(tgt, real.current) : [];
            const others = unit.vocab.filter(w => w !== tgt && !G.slots.some(s => s && s.word === w));
            const r = Math.random();
            if (L.two && tCount === 1 && now - G.targetSince > L.tDelay && Math.random() < L.two) put(i, { kind: "word", word: tgt, fake: false, sp, v: 0, until: now + L.upMs });
            else if (r < L.pX && nX < L.maxX && now - G.start > 3000) put(i, { kind: "x", word: "", fake: false, sp, v: 0, until: now + L.upMs });
            else if (fakes.length && !fakeUp && r < L.pX + L.pFake) put(i, { kind: "word", word: fakes[Math.floor(Math.random() * fakes.length)], fake: true, sp, v: 0, until: now + L.upMs });
            else if (others.length) put(i, { kind: "word", word: others[Math.floor(Math.random() * others.length)], fake: false, sp, v: 0, until: now + L.upMs * (0.8 + Math.random() * 0.4) });
            else if (fakes.length) put(i, { kind: "word", word: fakes[Math.floor(Math.random() * fakes.length)], fake: true, sp, v: 0, until: now + L.upMs });
          }
        }
        // coins: one at a time, quick (whack fast!)
        if (now - G.lastCoin > L.coinMs && !G.slots.some(s => s && s.kind === "coin")) {
          const i = free(now);
          if (i >= 0) {
            G.lastCoin = now;
            const r = Math.random(), v = r < 0.12 ? 3 : r < 0.35 ? 2 : 1;
            put(i, { kind: "coin", word: "", fake: false, sp: 0, v, until: now + COIN_UP });
          }
        }
        // heart: +1 life, only while lives < 5
        if (livesRef.current < MAX_LIVES && now - G.lastHeart > L.heartMs && !G.slots.some(s => s && s.kind === "heart")) {
          const i = free(now);
          if (i >= 0) { G.lastHeart = now; put(i, { kind: "heart", word: "", fake: false, sp: 0, v: 0, until: now + HEART_UP }); }
        }
      }
      setTick(t => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const fieldRef = useRef<HTMLDivElement>(null);
  const toStage = (cx: number, cy: number) => {
    const r = fieldRef.current?.getBoundingClientRect(); if (!r) return { x: -999, y: -999 };
    return { x: (cx - r.left) / fitRef.current.s, y: (cy - r.top) / fitRef.current.s };
  };
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = toStage(e.clientX, e.clientY);
    setHammer(h => ({ ...h, x: p.x, y: p.y, show: true }));
  };

  const whack = (e: React.PointerEvent) => {
    if (doneRef.current || !playingRef.current) return;
    const p = toStage(e.clientX, e.clientY);
    const now = performance.now();
    setHammer({ x: p.x, y: p.y, swing: now, show: true });
    if (e.pointerType !== "mouse") window.setTimeout(() => setHammer(h => (h.swing === now ? { ...h, show: false } : h)), 450);
    const G = g.current;
    const hs = holes(fitRef.current.sw, fitRef.current.sh);
    const el = (e.target as HTMLElement).closest?.("[data-h]") as HTMLElement | null;
    let best = el ? Number(el.dataset.h) : -1, bd = 1e9;
    if (best >= 0 && G.slots[best]?.state !== "up") best = -1;
    if (best < 0) hs.forEach((h, i) => {
      if (G.slots[i]?.state !== "up") return;
      const dx = Math.abs(p.x - h.x), dy = p.y - h.y;
      // whole hole (dark part + rim), ears, sides: a wide box around the hole and the critter above it
      if (dx > h.iw * 0.9 || dy < -h.iw * 1.25 || dy > h.iw * 0.75) return;
      const d = dx / h.iw + Math.abs(dy + h.iw * 0.25) / (h.iw * 1.1);
      if (d < bd) { bd = d; best = i; }
    });
    const s = best < 0 ? null : G.slots[best], h = hs[Math.max(0, best)];
    if (!s || s.state !== "up") { sfx("thud"); return; }
    const cy = h.y - h.iw * 0.45;
    if (s.kind === "coin") {
      G.slots[best] = null; G.freeAt[best] = now + 350;
      coinsRef.current += s.v; setCoins(coinsRef.current); sfx("coin");
      addFx({ x: h.x, y: cy, kind: "coin", v: s.v });
      return;
    }
    if (s.kind === "heart") {
      G.slots[best] = null; G.freeAt[best] = now + 350;
      livesRef.current = Math.min(MAX_LIVES, livesRef.current + 1); setLives(livesRef.current); sfx("life");
      addFx({ x: h.x, y: cy, kind: "life", v: 1 });
      return;
    }
    if (s.kind === "x") { s.state = "hit"; s.until = now + 520; sfx("thud"); hurt(); return; }
    if (!s.fake && s.word === targetRef.current) {
      s.state = "hit"; s.until = now + 480;
      sfx("bonk"); sfx("right"); speak(s.word, "en-US");
      G.slots.forEach(o => { if (o && o !== s && o.kind === "word" && !o.fake && o.word === s.word && o.state === "up") { o.state = "down"; o.until = now + 260; } }); // the 2nd copy ducks
      addFx({ x: h.x, y: cy, kind: "happy", v: 0 });
      const next = qi + 1;
      if (next >= TOTAL) { // meter full (Andy 14:29): it turns green, the big veggie basket wiggles in, then the win screen
        setQi(next); playingRef.current = false; endRef.current = true;
        G.slots.forEach(o => { if (o && o !== s && o.state === "up") { o.state = "down"; o.until = now + 260; } });
        window.setTimeout(() => { G.slots.forEach(o => { if (o && o.state !== "down") o.state = "down"; }); setFinale(true); sfx("levelup"); }, 650);
        window.setTimeout(() => finish(() => onWin(coinsRef.current)), 3400);
        return;
      }
      G.targetSince = now + 250;
      window.setTimeout(() => setQi(next), 250);
    } else {
      // WRONG (Andy 10-05): no ouch face - the critter giggles + wiggles at you (boing + giggle), -1 life
      s.state = "miss"; s.until = now + 1150;
      sfx("boing"); sfx("giggle"); hurt(false);
    }
  };

  const G = g.current;
  const { s, sw, sh } = fit;
  const hs = holes(sw, sh);
  const zh = unit.chinese[target] || target;
  const now = performance.now();
  const swinging = now - hammer.swing < 160;
  const solved = Math.min(qi, TOTAL);
  return (
    <div className="wg-page">
      <style>{CSS}</style>
      <GrammarGameBar onBack={onBack} muted={!musicOn} onToggleMute={onToggleMusic}
        stats={{ coins, lives, solved, total: TOTAL }}
        center={
          <span className="wg-target">
            <span className="wg-zh">{zh}</span>
            <button className="wg-say" aria-label="Say it" onClick={e => { e.stopPropagation(); speak(zh.split("/")[0].trim(), "zh-TW"); }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H3v6h3l5 4V5z" fill="#fff" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            </button>
          </span>
        } />
      <div className={"wg-field" + (ouch ? " ouch" : "")} ref={fieldRef} onPointerMove={onMove} onPointerDown={whack}
        onPointerLeave={() => setHammer(h => ({ ...h, show: false }))}>
        <div className="wg-stage" style={{ width: sw, height: sh, transform: `scale(${s})` }}>
          <ControlHints keys={[]} mouse style={HINT_BOTTOM_LEFT} /> {/* controls as pictures (Andy 23:32) */}
          <div className={"wg-meter" + (solved >= TOTAL ? " full" : "")}>
            <div className="wg-track"><div className="wg-fill" style={{ width: `${Math.max(6, (solved / TOTAL) * 100)}%` }} /></div>
            <img key={solved} className={"wg-mbasket" + (solved ? " bump" : "")} src={`${ART}/basket-big.webp`} alt="" draggable={false} />
          </div>
          {finale && (
            <div className="wg-finale"><i className="wg-finglow" /><img src={`${ART}/basket-big.webp`} alt="" draggable={false} /></div>
          )}
          {hs.map((h, i) => {
            const sl = G.slots[i], H = h.H, k = h.k;
            const w = H.w * k, hh = H.h * k;
            const left = h.x - ((H.ix0 + H.ix1) / 2) * k, top = h.y - ((H.iy0 + H.iy1) / 2) * k;
            const clipY = (H.iy1 + 0.45 * (H.h - H.iy1)) * k;
            let item: ReactNode = null;
            if (sl) {
              const cls = "wg-item " + sl.state;
              if (sl.kind === "word") {
                const [name, cw, ch, f] = CRIT[sl.sp];
                const ow = sl.state === "hit";
                const sc = (h.iw / 303) * f;
                const [iw2, ih2] = ow ? CRIT_OW[name] : [cw, ch];
                item = <img key={sl.id} data-h={i} className={cls} src={`${ART}/${name}${ow ? "-ow" : ""}.webp`} alt="" draggable={false}
                  style={{ width: iw2 * sc, height: ih2 * sc }} />;
              } else if (sl.kind === "x") {
                item = <img key={sl.id} data-h={i} className={cls} src={`${ART}/xboard.webp`} alt="" draggable={false} style={{ width: h.iw * 0.78, marginBottom: h.iw * 0.08 }} />;
              } else if (sl.kind === "coin") {
                item = <div key={sl.id} data-h={i} className={cls + " wg-coin"} style={{ width: h.iw * 0.52, marginBottom: h.iw * 0.3 }}>
                  <img src={COIN_IMG} alt="" draggable={false} style={{ width: "100%" }} />{sl.v > 1 && <b>{"×"}{sl.v}</b>}</div>;
              } else {
                item = <img key={sl.id} data-h={i} className={cls + " wg-heart"} src={HEART_IMG} alt="" draggable={false} style={{ width: h.iw * 0.56, marginBottom: h.iw * 0.28 }} />;
              }
            }
            return (
              <div key={i} className="wg-hole" style={{ left, top, width: w, height: hh, zIndex: 10 + h.row * 10 }}>
                <img className="wg-back" src={`${ART}/hole${h.v + 1}.webp`} alt="" draggable={false} style={{ width: w, height: hh }} />
                <div className="wg-clip" style={{ top: clipY - 520, height: 520 }}>{item}</div>
                <img className="wg-front" src={`${ART}/hole${h.v + 1}-front.webp`} alt="" draggable={false} style={{ width: w, height: hh }} />
              </div>
            );
          })}
          {hs.map((h, i) => { // word signs: own layer on top of every row (always readable)
            const sl = G.slots[i];
            if (!sl || sl.kind !== "word") return null;
            const H = h.H, k = h.k;
            const top = h.y - ((H.iy0 + H.iy1) / 2) * k + (H.iy1 + 0.45 * (H.h - H.iy1)) * k - 16 * h.r;
            const fs = Math.min(32 * h.r, (h.gap - 46) / Math.max(4, sl.word.length * 0.6));
            return <div key={sl.id} data-h={i} className={"wg-sign " + sl.state} style={{ left: h.x, top, fontSize: fs, zIndex: 15 + h.row * 10 }}>{sl.word}</div>;
          })}
          {G.fx.map(f => f.kind === "coin"
            ? <div key={f.id} className="wg-fx coin" style={{ left: f.x, top: f.y }}><b>+{f.v}</b>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => <i key={k} style={{ ["--a" as string]: `${k * 36 + 10}deg` } as CSSProperties} />)}</div>
            : f.kind === "life"
            ? <div key={f.id} className="wg-fx life" style={{ left: f.x, top: f.y }}><img src={HEART_IMG} alt="" style={{ width: 80 }} /><b>+1</b></div>
            : <div key={f.id} className="wg-fx happy" style={{ left: f.x, top: f.y }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(k => <i key={k} style={{ ["--a" as string]: `${k * 45 + 20}deg` } as CSSProperties} />)}</div>)}
          {phase !== "play" && (() => {
            const f = 0.72, gx = entered ? sw * 0.3 : -260, base = sh - 18;
            const angry = phase === "angry" || phase === "shout" || phase === "fade";
            return (
              <div className={"wg-gard " + phase} style={{ left: gx, top: base }}>
                {phase === "walk" && <img className={"wg-gimg" + (entered ? " walking" : "")} src={`${ART}/gardener-happy.webp`} alt="" draggable={false} style={{ width: 512 * f }} />}
                {phase === "gasp" && <img className="wg-gimg surprised" src={`${ART}/gardener-surprised-r.webp`} alt="" draggable={false} style={{ width: 468 * f }} />}
                {phase === "gasp" && <img className="wg-basket" src={`${ART}/basket-fly.webp`} alt="" draggable={false} style={{ width: 215 * f, left: -168 + 262 * f, bottom: 663 * f }} />}
                {angry && <img className="wg-gimg angry" src={`${ART}/gardener-angry-r2.webp`} alt="" draggable={false} style={{ width: 489 * f }} />}
                {(phase === "shout" || phase === "fade") && <div className="wg-bubble">Get out of my Garden!</div>}
              </div>
            );
          })()}
          {phase === "play" && hammer.show && (
            <div className={"wg-hammer" + (swinging ? " swing" : "") + (safe ? " safe" : "")} style={{ left: hammer.x, top: hammer.y }}>
              <img src={`${ART}/hammer-2.webp`} alt="" draggable={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Outer: keeps the result (win / lose) and restarts the game by remounting it.
export default function WhackGarden({ unit, diff, cfg, sfxOn = true, musicOn, onToggleMusic, onMusicTrack, onBack, onRestart, getCoinTotal, renderWin, renderLose }: {
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
  const [howto, setHowto] = useState(() => wantHowto("whack")); // first 3 times (cloud), then only via "?" (Andy 2026-10-07)
  const [playing, setPlaying] = useState(false); // false during the intro = no game song yet
  useEffect(() => () => onMusicTrack?.(null), []);
  useEffect(() => { onMusicTrack?.(result || !playing ? "" : GARDEN_MUSIC); }, [result, playing]);
  useEffect(() => { // font for the word signs
    if (document.getElementById("mpe-font-titan2")) return;
    const l = document.createElement("link"); l.id = "mpe-font-titan2"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Titan+One&family=Bangers&display=swap"; document.head.appendChild(l);
  }, []);
  const restart = () => { onRestart?.(); setPlaying(false); setResult(null); setRun(r => r + 1); };
  if (result === "win") return <>{renderWin(restart, coinsWon, coinStart)}</>;
  if (result) return <>{renderLose(result, restart)}</>;
  if (howto) return <HowToPlay {...gardenHowTo(diff)} muted={!musicOn} onDone={() => { setHowto(false); seenHowto("whack"); }} />;
  return <Play key={run} unit={unit} diff={diff} cfg={cfg} sfxOn={sfxOn && musicOn} musicOn={musicOn} onToggleMusic={onToggleMusic}
    onBack={onBack} onWin={c => { setCoinsWon(c); setResult("win"); }} onLose={r => setResult(r)} intro={run === 0} onPlaying={() => setPlaying(true)} />;
}

const CSS = `
.wg-page{position:fixed;inset:0;display:flex;flex-direction:column;background:#5aa84a;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden}
.wg-field{position:relative;flex:1;overflow:hidden;background:#6cbf55 url(${ART}/bg.webp) center/cover no-repeat;cursor:none;touch-action:none}
.wg-field.ouch{animation:wg-ouch .12s linear 4}
.wg-field.ouch::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px 40px rgba(255,30,30,.55)}
@keyframes wg-ouch{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.wg-stage{position:absolute;left:0;top:0;transform-origin:0 0}
.wg-target{display:flex;align-items:center;gap:8px;background:rgba(40,25,5,.55);border:1.5px solid rgba(255,220,120,.45);border-radius:999px;padding:2px 10px 2px 22px}
.wg-zh{font-family:'Nunito',sans-serif;font-weight:900;font-size:30px;line-height:1.2;color:#ffe066;white-space:nowrap}
.wg-say{background:none;border:none;cursor:pointer;padding:4px;display:flex}
.wg-hole{position:absolute;pointer-events:none}
.wg-hole img{display:block}
.wg-back,.wg-front{position:absolute;left:0;top:0}
.wg-clip{position:absolute;left:-40%;width:180%;overflow:hidden;display:flex;justify-content:center;align-items:flex-end}
.wg-item{display:block;flex:none;pointer-events:auto;animation:wg-rise .24s cubic-bezier(.34,1.45,.64,1) both;transform-origin:50% 100%}
.wg-item.down{animation:wg-sink .26s ease-in forwards}
.wg-item.hit{animation:wg-squash .3s ease-out both}
.wg-item.miss{animation:wg-giggle .26s ease-in-out 4}
@keyframes wg-giggle{0%,100%{transform:rotate(0) translateY(0)}25%{transform:rotate(-9deg) translateY(-6px)}75%{transform:rotate(9deg) translateY(-6px)}}
img.wg-item.hit[src*=xboard]{filter:drop-shadow(0 0 10px #ff2a2a) drop-shadow(0 0 22px rgba(255,0,0,.6))}
.wg-gard{position:absolute;z-index:180;pointer-events:none;transition:left 3.2s linear,opacity .6s ease}
.wg-gard.fade{opacity:0}
.wg-gimg{position:absolute;left:0;bottom:0;transform:translateX(-50%);max-width:none;filter:drop-shadow(0 10px 8px rgba(0,0,0,.3))}
.wg-gimg.walking{animation:wg-walk .36s ease-in-out infinite}
@keyframes wg-walk{0%,100%{transform:translateX(-50%) translateY(0) rotate(-2deg)}50%{transform:translateX(-50%) translateY(-12px) rotate(2deg)}}
.wg-gard.gasp .wg-gimg{animation:wg-jump .45s cubic-bezier(.3,1.6,.6,1)}
.wg-basket{position:absolute;max-width:none;animation:wg-toss .5s cubic-bezier(.2,.9,.4,1) both,wg-drift 1s ease-in-out .5s infinite alternate} /* basket flies out of her hands (Andy 14:15) */
@keyframes wg-toss{0%{transform:translate(-150px,250px) rotate(-70deg) scale(.8);opacity:0}25%{opacity:1}100%{transform:translate(0,0) rotate(0) scale(1)}}
@keyframes wg-drift{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(10px,-14px) rotate(12deg)}}
@keyframes wg-jump{0%{transform:translateX(-50%) translateY(0)}40%{transform:translateX(-50%) translateY(-46px) scale(1.04)}100%{transform:translateX(-50%) translateY(0)}}
.wg-gimg.angry{animation:wg-mad .16s linear infinite}
@keyframes wg-mad{0%,100%{transform:translateX(-50%) rotate(0)}25%{transform:translateX(calc(-50% - 4px)) rotate(-1.5deg)}75%{transform:translateX(calc(-50% + 4px)) rotate(1.5deg)}}
.wg-bang{position:absolute;left:30px;bottom:520px;font-family:'Bangers','Titan One',sans-serif;font-size:140px;line-height:1;color:#ffd23f;
 -webkit-text-stroke:5px #2b1600;text-shadow:0 6px 0 #2b1600;animation:wg-bangin .3s cubic-bezier(.3,1.8,.6,1) both}
@keyframes wg-bangin{0%{transform:scale(.2) rotate(-20deg);opacity:0}100%{transform:scale(1) rotate(8deg);opacity:1}}
.wg-bubble{position:absolute;left:150px;bottom:470px;width:max-content;padding:22px 40px 26px;background:#fff;border:6px solid #1a1a1a;border-radius:46px;
 font-family:'Bangers','Titan One',sans-serif;font-size:76px;line-height:1;letter-spacing:2px;color:#111;white-space:nowrap;
 box-shadow:0 10px 0 rgba(0,0,0,.25);transform-origin:12% 100%;animation:wg-bubin .32s cubic-bezier(.3,1.7,.6,1) both,wg-bubwig .22s ease-in-out .32s infinite}
.wg-bubble::before{content:"";position:absolute;left:46px;bottom:-44px;border:24px solid transparent;border-top:42px solid #1a1a1a;border-bottom:0}
.wg-bubble::after{content:"";position:absolute;left:53px;bottom:-30px;border:17px solid transparent;border-top:32px solid #fff;border-bottom:0}
@keyframes wg-bubin{0%{transform:scale(.1);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes wg-bubwig{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
.wg-hammer{animation:wg-hamin .5s ease-out}
.wg-meter{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:170;display:flex;align-items:center;pointer-events:none}
.wg-track{position:relative;width:560px;height:32px;border-radius:999px;background:#fff4d6;border:5px solid #5b3412;overflow:hidden;
 box-shadow:inset 0 4px 0 rgba(120,70,20,.18),0 4px 0 #3b220c,0 8px 12px rgba(0,0,0,.25)}
.wg-fill{height:100%;border-radius:999px;background:linear-gradient(180deg,#ffc76b 0%,#ff9426 55%,#e86d00 100%);
 box-shadow:inset 0 4px 0 rgba(255,255,255,.45);transition:width .5s cubic-bezier(.3,1.4,.6,1)}
.wg-meter.full .wg-fill{background:linear-gradient(180deg,#b8f58e 0%,#5ccf3a 55%,#2f9a1c 100%)}
.wg-mbasket{width:76px;margin-left:-24px;max-width:none;filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))}
.wg-mbasket.bump{animation:wg-mbump .45s cubic-bezier(.3,1.7,.6,1)}
.wg-meter.full .wg-mbasket{animation:wg-finwig .32s ease-in-out infinite alternate}
@keyframes wg-mbump{0%{transform:scale(1)}40%{transform:scale(1.28) rotate(-8deg)}100%{transform:scale(1)}}
.wg-finale{position:absolute;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;pointer-events:none;animation:wg-finbg .6s ease-out both}
@keyframes wg-finbg{0%{background:rgba(255,250,225,0)}100%{background:rgba(255,250,225,.35)}}
.wg-finale img{position:relative;width:600px;max-width:none;filter:drop-shadow(0 16px 14px rgba(0,0,0,.35));
 animation:wg-finin .7s cubic-bezier(.3,1.5,.6,1) both,wg-finwig .34s ease-in-out .7s infinite alternate}
.wg-finglow{position:absolute;width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(255,240,170,.85) 0%,rgba(255,220,120,.35) 40%,rgba(255,220,120,0) 70%);animation:wg-finin .7s ease-out both}
@keyframes wg-finin{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:scale(1)}}
@keyframes wg-finwig{0%{transform:rotate(-4deg)}100%{transform:rotate(4deg)}}
@keyframes wg-hamin{0%{opacity:0}100%{opacity:1}}
img.wg-item.hit[src*=xboard]{animation:wg-shake .1s linear 5}
@keyframes wg-rise{0%{transform:translateY(105%)}100%{transform:translateY(0)}}
@keyframes wg-sink{0%{transform:translateY(0)}100%{transform:translateY(105%)}}
@keyframes wg-squash{0%{transform:scale(1.15,.8)}60%{transform:scale(.95,1.06)}100%{transform:scale(1)}}
@keyframes wg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.wg-coin{position:relative;display:flex;justify-content:center}
.wg-coin img{animation:wg-spin 1.2s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(255,210,60,.85))}
.wg-coin b{position:absolute;left:66%;top:40%;font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:28px;color:#fff;white-space:nowrap;
 text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 3px 0 #7a3f08}
@keyframes wg-spin{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.6)}}
.wg-heart{filter:drop-shadow(0 0 10px rgba(255,140,120,.9))}
.wg-sign{position:absolute;transform:translate(-50%,0);pointer-events:auto;padding:.08em .5em .12em;white-space:nowrap;
 font-family:'Titan One','Fredoka',sans-serif;line-height:1.15;color:#4a2508;
 background:linear-gradient(180deg,#f6dca6 0%,#e9c27c 55%,#d9a95e 100%);border:4px solid #5b3412;border-radius:6px;
 box-shadow:inset 0 3px 0 rgba(255,250,225,.75),inset 0 -4px 0 rgba(140,80,30,.35),0 4px 0 #3b220c,0 6px 10px rgba(0,0,0,.35);
 animation:wg-signin .24s cubic-bezier(.34,1.5,.64,1) both}
.wg-sign.down{animation:wg-signout .22s ease-in forwards}
.wg-sign.hit{background:linear-gradient(180deg,#d9ffbf,#9be27a);border-color:#2f6b17;color:#1d4a0b}
.wg-sign.miss{background:linear-gradient(180deg,#ffd0c8,#ff8f80);border-color:#8a1a12;color:#6a0e08;animation:wg-shake2 .1s linear 4}
@keyframes wg-signin{0%{transform:translate(-50%,0) scale(.2);opacity:0}100%{transform:translate(-50%,0) scale(1);opacity:1}}
@keyframes wg-signout{0%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,0) scale(.3);opacity:0}}
@keyframes wg-shake2{0%,100%{transform:translate(-50%,0)}25%{transform:translate(calc(-50% - 6px),0)}75%{transform:translate(calc(-50% + 6px),0)}}
.wg-hammer{position:absolute;z-index:200;pointer-events:none;width:0;height:0}
.wg-hammer img{position:absolute;width:150px;max-width:none;left:-36px;top:-56px;transform-origin:8% 94%;transform:rotate(16deg);transition:transform .07s ease-out;
 filter:drop-shadow(0 6px 4px rgba(0,0,0,.35))}
.wg-hammer.swing img{transform:rotate(-30deg);transition:transform .05s ease-in}
.wg-hammer.safe{animation:wg-blink .3s steps(1) infinite}
@keyframes wg-blink{0%{opacity:1}50%{opacity:.3}}
.wg-fx{position:absolute;pointer-events:none;z-index:150}
.wg-fx i{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px;border-radius:50%;background:#fffde6;
 box-shadow:0 0 3px 1px #fff27a,0 0 9px 3px #ffd000;animation:wg-dot .8s ease-out forwards}
.wg-fx.coin i{width:9px;height:9px;margin:-4.5px;animation-duration:.55s}
@keyframes wg-dot{0%{opacity:1;transform:rotate(var(--a)) translateX(10px) scale(1.2)}100%{opacity:0;transform:rotate(var(--a)) translateX(110px) scale(.4)}}
.wg-fx b{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:'Fredoka','Nunito',sans-serif;font-weight:800;font-size:46px;white-space:nowrap;animation:wg-plus .9s ease-out forwards}
.wg-fx.coin b{color:#ffd84a;text-shadow:-2px -2px 0 #7a3f08,2px -2px 0 #7a3f08,-2px 2px 0 #7a3f08,2px 2px 0 #7a3f08,0 4px 0 #7a3f08}
.wg-fx.life b{color:#ff8a8a;text-shadow:0 0 10px rgba(255,120,120,.9),0 3px 0 #7a1020}
.wg-fx.life img{position:absolute;left:0;top:0;transform:translate(-50%,-50%);animation:wg-life .9s ease-out forwards}
@keyframes wg-life{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(2.2);opacity:0}}
@keyframes wg-plus{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}25%{opacity:1;transform:translate(-50%,-80%) scale(1.1)}100%{transform:translate(-50%,-180%) scale(1);opacity:0}}
@media (prefers-reduced-motion: reduce){.wg-coin img{animation:none}}
`;
